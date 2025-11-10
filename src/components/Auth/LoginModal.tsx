import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { GoogleLoginButton } from './GoogleLoginButton';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { loginWithEmail, login } = useAuth();
  const { language } = useLanguage();
  const isChinese = language.startsWith('zh');

  const [loginType, setLoginType] = useState<'email' | 'admin'>('email');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let success = false;
      
      if (loginType === 'email') {
        success = await loginWithEmail(formData.email, formData.password);
      } else {
        success = await login(formData.username, formData.password);
      }

      if (success) {
        onClose();
        // Reset form
        setFormData({ email: '', username: '', password: '' });
      } else {
        setError(isChinese ? '登录失败，请检查您的凭据' : 'Login failed, please check your credentials');
      }
    } catch (err: any) {
      setError(err.message || (isChinese ? '登录失败' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', username: '', password: '' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0d2847] rounded-2xl shadow-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              {isChinese ? '登录' : 'Login'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isChinese ? '登录以访问更多功能' : 'Login to access more features'}
            </p>
          </div>

          {/* Login Type Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setLoginType('email')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                loginType === 'email'
                  ? 'text-[#00a4e4] border-b-2 border-[#00a4e4]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {isChinese ? '邮箱登录' : 'Email Login'}
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'text-[#00a4e4] border-b-2 border-[#00a4e4]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {isChinese ? '管理员登录' : 'Admin Login'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Email/Username Input */}
            {loginType === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isChinese ? '邮箱' : 'Email'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a3a52] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:bg-[#1e4159] transition-colors"
                  placeholder={isChinese ? '请输入邮箱' : 'Enter your email'}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isChinese ? '用户名' : 'Username'}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a3a52] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:bg-[#1e4159] transition-colors"
                  placeholder={isChinese ? '请输入用户名' : 'Enter your username'}
                  required
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '密码' : 'Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a3a52] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:bg-[#1e4159] transition-colors"
                placeholder={isChinese ? '请输入密码' : 'Enter your password'}
                required
              />
            </div>

            {/* Forgot Password Link (only for email login) */}
            {loginType === 'email' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-[#00a4e4] hover:underline"
                  onClick={() => {
                    // TODO: Implement forgot password
                    alert(isChinese ? '忘记密码功能即将推出' : 'Forgot password feature coming soon');
                  }}
                >
                  {isChinese ? '忘记密码？' : 'Forgot password?'}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a4e4] hover:bg-[#0088c2] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isChinese ? '登录中...' : 'Logging in...'}
                </>
              ) : (
                isChinese ? '登录' : 'Login'
              )}
            </button>

            {/* Google Login (only for email login) */}
            {loginType === 'email' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0a2540] px-2 text-gray-400">
                      {isChinese ? '或' : 'Or'}
                    </span>
                  </div>
                </div>

                <GoogleLoginButton
                  onSuccess={() => {
                    handleClose();
                  }}
                  onError={(errorMsg) => {
                    setError(errorMsg);
                  }}
                />
              </>
            )}

            {/* Register Link (only for email login) */}
            {loginType === 'email' && (
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  {isChinese ? '还没有账号？' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onSwitchToRegister();
                    }}
                    className="text-[#00a4e4] hover:underline font-medium"
                  >
                    {isChinese ? '立即注册' : 'Register now'}
                  </button>
                </p>
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

