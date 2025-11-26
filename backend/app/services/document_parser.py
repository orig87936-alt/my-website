"""
文档解析服务
支持 Markdown 和 Word 文档的解析、图片提取和元数据生成
T072: 流式处理大文件
T073: 安全检查防止恶意代码
"""
import re
import io
import base64
import asyncio
import aiohttp
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path
import markdown
from bs4 import BeautifulSoup
import time
from ..config import get_settings

settings = get_settings()

# T073: 危险标签和模式列表
DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'applet',
    'meta', 'link', 'style', 'base', 'form'
]

DANGEROUS_PATTERNS = [
    r'javascript:',
    r'on\w+\s*=',  # onclick, onload, etc.
    r'data:text/html',
    r'vbscript:',
    r'<\s*script',
    r'eval\s*\(',
    r'expression\s*\(',
]

try:
    from docx import Document
    from docx.oxml.text.paragraph import CT_P
    from docx.oxml.table import CT_Tbl
    from docx.table import _Cell, Table
    from docx.text.paragraph import Paragraph
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

from ..schemas.article import ContentBlock


def sanitize_content(content: str) -> str:
    """
    T073: 清理内容，移除危险代码

    Args:
        content: 原始内容

    Returns:
        清理后的安全内容
    """
    # 检查危险模式
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE):
            print(f"⚠️  Detected dangerous pattern: {pattern}")
            content = re.sub(pattern, '', content, flags=re.IGNORECASE)

    return content


def sanitize_html(html: str) -> str:
    """
    T073: 清理 HTML，移除危险标签

    Args:
        html: 原始 HTML

    Returns:
        清理后的安全 HTML
    """
    soup = BeautifulSoup(html, 'html.parser')

    # 移除危险标签
    for tag_name in DANGEROUS_TAGS:
        for tag in soup.find_all(tag_name):
            print(f"⚠️  Removed dangerous tag: <{tag_name}>")
            tag.decompose()

    # 移除危险属性
    for tag in soup.find_all():
        # 移除所有 on* 事件属性
        attrs_to_remove = []
        for attr in tag.attrs:
            if attr.startswith('on') or attr in ['style', 'formaction']:
                attrs_to_remove.append(attr)

        for attr in attrs_to_remove:
            del tag[attr]

    return str(soup)


def check_file_size(file_content: bytes, max_size_mb: int = 10) -> bool:
    """
    T072: 检查文件大小

    Args:
        file_content: 文件内容
        max_size_mb: 最大文件大小（MB）

    Returns:
        是否在限制内
    """
    size_mb = len(file_content) / (1024 * 1024)
    if size_mb > max_size_mb:
        raise ValueError(f"File size ({size_mb:.2f}MB) exceeds maximum allowed size ({max_size_mb}MB)")
    return True


class DocumentParser:
    """文档解析器基类"""
    
    def __init__(self, file_content: bytes, filename: str):
        self.file_content = file_content
        self.filename = filename
        self.images: List[Tuple[str, bytes]] = []  # (filename, binary_data)
        
    def parse(self) -> Dict[str, Any]:
        """解析文档，返回结构化内容"""
        raise NotImplementedError
        
    def extract_metadata(self, content: str) -> Dict[str, Any]:
        """提取元数据"""
        # 计算字数
        word_count = len(re.findall(r'\w+', content))
        
        # 计算段落数
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        paragraph_count = len(paragraphs)
        
        # 生成摘要（取前150字）
        summary = content[:150].strip()
        if len(content) > 150:
            summary += '...'
            
        # 提取标题（第一行或第一个 # 标题）
        lines = content.split('\n')
        title = ''
        for line in lines:
            line = line.strip()
            if line:
                # 移除 Markdown 标题符号
                title = re.sub(r'^#+\s*', '', line)
                break
                
        return {
            'title': title or self.filename,
            'summary': summary,
            'word_count': word_count,
            'paragraph_count': paragraph_count,
            'image_count': len(self.images)
        }


class MarkdownParser(DocumentParser):
    """Markdown 文档解析器"""

    def parse(self) -> Dict[str, Any]:
        """解析 Markdown 文档"""
        start_time = time.time()

        # T072: 检查文件大小
        check_file_size(self.file_content, max_size_mb=10)

        # 解码文本内容
        try:
            text_content = self.file_content.decode('utf-8')
        except UnicodeDecodeError:
            text_content = self.file_content.decode('utf-8', errors='ignore')

        # T073: 清理内容
        text_content = sanitize_content(text_content)

        # 提取图片（base64 和 URL）
        self._extract_images_from_markdown(text_content)

        # 转换为 HTML
        html_content = markdown.markdown(
            text_content,
            extensions=['extra', 'codehilite', 'tables', 'fenced_code']
        )

        # T073: 清理 HTML
        html_content = sanitize_html(html_content)

        # 解析 HTML 为 ContentBlock
        content_blocks = self._html_to_content_blocks(html_content)

        # 提取元数据（传入 content_blocks 以便更好地提取标题）
        metadata = self.extract_metadata_from_blocks(content_blocks, text_content)
        metadata['parse_time'] = time.time() - start_time

        return {
            'content_blocks': content_blocks,
            'metadata': metadata,
            'images': self.images
        }

    def extract_metadata_from_blocks(self, content_blocks: List[ContentBlock], plain_text: str) -> Dict[str, Any]:
        """从内容块中提取元数据"""
        # 计算字数
        word_count = len(re.findall(r'\w+', plain_text))

        # 计算段落数
        paragraphs = [p.strip() for p in plain_text.split('\n\n') if p.strip()]
        paragraph_count = len(paragraphs)

        # 提取标题：优先从第一个 heading 块中提取
        title = ''
        for block in content_blocks:
            if block.type == 'heading' and block.content:
                title = block.content.strip()
                break

        # 如果没有找到标题，使用文件名
        if not title:
            title = self.filename

        # 生成摘要：从第一个段落或前150字
        summary = ''
        for block in content_blocks:
            if block.type == 'paragraph' and block.content:
                summary = block.content[:150].strip()
                if len(block.content) > 150:
                    summary += '...'
                break

        # 如果没有找到段落，使用纯文本的前150字
        if not summary:
            summary = plain_text[:150].strip()
            if len(plain_text) > 150:
                summary += '...'

        return {
            'title': title,
            'summary': summary,
            'word_count': word_count,
            'paragraph_count': paragraph_count,
            'image_count': len(self.images)
        }
    
    def _extract_images_from_markdown(self, text: str):
        """从 Markdown 中提取图片"""
        # 提取 base64 图片
        base64_pattern = r'!\[([^\]]*)\]\(data:image/([^;]+);base64,([^)]+)\)'
        for match in re.finditer(base64_pattern, text):
            alt_text, img_format, base64_data = match.groups()
            try:
                img_data = base64.b64decode(base64_data)
                filename = f"{alt_text or 'image'}.{img_format}"
                self.images.append((filename, img_data))
            except Exception:
                continue
    
    def _html_to_content_blocks(self, html: str) -> List[ContentBlock]:
        """将 HTML 转换为 ContentBlock 列表"""
        soup = BeautifulSoup(html, 'html.parser')
        blocks = []
        
        for element in soup.children:
            if element.name is None:
                continue
                
            if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                level = int(element.name[1])
                heading_text = element.get_text().strip()
                blocks.append(ContentBlock(
                    type='heading',
                    content=heading_text,  # 保持向后兼容
                    text=heading_text,     # 新的标准字段
                    level=level
                ))
            elif element.name == 'p':
                text = element.get_text().strip()
                if text:
                    blocks.append(ContentBlock(
                        type='paragraph',
                        content=text,  # 保持向后兼容
                        text=text      # 新的标准字段
                    ))
            elif element.name == 'pre':
                code = element.find('code')
                if code:
                    code_text = code.get_text()
                    blocks.append(ContentBlock(
                        type='code',
                        content=code_text,  # 保持向后兼容
                        text=code_text,     # 新的标准字段
                        language=code.get('class', [''])[0].replace('language-', '') or 'text'
                    ))
            elif element.name == 'blockquote':
                quote_text = element.get_text().strip()
                blocks.append(ContentBlock(
                    type='quote',
                    content=quote_text,  # 保持向后兼容
                    text=quote_text      # 新的标准字段
                ))
            elif element.name in ['ul', 'ol']:
                items = [li.get_text().strip() for li in element.find_all('li')]
                list_text = '\n'.join(items)
                blocks.append(ContentBlock(
                    type='list',
                    content=list_text,  # 保持向后兼容
                    text=list_text,     # 新的标准字段
                    ordered=element.name == 'ol'
                ))
            elif element.name == 'img':
                blocks.append(ContentBlock(
                    type='image',
                    content=element.get('src', ''),
                    caption=element.get('alt', '')
                ))
        
        return blocks


class WordParser(DocumentParser):
    """Word 文档解析器"""

    def __init__(self, file_content: bytes, filename: str):
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx is not installed. Install it with: pip install python-docx")
        super().__init__(file_content, filename)

    def parse(self) -> Dict[str, Any]:
        """解析 Word 文档"""
        start_time = time.time()

        # T072: 检查文件大小
        check_file_size(self.file_content, max_size_mb=10)

        # 加载文档
        doc = Document(io.BytesIO(self.file_content))

        # 提取图片
        self._extract_images_from_docx(doc)

        # 解析内容块
        content_blocks = self._docx_to_content_blocks(doc)

        # 提取纯文本用于元数据
        plain_text = '\n\n'.join([block.content for block in content_blocks if block.content])

        # T073: 清理内容
        plain_text = sanitize_content(plain_text)

        # 提取元数据（传入 content_blocks 以便更好地提取标题）
        metadata = self.extract_metadata_from_blocks(content_blocks, plain_text)
        metadata['parse_time'] = time.time() - start_time

        return {
            'content_blocks': content_blocks,
            'metadata': metadata,
            'images': self.images
        }

    def extract_metadata_from_blocks(self, content_blocks: List[ContentBlock], plain_text: str) -> Dict[str, Any]:
        """从内容块中提取元数据"""
        # 计算字数
        word_count = len(re.findall(r'\w+', plain_text))

        # 计算段落数
        paragraphs = [p.strip() for p in plain_text.split('\n\n') if p.strip()]
        paragraph_count = len(paragraphs)

        # 提取标题：优先从第一个 heading 块中提取
        title = ''
        for block in content_blocks:
            if block.type == 'heading' and block.content:
                title = block.content.strip()
                break

        # 如果没有找到标题，使用文件名
        if not title:
            title = self.filename

        # 生成摘要：从第一个段落或前150字
        summary = ''
        for block in content_blocks:
            if block.type == 'paragraph' and block.content:
                summary = block.content[:150].strip()
                if len(block.content) > 150:
                    summary += '...'
                break

        # 如果没有找到段落，使用纯文本的前150字
        if not summary:
            summary = plain_text[:150].strip()
            if len(plain_text) > 150:
                summary += '...'

        return {
            'title': title,
            'summary': summary,
            'word_count': word_count,
            'paragraph_count': paragraph_count,
            'image_count': len(self.images)
        }
    
    def _extract_images_from_docx(self, doc: Document):
        """从 Word 文档中提取图片并建立 rId 到图片数据的映射"""
        print(f"🔍 开始从 Word 文档中提取图片...")
        print(f"📊 文档关系总数: {len(doc.part.rels)}")

        # 创建 rId 到图片数据的映射
        self.image_map = {}  # {rId: (filename, image_data)}

        # 遍历文档中的所有关系
        image_count = 0
        for rel_id, rel in doc.part.rels.items():
            print(f"  - 关系 {rel_id}: {rel.target_ref}")
            if "image" in rel.target_ref:
                try:
                    image_data = rel.target_part.blob
                    # 从关系中获取文件扩展名，并规范化
                    ext = Path(rel.target_ref).suffix.lower()

                    # 处理不同的图片格式
                    if ext == '.jpeg':
                        ext = '.jpg'
                    elif ext in ['.wmf', '.emf']:
                        # WMF 和 EMF 格式不被 Web 浏览器支持，需要转换为 PNG
                        print(f"  🔄 尝试转换 {ext} 格式到 PNG...")
                        try:
                            from PIL import Image
                            import io

                            # 尝试使用 Pillow 打开 WMF/EMF
                            img = Image.open(io.BytesIO(image_data))

                            # 转换为 PNG
                            png_buffer = io.BytesIO()
                            img.save(png_buffer, format='PNG')
                            image_data = png_buffer.getvalue()
                            ext = '.png'

                            print(f"  ✅ 成功转换 {ext} 到 PNG，大小: {len(image_data)} bytes")
                        except Exception as e:
                            print(f"  ⚠️ 无法转换 {ext} 格式: {str(e)}")
                            print(f"  ℹ️ 跳过此图片")
                            continue
                    elif ext not in ['.jpg', '.png', '.webp', '.gif']:
                        print(f"  ⚠️ 不支持的图片格式: {ext}，跳过")
                        continue

                    filename = f"image_{image_count + 1}{ext}"
                    self.image_map[rel_id] = (filename, image_data)

                    # 直接将图片添加到 images 列表（用于上传）
                    # 这样可以确保所有图片都被上传，即使它们不在段落中
                    self.images.append((filename, image_data))

                    image_count += 1
                    print(f"  ✅ 提取图片: {filename}, 大小: {len(image_data)} bytes, rId: {rel_id}")
                except Exception as e:
                    print(f"  ❌ 提取图片失败: {str(e)}")
                    continue

        print(f"📊 总共提取了 {image_count} 张图片到映射表和上传列表")

        # 如果没有提取到任何图片，给出提示
        if image_count == 0:
            print(f"⚠️ 警告：文档中没有找到支持的图片格式（.jpg, .png, .webp, .gif）")
            print(f"   如果文档包含 WMF/EMF 格式的图片，这些格式暂不支持")
    
    def _docx_to_content_blocks(self, doc: Document) -> List[ContentBlock]:
        """将 Word 文档转换为 ContentBlock 列表"""
        from docx.oxml.ns import qn

        blocks = []

        # 首先，扫描整个文档，找到所有图片的位置
        # 创建一个映射：段落索引 -> 该段落中的图片列表
        paragraph_image_map = {}

        for para_idx, element in enumerate(doc.element.body):
            if isinstance(element, CT_P):
                # 查找该段落中的所有图片引用
                all_blips = element.findall(f'.//{qn("a:blip")}')
                if all_blips:
                    images_in_para = []
                    for blip in all_blips:
                        embed_id = blip.get(qn('r:embed'))
                        if embed_id and embed_id in self.image_map:
                            filename, _ = self.image_map[embed_id]
                            images_in_para.append(filename)
                    if images_in_para:
                        paragraph_image_map[para_idx] = images_in_para
                        print(f"  📍 段落 {para_idx} 包含图片: {images_in_para}")

        for para_idx, element in enumerate(doc.element.body):
            if isinstance(element, CT_P):
                para = Paragraph(element, doc)
                self._parse_paragraph(para, blocks, doc)

                # 如果这个段落在 paragraph_image_map 中，但图片没有被添加到 blocks
                # 那么手动添加这些图片
                if para_idx in paragraph_image_map:
                    for filename in paragraph_image_map[para_idx]:
                        # 检查这个图片是否已经在最近的 blocks 中
                        already_added = False
                        for i in range(max(0, len(blocks) - 5), len(blocks)):
                            if blocks[i].type == 'image' and blocks[i].url == filename:
                                already_added = True
                                break

                        if not already_added:
                            print(f"  ➕ 手动添加段落 {para_idx} 中的图片: {filename}")
                            blocks.append(ContentBlock(
                                type='image',
                                url=filename,
                                content=filename,
                                text=f'Image: {filename}'
                            ))

            elif isinstance(element, CT_Tbl):
                # 解析表格中的图片
                self._parse_table(element, blocks, doc)

        # 检查是否有图片被提取但没有添加到 content_blocks 中
        # 收集已经在 blocks 中的图片文件名
        images_in_blocks = set()
        for block in blocks:
            if block.type == 'image' and block.url:
                images_in_blocks.add(block.url)

        # 找出所有被提取但没有在 blocks 中的图片
        orphan_images = []
        for filename, _ in self.images:
            if filename not in images_in_blocks:
                orphan_images.append(filename)

        # 将孤立的图片按照它们在 image_map 中的顺序添加到 blocks 中
        # 这样可以保持图片在文档中的相对顺序
        if orphan_images:
            print(f"  ⚠️ 发现 {len(orphan_images)} 张图片未在段落/表格中引用")
            print(f"  💡 这些图片可能在文本框、形状或其他容器中")
            print(f"  📝 将按照文档顺序添加这些图片")

            # 按照 image_map 的顺序（即 rId 顺序）添加图片
            # rId 通常反映了图片在文档中的出现顺序
            for rId, (filename, _) in self.image_map.items():
                if filename in orphan_images:
                    blocks.append(ContentBlock(
                        type='image',
                        url=filename,
                        content=filename,
                        text=f'Image: {filename}'
                    ))
                    print(f"  ✅ 添加图片 (rId: {rId}): {filename}")

        return blocks

    def _parse_table(self, table_element, blocks: List[ContentBlock], doc: Document):
        """解析表格，提取其中的图片"""
        from docx.table import Table
        from docx.oxml.ns import qn

        print(f"  📊 解析表格...")
        table = Table(table_element, doc)

        # 遍历表格的所有单元格
        for row_idx, row in enumerate(table.rows):
            for col_idx, cell in enumerate(row.cells):
                # 遍历单元格中的所有段落
                for para in cell.paragraphs:
                    # 检查段落中的图片
                    for run in para.runs:
                        # 检查 w:drawing
                        drawings = run.element.findall(qn('w:drawing'))
                        for drawing in drawings:
                            blip = drawing.find(f'.//{qn("a:blip")}')
                            if blip is not None:
                                embed_id = blip.get(qn('r:embed'))
                                if embed_id and embed_id in self.image_map:
                                    filename, image_data = self.image_map[embed_id]
                                    blocks.append(ContentBlock(
                                        type='image',
                                        url=filename,
                                        content=filename,
                                        text=f'Image: {filename}'
                                    ))
                                    print(f"  📷 在表格 [{row_idx},{col_idx}] 中找到图片: {filename}")

                        # 检查 w:pict
                        picts = run.element.findall(qn('w:pict'))
                        for pict in picts:
                            imagedata = pict.find(f'.//{qn("v:imagedata")}')
                            if imagedata is not None:
                                embed_id = imagedata.get(qn('r:id'))
                                if embed_id and embed_id in self.image_map:
                                    filename, image_data = self.image_map[embed_id]
                                    blocks.append(ContentBlock(
                                        type='image',
                                        url=filename,
                                        content=filename,
                                        text=f'Image: {filename}'
                                    ))
                                    print(f"  📷 在表格 [{row_idx},{col_idx}] 中找到图片 (pict): {filename}")
    
    def _parse_paragraph(self, para: Paragraph, blocks: List[ContentBlock], doc: Document):
        """解析段落，包括文本和图片"""
        from docx.oxml.ns import qn

        # 收集段落中的图片
        paragraph_images = []

        # 检查段落中是否有图片
        print(f"  🔍 检查段落，runs 数量: {len(para.runs)}")

        # 打印 image_map 的内容以便调试
        if not hasattr(self, '_image_map_printed'):
            print(f"  📊 image_map 包含的 rId: {list(self.image_map.keys())}")
            self._image_map_printed = True

        # 方法0: 检查段落本身是否包含浮动图片（w:anchor）
        # 浮动图片不在 runs 中，而是直接在段落元素下
        anchors = para._element.findall(qn('w:r') + '/' + qn('w:drawing'))
        if not anchors:
            # 也检查直接在段落下的 drawing
            anchors = para._element.findall(qn('w:drawing'))

        for anchor in anchors:
            blip = anchor.find(f'.//{qn("a:blip")}')
            if blip is not None:
                embed_id = blip.get(qn('r:embed'))
                print(f"    🔍 段落级别的 drawing，embed_id: {embed_id}")
                if embed_id and embed_id in self.image_map:
                    filename, image_data = self.image_map[embed_id]
                    if filename not in paragraph_images:
                        paragraph_images.append(filename)
                        print(f"    📷 找到段落级别图片: {filename}")

        for i, run in enumerate(para.runs):
            run_text = run.text[:50] if run.text else '(empty)'

            # 方法1: 检查 w:drawing 元素（新版 Word 格式）
            drawings = run.element.findall(qn('w:drawing'))
            if drawings:
                print(f"    🔍 Run {i} [{run_text}]: 找到 {len(drawings)} 个 drawing 元素")

            for drawing in drawings:
                # 提取图片的 rId
                blip = drawing.find(f'.//{qn("a:blip")}')
                if blip is not None:
                    embed_id = blip.get(qn('r:embed'))
                    print(f"      🔍 drawing embed_id: {embed_id}")
                    if embed_id and embed_id in self.image_map:
                        filename, image_data = self.image_map[embed_id]
                        if filename not in paragraph_images:
                            paragraph_images.append(filename)
                            print(f"      📷 找到图片 (drawing): {filename}")
                    else:
                        print(f"      ⚠️ embed_id {embed_id} 不在 image_map 中")

            # 方法2: 检查 w:pict 元素（旧版 Word 格式）
            picts = run.element.findall(qn('w:pict'))
            if picts:
                print(f"    🔍 Run {i} [{run_text}]: 找到 {len(picts)} 个 pict 元素")

            for pict in picts:
                # 查找 v:imagedata 元素
                imagedata = pict.find(f'.//{qn("v:imagedata")}')
                if imagedata is not None:
                    embed_id = imagedata.get(qn('r:id'))
                    print(f"      🔍 pict embed_id: {embed_id}")
                    if embed_id and embed_id in self.image_map:
                        filename, image_data = self.image_map[embed_id]
                        if filename not in paragraph_images:
                            paragraph_images.append(filename)
                            print(f"      📷 找到图片 (pict): {filename}")
                    else:
                        print(f"      ⚠️ embed_id {embed_id} 不在 image_map 中")

        # 处理段落文本
        text = para.text.strip()

        # 如果段落只有图片没有文本，添加图片块后直接返回
        if not text and paragraph_images:
            for img_filename in paragraph_images:
                blocks.append(ContentBlock(
                    type='image',
                    url=img_filename,
                    content=img_filename,
                    text=f'Image: {img_filename}'
                ))
                print(f"  ✅ 添加独立图片块: {img_filename}")
            return

        # 如果段落没有文本也没有图片，跳过
        if not text:
            return

        # 先添加文本块（根据段落样式）
        if para.style.name.startswith('Heading'):
            try:
                level = int(para.style.name.split()[-1])
                blocks.append(ContentBlock(
                    type='heading',
                    content=text,  # 保持向后兼容
                    text=text,     # 新的标准字段
                    level=min(level, 6)
                ))
            except (ValueError, IndexError):
                blocks.append(ContentBlock(
                    type='heading',
                    content=text,  # 保持向后兼容
                    text=text,     # 新的标准字段
                    level=2
                ))
        # 检查是否是列表
        elif para.style.name.startswith('List'):
            # 简单处理：将连续的列表项合并
            if blocks and blocks[-1].type == 'list':
                blocks[-1].content += '\n' + text
                blocks[-1].text = blocks[-1].content  # 同步 text 字段
            else:
                blocks.append(ContentBlock(
                    type='list',
                    content=text,  # 保持向后兼容
                    text=text,     # 新的标准字段
                    ordered=False
                ))
        # 普通段落
        else:
            blocks.append(ContentBlock(
                type='paragraph',
                content=text,  # 保持向后兼容
                text=text      # 新的标准字段
            ))

        # 然后在文本块之后添加图片块
        for img_filename in paragraph_images:
            blocks.append(ContentBlock(
                type='image',
                url=img_filename,
                content=img_filename,
                text=f'Image: {img_filename}'
            ))
            print(f"  ✅ 在文本后添加图片块: {img_filename}")


async def upload_images_concurrently(
    images: List[Tuple[str, bytes]],
    auth_token: str,
    max_concurrent: int = 5
) -> List[Dict[str, Any]]:
    """
    并发上传图片到服务器

    Args:
        images: 图片列表 [(filename, binary_data), ...]
        auth_token: 认证 token
        max_concurrent: 最大并发数（默认 5）

    Returns:
        上传结果列表 [{"original_name": str, "uploaded_url": str, "size": int}, ...]
    """
    print(f"📤 开始上传图片，总数: {len(images)}")
    if not images:
        print("⚠️ 没有图片需要上传")
        return []

    # 限制并发数
    semaphore = asyncio.Semaphore(max_concurrent)

    async def upload_single_image(filename: str, image_data: bytes) -> Dict[str, Any]:
        async with semaphore:
            # 重试配置
            max_retries = 3
            retry_delays = [1, 2, 4]  # 递增延迟（秒）

            for attempt in range(max_retries):
                try:
                    if attempt > 0:
                        print(f"  🔄 重试上传 ({attempt + 1}/{max_retries}): {filename}")
                    else:
                        print(f"  📤 上传图片: {filename}, 大小: {len(image_data)} bytes")

                    # 获取文件扩展名并映射到正确的 MIME 类型
                    ext = Path(filename).suffix.lower()
                    content_type_map = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png',
                        '.webp': 'image/webp',
                        '.gif': 'image/gif'
                    }
                    content_type = content_type_map.get(ext, 'image/jpeg')

                    print(f"  📋 文件扩展名: {ext}, Content-Type: {content_type}")

                    # 创建 FormData
                    form_data = aiohttp.FormData()
                    form_data.add_field(
                        'file',
                        image_data,
                        filename=filename,
                        content_type=content_type
                    )

                    # 上传图片 - 使用配置的后端 URL
                    backend_url = settings.BACKEND_URL
                    upload_url = f"{backend_url}/api/v1/upload/image"
                    headers = {"Authorization": f"Bearer {auth_token}"}

                    print(f"  🌐 上传 URL: {upload_url}")
                    print(f"  🔑 Authorization: Bearer {auth_token[:20]}...")

                    # 设置超时
                    timeout = aiohttp.ClientTimeout(total=30, connect=10)

                    async with aiohttp.ClientSession(timeout=timeout) as session:
                        async with session.post(upload_url, data=form_data, headers=headers) as response:
                            response_text = await response.text()
                            print(f"  📊 响应状态: {response.status}")
                            print(f"  📄 响应内容: {response_text[:200]}")

                            if response.status == 200:
                                result = await response.json()
                                print(f"  ✅ 上传成功: {filename} -> {result['url']}")
                                return {
                                    "original_name": filename,
                                    "uploaded_url": result["url"],
                                    "size": len(image_data)
                                }
                            else:
                                error_msg = f"Upload failed ({response.status}): {response_text}"
                                print(f"  ❌ {error_msg}")

                                # 如果是最后一次尝试，抛出异常
                                if attempt == max_retries - 1:
                                    raise Exception(error_msg)

                                # 否则等待后重试
                                await asyncio.sleep(retry_delays[attempt])

                except aiohttp.ClientConnectorError as e:
                    error_msg = f"连接错误 (ERR_CONNECTION_REFUSED): 无法连接到 {backend_url}. 请检查后端服务是否运行。"
                    print(f"  ❌ {error_msg}")
                    print(f"  🔍 详细错误: {str(e)}")

                    if attempt == max_retries - 1:
                        return {
                            "original_name": filename,
                            "uploaded_url": "",
                            "size": len(image_data),
                            "error": error_msg
                        }

                    # 等待后重试
                    await asyncio.sleep(retry_delays[attempt])

                except asyncio.TimeoutError:
                    error_msg = f"上传超时: {filename}"
                    print(f"  ⏱️ {error_msg}")

                    if attempt == max_retries - 1:
                        return {
                            "original_name": filename,
                            "uploaded_url": "",
                            "size": len(image_data),
                            "error": error_msg
                        }

                    # 等待后重试
                    await asyncio.sleep(retry_delays[attempt])

                except Exception as e:
                    error_msg = f"上传异常: {str(e)}"
                    print(f"  ❌ {error_msg}")
                    print(f"  🔍 错误类型: {type(e).__name__}")

                    if attempt == max_retries - 1:
                        return {
                            "original_name": filename,
                            "uploaded_url": "",
                            "size": len(image_data),
                            "error": error_msg
                        }

                    # 等待后重试
                    await asyncio.sleep(retry_delays[attempt])

            # 如果所有重试都失败，返回错误
            return {
                "original_name": filename,
                "uploaded_url": "",
                "size": len(image_data),
                "error": f"上传失败: 已重试 {max_retries} 次"
            }

    # 并发上传所有图片
    tasks = [upload_single_image(filename, data) for filename, data in images]
    results = await asyncio.gather(*tasks, return_exceptions=False)

    # 统计上传结果
    success_count = sum(1 for r in results if 'error' not in r)
    failed_count = len(results) - success_count
    print(f"📊 图片上传完成: 成功 {success_count}/{len(results)}, 失败 {failed_count}")

    return results


def parse_document(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    解析文档（自动检测类型）

    Args:
        file_content: 文件二进制内容
        filename: 文件名

    Returns:
        解析结果字典
    """
    ext = Path(filename).suffix.lower()

    if ext == '.md':
        parser = MarkdownParser(file_content, filename)
    elif ext == '.docx':
        parser = WordParser(file_content, filename)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    return parser.parse()

