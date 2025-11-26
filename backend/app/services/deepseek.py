"""
DeepSeek AI service for chat completion
"""
import httpx
from typing import List, Dict, Optional
from app.config import get_settings

settings = get_settings()


class DeepSeekService:
    """DeepSeek AI 服务"""
    
    BASE_URL = settings.DEEPSEEK_BASE_URL
    API_KEY = settings.DEEPSEEK_API_KEY
    MODEL = settings.DEEPSEEK_MODEL
    MAX_TOKENS = settings.DEEPSEEK_MAX_TOKENS
    TEMPERATURE = settings.DEEPSEEK_TEMPERATURE
    
    @staticmethod
    async def chat_completion(
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        调用 DeepSeek Chat API 生成回复
        
        Args:
            messages: 消息列表，格式: [{"role": "user", "content": "..."}]
            max_tokens: 最大 token 数（可选）
            temperature: 温度参数（可选）
            
        Returns:
            AI 生成的回复内容
            
        Raises:
            Exception: API 调用失败时抛出异常
        """
        if not DeepSeekService.API_KEY or DeepSeekService.API_KEY == "your-deepseek-api-key-here":
            # 开发环境：返回模拟回复
            print("⚠️  DeepSeek API 未配置，返回模拟回复")
            return DeepSeekService._mock_response(messages)
        
        url = f"{DeepSeekService.BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {DeepSeekService.API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": DeepSeekService.MODEL,
            "messages": messages,
            "max_tokens": max_tokens or DeepSeekService.MAX_TOKENS,
            "temperature": temperature or DeepSeekService.TEMPERATURE,
            "stream": False
        }
        
        try:
            # 增加超时时间以支持长文本翻译（最多 5 分钟）
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                
                data = response.json()
                
                # 提取回复内容
                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"]
                else:
                    raise Exception("DeepSeek API 返回格式错误")
                    
        except httpx.HTTPStatusError as e:
            print(f"❌ DeepSeek API HTTP 错误: {e.response.status_code} - {e.response.text}")
            raise Exception(f"DeepSeek API 调用失败: {e.response.status_code}")
        except httpx.TimeoutException:
            print("❌ DeepSeek API 超时")
            raise Exception("DeepSeek API 调用超时")
        except Exception as e:
            print(f"❌ DeepSeek API 错误: {str(e)}")
            raise Exception(f"DeepSeek API 调用失败: {str(e)}")
    
    @staticmethod
    def _mock_response(messages: List[Dict[str, str]]) -> str:
        """
        开发环境模拟回复
        """
        if not messages:
            return "您好！我是智能助手，有什么可以帮您的吗？"
        
        last_message = messages[-1]["content"].lower()
        
        # 简单的关键词匹配
        if "预约" in last_message:
            return """您可以通过以下步骤进行预约：

1. 点击页面上方的"预约"按钮
2. 选择合适的日期和时间（工作时间：9:00-18:00）
3. 填写您的联系信息（姓名、邮箱、电话）
4. 选择服务类型并添加备注
5. 提交预约

预约成功后，您会收到确认邮件。

💡 如需进一步咨询，欢迎点击页面上方的"预约"按钮，选择合适的时间预约一对一咨询服务。我们的专业顾问将为您提供更详细的解答。"""
        
        elif "取消" in last_message:
            return """如需取消预约，请联系我们的客服团队，提供您的预约确认号。我们会尽快为您处理。

客服邮箱：support@example.com
客服电话：400-123-4567

💡 如需进一步咨询，欢迎点击页面上方的"预约"按钮，选择合适的时间预约一对一咨询服务。我们的专业顾问将为您提供更详细的解答。"""
        
        elif "时间" in last_message or "营业" in last_message:
            return """我们的营业时间为：
周一至周五：9:00 - 18:00
周六至周日：休息

预约时间槽为 30 分钟间隔，您可以选择任意可用的时间段。

💡 如需进一步咨询，欢迎点击页面上方的"预约"按钮，选择合适的时间预约一对一咨询服务。我们的专业顾问将为您提供更详细的解答。"""
        
        elif "服务" in last_message or "咨询" in last_message:
            return """我们提供以下服务：

1. 咨询服务 - 专业顾问一对一咨询
2. 技术支持 - 技术问题解答和指导
3. 产品演示 - 产品功能展示和体验
4. 培训服务 - 专业培训和指导

您可以在预约时选择您需要的服务类型。

💡 如需进一步咨询，欢迎点击页面上方的"预约"按钮，选择合适的时间预约一对一咨询服务。我们的专业顾问将为您提供更详细的解答。"""
        
        elif "你好" in last_message or "您好" in last_message or "hi" in last_message:
            return """您好！我是智能助手，很高兴为您服务。您可以问我关于预约、服务、文章等方面的问题。

💡 如需进一步咨询，欢迎点击页面上方的"预约"按钮，选择合适的时间预约一对一咨询服务。我们的专业顾问将为您提供更详细的解答。"""
        
        else:
            return f"""感谢您的提问！我已经收到您的消息："{messages[-1]['content']}"

我可以帮您解答以下问题：
- 如何预约服务
- 预约时间和流程
- 服务类型介绍
- 取消或修改预约
- 其他常见问题

请告诉我您想了解什么？

💡 如需进一步咨询，欢迎点击页面上方的"预约"按钮，选择合适的时间预约一对一咨询服务。我们的专业顾问将为您提供更详细的解答。"""
    
    @staticmethod
    def build_rag_prompt(
        user_question: str,
        faq_results: List[Dict],
        article_results: List[Dict]
    ) -> List[Dict[str, str]]:
        """
        构建 RAG 提示词
        
        Args:
            user_question: 用户问题
            faq_results: FAQ 检索结果
            article_results: 文章检索结果
            
        Returns:
            消息列表
        """
        # 构建上下文
        context_parts = []
        
        # 添加 FAQ 上下文
        if faq_results:
            context_parts.append("=== 常见问题解答 ===")
            for i, faq in enumerate(faq_results[:3], 1):  # 最多 3 个 FAQ
                context_parts.append(f"\nQ{i}: {faq['question']}")
                context_parts.append(f"A{i}: {faq['answer']}")
        
        # 添加文章上下文
        if article_results:
            context_parts.append("\n=== 相关文章 ===")
            for i, article in enumerate(article_results[:2], 1):  # 最多 2 篇文章
                context_parts.append(f"\n文章{i}: {article['title']}")
                if article.get('summary'):
                    context_parts.append(f"摘要: {article['summary']}")
        
        context = "\n".join(context_parts)
        
        # 构建系统提示
        system_prompt = """你是一个专业的客服助手，负责回答用户关于网站服务、预约流程、文章内容等问题。

请遵循以下规则：
1. 基于提供的上下文信息回答问题
2. 如果上下文中没有相关信息，礼貌地告知用户并建议联系人工客服
3. 回答要简洁、准确、友好
4. 使用中文回答
5. 如果涉及预约，提供清晰的步骤说明
6. 保持专业和礼貌的语气
7. **重要**：在回答的最后，务必提醒用户如需进一步咨询，可以通过页面上方的"预约"按钮预约具体时间进行一对一咨询服务

回答格式示例：
[回答用户的问题...]

💡 如需进一步咨询，欢迎点击页面上方的"预约"按钮，选择合适的时间预约一对一咨询服务。我们的专业顾问将为您提供更详细的解答。"""
        
        # 构建用户提示
        if context:
            user_prompt = f"""参考以下信息回答用户问题：

{context}

用户问题：{user_question}

请基于上述信息给出准确、友好的回答。"""
        else:
            user_prompt = f"""用户问题：{user_question}

请给出友好的回答，如果需要更多信息，建议用户联系人工客服。"""
        
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

    @staticmethod
    async def translate_text(
        text: str,
        source_lang: str,
        target_lang: str
    ) -> str:
        """
        使用 DeepSeek API 翻译文本

        Args:
            text: 要翻译的文本
            source_lang: 源语言 (zh/en)
            target_lang: 目标语言 (zh/en)

        Returns:
            翻译后的文本

        Raises:
            Exception: API 调用失败时抛出异常
        """
        # 构建翻译提示词
        lang_names = {
            "zh": "简体中文",
            "zh-tw": "繁体中文",
            "en": "英文",
            "ja": "日文",
            "es": "西班牙文",
            "fr": "法文",
            "ar": "阿拉伯文",
            "hi": "印地文"
        }
        source_name = lang_names.get(source_lang, source_lang)
        target_name = lang_names.get(target_lang, target_lang)

        system_prompt = f"""你是一个专业的翻译助手，负责将{source_name}翻译成{target_name}。

翻译要求：
1. 准确传达原文含义
2. 保持专业和正式的语气
3. 符合目标语言的表达习惯
4. 只返回翻译结果，不要添加任何解释或说明
5. 保持原文的格式和结构"""

        user_prompt = f"请将以下{source_name}翻译成{target_name}：\n\n{text}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        # 根据文本长度动态计算所需的 max_tokens
        # 估算：中文 1 字符 ≈ 2 tokens，英文 1 字符 ≈ 0.5 tokens
        # 翻译结果通常比原文长 20-50%
        estimated_tokens = int(len(text) * 3)  # 保守估计
        # DeepSeek API 的 max_tokens 上限是 4096
        max_tokens = max(2000, min(estimated_tokens, 4096))  # 最少 2000，最多 4096

        # 警告：如果文本太长，可能会被截断
        if estimated_tokens > 4096:
            print(f"⚠️  WARNING: Text is too long ({len(text)} chars, ~{estimated_tokens} tokens). Translation may be truncated!")
            print(f"⚠️  Consider splitting the text into smaller chunks (max ~1300 chars per chunk)")

        print(f"📊 Translation params: text_length={len(text)}, estimated_tokens={estimated_tokens}, max_tokens={max_tokens}")
        print(f"🌐 Translating: {source_lang} ({source_name}) → {target_lang} ({target_name})")

        # 调用 chat_completion
        try:
            result = await DeepSeekService.chat_completion(
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.3   # 降低温度以获得更一致的翻译
            )

            print(f"✅ DeepSeek API returned: {len(result) if result else 0} chars")
            print(f"📝 Result preview: {result[:100] if result else 'EMPTY'}")

            if not result or not result.strip():
                print(f"⚠️ WARNING: DeepSeek returned empty result for {source_lang} → {target_lang}")
                print(f"⚠️ Original text: {text[:200]}")
                return text  # 返回原文而不是空字符串

            return result.strip()
        except Exception as e:
            print(f"❌ DeepSeek API error for {source_lang} → {target_lang}: {e}")
            print(f"❌ Returning original text")
            return text  # 返回原文

    @staticmethod
    async def generate_summary(text: str, max_length: int = 80) -> str:
        """
        使用 DeepSeek API 生成摘要

        Args:
            text: 原文
            max_length: 摘要最大长度

        Returns:
            生成的摘要
        """
        system_prompt = f"""你是一个专业的内容摘要助手。

摘要要求：
1. 长度控制在 {max_length} 字符以内
2. 准确概括文章核心内容
3. 语言简洁、专业
4. 只返回摘要文本，不要添加任何解释"""

        user_prompt = f"请为以下文章生成一个 {max_length} 字符以内的摘要：\n\n{text[:1000]}"  # 只取前1000字符

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        result = await DeepSeekService.chat_completion(
            messages=messages,
            max_tokens=200,
            temperature=0.5
        )

        return result.strip()[:max_length]

    @staticmethod
    async def suggest_category(text: str, title: str) -> str:
        """
        使用 DeepSeek API 建议文章分类

        Args:
            text: 文章内容
            title: 文章标题

        Returns:
            建议的分类 (headline/regulatory/analysis/business/enterprise/outlook)
        """
        system_prompt = """你是一个专业的内容分类助手。

可用分类：
- headline: 头条新闻
- regulatory: 监管动态
- analysis: 深度分析
- business: 商业资讯
- enterprise: 企业动态
- outlook: 市场展望

请根据文章标题和内容，选择最合适的分类。只返回分类名称，不要添加任何解释。"""

        user_prompt = f"标题：{title}\n\n内容摘要：{text[:500]}\n\n请选择最合适的分类："

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        result = await DeepSeekService.chat_completion(
            messages=messages,
            max_tokens=50,
            temperature=0.3
        )

        # 提取分类名称
        category = result.strip().lower()
        valid_categories = ['headline', 'regulatory', 'analysis', 'business', 'enterprise', 'outlook']

        for valid_cat in valid_categories:
            if valid_cat in category:
                return valid_cat

        return 'headline'  # 默认分类

    @staticmethod
    async def extract_tags(text: str, title: str, max_tags: int = 5) -> List[str]:
        """
        使用 DeepSeek API 提取文章标签

        Args:
            text: 文章内容
            title: 文章标题
            max_tags: 最大标签数量

        Returns:
            标签列表
        """
        system_prompt = f"""你是一个专业的内容标签提取助手。

要求：
1. 提取 {max_tags} 个最相关的关键词作为标签
2. 标签应该简洁、准确
3. 用逗号分隔标签
4. 只返回标签列表，不要添加任何解释"""

        user_prompt = f"标题：{title}\n\n内容：{text[:800]}\n\n请提取 {max_tags} 个关键标签："

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        result = await DeepSeekService.chat_completion(
            messages=messages,
            max_tokens=100,
            temperature=0.5
        )

        # 解析标签
        tags = [tag.strip() for tag in result.split(',')]
        tags = [tag for tag in tags if tag]  # 移除空标签

        return tags[:max_tags]

