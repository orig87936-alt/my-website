"""add_multilang_fields_to_articles

Revision ID: 216e2efd0bde
Revises: bd453f122398
Create Date: 2025-11-17 12:52:34.676957

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '216e2efd0bde'
down_revision: Union[str, Sequence[str], None] = 'bd453f122398'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    T014-T016: Add multilingual fields to articles table
    Adds support for 6 additional languages: zh-tw, ja, es, fr, ar, hi
    """
    # Add title fields for 6 new languages
    op.add_column('articles', sa.Column('title_zh_tw', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('title_ja', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('title_es', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('title_fr', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('title_ar', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('title_hi', sa.Text(), nullable=True))

    # Add summary fields for 6 new languages
    op.add_column('articles', sa.Column('summary_zh_tw', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('summary_ja', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('summary_es', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('summary_fr', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('summary_ar', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('summary_hi', sa.Text(), nullable=True))

    # Add lead fields for 6 new languages
    op.add_column('articles', sa.Column('lead_zh_tw', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('lead_ja', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('lead_es', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('lead_fr', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('lead_ar', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('lead_hi', sa.Text(), nullable=True))

    # Add content fields for 6 new languages (JSONB type)
    op.add_column('articles', sa.Column('content_zh_tw', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_ja', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_es', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_fr', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_ar', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_hi', sa.JSON(), nullable=True))

    # Add image caption fields for 6 new languages
    op.add_column('articles', sa.Column('image_caption_zh_tw', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('image_caption_ja', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('image_caption_es', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('image_caption_fr', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('image_caption_ar', sa.Text(), nullable=True))
    op.add_column('articles', sa.Column('image_caption_hi', sa.Text(), nullable=True))


def downgrade() -> None:
    """
    Rollback: Remove multilingual fields from articles table
    """
    # Remove image caption fields
    op.drop_column('articles', 'image_caption_hi')
    op.drop_column('articles', 'image_caption_ar')
    op.drop_column('articles', 'image_caption_fr')
    op.drop_column('articles', 'image_caption_es')
    op.drop_column('articles', 'image_caption_ja')
    op.drop_column('articles', 'image_caption_zh_tw')

    # Remove content fields
    op.drop_column('articles', 'content_hi')
    op.drop_column('articles', 'content_ar')
    op.drop_column('articles', 'content_fr')
    op.drop_column('articles', 'content_es')
    op.drop_column('articles', 'content_ja')
    op.drop_column('articles', 'content_zh_tw')

    # Remove lead fields
    op.drop_column('articles', 'lead_hi')
    op.drop_column('articles', 'lead_ar')
    op.drop_column('articles', 'lead_fr')
    op.drop_column('articles', 'lead_es')
    op.drop_column('articles', 'lead_ja')
    op.drop_column('articles', 'lead_zh_tw')

    # Remove summary fields
    op.drop_column('articles', 'summary_hi')
    op.drop_column('articles', 'summary_ar')
    op.drop_column('articles', 'summary_fr')
    op.drop_column('articles', 'summary_es')
    op.drop_column('articles', 'summary_ja')
    op.drop_column('articles', 'summary_zh_tw')

    # Remove title fields
    op.drop_column('articles', 'title_hi')
    op.drop_column('articles', 'title_ar')
    op.drop_column('articles', 'title_fr')
    op.drop_column('articles', 'title_es')
    op.drop_column('articles', 'title_ja')
    op.drop_column('articles', 'title_zh_tw')
