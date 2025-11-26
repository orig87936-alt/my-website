"""
文档上传路由
提供文档上传、解析和历史记录功能
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Query
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pathlib import Path
import time
import asyncio
from datetime import datetime

from ..database import get_db
from ..core.deps import require_admin
from ..models.document import DocumentUpload
from ..models.user import User
from ..schemas.document import (
    UploadDocumentResponse,
    DocumentUploadHistoryResponse,
    DocumentUploadDetail,
    ParseResult,
    ParseMetadata,
    UploadedImage
)
from ..schemas.article import ContentBlock
from ..services.document_parser import parse_document, upload_images_concurrently
from ..services.metadata_generator import MetadataGenerator
from ..services.translation import TranslationService

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

# HTTP Bearer token security scheme
security = HTTPBearer()

# 文件大小限制：10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# 允许的文件类型
ALLOWED_EXTENSIONS = {".md", ".docx"}


@router.post(
    "/upload",
    response_model=UploadDocumentResponse,
    summary="Upload and parse document",
    description="T075: Upload Markdown/Word document with automatic parsing, image extraction, and AI metadata generation"
)
async def upload_document(
    file: UploadFile = File(..., description="Document file (.md or .docx, max 10MB)"),
    category: Optional[str] = Form(None, description="Article category (optional)"),
    auto_translate: bool = Form(False, description="Auto-translate content to target languages"),
    target_langs: str = Form("en", description="Comma-separated target languages (zh-tw,en,ja,es,fr,ar,hi)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UploadDocumentResponse:
    """
    Upload and parse Markdown or Word document with intelligent content extraction.

    **Features:**
    - **Document Parsing**: Supports .md and .docx files (T035-T040)
    - **Image Extraction**: Automatically extracts and uploads images (max 5 concurrent) (T039)
    - **AI Metadata Generation**: Auto-generates summary, category, and tags (T041-T044)
    - **Multi-Language Translation**: Optional translation to multiple languages (T021-T023)
    - **Security**: Content sanitization and XSS protection (T073)
    - **Performance**: File size validation and streaming (T072)

    **Workflow:**
    1. Upload document file
    2. Parse content and extract images
    3. Upload images concurrently (max 5 at a time)
    4. Generate AI metadata (summary, category, tags)
    5. Optionally translate content to multiple languages concurrently
    6. Return structured content blocks ready for article creation

    **Parameters:**
    - **file**: Document file (.md or .docx, max 10MB)
    - **category**: Article category (optional, will be AI-suggested if not provided)
    - **auto_translate**: Enable automatic translation (default: false)
    - **target_langs**: Comma-separated target languages (zh-tw,en,ja,es,fr,ar,hi, default: en)

    **File Size Limit:** 10MB

    **Allowed File Types:** .md, .docx

    **Permissions:** Admin only

    **Returns:**
    - **upload_id**: Unique upload identifier
    - **filename**: Original filename
    - **file_type**: File extension
    - **file_size**: File size in bytes
    - **upload_status**: Upload status (success/failed)
    - **parse_result**: Parsed content including:
      - **title**: Extracted document title
      - **content_zh**: Chinese content blocks
      - **translations**: Translations for each target language
      - **images**: Uploaded images with URLs
      - **metadata**: AI-generated summary, category, and tags
    - **uploaded_at**: Upload timestamp
    """
    start_time = time.time()

    # 🔍 调试：打印接收到的参数
    print(f"📥 Upload request received:")
    print(f"  - filename: {file.filename}")
    print(f"  - category: {category}")
    print(f"  - auto_translate: {auto_translate}")
    print(f"  - target_langs: {target_langs}")

    # 验证文件名
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # 验证文件类型
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 读取文件内容
    try:
        file_content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
    # 验证文件大小
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # 创建上传记录
    upload_record = DocumentUpload(
        filename=file.filename,
        file_type=file_ext[1:],  # 移除点号
        file_size=file_size,
        upload_status='processing',
        created_by=current_user.username
    )
    
    try:
        # 1. 解析文档
        parse_result = parse_document(file_content, file.filename)
        content_blocks = parse_result['content_blocks']
        metadata = parse_result['metadata']
        images = parse_result['images']
        
        # 2. 上传图片（如果有）
        uploaded_images = []
        image_url_map = {}  # {filename: uploaded_url}
        if images:
            # 获取认证 token - 从 credentials 获取
            auth_token = credentials.credentials
            uploaded_images = await upload_images_concurrently(images, auth_token, max_concurrent=5)

            # 创建文件名到 URL 的映射
            for img in uploaded_images:
                if 'error' not in img:
                    image_url_map[img['original_name']] = img['uploaded_url']

            print(f"📊 图片 URL 映射: {image_url_map}")

            # 3. 替换 content_blocks 中的图片文件名为 URL
            for block in content_blocks:
                if block.type == 'image':
                    # 检查 url 字段
                    if block.url and block.url in image_url_map:
                        old_url = block.url
                        block.url = image_url_map[block.url]
                        print(f"  🔄 替换图片 URL: {old_url} -> {block.url}")
                    # 也更新 content 字段（如果存在）
                    if block.content and block.content in image_url_map:
                        block.content = image_url_map[block.content]
        
        # 4. 生成 AI 元数据
        metadata_generator = MetadataGenerator()
        
        # 提取纯文本内容
        plain_text = '\n\n'.join([block.content for block in content_blocks if block.content])
        
        # 生成元数据
        ai_metadata = await metadata_generator.generate_all_metadata(
            title=metadata.get('title', file.filename),
            content=plain_text,
            language='zh'
        )
        
        # 合并元数据
        final_title = metadata.get('title', file.filename)
        final_summary = ai_metadata.get('summary', metadata.get('summary', ''))
        final_category = category or ai_metadata.get('category', 'headline')
        final_tags = ai_metadata.get('tags', [])
        
        # 4. 多语言翻译（如果需要）(T021-T023)
        translations = None
        translation_time = None

        if auto_translate:
            translation_start = time.time()
            translation_service = TranslationService(db)

            # 解析目标语言列表
            target_langs_list = [lang.strip() for lang in target_langs.split(',') if lang.strip()]

            # 过滤掉源语言（zh）
            target_langs_list = [lang for lang in target_langs_list if lang != 'zh']

            if target_langs_list:
                translations = {}

                # 定义单个语言的翻译任务
                async def translate_to_language(target_lang: str):
                    """翻译到单个目标语言（并发执行）"""
                    try:
                        print(f"🌐 开始翻译到 {target_lang}...")

                        # 翻译标题
                        title_result = await translation_service.translate_text(
                            text=final_title,
                            source_lang='zh',
                            target_lang=target_lang
                        )
                        translated_title = title_result['translated_text']

                        # 翻译摘要
                        summary_result = await translation_service.translate_text(
                            text=final_summary,
                            source_lang='zh',
                            target_lang=target_lang
                        )
                        translated_summary = summary_result['translated_text']

                        # 翻译所有文本块（并发）
                        async def translate_block(i: int, block: ContentBlock):
                            """翻译单个内容块"""
                            # 获取文本内容（优先使用 content，然后 text）
                            text_to_translate = block.content or block.text

                            if block.type in ['paragraph', 'heading', 'quote', 'list'] and text_to_translate:
                                try:
                                    print(f"🔄 Translating block {i+1} [{target_lang}]: {text_to_translate[:50]}...")

                                    translation_result = await translation_service.translate_text(
                                        text=text_to_translate,
                                        source_lang='zh',
                                        target_lang=target_lang
                                    )
                                    translated_text = translation_result['translated_text']

                                    # 调试：打印翻译结果
                                    print(f"🔍 Block {i+1} [{target_lang}] translation result:")
                                    print(f"  - Original ({len(text_to_translate)} chars): {text_to_translate[:50]}...")
                                    print(f"  - Translated ({len(translated_text) if translated_text else 0} chars): {translated_text[:50] if translated_text else 'EMPTY'}...")
                                    print(f"  - Translation result type: {type(translated_text)}")
                                    print(f"  - Translation result repr: {repr(translated_text[:100]) if translated_text else 'None'}")

                                    # 如果翻译结果为空，使用原文
                                    if not translated_text or not translated_text.strip():
                                        print(f"⚠️ WARNING: Translation returned empty for block {i+1} [{target_lang}], using original text")
                                        translated_text = text_to_translate

                                    # 同时设置 content 和 text 字段以确保兼容性
                                    return ContentBlock(
                                        type=block.type,
                                        content=translated_text,  # 保持向后兼容
                                        text=translated_text,     # 新的标准字段
                                        level=block.level,
                                        language=block.language,
                                        caption=block.caption
                                    )
                                except Exception as e:
                                    print(f"⚠️ Translation failed for block {i+1} in {target_lang}: {e}")
                                    print(f"⚠️ Using original text for block {i+1}")
                                    # 翻译失败时返回原文
                                    return ContentBlock(
                                        type=block.type,
                                        content=text_to_translate,
                                        text=text_to_translate,
                                        level=block.level,
                                        language=block.language,
                                        caption=block.caption
                                    )
                            else:
                                # 非文本块（如图片、代码）直接复制
                                return block

                        # 并发翻译所有内容块
                        translated_blocks = await asyncio.gather(
                            *[translate_block(i, block) for i, block in enumerate(content_blocks)]
                        )

                        # 存储该语言的翻译结果
                        result = {
                            'title': translated_title,
                            'summary': translated_summary,
                            'content': [block.model_dump() for block in translated_blocks]
                        }

                        print(f"✅ Translation completed for {target_lang}")
                        return (target_lang, result)

                    except Exception as e:
                        # 语言级别的翻译失败时，不要丢弃整个语言
                        # 使用原始中文标题/摘要/内容作为兜底，这样前端至少有内容可用
                        print(f"⚠️ Translation failed for {target_lang}: {e}")
                        print(f"⚠️ Using original Chinese content as fallback for {target_lang}")

                        fallback_result = {
                            'title': final_title,
                            'summary': final_summary,
                            'content': [block.model_dump() for block in content_blocks]
                        }
                        return (target_lang, fallback_result)

                # 并发翻译所有目标语言
                translation_results = await asyncio.gather(
                    *[translate_to_language(lang) for lang in target_langs_list],
                    return_exceptions=True
                )

                # 收集成功的翻译结果（现在所有语言都会返回一个 result，只是可能是兜底的中文）
                for result in translation_results:
                    if isinstance(result, tuple) and result[1] is not None:
                        target_lang, translation_data = result
                        translations[target_lang] = translation_data

            translation_time = time.time() - translation_start
            print(f"📊 Translation results: {list(translations.keys()) if translations else 'None'}")

        # 5. 构建解析结果
        parse_metadata = ParseMetadata(
            word_count=metadata.get('word_count', 0),
            paragraph_count=metadata.get('paragraph_count', 0),
            image_count=len(uploaded_images),
            parse_time=metadata.get('parse_time', 0),
            translation_time=translation_time
        )

        parse_result_schema = ParseResult(
            title=final_title,
            summary=final_summary,
            category=final_category,
            tags=final_tags,
            content_zh=content_blocks,
            images_uploaded=[
                UploadedImage(
                    original_name=img['original_name'],
                    uploaded_url=img['uploaded_url'],
                    size=img['size']
                ) for img in uploaded_images if 'error' not in img
            ],
            metadata=parse_metadata,
            translations=translations  # T023: 添加多语言翻译结果
        )

        print(f"📦 ParseResult created with translations: {parse_result_schema.translations is not None}")
        
        # 6. 更新上传记录
        upload_record.upload_status = 'success'
        upload_record.parse_result = parse_result_schema.model_dump()
        
        db.add(upload_record)
        await db.commit()
        await db.refresh(upload_record)
        
        # 7. 返回响应
        return UploadDocumentResponse(
            upload_id=str(upload_record.id),
            filename=upload_record.filename,
            file_type=upload_record.file_type,
            file_size=upload_record.file_size,
            parse_result=parse_result_schema,
            status='success',
            created_at=upload_record.created_at
        )
        
    except Exception as e:
        # 更新上传记录为失败
        upload_record.upload_status = 'failed'
        upload_record.error_message = str(e)
        
        db.add(upload_record)
        await db.commit()
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )


@router.get("/history", response_model=DocumentUploadHistoryResponse)
async def get_upload_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> DocumentUploadHistoryResponse:
    """
    获取文档上传历史记录
    
    - **limit**: 返回数量（默认 20，最大 100）
    - **offset**: 偏移量（默认 0）
    - **status**: 过滤状态（success/failed）
    - **权限**: 仅管理员
    """
    from sqlalchemy import select, func
    
    # 构建查询
    query = select(DocumentUpload).order_by(DocumentUpload.created_at.desc())
    
    # 过滤状态
    if status:
        query = query.where(DocumentUpload.upload_status == status)
    
    # 获取总数
    count_query = select(func.count()).select_from(DocumentUpload)
    if status:
        count_query = count_query.where(DocumentUpload.upload_status == status)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return DocumentUploadHistoryResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{upload_id}", response_model=DocumentUploadDetail)
async def get_upload_detail(
    upload_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> DocumentUploadDetail:
    """
    获取特定上传的详细信息
    
    - **upload_id**: 上传 ID
    - **权限**: 仅管理员
    """
    from sqlalchemy import select
    from uuid import UUID
    
    try:
        upload_uuid = UUID(upload_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid upload ID format")
    
    query = select(DocumentUpload).where(DocumentUpload.id == upload_uuid)
    result = await db.execute(query)
    upload = result.scalar_one_or_none()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return DocumentUploadDetail.model_validate(upload)

