import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

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
  });
  const [isLoading, setIsLoading] = useState(false);
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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email) {
      setError(isChinese ? '请输入邮箱' : 'Please enter email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(isChinese ? '请输入有效的邮箱地址' : 'Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError(isChinese ? '请输入密码' : 'Please enter password');
      return;
    }

    if (formData.password.length < 8) {
      setError(isChinese ? '密码至少需要8个字符' : 'Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(isChinese ? '两次输入的密码不一致' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.displayName || formData.email.split('@')[0]
        // 不传递验证码参数
      );

      // If we get here, registration was successful
      onClose();
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
      });
    } catch (err: any) {
      // Display the error message from the backend
      setError(err.message || (isChinese ? '注册失败，请稍后重试' : 'Registration failed. Please try again.'));
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
    });
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

