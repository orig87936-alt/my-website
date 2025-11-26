"""
SMTP Email Service using Gmail
支持发送预约确认邮件和通知邮件
"""
import asyncio
import logging
import smtplib
from typing import Optional
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from concurrent.futures import ThreadPoolExecutor

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# 线程池用于执行同步 SMTP 操作
_executor = ThreadPoolExecutor(max_workers=3)


class SMTPEmailService:
    """Gmail SMTP 邮件服务"""
    
    @staticmethod
    async def send_appointment_confirmation(
        to_email: str,
        name: str,
        confirmation_number: str,
        appointment_date: str,
        time_slot: str,
        service_type: Optional[str] = None,
        notes: Optional[str] = None
    ) -> bool:
        """
        发送预约确认邮件给客户
        
        Args:
            to_email: 客户邮箱
            name: 客户姓名
            confirmation_number: 确认号
            appointment_date: 预约日期
            time_slot: 预约时间
            service_type: 服务类型
            notes: 备注
            
        Returns:
            True if email sent successfully, False otherwise
        """
        # 检查 SMTP 配置
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(f"⚠️  SMTP 未配置，跳过发送邮件到 {to_email}")
            logger.info(f"   预约确认号: {confirmation_number}")
            logger.info(f"   预约时间: {appointment_date} {time_slot}")
            return True  # 返回成功，避免阻塞预约流程
        
        # 构建邮件主题
        subject = f"预约确认 - {confirmation_number}"
        
        # 构建 HTML 邮件内容
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                .info-box {{ background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .highlight {{ color: #4CAF50; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ 预约确认</h1>
                </div>
                <div class="content">
                    <p>尊敬的 <strong>{name}</strong>，您好！</p>
                    
                    <p>感谢您的预约！我们已收到您的预约请求，详情如下：</p>
                    
                    <div class="info-box">
                        <p><strong>确认号：</strong> <span class="highlight">{confirmation_number}</span></p>
                        <p><strong>预约日期：</strong> {appointment_date}</p>
                        <p><strong>预约时间：</strong> {time_slot}</p>
                        {f'<p><strong>服务类型：</strong> {service_type}</p>' if service_type else ''}
                        {f'<p><strong>备注：</strong> {notes}</p>' if notes else ''}
                    </div>
                    
                    <p>请保存此确认号以便查询。如需取消或修改预约，请尽快联系我们。</p>
                    
                    <p>期待与您见面！</p>
                    
                    <div class="footer">
                        <p>此邮件由系统自动发送，请勿直接回复。</p>
                        <p>如有疑问，请联系我们的客服团队。</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # 纯文本版本
        text_content = f"""
预约确认

尊敬的 {name}，您好！

感谢您的预约！我们已收到您的预约请求，详情如下：

确认号：{confirmation_number}
预约日期：{appointment_date}
预约时间：{time_slot}
{f'服务类型：{service_type}' if service_type else ''}
{f'备注：{notes}' if notes else ''}

请保存此确认号以便查询。如需取消或修改预约，请尽快联系我们。

期待与您见面！

---
此邮件由系统自动发送，请勿直接回复。
如有疑问，请联系我们的客服团队。
        """
        
        # 发送邮件
        return await SMTPEmailService._send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )

    @staticmethod
    async def send_admin_notification(
        admin_email: str,
        customer_name: str,
        customer_email: str,
        customer_phone: Optional[str],
        confirmation_number: str,
        appointment_date: str,
        time_slot: str,
        service_type: Optional[str] = None,
        notes: Optional[str] = None
    ) -> bool:
        """
        发送新预约通知给管理员

        Args:
            admin_email: 管理员邮箱
            customer_name: 客户姓名
            customer_email: 客户邮箱
            customer_phone: 客户电话
            confirmation_number: 确认号
            appointment_date: 预约日期
            time_slot: 预约时间
            service_type: 服务类型
            notes: 备注

        Returns:
            True if email sent successfully, False otherwise
        """
        # 检查 SMTP 配置
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(f"⚠️  SMTP 未配置，跳过发送管理员通知")
            return True

        # 构建邮件主题
        subject = f"🔔 新预约通知 - {confirmation_number}"

        # 构建 HTML 邮件内容
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                .info-box {{ background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #2196F3; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .highlight {{ color: #2196F3; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 新预约通知</h1>
                </div>
                <div class="content">
                    <p>您有一个新的预约！</p>

                    <div class="info-box">
                        <h3>预约信息</h3>
                        <p><strong>确认号：</strong> <span class="highlight">{confirmation_number}</span></p>
                        <p><strong>预约日期：</strong> {appointment_date}</p>
                        <p><strong>预约时间：</strong> {time_slot}</p>
                        {f'<p><strong>服务类型：</strong> {service_type}</p>' if service_type else ''}

                        <h3 style="margin-top: 20px;">客户信息</h3>
                        <p><strong>姓名：</strong> {customer_name}</p>
                        <p><strong>邮箱：</strong> {customer_email}</p>
                        {f'<p><strong>电话：</strong> {customer_phone}</p>' if customer_phone else ''}
                        {f'<p><strong>备注：</strong> {notes}</p>' if notes else ''}
                    </div>

                    <p>请及时处理此预约。</p>

                    <div class="footer">
                        <p>此邮件由预约系统自动发送。</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        # 纯文本版本
        text_content = f"""
新预约通知

您有一个新的预约！

预约信息：
确认号：{confirmation_number}
预约日期：{appointment_date}
预约时间：{time_slot}
{f'服务类型：{service_type}' if service_type else ''}

客户信息：
姓名：{customer_name}
邮箱：{customer_email}
{f'电话：{customer_phone}' if customer_phone else ''}
{f'备注：{notes}' if notes else ''}

请及时处理此预约。

---
此邮件由预约系统自动发送。
        """

        # 发送邮件
        return await SMTPEmailService._send_email(
            to_email=admin_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )

    @staticmethod
    def _send_email_sync(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str
    ) -> bool:
        """
        同步邮件发送方法（使用 Gmail SMTP）

        Args:
            to_email: 收件人邮箱
            subject: 邮件主题
            html_content: HTML 内容
            text_content: 纯文本内容

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # 创建邮件消息
            message = MIMEMultipart("alternative")
            message["From"] = settings.SMTP_USER
            message["To"] = to_email
            message["Subject"] = subject

            # 添加纯文本和 HTML 版本
            part1 = MIMEText(text_content, "plain", "utf-8")
            part2 = MIMEText(html_content, "html", "utf-8")

            message.attach(part1)
            message.attach(part2)

            # 发送邮件
            if settings.SMTP_PORT == 465:
                # 使用 SSL (端口 465)
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
            else:
                # 使用 STARTTLS (端口 587)
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
                server.starttls()

            # 登录
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

            # 发送邮件
            server.send_message(message)
            server.quit()

            logger.info(f"✅ 邮件发送成功: {to_email}")
            return True

        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"❌ SMTP 认证失败: {str(e)}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"❌ SMTP 错误: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"❌ 邮件发送异常: {str(e)}")
            return False

    @staticmethod
    async def _send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str
    ) -> bool:
        """
        异步邮件发送方法（在线程池中运行同步方法）

        Args:
            to_email: 收件人邮箱
            subject: 邮件主题
            html_content: HTML 内容
            text_content: 纯文本内容

        Returns:
            True if email sent successfully, False otherwise
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            _executor,
            SMTPEmailService._send_email_sync,
            to_email,
            subject,
            html_content,
            text_content
        )

