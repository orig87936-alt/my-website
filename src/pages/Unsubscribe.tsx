/**
 * 退订页面
 * 用户点击邮件中的退订链接后跳转到此页面
 */

import React, { useEffect, useState } from 'react';
import { subscriptionAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, XCircle, Loader, Home, Mail, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

type UnsubscribeStatus = 'loading' | 'confirm' | 'success' | 'error' | 'already_unsubscribed';

interface UnsubscribeProps {
  onNavigate?: (page: string) => void;
}

export const Unsubscribe: React.FC<UnsubscribeProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isChinese = language.startsWith('zh');

  const [status, setStatus] = useState<UnsubscribeStatus>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // 从 URL 参数获取 token
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (!urlToken) {
      setStatus('error');
      setMessage(isChinese ? '无效的退订链接' : 'Invalid unsubscribe link');
      return;
    }

    setToken(urlToken);
    setStatus('confirm');
  }, [isChinese]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStatus('loading');

    try {
      const response = await subscriptionAPI.unsubscribe(token);
      setStatus('success');
      setEmail(response.email || '');
      setMessage(
        isChinese
          ? '退订成功！您将不会再收到我们的邮件推送。'
          : 'Unsubscribed successfully! You will no longer receive our emails.'
      );
    } catch (error: any) {
      console.error('Unsubscribe error:', error);

      // 检查是否已经退订过
      if (error.message?.includes('already unsubscribed') || error.message?.includes('已退订')) {
        setStatus('already_unsubscribed');
        setMessage(
          isChinese
            ? '此订阅已经退订过了。'
            : 'This subscription has already been unsubscribed.'
        );
      } else {
        setStatus('error');
        setMessage(
          isChinese
            ? error.message || '退订失败，请稍后重试。'
            : error.message || 'Unsubscribe failed. Please try again later.'
        );
      }
    }
  };

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  const handleResubscribe = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/?subscribe=true';
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
        <div
          className={`p-8 text-center ${
            status === 'confirm'
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : status === 'success' || status === 'already_unsubscribed'
              ? 'bg-gradient-to-r from-gray-600 to-gray-700'
              : status === 'error'
              ? 'bg-gradient-to-r from-red-600 to-red-700'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
        >
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader className="w-16 h-16 text-white mx-auto" />
            </motion.div>
          )}

          {status === 'confirm' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <AlertTriangle className="w-16 h-16 text-white mx-auto" />
            </motion.div>
          )}

          {(status === 'success' || status === 'already_unsubscribed') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircle className="w-16 h-16 text-white mx-auto" />
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
            {status === 'loading' && (isChinese ? '正在处理...' : 'Processing...')}
            {status === 'confirm' && (isChinese ? '确认退订' : 'Confirm Unsubscribe')}
            {status === 'success' && (isChinese ? '退订成功' : 'Unsubscribed')}
            {status === 'already_unsubscribed' && (isChinese ? '已退订' : 'Already Unsubscribed')}
            {status === 'error' && (isChinese ? '退订失败' : 'Unsubscribe Failed')}
          </h1>
        </div>

        {/* Content */}
        <div className="p-8">
          {status === 'loading' && (
            <p className="text-gray-300 text-center">
              {isChinese ? '请稍候，正在处理您的退订请求...' : 'Please wait, processing your unsubscribe request...'}
            </p>
          )}

          {status === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center text-6xl mb-4">😢</div>

              <p className="text-gray-300 text-center text-lg">
                {isChinese ? '您确定要退订吗？' : 'Are you sure you want to unsubscribe?'}
              </p>

              <div className="bg-[#0a1929] rounded-lg p-4 border border-orange-500/20">
                <p className="text-sm text-gray-400 text-center mb-2">
                  {isChinese ? '退订后，您将：' : 'After unsubscribing, you will:'}
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• {isChinese ? '不再收到我们的邮件推送' : 'No longer receive our email updates'}</li>
                  <li>• {isChinese ? '错过最新的资讯和优惠' : 'Miss out on latest news and offers'}</li>
                  <li>• {isChinese ? '可以随时重新订阅' : 'Can resubscribe anytime'}</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleGoHome}
                  className="flex-1 px-6 py-3 bg-[#0a1929] text-white rounded-lg font-medium border border-gray-600 hover:bg-[#0d2137] transition-all duration-300"
                >
                  {isChinese ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleUnsubscribe}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                >
                  {isChinese ? '确认退订' : 'Confirm Unsubscribe'}
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-center">{message}</p>

              {email && (
                <div className="bg-[#0a1929] rounded-lg p-4 border border-gray-600/20">
                  <p className="text-sm text-gray-400 text-center">
                    {isChinese ? '退订邮箱' : 'Unsubscribed Email'}
                  </p>
                  <p className="text-white font-medium text-center mt-1">{email}</p>
                </div>
              )}

              <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
                <p className="text-sm text-gray-300 text-center">
                  {isChinese
                    ? '💭 感谢您曾经的支持！如果改变主意，随时欢迎您回来。'
                    : '💭 Thank you for your past support! You are welcome back anytime.'}
                </p>
              </div>

              <button
                onClick={handleResubscribe}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#00a4e4] to-[#0077b6] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00a4e4]/30 transition-all duration-300"
              >
                {isChinese ? '🔄 重新订阅' : '🔄 Resubscribe'}
              </button>
            </div>
          )}

          {status === 'already_unsubscribed' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-center">{message}</p>

              <div className="bg-[#0a1929] rounded-lg p-4 border border-gray-600/20">
                <p className="text-sm text-gray-300 text-center">
                  {isChinese
                    ? 'ℹ️ 您已经退订过了，无需重复操作。'
                    : 'ℹ️ You have already unsubscribed, no need to do it again.'}
                </p>
              </div>

              <button
                onClick={handleResubscribe}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#00a4e4] to-[#0077b6] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00a4e4]/30 transition-all duration-300"
              >
                {isChinese ? '🔄 重新订阅' : '🔄 Resubscribe'}
              </button>
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

          {/* Home Button */}
          {status !== 'loading' && status !== 'confirm' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleGoHome}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-[#0a1929] text-white rounded-lg font-medium border border-gray-600 hover:bg-[#0d2137] transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              {isChinese ? '返回首页' : 'Back to Home'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

