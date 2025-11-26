"""
FAQ model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Index, text
from sqlalchemy.dialects.postgresql import ARRAY
from app.models.base import Base
from app.models.types import UUID


class FAQ(Base):
    """FAQ knowledge base model"""

    __tablename__ = "faqs"

    # Primary key
    id = Column(UUID, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Multi-language content
    question_zh = Column(String(500), nullable=False)
    question_en = Column(String(500), nullable=False)
    answer_zh = Column(Text, nullable=False)
    answer_en = Column(Text, nullable=False)
    keywords = Column(ARRAY(Text), nullable=False)  # PostgreSQL array of keywords

    # Organization
    priority = Column(Integer, nullable=False, default=0, server_default="0")  # Higher = more important

    # Status
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")

    # Usage tracking
    usage_count = Column(Integer, nullable=False, default=0, server_default="0")
    last_used_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        # Index for keyword search (GIN index for array)
        Index("idx_faqs_keywords", "keywords", postgresql_using='gin'),
        # Index for active FAQs ordered by priority
        Index(
            "idx_faqs_priority_active",
            "priority"
        ),
    )

    def __repr__(self):
        return f"<FAQ(id={self.id}, question_zh='{self.question_zh[:50]}...', priority={self.priority}, is_active={self.is_active})>"

