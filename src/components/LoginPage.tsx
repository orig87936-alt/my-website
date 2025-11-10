import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, LogIn, UserCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Logo } from './Logo';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { language } = useLanguage();
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);

      if (success) {
        showSuccess(language.startsWith('zh') ? '登录成功！' : 'Login successful!');
        onLoginSuccess();
      } else {
        showError(language.startsWith('zh') ? '用户名或密码错误' : 'Invalid username or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // The error message from the API is already user-friendly
      showError(error?.detail || (language.startsWith('zh') ? '登录失败，请稍后重试' : 'Login failed, please try again later'));
    } finally {
      setIsLoading(false);
    }
  };

  // 访客直接进入
  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // 使用访客账号自动登录
      const success = await login('visitor', 'visitor123');
      if (success) {
        showSuccess(language.startsWith('zh') ? '访客登录成功！' : 'Guest login successful!');
        onLoginSuccess();
      } else {
        showError(language.startsWith('zh') ? '访客登录失败' : 'Guest login failed');
      }
    } catch (error: any) {
      console.error('Guest login error:', error);
      showError(error?.detail || (language.startsWith('zh') ? '访客登录失败，请稍后重试' : 'Guest login failed, please try again later'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2540] via-[#0e2d50] to-[#051429] relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00a4e4]/20 rounded-full blur-[120px] animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3b5bdb]/20 rounded-full blur-[120px] animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Login Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <Logo size="md" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl md:text-4xl font-light text-white mb-2"
            >
              {language.startsWith('zh') ? '欢迎回来' : 'Welcome Back'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-400"
            >
              {language.startsWith('zh') ? '管理员登录或访客浏览' : 'Admin Login or Guest Access'}
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {language.startsWith('zh') ? '用户名' : 'Username'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a4e4] focus:border-transparent transition-all relative z-0"
                    placeholder={language.startsWith('zh') ? '请输入用户名' : 'Enter your username'}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {language.startsWith('zh') ? '密码' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a4e4] focus:border-transparent transition-all relative z-0"
                    placeholder={language.startsWith('zh') ? '请输入密码' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>



              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#00a4e4] to-[#0088c2] hover:from-[#0088c2] hover:to-[#006a9a] text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>{language.startsWith('zh') ? '管理员登录' : 'Admin Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0a2540] text-gray-400">
                  {language.startsWith('zh') ? '或' : 'OR'}
                </span>
              </div>
            </div>

            {/* Guest Access Button */}
            <motion.button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00a4e4]/50 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <UserCheck className="w-5 h-5 text-[#00a4e4] group-hover:scale-110 transition-transform" />
              <span>{language.startsWith('zh') ? '访客浏览' : 'Guest Access'}</span>
            </motion.button>

            {/* Admin Credentials Hint */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center mb-3">
                {language.startsWith('zh') ? '管理员账号：' : 'Admin Account:'}
              </p>
              <div className="text-xs text-gray-500">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <span>{language.startsWith('zh') ? '用户名 / 密码' : 'Username / Password'}:</span>
                  <span className="text-gray-400">admin / admin123</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-6 space-y-2"
          >
            <p className="text-sm text-gray-400">
              {language.startsWith('zh')
                ? '💡 访客可直接浏览所有内容'
                : '💡 Guests can browse all content directly'}
            </p>
            <p className="text-xs text-gray-500">
              {language.startsWith('zh')
                ? '管理员登录后可编辑和管理内容'
                : 'Admin login required for editing and management'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

