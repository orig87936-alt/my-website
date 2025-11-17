"""
测试翻译 API - 包含多张图片的长文本
"""
import requests
import json
import time

# API 配置
API_BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{API_BASE_URL}/api/v1/auth/login"
TRANSLATE_URL = f"{API_BASE_URL}/api/v1/translation/translate"

# 管理员登录
def login():
    """登录获取 token"""
    print("🔐 正在登录...")
    response = requests.post(LOGIN_URL, json={
        "email": "admin@newsplatform.com",
        "password": "admin123"
    })

    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"✅ 登录成功！Token: {token[:20]}...")
        return token
    else:
        print(f"❌ 登录失败：{response.status_code}")
        print(response.text)
        return None

# 读取测试文件
def read_test_file():
    """读取测试 Markdown 文件"""
    print("\n📄 正在读取测试文件...")
    with open("test_translation_with_images.md", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 统计信息
    lines = content.split('\n')
    images = [line for line in lines if line.strip().startswith('![')]
    
    print(f"✅ 文件读取成功！")
    print(f"   - 总字符数: {len(content)}")
    print(f"   - 总行数: {len(lines)}")
    print(f"   - 图片数量: {len(images)}")
    print(f"\n📸 检测到的图片：")
    for i, img in enumerate(images, 1):
        print(f"   {i}. {img[:80]}...")
    
    return content

# 翻译文本
def translate_text(token, text):
    """调用翻译 API"""
    print(f"\n🔄 开始翻译...")
    print(f"   - 源语言: 中文 (zh)")
    print(f"   - 目标语言: 英文 (en)")
    print(f"   - 文本长度: {len(text)} 字符")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "text": text,
        "source_lang": "zh",
        "target_lang": "en"
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(TRANSLATE_URL, headers=headers, json=payload, timeout=300)
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            translated_text = data.get("translated_text", "")
            cached = data.get("cached", False)
            images_count = data.get("images_count", 0)
            
            print(f"\n✅ 翻译成功！")
            print(f"   - 耗时: {elapsed_time:.2f} 秒")
            print(f"   - 缓存命中: {'是' if cached else '否'}")
            print(f"   - 保护的图片数量: {images_count}")
            print(f"   - 翻译后长度: {len(translated_text)} 字符")
            
            return translated_text
        else:
            print(f"\n❌ 翻译失败：{response.status_code}")
            print(response.text)
            return None
            
    except requests.exceptions.Timeout:
        print(f"\n⏱️ 请求超时（超过 300 秒）")
        return None
    except Exception as e:
        print(f"\n❌ 发生错误：{e}")
        return None

# 验证翻译结果
def verify_translation(original, translated):
    """验证翻译结果中的图片"""
    print(f"\n🔍 验证翻译结果...")
    
    # 提取原文中的图片
    original_images = []
    for line in original.split('\n'):
        if line.strip().startswith('!['):
            original_images.append(line.strip())
    
    # 提取译文中的图片
    translated_images = []
    for line in translated.split('\n'):
        if line.strip().startswith('!['):
            translated_images.append(line.strip())
    
    print(f"\n📊 图片对比：")
    print(f"   - 原文图片数量: {len(original_images)}")
    print(f"   - 译文图片数量: {len(translated_images)}")
    
    if len(original_images) == len(translated_images):
        print(f"   ✅ 图片数量一致！")
    else:
        print(f"   ❌ 图片数量不一致！")
        return False
    
    # 检查每张图片的 URL 是否保持不变
    print(f"\n🔗 URL 验证：")
    all_match = True
    for i, (orig, trans) in enumerate(zip(original_images, translated_images), 1):
        # 提取 URL
        orig_url = orig.split('](')[1].split(')')[0] if '](' in orig else ""
        trans_url = trans.split('](')[1].split(')')[0] if '](' in trans else ""
        
        if orig_url == trans_url:
            print(f"   ✅ 图片 {i}: URL 一致")
            print(f"      {orig_url}")
        else:
            print(f"   ❌ 图片 {i}: URL 不一致！")
            print(f"      原文: {orig_url}")
            print(f"      译文: {trans_url}")
            all_match = False
    
    return all_match

# 保存结果
def save_result(translated_text):
    """保存翻译结果"""
    print(f"\n💾 保存翻译结果...")
    
    output_file = "test_translation_result.md"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(translated_text)
    
    print(f"✅ 结果已保存到: {output_file}")

# 主函数
def main():
    print("=" * 80)
    print("🧪 翻译 API 测试 - 长文本 + 多图片")
    print("=" * 80)
    
    # 1. 登录
    token = login()
    if not token:
        return
    
    # 2. 读取测试文件
    original_text = read_test_file()
    
    # 3. 翻译
    translated_text = translate_text(token, original_text)
    if not translated_text:
        return
    
    # 4. 验证
    success = verify_translation(original_text, translated_text)
    
    # 5. 保存结果
    save_result(translated_text)
    
    # 6. 总结
    print("\n" + "=" * 80)
    if success:
        print("🎉 测试成功！所有图片都已正确保护和恢复。")
    else:
        print("⚠️ 测试完成，但发现一些问题，请检查上面的输出。")
    print("=" * 80)

if __name__ == "__main__":
    main()

