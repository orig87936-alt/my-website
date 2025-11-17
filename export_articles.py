"""
Export all articles from local database to JSON file
"""
import asyncio
import json
from datetime import datetime
from sqlalchemy import select
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import engine
from app.models.article import Article


def serialize_datetime(obj):
    """JSON serializer for datetime objects"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


async def export_articles():
    """Export all articles to JSON file"""
    async with engine.begin() as conn:
        # Get all articles as rows
        result = await conn.execute(
            select(
                Article.id,
                Article.category,
                Article.status,
                Article.title_zh,
                Article.title_en,
                Article.summary_zh,
                Article.summary_en,
                Article.lead_zh,
                Article.lead_en,
                Article.content_zh,
                Article.content_en,
                Article.image_url,
                Article.image_caption_zh,
                Article.image_caption_en,
                Article.author,
                Article.published_at,
                Article.created_at,
                Article.updated_at,
            ).order_by(Article.published_at.desc())
        )
        articles = result.all()

        print(f"📦 找到 {len(articles)} 篇文章")

        # Convert to dict
        articles_data = []
        for row in articles:
            article_dict = {
                'id': str(row[0]),  # Convert UUID to string
                'category': row[1],
                'status': row[2],
                'title_zh': row[3],
                'title_en': row[4],
                'summary_zh': row[5],
                'summary_en': row[6],
                'lead_zh': row[7],
                'lead_en': row[8],
                'content_zh': row[9],
                'content_en': row[10],
                'image_url': row[11],
                'image_caption_zh': row[12],
                'image_caption_en': row[13],
                'author': row[14],
                'published_at': row[15],
                'created_at': row[16],
                'updated_at': row[17],
            }
            articles_data.append(article_dict)
        
        # Save to JSON file
        with open('articles_export.json', 'w', encoding='utf-8') as f:
            json.dump(articles_data, f, ensure_ascii=False, indent=2, default=serialize_datetime)
        
        print(f"✅ 已导出到 articles_export.json")
        print(f"📊 文件大小: {os.path.getsize('articles_export.json') / 1024:.2f} KB")


if __name__ == '__main__':
    asyncio.run(export_articles())

