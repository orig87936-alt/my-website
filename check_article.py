"""
检查文章数据
"""
import asyncio
import sys
import os

# 设置环境变量文件路径
os.environ.setdefault('ENV_FILE', 'backend/.env')

sys.path.insert(0, 'backend')

from app.database import get_db
from app.models.article import Article
from sqlalchemy import select
import json

async def check_article():
    async for db in get_db():
        # 查找标题包含"测试"的文章
        result = await db.execute(
            select(Article).where(Article.title_zh.like('%测试%'))
        )
        article = result.scalar_one_or_none()
        
        if article:
            print(f"\n📰 文章信息:")
            print(f"  ID: {article.id}")
            print(f"  标题(中): {article.title_zh}")
            print(f"  标题(英): {article.title_en}")
            print(f"  分类: {article.category}")
            print(f"  状态: {article.status}")
            print(f"\n🖼️ 图片信息:")
            print(f"  封面图片URL: {article.image_url or '(空)'}")
            print(f"  图片说明(中): {article.image_caption_zh or '(空)'}")
            print(f"  图片说明(英): {article.image_caption_en or '(空)'}")
            print(f"\n📝 内容信息:")
            print(f"  中文内容块数量: {len(article.content_zh) if article.content_zh else 0}")
            print(f"  英文内容块数量: {len(article.content_en) if article.content_en else 0}")
            
            if article.content_zh:
                print(f"\n📋 中文内容块详情:")
                for i, block in enumerate(article.content_zh):
                    print(f"  块 {i+1}:")
                    print(f"    类型: {block.get('type', 'unknown')}")
                    if block.get('type') == 'image':
                        print(f"    图片URL: {block.get('url', '(空)')}")
                        print(f"    图片说明: {block.get('caption', '(空)')}")
                    elif block.get('type') == 'paragraph':
                        text = block.get('text', '')
                        print(f"    文本: {text[:100]}{'...' if len(text) > 100 else ''}")
                    elif block.get('type') == 'markdown':
                        text = block.get('text', '')
                        print(f"    Markdown: {text[:100]}{'...' if len(text) > 100 else ''}")
            
            print(f"\n📄 完整JSON数据:")
            print(json.dumps({
                'id': str(article.id),
                'title_zh': article.title_zh,
                'title_en': article.title_en,
                'image_url': article.image_url,
                'content_zh': article.content_zh,
                'content_en': article.content_en
            }, ensure_ascii=False, indent=2))
        else:
            print("❌ 未找到包含'测试'的文章")
        
        break

if __name__ == '__main__':
    asyncio.run(check_article())

