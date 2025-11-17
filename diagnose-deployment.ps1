# 🔍 部署诊断脚本
# 用于诊断网站无法访问的问题

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 开始诊断部署问题..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$EC2_IP = "3.17.31.19"

# 1. 测试网络连接
Write-Host "1️⃣ 测试网络连接..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   测试 HTTP (80端口)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://$EC2_IP" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ HTTP 端口 80 可访问" -ForegroundColor Green
    Write-Host "   状态码: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ HTTP 端口 80 无法访问" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "   测试 API (8000端口)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://${EC2_IP}:8000/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ API 端口 8000 可访问" -ForegroundColor Green
    Write-Host "   状态码: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API 端口 8000 无法访问" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "   测试 SSH (22端口)..." -ForegroundColor Gray
$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect($EC2_IP, 22)
    Write-Host "   ✅ SSH 端口 22 可访问" -ForegroundColor Green
    $tcpClient.Close()
} catch {
    Write-Host "   ❌ SSH 端口 22 无法访问" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. 检查 EC2 安全组配置
Write-Host "2️⃣ 检查 EC2 安全组配置..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   正在查询安全组规则..." -ForegroundColor Gray
try {
    # 获取实例信息
    $instance = aws ec2 describe-instances --filters "Name=ip-address,Values=$EC2_IP" --query "Reservations[0].Instances[0]" --output json | ConvertFrom-Json
    
    if ($instance) {
        $instanceId = $instance.InstanceId
        $securityGroups = $instance.SecurityGroups
        
        Write-Host "   实例 ID: $instanceId" -ForegroundColor Cyan
        Write-Host "   安全组:" -ForegroundColor Cyan
        
        foreach ($sg in $securityGroups) {
            Write-Host "     - $($sg.GroupName) ($($sg.GroupId))" -ForegroundColor Cyan
            
            # 获取安全组规则
            $sgRules = aws ec2 describe-security-groups --group-ids $sg.GroupId --query "SecurityGroups[0].IpPermissions" --output json | ConvertFrom-Json
            
            Write-Host "       入站规则:" -ForegroundColor Gray
            foreach ($rule in $sgRules) {
                $port = if ($rule.FromPort -eq $rule.ToPort) { $rule.FromPort } else { "$($rule.FromPort)-$($rule.ToPort)" }
                $protocol = $rule.IpProtocol
                $sources = $rule.IpRanges | ForEach-Object { $_.CidrIp }
                
                Write-Host "         端口 $port ($protocol): $($sources -join ', ')" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ⚠️ 未找到实例信息" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ 无法查询安全组信息" -ForegroundColor Yellow
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# 3. 提供解决方案
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "💡 可能的解决方案" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "如果无法访问,请检查以下几点:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. EC2 安全组配置" -ForegroundColor White
Write-Host "   - 确保入站规则允许以下端口:" -ForegroundColor Gray
Write-Host "     • HTTP (80) - 来源: 0.0.0.0/0" -ForegroundColor Gray
Write-Host "     • HTTPS (443) - 来源: 0.0.0.0/0" -ForegroundColor Gray
Write-Host "     • 自定义 TCP (8000) - 来源: 0.0.0.0/0" -ForegroundColor Gray
Write-Host "     • SSH (22) - 来源: 您的 IP" -ForegroundColor Gray
Write-Host ""

Write-Host "2. EC2 实例状态" -ForegroundColor White
Write-Host "   - 登录 AWS 控制台 → EC2 → 实例" -ForegroundColor Gray
Write-Host "   - 确保实例状态为 '正在运行'" -ForegroundColor Gray
Write-Host "   - 检查状态检查是否通过" -ForegroundColor Gray
Write-Host ""

Write-Host "3. 后端服务状态" -ForegroundColor White
Write-Host "   - 如果能 SSH 连接,运行:" -ForegroundColor Gray
Write-Host "     sudo systemctl status sl-news-backend" -ForegroundColor Cyan
Write-Host "     sudo systemctl status nginx" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Nginx 配置" -ForegroundColor White
Write-Host "   - 检查 Nginx 是否正确配置并运行" -ForegroundColor Gray
Write-Host "   - 运行: sudo nginx -t" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔧 快速修复命令" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "如果您能访问 AWS 控制台,请执行以下步骤:" -ForegroundColor Yellow
Write-Host ""
Write-Host "步骤 1: 修改安全组" -ForegroundColor White
Write-Host "---------------------------------------" -ForegroundColor Gray
Write-Host "1. 登录 AWS 控制台" -ForegroundColor Gray
Write-Host "2. 进入 EC2 → 安全组" -ForegroundColor Gray
Write-Host "3. 找到 'sl-news-backend-sg' 安全组" -ForegroundColor Gray
Write-Host "4. 点击 '编辑入站规则'" -ForegroundColor Gray
Write-Host "5. 确保有以下规则:" -ForegroundColor Gray
Write-Host ""
Write-Host "   类型          协议    端口范围    源" -ForegroundColor Cyan
Write-Host "   ----          ----    --------    --" -ForegroundColor Cyan
Write-Host "   SSH           TCP     22          我的 IP" -ForegroundColor Gray
Write-Host "   HTTP          TCP     80          0.0.0.0/0" -ForegroundColor Gray
Write-Host "   HTTPS         TCP     443         0.0.0.0/0" -ForegroundColor Gray
Write-Host "   自定义 TCP    TCP     8000        0.0.0.0/0" -ForegroundColor Gray
Write-Host ""

Write-Host "步骤 2: 使用 AWS CLI 修复" -ForegroundColor White
Write-Host "---------------------------------------" -ForegroundColor Gray
Write-Host "运行以下命令自动添加规则:" -ForegroundColor Gray
Write-Host ""
Write-Host "# 获取安全组 ID" -ForegroundColor Cyan
Write-Host '$SG_ID = (aws ec2 describe-instances --filters "Name=ip-address,Values=' + $EC2_IP + '" --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" --output text)' -ForegroundColor Cyan
Write-Host ""
Write-Host "# 添加 HTTP 规则" -ForegroundColor Cyan
Write-Host 'aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0' -ForegroundColor Cyan
Write-Host ""
Write-Host "# 添加 HTTPS 规则" -ForegroundColor Cyan
Write-Host 'aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0' -ForegroundColor Cyan
Write-Host ""
Write-Host "# 添加 API 规则" -ForegroundColor Cyan
Write-Host 'aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8000 --cidr 0.0.0.0/0' -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📞 需要帮助?" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果问题仍然存在,请提供以下信息:" -ForegroundColor Yellow
Write-Host "1. 上述诊断结果的截图" -ForegroundColor Gray
Write-Host "2. AWS 控制台中 EC2 实例的状态截图" -ForegroundColor Gray
Write-Host "3. 安全组配置的截图" -ForegroundColor Gray
Write-Host ""

