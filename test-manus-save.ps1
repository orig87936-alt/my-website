Write-Host "测试保存 Manus AI 文章..." -ForegroundColor Cyan

# 获取 Token
$token = Get-Content "$env:APPDATA\news-platform-token.txt" -ErrorAction SilentlyContinue
if (-not $token) {
    Write-Host "❌ 未找到认证令牌，正在登录..." -ForegroundColor Yellow
    $loginBody = '{"username":"admin","password":"admin123"}'
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/admin-login" -Method POST -Headers @{'Content-Type'='application/json'} -Body $loginBody -UseBasicParsing
        $data = $r.Content | ConvertFrom-Json
        $token = $data.access_token
        New-Item -Path "$env:APPDATA" -Name "news-platform-token.txt" -ItemType File -Value $token -Force | Out-Null
        Write-Host "✅ 登录成功" -ForegroundColor Green
    } catch {
        Write-Host "❌ 登录失败: $_" -ForegroundColor Red
        exit 1
    }
}

# 准备文章数据
$articleData = @{
    title_zh = 'Manus AI：能力、局限性与市场定位'
    title_en = 'Manus AI: Capabilities, Limitations, and Market Position'
    summary_zh = 'Manus AI由中国初创公司Monica（隶属于Butterfly Effect集团）开发，最近作为一个值得注意的自主AI代理出现，旨在跨各个领域执行复杂任务。它的推出引发了关于其能力、局限性以及在竞争激烈的AI领域中的地位的讨论。'
    summary_en = 'Manus AI, developed by the Chinese startup Monica under the Butterfly Effect group, has recently emerged as a notable autonomous AI agent designed to execute complex tasks across various domains. Its introduction has sparked discussions regarding its capabilities, limitations, and position within the competitive AI landscape.'
    content_zh = @(
        @{ type = 'heading'; text = 'Manus AI的能力' }
        @{ type = 'paragraph'; text = 'Manus AI通过几个先进功能脱颖而出：' }
        @{ 
            type = 'list'
            items = @(
                '自主任务执行：与提供建议的传统AI助手不同，Manus AI可以独立执行任务，如整理简历、分析股票趋势和构建网站。'
                '多模态处理：该AI代理能够处理各种数据类型，包括文本、图像和代码，使其能够生成报告、分析视觉内容和自动化编程任务。'
                '高级工具集成：Manus AI无缝集成外部应用程序，如网络浏览器、代码编辑器和数据库管理系统，增强了其在自动化工作流程和决策过程中的实用性。'
            )
        }
    )
    content_en = @(
        @{ type = 'heading'; text = 'Capabilities of Manus AI' }
        @{ type = 'paragraph'; text = 'Manus AI distinguishes itself through several advanced features:' }
        @{
            type = 'list'
            items = @(
                'Autonomous Task Execution: Unlike traditional AI assistants that provide suggestions, Manus AI can independently perform tasks such as sorting résumés, analyzing stock trends, and building websites.'
                'Multi-Modal Processing: The AI agent is capable of handling various data types, including text, images, and code, enabling it to generate reports, analyze visual content, and automate programming tasks.'
                'Advanced Tool Integration: Manus AI seamlessly integrates with external applications like web browsers, code editors, and database management systems, enhancing its utility in automating workflows and decision-making processes.'
            )
        }
    )
    category = 'enterprise'
    author = 'Siberia Fund'
    status = 'published'
    image_url = 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200'
    image_caption_zh = 'Manus AI代表了自主AI代理技术的重大进步。'
    image_caption_en = 'Manus AI represents a significant advancement in autonomous AI agent technology.'
}

# 转换为 JSON
$json = $articleData | ConvertTo-Json -Depth 10 -Compress:$false

Write-Host "📤 发送请求..." -ForegroundColor Yellow
Write-Host "JSON 大小: $([System.Text.Encoding]::UTF8.GetByteCount($json)) bytes" -ForegroundColor Gray

# 发送请求
try {
    $headers = @{
        'Content-Type' = 'application/json; charset=utf-8'
        'Authorization' = "Bearer $token"
    }
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/v1/articles" `
        -Method POST `
        -Headers $headers `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "✅ 成功: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "文章 ID: $($data.id)" -ForegroundColor Cyan
    Write-Host "标题: $($data.title_zh)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 失败: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "错误详情:" -ForegroundColor Yellow
        Write-Host $errorBody -ForegroundColor Red
    }
}

