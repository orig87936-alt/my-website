/**
 * 订阅确认页面
 * 用户点击邮件中的确认链接后跳转到此页面
 */

import React, { useEffect, useState } from 'react';
import { subscriptionAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, XCircle, Loader, Home, Mail } from 'lucide-react';
import { motion } from 'motion/react';

type ConfirmStatus = 'loading' | 'success' | 'error' | 'already_confirmed';

interface SubscriptionConfirmProps {
  onNavigate?: (page: string) => void;
}

export const SubscriptionConfirm: React.FC<SubscriptionConfirmProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isChinese = language.startsWith('zh');

  const [status, setStatus] = useState<ConfirmStatus>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const confirmSubscription = async () => {
      // 从 URL 参数获取 token
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage(isChinese ? '无效的确认链接' : 'Invalid confirmation link');
        return;
      }

      try {
        const response = await subscriptionAPI.confirm(token);
        setStatus('success');
        setEmail(response.email || '');
        setMessage(
          isChinese
            ? '订阅确认成功！您将开始接收我们的邮件推送。'
            : 'Subscription confirmed! You will start receiving our emails.'
        );
      } catch (error: any) {
        console.error('Subscription confirmation error:', error);

        // 检查是否已经确认过
        if (error.message?.includes('already confirmed') || error.message?.includes('已确认')) {
          setStatus('already_confirmed');
          setMessage(
            isChinese
              ? '此订阅已经确认过了。'
              : 'This subscription has already been confirmed.'
          );
        } else {
          setStatus('error');
          setMessage(
            isChinese
              ? error.message || '确认失败，请稍后重试。'
              : error.message || 'Confirmation failed. Please try again later.'
          );
        }
      }
    };

    confirmSubscription();
  }, [isChinese]);

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d2137] to-[#0a1929] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00a4e4] to-[#0077b6] p-8 text-center">
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader className="w-16 h-16 text-white mx-auto" />
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircle className="w-16 h-16 text-white mx-auto" />
            </motion.div>
          )}

          {status === 'already_confirmed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <Mail className="w-16 h-16 text-white mx-auto" />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <XCircle className="w-16 h-16 text-white mx-auto" />
            </motion.div>
          )}

          <h1 className="text-2xl font-bold text-white mt-4">
            {status === 'loading' && (isChinese ? '正在确认...' : 'Confirming...')}
            {status === 'success' && (isChinese ? '确认成功！' : 'Confirmed!')}
            {status === 'already_confirmed' && (isChinese ? '已确认' : 'Already Confirmed')}
            {status === 'error' && (isChinese ? '确认失败' : 'Confirmation Failed')}
          </h1>
        </div>

        {/* Content */}
        <div className="p-8">
          {status === 'loading' && (
            <p className="text-gray-300 text-center">
              {isChinese ? '请稍候，正在处理您的订阅确认...' : 'Please wait, processing your subscription confirmation...'}
            </p>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-center">{message}</p>

              {email && (
                <div className="bg-[#0a1929] rounded-lg p-4 border border-[#00a4e4]/20">
                  <p className="text-sm text-gray-400 text-center">
                    {isChinese ? '订阅邮箱' : 'Subscription Email'}
                  </p>
                  <p className="text-white font-medium text-center mt-1">{email}</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-green-300 text-center">
                  {isChinese
                    ? '✨ 感谢您的订阅！我们将定期为您推送精彩内容。'
                    : '✨ Thank you for subscribing! We will send you great content regularly.'}
                </p>
              </div>
            </div>
          )}

          {status === 'already_confirmed' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-center">{message}</p>

              <div className="bg-[#0a1929] rounded-lg p-4 border border-blue-500/20">
                <p className="text-sm text-blue-300 text-center">
                  {isChinese
                    ? 'ℹ️ 您已经是我们的订阅用户，无需重复确认。'
                    : 'ℹ️ You are already subscribed, no need to confirm again.'}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-center">{message}</p>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-red-300 text-center">
                  {isChinese
                    ? '⚠️ 如果问题持续存在，请联系我们的客服团队。'
                    : '⚠️ If the problem persists, please contact our support team.'}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          {status !== 'loading' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleGoHome}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00a4e4] to-[#0077b6] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00a4e4]/30 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              {isChinese ? '返回首页' : 'Back to Home'}
            </motion.button>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

