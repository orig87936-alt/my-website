"""
Sync articles table schema with current model
"""
import asyncio
from sqlalchemy import text
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import engine


async def sync_schema():
    """Sync articles table schema with current model"""
    async with engine.begin() as conn:
        # Get all existing columns
        result = await conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='articles'
        """))
        existing = [row[0] for row in result]
        print(f"📋 Existing columns: {', '.join(existing)}")

        # Define all required columns
        required_columns = {
            'lead_zh': 'TEXT',
            'lead_en': 'TEXT',
            'image_url': 'TEXT',
            'image_caption_zh': 'TEXT',
            'image_caption_en': 'TEXT',
        }

        # Add missing columns
        for col_name, col_type in required_columns.items():
            if col_name not in existing:
                await conn.execute(text(f'ALTER TABLE articles ADD COLUMN {col_name} {col_type}'))
                print(f'✅ Added {col_name} column ({col_type})')
            else:
                print(f'ℹ️  {col_name} column already exists')

        print('✅ Schema sync complete!')


if __name__ == '__main__':
    asyncio.run(sync_schema())

