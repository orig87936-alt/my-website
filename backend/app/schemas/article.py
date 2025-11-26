"""
Article schemas for request/response validation
"""
from datetime import datetime
from typing import List, Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, ConfigDict


# Content block schema
class ContentBlock(BaseModel):
    """Content block for article content"""
    model_config = ConfigDict(exclude_none=True)  # Exclude None values from JSON serialization

    type: str = Field(..., description="Block type: paragraph, heading, list, quote, code, image, markdown")
    text: Optional[str] = Field(None, description="Block text content")
    content: Optional[str] = Field(None, description="Block content (deprecated, use 'text')")
    level: Optional[int] = Field(None, description="Heading level (1-6) for heading type")
    items: Optional[List[str]] = Field(None, description="List items for list type")
    language: Optional[str] = Field(None, description="Code language for code type")
    url: Optional[str] = Field(None, description="Image URL for image type")
    caption: Optional[str] = Field(None, description="Image caption for image type")
    width: Optional[int] = Field(None, description="Image width in pixels for image type")
    height: Optional[int] = Field(None, description="Image height in pixels for image type")

    @field_validator('type')
    @classmethod
    def validate_type(cls, v):
        allowed_types = ['paragraph', 'heading', 'list', 'quote', 'code', 'image', 'markdown']
        if v not in allowed_types:
            raise ValueError(f"type must be one of {allowed_types}")
        return v

    @field_validator('level')
    @classmethod
    def validate_level(cls, v):
        if v is not None and (v < 1 or v > 6):
            raise ValueError("level must be between 1 and 6")
        return v


# Base article schema
class ArticleBase(BaseModel):
    """Base article schema with common fields (T019: 8-language support)"""
    category: str = Field(..., description="Article category")
    status: str = Field(default="published", description="Article status")

    # Titles (8 languages) - Only Chinese is required
    title_zh: str = Field(..., min_length=1, max_length=500, description="Chinese (Simplified) title")
    title_en: Optional[str] = Field(None, max_length=500, description="English title")
    title_zh_tw: Optional[str] = Field(None, max_length=500, description="Chinese (Traditional) title")
    title_ja: Optional[str] = Field(None, max_length=500, description="Japanese title")
    title_es: Optional[str] = Field(None, max_length=500, description="Spanish title")
    title_fr: Optional[str] = Field(None, max_length=500, description="French title")
    title_ar: Optional[str] = Field(None, max_length=500, description="Arabic title")
    title_hi: Optional[str] = Field(None, max_length=500, description="Hindi title")

    # Summaries (8 languages) - Only Chinese is required
    summary_zh: str = Field(..., min_length=1, description="Chinese (Simplified) summary")
    summary_en: Optional[str] = Field(None, description="English summary")
    summary_zh_tw: Optional[str] = Field(None, description="Chinese (Traditional) summary")
    summary_ja: Optional[str] = Field(None, description="Japanese summary")
    summary_es: Optional[str] = Field(None, description="Spanish summary")
    summary_fr: Optional[str] = Field(None, description="French summary")
    summary_ar: Optional[str] = Field(None, description="Arabic summary")
    summary_hi: Optional[str] = Field(None, description="Hindi summary")

    # Lead paragraphs (8 languages)
    lead_zh: Optional[str] = Field(None, description="Chinese (Simplified) lead paragraph")
    lead_en: Optional[str] = Field(None, description="English lead paragraph")
    lead_zh_tw: Optional[str] = Field(None, description="Chinese (Traditional) lead paragraph")
    lead_ja: Optional[str] = Field(None, description="Japanese lead paragraph")
    lead_es: Optional[str] = Field(None, description="Spanish lead paragraph")
    lead_fr: Optional[str] = Field(None, description="French lead paragraph")
    lead_ar: Optional[str] = Field(None, description="Arabic lead paragraph")
    lead_hi: Optional[str] = Field(None, description="Hindi lead paragraph")

    # Image
    image_url: Optional[str] = Field(None, description="Article image URL")
    image_caption_zh: Optional[str] = Field(None, description="Chinese (Simplified) image caption")
    image_caption_en: Optional[str] = Field(None, description="English image caption")
    image_caption_zh_tw: Optional[str] = Field(None, description="Chinese (Traditional) image caption")
    image_caption_ja: Optional[str] = Field(None, description="Japanese image caption")
    image_caption_es: Optional[str] = Field(None, description="Spanish image caption")
    image_caption_fr: Optional[str] = Field(None, description="French image caption")
    image_caption_ar: Optional[str] = Field(None, description="Arabic image caption")
    image_caption_hi: Optional[str] = Field(None, description="Hindi image caption")

    # Metadata
    author: Optional[str] = Field(None, max_length=100, description="Article author")
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed_categories = ['headline', 'regulatory', 'analysis', 'business', 'enterprise', 'outlook']
        if v not in allowed_categories:
            raise ValueError(f"category must be one of {allowed_categories}")
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        allowed_statuses = ['draft', 'published', 'archived']
        if v not in allowed_statuses:
            raise ValueError(f"status must be one of {allowed_statuses}")
        return v


# Create article schema
class ArticleCreate(ArticleBase):
    """Schema for creating a new article (T019: 8-language support)"""
    # Content blocks (8 languages) - Only Chinese is required
    content_zh: List[ContentBlock] = Field(..., description="Chinese (Simplified) content blocks")
    content_en: Optional[List[ContentBlock]] = Field(None, description="English content blocks")
    content_zh_tw: Optional[List[ContentBlock]] = Field(None, description="Chinese (Traditional) content blocks")
    content_ja: Optional[List[ContentBlock]] = Field(None, description="Japanese content blocks")
    content_es: Optional[List[ContentBlock]] = Field(None, description="Spanish content blocks")
    content_fr: Optional[List[ContentBlock]] = Field(None, description="French content blocks")
    content_ar: Optional[List[ContentBlock]] = Field(None, description="Arabic content blocks")
    content_hi: Optional[List[ContentBlock]] = Field(None, description="Hindi content blocks")

    published_at: Optional[datetime] = Field(None, description="Publication date (defaults to now)")


# Update article schema
class ArticleUpdate(BaseModel):
    """Schema for updating an article (all fields optional, T019: 8-language support)"""
    category: Optional[str] = None
    status: Optional[str] = None

    # Titles (8 languages)
    title_zh: Optional[str] = Field(None, min_length=1, max_length=500)
    title_en: Optional[str] = Field(None, min_length=1, max_length=500)
    title_zh_tw: Optional[str] = Field(None, min_length=1, max_length=500)
    title_ja: Optional[str] = Field(None, min_length=1, max_length=500)
    title_es: Optional[str] = Field(None, min_length=1, max_length=500)
    title_fr: Optional[str] = Field(None, min_length=1, max_length=500)
    title_ar: Optional[str] = Field(None, min_length=1, max_length=500)
    title_hi: Optional[str] = Field(None, min_length=1, max_length=500)

    # Summaries (8 languages)
    summary_zh: Optional[str] = Field(None, min_length=1)
    summary_en: Optional[str] = Field(None, min_length=1)
    summary_zh_tw: Optional[str] = Field(None, min_length=1)
    summary_ja: Optional[str] = Field(None, min_length=1)
    summary_es: Optional[str] = Field(None, min_length=1)
    summary_fr: Optional[str] = Field(None, min_length=1)
    summary_ar: Optional[str] = Field(None, min_length=1)
    summary_hi: Optional[str] = Field(None, min_length=1)

    # Lead paragraphs (8 languages)
    lead_zh: Optional[str] = None
    lead_en: Optional[str] = None
    lead_zh_tw: Optional[str] = None
    lead_ja: Optional[str] = None
    lead_es: Optional[str] = None
    lead_fr: Optional[str] = None
    lead_ar: Optional[str] = None
    lead_hi: Optional[str] = None

    # Content blocks (8 languages)
    content_zh: Optional[List[ContentBlock]] = None
    content_en: Optional[List[ContentBlock]] = None
    content_zh_tw: Optional[List[ContentBlock]] = None
    content_ja: Optional[List[ContentBlock]] = None
    content_es: Optional[List[ContentBlock]] = None
    content_fr: Optional[List[ContentBlock]] = None
    content_ar: Optional[List[ContentBlock]] = None
    content_hi: Optional[List[ContentBlock]] = None

    # Image
    image_url: Optional[str] = None
    image_caption_zh: Optional[str] = None
    image_caption_en: Optional[str] = None
    image_caption_zh_tw: Optional[str] = None
    image_caption_ja: Optional[str] = None
    image_caption_es: Optional[str] = None
    image_caption_fr: Optional[str] = None
    image_caption_ar: Optional[str] = None
    image_caption_hi: Optional[str] = None

    # Metadata
    author: Optional[str] = Field(None, max_length=100)
    published_at: Optional[datetime] = None
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        if v is not None:
            allowed_categories = ['headline', 'regulatory', 'analysis', 'business', 'enterprise', 'outlook']
            if v not in allowed_categories:
                raise ValueError(f"category must be one of {allowed_categories}")
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['draft', 'published', 'archived']
            if v not in allowed_statuses:
                raise ValueError(f"status must be one of {allowed_statuses}")
        return v


# Article response schema (simplified for list view)
class ArticleListItem(BaseModel):
    """Simplified article schema for list view (T019: 8-language support)"""
    model_config = ConfigDict(from_attributes=True, exclude_none=True)

    id: UUID
    category: str
    status: str

    # Titles (8 languages)
    title_zh: str
    title_en: str
    title_zh_tw: Optional[str] = None
    title_ja: Optional[str] = None
    title_es: Optional[str] = None
    title_fr: Optional[str] = None
    title_ar: Optional[str] = None
    title_hi: Optional[str] = None

    # Summaries (8 languages)
    summary_zh: str
    summary_en: str
    summary_zh_tw: Optional[str] = None
    summary_ja: Optional[str] = None
    summary_es: Optional[str] = None
    summary_fr: Optional[str] = None
    summary_ar: Optional[str] = None
    summary_hi: Optional[str] = None

    image_url: Optional[str] = None
    author: Optional[str] = None
    published_at: datetime
    created_at: datetime
    updated_at: datetime


# Full article response schema
class ArticleResponse(ArticleListItem):
    """Full article schema with content (T019: 8-language support)"""
    # Inherits model_config from ArticleListItem (from_attributes=True, exclude_none=True)

    # Lead paragraphs (8 languages)
    lead_zh: Optional[str] = None
    lead_en: Optional[str] = None
    lead_zh_tw: Optional[str] = None
    lead_ja: Optional[str] = None
    lead_es: Optional[str] = None
    lead_fr: Optional[str] = None
    lead_ar: Optional[str] = None
    lead_hi: Optional[str] = None

    # Content blocks (8 languages) - Use ContentBlock for proper serialization
    content_zh: List[ContentBlock]  # Content blocks with exclude_none
    content_en: List[ContentBlock]  # Content blocks with exclude_none
    content_zh_tw: Optional[List[ContentBlock]] = None
    content_ja: Optional[List[ContentBlock]] = None
    content_es: Optional[List[ContentBlock]] = None
    content_fr: Optional[List[ContentBlock]] = None
    content_ar: Optional[List[ContentBlock]] = None
    content_hi: Optional[List[ContentBlock]] = None

    # Image captions (8 languages)
    image_caption_zh: Optional[str] = None
    image_caption_en: Optional[str] = None
    image_caption_zh_tw: Optional[str] = None
    image_caption_ja: Optional[str] = None
    image_caption_es: Optional[str] = None
    image_caption_fr: Optional[str] = None
    image_caption_ar: Optional[str] = None
    image_caption_hi: Optional[str] = None


# Paginated article list response
class ArticleListResponse(BaseModel):
    """Paginated list of articles"""
    items: List[ArticleListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    @property
    def has_next(self) -> bool:
        return self.page < self.total_pages
    
    @property
    def has_prev(self) -> bool:
        return self.page > 1


# Related articles response (for article bottom navigation)
class RelatedArticlesResponse(BaseModel):
    """Related articles for article bottom navigation"""
    articles: List[ArticleListItem]
    total: int
    has_more: bool  # True if there are more than 6 articles

