"""
Import articles from JSON file to database
"""
import asyncio
import json
from datetime import datetime
from sqlalchemy import text
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import engine


def parse_datetime(dt_str):
    """Parse datetime string"""
    if dt_str is None:
        return None
    if isinstance(dt_str, datetime):
        return dt_str
    # Try parsing ISO format
    try:
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except:
        return datetime.utcnow()


async def import_articles():
    """Import articles from JSON file"""
    # Load JSON file
    with open('articles_export.json', 'r', encoding='utf-8') as f:
        articles_data = json.load(f)
    
    print(f"📦 准备导入 {len(articles_data)} 篇文章")
    
    async with engine.begin() as conn:
        # Clear existing articles (optional)
        # await conn.execute(text("DELETE FROM articles"))
        # print("🗑️  已清空现有文章")
        
        # Insert articles
        imported = 0
        skipped = 0
        
        for article in articles_data:
            try:
                # Check if article already exists
                result = await conn.execute(
                    text("SELECT id FROM articles WHERE id = :id"),
                    {"id": article['id']}
                )
                if result.fetchone():
                    print(f"⏭️  跳过已存在的文章: {article['title_zh'][:50]}...")
                    skipped += 1
                    continue
                
                # Insert article
                await conn.execute(text("""
                    INSERT INTO articles (
                        id, category, status, title_zh, title_en,
                        summary_zh, summary_en, lead_zh, lead_en,
                        content_zh, content_en, image_url,
                        image_caption_zh, image_caption_en, author,
                        published_at, created_at, updated_at
                    ) VALUES (
                        :id, :category, :status, :title_zh, :title_en,
                        :summary_zh, :summary_en, :lead_zh, :lead_en,
                        :content_zh, :content_en, :image_url,
                        :image_caption_zh, :image_caption_en, :author,
                        :published_at, :created_at, :updated_at
                    )
                """), {
                    'id': article['id'],
                    'category': article['category'],
                    'status': article['status'],
                    'title_zh': article['title_zh'],
                    'title_en': article['title_en'],
                    'summary_zh': article['summary_zh'],
                    'summary_en': article['summary_en'],
                    'lead_zh': article.get('lead_zh'),
                    'lead_en': article.get('lead_en'),
                    'content_zh': json.dumps(article['content_zh']) if isinstance(article['content_zh'], (list, dict)) else article['content_zh'],
                    'content_en': json.dumps(article['content_en']) if isinstance(article['content_en'], (list, dict)) else article['content_en'],
                    'image_url': article.get('image_url'),
                    'image_caption_zh': article.get('image_caption_zh'),
                    'image_caption_en': article.get('image_caption_en'),
                    'author': article.get('author'),
                    'published_at': parse_datetime(article['published_at']),
                    'created_at': parse_datetime(article['created_at']),
                    'updated_at': parse_datetime(article['updated_at']),
                })
                
                imported += 1
                if imported % 10 == 0:
                    print(f"✅ 已导入 {imported} 篇文章...")
                    
            except Exception as e:
                print(f"❌ 导入失败: {article['title_zh'][:50]}... - {str(e)}")
        
        print(f"\n✅ 导入完成！")
        print(f"📊 成功导入: {imported} 篇")
        print(f"⏭️  跳过: {skipped} 篇")


if __name__ == '__main__':
    asyncio.run(import_articles())

