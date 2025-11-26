from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "S&L News API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str

    # DeepSeek API
    DEEPSEEK_API_KEY: str
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_MAX_TOKENS: int = 1000
    DEEPSEEK_TEMPERATURE: float = 0.7

    # OpenAI (for embeddings)
    OPENAI_API_KEY: str
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days (7 * 24 * 60)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7  # Legacy, for backward compatibility

    # CORS (comma-separated string)
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Email
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@example.com"
    EMAIL_FROM_NAME: str = "News Platform"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    ADMIN_NOTIFICATION_EMAIL: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Admin
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Appointments
    APPOINTMENT_TIME_SLOTS: str = "09:00,09:30,10:00,10:30,11:00,11:30,13:00,13:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30"
    EMAIL_RETRY_MAX_ATTEMPTS: int = 3
    EMAIL_RETRY_DELAYS: str = "60,300,1800"

    # Chat
    CHAT_RESPONSE_TIMEOUT: int = 3
    VECTOR_SEARCH_LIMIT: int = 5

    # Translation Service
    TRANSLATION_PROVIDER: str = "deepseek"
    DEEPL_API_KEY: str = "your-deepl-api-key-here"
    TRANSLATION_CACHE_DAYS: int = 30

    # Document Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes
    ALLOWED_FILE_TYPES: str = ".md,.docx"
    TEMP_UPLOAD_DIR: str = "./temp_uploads"

    # Backend API URL (for internal service calls)
    # 生产环境应使用: http://api.s-l.ai 或 http://127.0.0.1:8000
    # 开发环境可使用: http://localhost:8000
    # 注意: 在 Docker 容器中，localhost 可能无法正确解析，建议使用 127.0.0.1
    BACKEND_URL: str = "http://127.0.0.1:8000"

    # Public API URL (for generating URLs accessible from browser)
    # 生产环境应使用: http://api.s-l.ai
    # 开发环境可使用: http://localhost:8000
    PUBLIC_API_URL: str = "http://api.s-l.ai"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    def validate_config(self):
        """验证关键配置项"""
        import logging
        logger = logging.getLogger(__name__)

        # 验证 BACKEND_URL
        if not self.BACKEND_URL:
            logger.error("❌ BACKEND_URL 未配置！")
            raise ValueError("BACKEND_URL is required")

        if self.BACKEND_URL == "http://localhost:8000":
            logger.warning("⚠️ BACKEND_URL 使用默认值 'http://localhost:8000'")
            logger.warning("   在生产环境中，建议使用 'http://api.s-l.ai' 或 'http://127.0.0.1:8000'")

        # 验证 URL 格式
        if not self.BACKEND_URL.startswith(("http://", "https://")):
            logger.error(f"❌ BACKEND_URL 格式错误: {self.BACKEND_URL}")
            raise ValueError("BACKEND_URL must start with http:// or https://")

        logger.info(f"✅ BACKEND_URL 配置: {self.BACKEND_URL}")

        # 验证其他关键配置
        if self.SECRET_KEY == "your-secret-key-change-in-production":
            logger.warning("⚠️ SECRET_KEY 使用默认值，请在生产环境中修改！")

        if self.ENVIRONMENT == "production" and "localhost" in self.BACKEND_URL:
            logger.warning("⚠️ 生产环境中 BACKEND_URL 包含 'localhost'，可能导致连接问题")

@lru_cache()
def get_settings():
    settings = Settings()
    settings.validate_config()
    return settings

# Create a global settings instance for easy import
settings = get_settings()
