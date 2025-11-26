"""
FAQ schemas for request/response validation
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class FAQBase(BaseModel):
    """FAQ 基础模型"""
    question_zh: str = Field(..., min_length=1, max_length=500, description="中文问题")
    question_en: str = Field(..., min_length=1, max_length=500, description="英文问题")
    answer_zh: str = Field(..., min_length=1, max_length=5000, description="中文答案")
    answer_en: str = Field(..., min_length=1, max_length=5000, description="英文答案")
    keywords: List[str] = Field(default_factory=list, description="关键词列表")
    priority: int = Field(default=0, ge=0, le=100, description="优先级（0-100，越高越优先）")
    is_active: bool = Field(default=True, description="是否启用")


class FAQCreate(FAQBase):
    """创建 FAQ 请求模型"""

    model_config = {
        "json_schema_extra": {
            "example": {
                "question_zh": "如何预约咨询服务？",
                "question_en": "How to book a consultation service?",
                "answer_zh": "您可以通过我们的预约页面选择合适的时间进行咨询服务预约。步骤如下：1. 访问预约页面 2. 选择日期和时间 3. 填写联系信息 4. 提交预约",
                "answer_en": "You can book a consultation service through our appointment page by selecting a suitable time. Steps: 1. Visit the appointment page 2. Select date and time 3. Fill in contact information 4. Submit appointment",
                "keywords": ["预约", "咨询", "服务", "时间", "appointment", "consultation"],
                "priority": 90,
                "is_active": True
            }
        }
    }


class FAQUpdate(BaseModel):
    """更新 FAQ 请求模型（所有字段可选）"""
    question_zh: Optional[str] = Field(None, min_length=1, max_length=500)
    question_en: Optional[str] = Field(None, min_length=1, max_length=500)
    answer_zh: Optional[str] = Field(None, min_length=1, max_length=5000)
    answer_en: Optional[str] = Field(None, min_length=1, max_length=5000)
    keywords: Optional[List[str]] = None
    priority: Optional[int] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "answer_zh": "更新后的中文答案内容...",
                "answer_en": "Updated English answer content...",
                "priority": 95
            }
        }
    }


class FAQResponse(FAQBase):
    """FAQ 响应模型"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "question_zh": "如何预约咨询服务？",
                "question_en": "How to book a consultation service?",
                "answer_zh": "您可以通过我们的预约页面选择合适的时间进行咨询服务预约...",
                "answer_en": "You can book a consultation service through our appointment page...",
                "keywords": ["预约", "咨询", "服务", "appointment"],
                "priority": 90,
                "is_active": True,
                "created_at": "2025-11-08T10:00:00Z",
                "updated_at": "2025-11-08T10:00:00Z"
            }
        }
    }


class FAQListItem(BaseModel):
    """FAQ 列表项（简化版）"""
    id: UUID
    question_zh: str
    question_en: str
    priority: int
    is_active: bool
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class FAQListResponse(BaseModel):
    """FAQ 列表响应（分页）"""
    items: List[FAQListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [],
                "total": 50,
                "page": 1,
                "page_size": 20,
                "total_pages": 3
            }
        }
    }


class FAQSearchResult(BaseModel):
    """FAQ 搜索结果"""
    id: UUID
    question: str
    answer: str
    priority: int
    relevance_score: float = Field(..., description="相关性分数（0-1）")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "question": "如何预约咨询服务？",
                "answer": "您可以通过我们的预约页面...",
                "priority": 90,
                "relevance_score": 0.95
            }
        }
    }


class FAQSearchResponse(BaseModel):
    """FAQ 搜索响应"""
    results: List[FAQSearchResult]
    total: int
    query: str
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "results": [],
                "total": 5,
                "query": "预约"
            }
        }
    }

