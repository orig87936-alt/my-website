"""
测试多语言翻译功能
Test multi-language translation feature
"""
import asyncio
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import get_db
from app.services.translation import TranslationService, SUPPORTED_LANGUAGES, LANGUAGE_NAMES


async def test_language_detection():
    """测试语言检测功能"""
    print("\n" + "="*60)
    print("测试 1: 语言检测 (支持8种语言)")
    print("="*60)
    
    test_texts = {
        'zh': "这是一个中文测试文本。",
        'en': "This is an English test text.",
        'ja': "これは日本語のテストテキストです。",
        'es': "Este es un texto de prueba en español.",
        'fr': "Ceci est un texte de test en français.",
        'ar': "هذا نص تجريبي باللغة العربية.",
        'hi': "यह हिंदी में एक परीक्षण पाठ है।"
    }
    
    async for db in get_db():
        service = TranslationService(db)
        
        for expected_lang, text in test_texts.items():
            detected_lang, confidence = await service.detect_language(text)
            status = "✅" if detected_lang == expected_lang or (expected_lang == 'zh' and detected_lang in ['zh', 'zh-tw']) else "⚠️"
            print(f"{status} 期望: {expected_lang:6s} | 检测: {detected_lang:6s} | 置信度: {confidence:.2f} | 文本: {text[:30]}...")
        
        break


async def test_single_translation():
    """测试单个翻译"""
    print("\n" + "="*60)
    print("测试 2: 单个翻译 (中文 → 英文)")
    print("="*60)
    
    text = "这是一个测试文本，用于验证翻译功能是否正常工作。"
    
    async for db in get_db():
        service = TranslationService(db)
        
        result = await service.translate_text(
            text=text,
            source_lang='zh',
            target_lang='en'
        )
        
        print(f"源文本: {text}")
        print(f"译文: {result['translated_text']}")
        print(f"源语言: {result['source_lang']}")
        print(f"目标语言: {result['target_lang']}")
        print(f"缓存: {result['cached']}")
        
        break


async def test_multilang_translation():
    """测试多语言翻译"""
    print("\n" + "="*60)
    print("测试 3: 多语言翻译 (中文 → 7种语言)")
    print("="*60)
    
    text = "欢迎使用我们的多语言翻译系统！这个系统支持8种语言之间的互译。"
    
    async for db in get_db():
        service = TranslationService(db)
        
        # 翻译到所有其他语言
        target_langs = ['en', 'ja', 'es', 'fr', 'ar', 'hi', 'zh-tw']
        
        print(f"源文本: {text}")
        print(f"目标语言: {', '.join(target_langs)}")
        print(f"\n开始翻译...")
        
        result = await service.translate_to_multiple_languages(
            text=text,
            source_lang='zh',
            target_langs=target_langs,
            max_concurrent=4
        )
        
        print(f"\n翻译结果:")
        print(f"源语言: {result['source_lang']}")
        print(f"总语言数: {result['total_langs']}")
        print(f"成功: {result['success_count']}")
        print(f"失败: {result['failed_count']}")
        
        print(f"\n各语言翻译结果:")
        for lang, lang_result in result['results'].items():
            lang_name = LANGUAGE_NAMES.get(lang, lang)
            if lang_result['error']:
                print(f"❌ {lang_name:25s} | 错误: {lang_result['error']}")
            else:
                cached_mark = "💾" if lang_result['cached'] else "🆕"
                text_preview = lang_result['translated_text'][:50] + "..." if len(lang_result['translated_text']) > 50 else lang_result['translated_text']
                print(f"✅ {lang_name:25s} | {cached_mark} | {text_preview}")
        
        break


async def test_markdown_preservation():
    """测试Markdown图片保留"""
    print("\n" + "="*60)
    print("测试 4: Markdown图片保留")
    print("="*60)
    
    text = """
这是一个包含图片的文档。

![测试图片](https://example.com/image1.jpg)

这是第二段文字。

![另一张图片](https://example.com/image2.png "图片标题")
"""
    
    async for db in get_db():
        service = TranslationService(db)
        
        result = await service.translate_text(
            text=text,
            source_lang='zh',
            target_lang='en',
            preserve_markdown_images=True
        )
        
        print(f"源文本:\n{text}")
        print(f"\n译文:\n{result['translated_text']}")
        print(f"\n图片数量: {result['images_count']}")
        
        # 检查图片是否保留
        if '![' in result['translated_text'] and 'https://example.com' in result['translated_text']:
            print("✅ Markdown图片已正确保留")
        else:
            print("❌ Markdown图片未正确保留")
        
        break


async def test_supported_languages():
    """显示支持的语言列表"""
    print("\n" + "="*60)
    print("支持的语言列表")
    print("="*60)
    
    print(f"\n共支持 {len(SUPPORTED_LANGUAGES)} 种语言:\n")
    for i, lang in enumerate(SUPPORTED_LANGUAGES, 1):
        lang_name = LANGUAGE_NAMES.get(lang, lang)
        print(f"{i}. {lang:8s} - {lang_name}")


async def main():
    """运行所有测试"""
    print("\n" + "="*60)
    print("多语言翻译功能测试")
    print("Multi-Language Translation Feature Test")
    print("="*60)
    
    try:
        # 显示支持的语言
        await test_supported_languages()
        
        # 测试语言检测
        await test_language_detection()
        
        # 测试单个翻译
        await test_single_translation()
        
        # 测试多语言翻译
        await test_multilang_translation()
        
        # 测试Markdown保留
        await test_markdown_preservation()
        
        print("\n" + "="*60)
        print("✅ 所有测试完成！")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())

