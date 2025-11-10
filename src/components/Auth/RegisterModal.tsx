import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { authAPI } from '../../services/api';
import { GoogleLoginButton } from './GoogleLoginButton';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuth();
  const { language } = useLanguage();
  const isChinese = language.startsWith('zh');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    verificationCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) return 'weak';
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (hasLetter && hasNumber && hasSpecial) return 'strong';
    if (hasLetter && hasNumber) return 'medium';
    return 'weak';
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setError(isChinese ? '请输入邮箱' : 'Please enter email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(isChinese ? '请输入有效的邮箱地址' : 'Please enter a valid email address');
      return;
    }

    setIsSendingCode(true);
    setError(null);

    try {
      await authAPI.sendVerificationCode(formData.email, 'register');
      setCodeSent(true);
      setCountdown(60);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || (isChinese ? '发送验证码失败' : 'Failed to send verification code'));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(isChinese ? '两次输入的密码不一致' : 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError(isChinese ? '密码至少需要8个字符' : 'Password must be at least 8 characters');
      return;
    }

    if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError(isChinese ? '密码必须包含字母和数字' : 'Password must contain letters and numbers');
      return;
    }

    if (!formData.verificationCode) {
      setError(isChinese ? '请输入验证码' : 'Please enter verification code');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.displayName || formData.email.split('@')[0],
        formData.verificationCode
      );

      if (success) {
        onClose();
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          displayName: '',
          verificationCode: '',
        });
        setCodeSent(false);
      } else {
        setError(isChinese ? '注册失败，请检查验证码' : 'Registration failed, please check verification code');
      }
    } catch (err: any) {
      setError(err.message || (isChinese ? '注册失败' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      verificationCode: '',
    });
    setError(null);
    setCodeSent(false);
    setCountdown(0);
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
          className="relative w-full max-w-md bg-[#0d2847] rounded-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              {isChinese ? '注册' : 'Register'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isChinese ? '创建您的账号' : 'Create your account'}
            </p>
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

            {/* Email Input */}
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

            {/* Verification Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '验证码' : 'Verification Code'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  className="flex-1 px-4 py-3 bg-[#1a3a52] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:bg-[#1e4159] transition-colors"
                  placeholder={isChinese ? '请输入6位验证码' : 'Enter 6-digit code'}
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || countdown > 0}
                  className="px-4 py-2.5 bg-[#00a4e4]/20 hover:bg-[#00a4e4]/30 text-[#00a4e4] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {isSendingCode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : codeSent ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {countdown > 0
                    ? `${countdown}s`
                    : isChinese
                    ? '发送'
                    : 'Send'}
                </button>
              </div>
              {codeSent && countdown === 0 && (
                <p className="text-xs text-green-400 mt-1">
                  {isChinese ? '验证码已发送，请查收邮箱' : 'Verification code sent, please check your email'}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '显示名称（可选）' : 'Display Name (Optional)'}
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a3a52] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:bg-[#1e4159] transition-colors"
                placeholder={isChinese ? '请输入显示名称' : 'Enter display name'}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '密码' : 'Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a3a52] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:bg-[#1e4159] transition-colors"
                placeholder={isChinese ? '至少8个字符，包含字母和数字' : 'At least 8 characters, letters and numbers'}
                required
              />
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-600'}`} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {passwordStrength === 'weak' && (isChinese ? '弱' : 'Weak')}
                    {passwordStrength === 'medium' && (isChinese ? '中等' : 'Medium')}
                    {passwordStrength === 'strong' && (isChinese ? '强' : 'Strong')}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '确认密码' : 'Confirm Password'}
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a3a52] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:bg-[#1e4159] transition-colors"
                placeholder={isChinese ? '请再次输入密码' : 'Enter password again'}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a4e4] hover:bg-[#0088c2] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isChinese ? '注册中...' : 'Registering...'}
                </>
              ) : (
                isChinese ? '注册' : 'Register'
              )}
            </button>

            {/* Google Login */}
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

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                {isChinese ? '已有账号？' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSwitchToLogin();
                  }}
                  className="text-[#00a4e4] hover:underline font-medium"
                >
                  {isChinese ? '立即登录' : 'Login now'}
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

