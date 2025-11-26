"""
启动后端服务器
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 启动 News Platform API...")
    print("📍 地址: http://localhost:8000")
    print("📚 API 文档: http://localhost:8000/api/docs")
    print("💚 健康检查: http://localhost:8000/health")
    print("\n按 Ctrl+C 停止服务器\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

