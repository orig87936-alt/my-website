"""
Translation service for text translation with caching
"""
import hashlib
import asyncio
import time
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from langdetect import detect, LangDetectException

from app.models.translation import TranslationCache, TranslationLog
from app.services.deepseek import DeepSeekService
from app.config import get_settings

settings = get_settings()

# ============================================================================
# 多语言支持常量 (T004: 8种语言支持)
# ============================================================================

# 支持的8种语言
SUPPORTED_LANGUAGES = ['zh', 'zh-tw', 'en', 'ja', 'es', 'fr', 'ar', 'hi']

# 语言名称映射
LANGUAGE_NAMES = {
    'zh': 'Chinese (Simplified)',
    'zh-tw': 'Chinese (Traditional)',
    'en': 'English',
    'ja': 'Japanese',
    'es': 'Spanish',
    'fr': 'French',
    'ar': 'Arabic',
    'hi': 'Hindi'
}

# 前端语言代码到后端语言代码的映射
FRONTEND_TO_BACKEND_LANG = {
    'zh-CN': 'zh',
    'zh-TW': 'zh-tw',
    'en': 'en',
    'ja': 'ja',
    'es': 'es',
    'fr': 'fr',
    'ar': 'ar',
    'hi': 'hi'
}

# 后端语言代码到前端语言代码的映射
BACKEND_TO_FRONTEND_LANG = {v: k for k, v in FRONTEND_TO_BACKEND_LANG.items()}


class TranslationService:
    """Translation service with caching and logging"""

    def __init__(self, db: AsyncSession):
        """
        Initialize translation service

        Args:
            db: Database session
        """
        self.db = db
        self.deepseek = DeepSeekService()
        self._db_lock = asyncio.Lock()  # T076: Lock for database operations in concurrent scenarios
    
    @staticmethod
    def _compute_hash(text: str) -> str:
        """
        Compute SHA-256 hash of text for cache key

        Args:
            text: Text to hash

        Returns:
            SHA-256 hash string
        """
        return hashlib.sha256(text.encode('utf-8')).hexdigest()

    @staticmethod
    def _extract_markdown_images(text: str) -> Tuple[str, List[Dict[str, str]]]:
        """
        Extract Markdown images from text and replace with placeholders

        Args:
            text: Markdown text containing images

        Returns:
            Tuple of (text_with_placeholders, list_of_image_info)

        Example:
            Input: "Hello ![alt](url) world"
            Output: ("Hello {{IMAGE_0}} world", [{"alt": "alt", "url": "url", "full": "![alt](url)"}])
        """
        # Regex pattern for Markdown images: ![alt](url)
        # Supports optional title: ![alt](url "title")
        image_pattern = r'!\[([^\]]*)\]\(([^\s\)]+)(?:\s+"([^"]*)")?\)'

        images = []

        def replace_image(match):
            index = len(images)
            alt_text = match.group(1)
            url = match.group(2)
            title = match.group(3) if match.group(3) else ""
            full_match = match.group(0)

            images.append({
                'alt': alt_text,
                'url': url,
                'title': title,
                'full': full_match,
                'placeholder': f'{{{{IMAGE_{index}}}}}'
            })

            return f'{{{{IMAGE_{index}}}}}'

        # Replace all images with placeholders
        text_with_placeholders = re.sub(image_pattern, replace_image, text)

        return text_with_placeholders, images

    @staticmethod
    def _restore_markdown_images(text: str, images: List[Dict[str, str]]) -> str:
        """
        Restore Markdown images from placeholders

        Args:
            text: Translated text with placeholders
            images: List of image info from _extract_markdown_images

        Returns:
            Text with images restored

        Example:
            Input: ("Hello {{IMAGE_0}} world", [{"alt": "alt", "url": "url", "full": "![alt](url)"}])
            Output: "Hello ![alt](url) world"
        """
        result = text

        for image in images:
            placeholder = image['placeholder']
            # Restore the original image markdown
            result = result.replace(placeholder, image['full'])

        return result
    
    async def detect_language(self, text: str) -> Tuple[str, float]:
        """
        Detect language of text (T006: 支持8种语言检测)

        Args:
            text: Text to detect

        Returns:
            Tuple of (language_code, confidence)

        Raises:
            Exception: If language detection fails
        """
        try:
            # Use langdetect library
            detected = detect(text)

            # Map langdetect codes to our supported languages
            language_map = {
                'zh-cn': 'zh',
                'zh-tw': 'zh-tw',
                'zh': 'zh',
                'en': 'en',
                'ja': 'ja',
                'es': 'es',
                'fr': 'fr',
                'ar': 'ar',
                'hi': 'hi'
            }

            # Check if detected language is in our supported list
            if detected in language_map:
                mapped_lang = language_map[detected]
                return (mapped_lang, 0.95)
            else:
                # Try to find a close match
                for key, value in language_map.items():
                    if detected.startswith(key) or key.startswith(detected):
                        return (value, 0.8)

                # Default to English if no match found
                print(f"⚠️  Unsupported language detected: {detected}, defaulting to English")
                return ('en', 0.5)

        except LangDetectException as e:
            print(f"⚠️  Language detection failed: {e}")
            # Default to English
            return ('en', 0.3)
    
    async def _get_from_cache(
        self,
        text_hash: str,
        source_lang: str,
        target_lang: str
    ) -> Optional[str]:
        """
        Get translation from cache
        
        Args:
            text_hash: SHA-256 hash of source text
            source_lang: Source language
            target_lang: Target language
            
        Returns:
            Cached translation or None
        """
        try:
            # T076: Use lock for database operations
            async with self._db_lock:
                # Query cache
                stmt = select(TranslationCache).where(
                    and_(
                        TranslationCache.source_text_hash == text_hash,
                        TranslationCache.source_lang == source_lang,
                        TranslationCache.target_lang == target_lang,
                        TranslationCache.expires_at > datetime.utcnow()
                    )
                )
                result = await self.db.execute(stmt)
                cache_entry = result.scalar_one_or_none()

                if cache_entry:
                    print(f"✅ Cache hit for hash {text_hash[:8]}...")
                    return cache_entry.translated_text

                return None

        except Exception as e:
            print(f"⚠️  Cache lookup failed: {e}")
            return None
    
    async def _save_to_cache(
        self,
        text: str,
        text_hash: str,
        translated_text: str,
        source_lang: str,
        target_lang: str
    ) -> None:
        """
        Save translation to cache
        
        Args:
            text: Source text
            text_hash: SHA-256 hash of source text
            translated_text: Translated text
            source_lang: Source language
            target_lang: Target language
        """
        try:
            # T076: Use lock for database operations
            async with self._db_lock:
                # Create cache entry
                cache_entry = TranslationCache(
                    source_text_hash=text_hash,
                    source_text=text,
                    translated_text=translated_text,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    created_at=datetime.utcnow(),
                    expires_at=datetime.utcnow() + timedelta(days=settings.TRANSLATION_CACHE_DAYS)
                )

                self.db.add(cache_entry)
                await self.db.commit()

                print(f"✅ Saved to cache: {text_hash[:8]}...")

        except Exception as e:
            print(f"⚠️  Failed to save to cache: {e}")
            async with self._db_lock:
                await self.db.rollback()
    
    async def translate_text(
        self,
        text: str,
        source_lang: Optional[str] = None,
        target_lang: str = 'en',
        preserve_markdown_images: bool = True
    ) -> Dict[str, Any]:
        """
        Translate text with caching and Markdown image preservation

        Args:
            text: Text to translate
            source_lang: Source language (auto-detect if None)
            target_lang: Target language
            preserve_markdown_images: Whether to preserve Markdown images (default: True)

        Returns:
            Dict with keys: translated_text, source_lang, target_lang, cached, images_count
        """
        # Extract Markdown images before translation
        images = []
        text_to_translate = text

        if preserve_markdown_images:
            text_to_translate, images = self._extract_markdown_images(text)
            if images:
                print(f"📸 Extracted {len(images)} Markdown images for preservation")

        # Detect source language if not provided
        if not source_lang:
            # Use original text for language detection (without placeholders)
            source_lang, confidence = await self.detect_language(text)
            print(f"🔍 Detected language: {source_lang} (confidence: {confidence:.2f})")

        # Check if source and target are the same
        if source_lang == target_lang:
            return {
                'translated_text': text,  # Return original text with images
                'source_lang': source_lang,
                'target_lang': target_lang,
                'cached': False,
                'images_count': len(images)
            }

        # Compute hash for cache lookup (use text with placeholders)
        text_hash = self._compute_hash(text_to_translate)

        # Try to get from cache
        cached_translation = await self._get_from_cache(text_hash, source_lang, target_lang)

        if cached_translation:
            # Restore images in cached translation
            if preserve_markdown_images and images:
                cached_translation = self._restore_markdown_images(cached_translation, images)
                print(f"📸 Restored {len(images)} images in cached translation")

            return {
                'translated_text': cached_translation,
                'source_lang': source_lang,
                'target_lang': target_lang,
                'cached': True,
                'images_count': len(images)
            }

        # Translate using DeepSeek
        text_length = len(text_to_translate)
        print(f"🔄 Translating {text_length} chars: {source_lang} → {target_lang}...")

        try:
            translated_text = await self.deepseek.translate_text(text_to_translate, source_lang, target_lang)
            translated_length = len(translated_text) if translated_text else 0
            print(f"✅ Translation successful: {translated_length} chars")
        except Exception as e:
            print(f"❌ Translation failed: {e}")
            raise

        # Restore images in translated text
        if preserve_markdown_images and images:
            translated_text = self._restore_markdown_images(translated_text, images)
            print(f"📸 Restored {len(images)} images in translated text")

        # Save to cache (with placeholders, not with restored images)
        # This ensures cache consistency
        text_to_cache = translated_text
        if preserve_markdown_images and images:
            # Remove images again for caching
            text_to_cache, _ = self._extract_markdown_images(translated_text)

        await self._save_to_cache(text_to_translate, text_hash, text_to_cache, source_lang, target_lang)

        return {
            'translated_text': translated_text,
            'source_lang': source_lang,
            'target_lang': target_lang,
            'cached': False,
            'images_count': len(images)
        }
    
    async def batch_translate(
        self,
        fields: List[Dict[str, str]],
        source_lang: Optional[str] = None,
        target_lang: str = 'en',
        article_id: Optional[str] = None,
        max_concurrent: int = 4  # T070: Max concurrent translations
    ) -> Dict[str, Any]:
        """
        T070: Batch translate multiple fields with concurrent processing

        Args:
            fields: List of dicts with 'field_name' and 'text'
            source_lang: Source language (auto-detect if None)
            target_lang: Target language
            article_id: Article ID for logging (optional)
            max_concurrent: Maximum concurrent translations (default: 4)

        Returns:
            Dict with keys: results, source_lang, target_lang, total_fields, cached_count, translation_time
        """
        start_time = time.time()  # T071: Track translation time

        # Detect source language from first field if not provided
        if not source_lang and fields:
            source_lang, _ = await self.detect_language(fields[0]['text'])

        cached_count = 0

        # T070: Concurrent translation with semaphore
        semaphore = asyncio.Semaphore(max_concurrent)

        async def translate_single_field(field: Dict[str, str]) -> Dict[str, Any]:
            """Translate a single field with semaphore control"""
            async with semaphore:
                field_name = field['field_name']
                text = field['text']

                # Translate
                translation_result = await self.translate_text(text, source_lang, target_lang)

                # Log translation (if article_id provided)
                if article_id:
                    await self._log_translation(
                        article_id=article_id,
                        field_name=field_name,
                        source_text=text,
                        translated_text=translation_result['translated_text'],
                        source_lang=source_lang,
                        target_lang=target_lang
                    )

                return {
                    'field_name': field_name,
                    'translated_text': translation_result['translated_text'],
                    'cached': translation_result['cached']
                }

        # Execute translations concurrently
        tasks = [translate_single_field(field) for field in fields]
        results = await asyncio.gather(*tasks)

        # Count cache hits
        cached_count = sum(1 for r in results if r['cached'])

        # T071: Calculate translation time
        translation_time = time.time() - start_time

        return {
            'results': results,
            'source_lang': source_lang,
            'target_lang': target_lang,
            'total_fields': len(fields),
            'cached_count': cached_count,
            'translation_time': round(translation_time, 2),  # T071: Include timing
            'cache_hit_rate': round((cached_count / len(fields) * 100), 2) if fields else 0  # T071: Cache hit rate
        }
    
    async def _log_translation(
        self,
        article_id: str,
        field_name: str,
        source_text: str,
        translated_text: str,
        source_lang: str,
        target_lang: str
    ) -> None:
        """
        Log translation to database
        
        Args:
            article_id: Article ID
            field_name: Field name
            source_text: Source text
            translated_text: Translated text
            source_lang: Source language
            target_lang: Target language
        """
        try:
            # T076: Use lock for database operations
            async with self._db_lock:
                log_entry = TranslationLog(
                    article_id=article_id,
                    field_name=field_name,
                    source_text=source_text,
                    translated_text=translated_text,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    manually_edited=False,
                    created_at=datetime.utcnow()
                )

                self.db.add(log_entry)
                await self.db.commit()

        except Exception as e:
            print(f"⚠️  Failed to log translation: {e}")
            async with self._db_lock:
                await self.db.rollback()

    async def translate_to_multiple_languages(
        self,
        text: str,
        source_lang: Optional[str] = None,
        target_langs: List[str] = None,
        preserve_markdown_images: bool = True,
        max_concurrent: int = 4
    ) -> Dict[str, Any]:
        """
        T008: 将文本翻译到多个目标语言（并发处理）

        Args:
            text: 要翻译的文本
            source_lang: 源语言代码（如果为None则自动检测）
            target_langs: 目标语言代码列表
            preserve_markdown_images: 是否保留Markdown图片
            max_concurrent: 最大并发翻译数（默认4）

        Returns:
            Dict，包含：
            - results: Dict[lang_code, translation_result]
            - source_lang: 检测到的源语言
            - total_langs: 总语言数
            - success_count: 成功翻译数
            - failed_count: 失败翻译数
        """
        # 检测源语言（如果未提供）
        if not source_lang:
            source_lang, confidence = await self.detect_language(text)
            print(f"🔍 Detected source language: {source_lang} (confidence: {confidence:.2f})")

        # 如果未提供目标语言列表，默认翻译到所有支持的语言
        if target_langs is None:
            target_langs = [lang for lang in SUPPORTED_LANGUAGES if lang != source_lang]
        else:
            # 过滤掉源语言
            target_langs = [lang for lang in target_langs if lang != source_lang]

        if not target_langs:
            print("⚠️  No target languages specified or all target languages are same as source")
            return {
                'results': {},
                'source_lang': source_lang,
                'total_langs': 0,
                'success_count': 0,
                'failed_count': 0
            }

        print(f"🌍 Translating from {source_lang} to {len(target_langs)} languages: {', '.join(target_langs)}")

        # 创建翻译任务
        async def translate_single(target_lang: str) -> Tuple[str, Dict[str, Any]]:
            """翻译到单个目标语言"""
            try:
                result = await self.translate_text(
                    text=text,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    preserve_markdown_images=preserve_markdown_images
                )
                return (target_lang, {
                    'translated_text': result['translated_text'],
                    'cached': result.get('cached', False),
                    'images_count': result.get('images_count', 0),
                    'error': None
                })
            except Exception as e:
                print(f"❌ Translation to {target_lang} failed: {e}")
                return (target_lang, {
                    'translated_text': None,
                    'cached': False,
                    'images_count': 0,
                    'error': str(e)
                })

        # 使用信号量控制并发数
        semaphore = asyncio.Semaphore(max_concurrent)

        async def translate_with_semaphore(target_lang: str):
            async with semaphore:
                return await translate_single(target_lang)

        # 并发执行所有翻译任务
        tasks = [translate_with_semaphore(lang) for lang in target_langs]
        results_list = await asyncio.gather(*tasks)

        # 整理结果
        results = {}
        success_count = 0
        failed_count = 0

        for lang, result in results_list:
            results[lang] = result
            if result['error'] is None:
                success_count += 1
                print(f"✅ {lang}: {len(result['translated_text'])} chars (cached: {result['cached']})")
            else:
                failed_count += 1
                print(f"❌ {lang}: {result['error']}")

        return {
            'results': results,
            'source_lang': source_lang,
            'total_langs': len(target_langs),
            'success_count': success_count,
            'failed_count': failed_count
        }

    async def cleanup_expired_cache(self, days: int = 30) -> int:
        """
        T069: Clean up expired translation cache entries

        Args:
            days: Number of days to keep cache (default: 30)

        Returns:
            Number of deleted entries
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            # Delete expired cache entries
            stmt = delete(TranslationCache).where(
                TranslationCache.created_at < cutoff_date
            )

            result = await self.db.execute(stmt)
            await self.db.commit()

            deleted_count = result.rowcount
            print(f"🧹 Cleaned up {deleted_count} expired translation cache entries")

            return deleted_count

        except Exception as e:
            print(f"⚠️  Failed to cleanup cache: {e}")
            await self.db.rollback()
            return 0

    async def get_cache_statistics(self) -> Dict[str, Any]:
        """
        T071: Get translation cache statistics for monitoring

        Returns:
            Dictionary with cache statistics
        """
        try:
            # Total cache entries
            total_stmt = select(TranslationCache)
            total_result = await self.db.execute(total_stmt)
            total_count = len(total_result.scalars().all())

            # Cache entries from last 24 hours
            yesterday = datetime.utcnow() - timedelta(days=1)
            recent_stmt = select(TranslationCache).where(
                TranslationCache.created_at >= yesterday
            )
            recent_result = await self.db.execute(recent_stmt)
            recent_count = len(recent_result.scalars().all())

            # Total translation logs
            logs_stmt = select(TranslationLog)
            logs_result = await self.db.execute(logs_stmt)
            total_translations = len(logs_result.scalars().all())

            return {
                "total_cache_entries": total_count,
                "recent_cache_entries_24h": recent_count,
                "total_translations": total_translations,
                "cache_hit_rate": (total_count / total_translations * 100) if total_translations > 0 else 0
            }

        except Exception as e:
            print(f"⚠️  Failed to get cache statistics: {e}")
            return {
                "total_cache_entries": 0,
                "recent_cache_entries_24h": 0,
                "total_translations": 0,
                "cache_hit_rate": 0
            }

