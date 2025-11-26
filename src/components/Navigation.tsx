import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Globe, Home, Briefcase, Newspaper, MessageSquare, Mail, Phone, MapPin, ChevronRight, LogOut, User, Settings, Calendar, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { LoginModal } from './Auth/LoginModal';
import { RegisterModal } from './Auth/RegisterModal';
import { UserMenu } from './Auth/UserMenu';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    // No need to reload, just close sidebar
    setIsSidebarOpen(false);
  };

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'business', label: t('nav.business'), icon: Briefcase },
    { id: 'news', label: t('nav.news'), icon: Newspaper },
    { id: 'consulting', label: t('nav.consulting'), icon: MessageSquare },
    { id: 'contact', label: t('nav.contact'), icon: Mail },
  ];

  // 管理员专用导航项
  const adminNavItems = user?.role === 'ADMIN' ? [
    { id: 'admin-news', label: language.startsWith('zh') ? '新闻管理' : 'News Admin', icon: Settings },
    { id: 'admin-appointments', label: language.startsWith('zh') ? '预约管理' : 'Appointments', icon: Calendar },
    { id: 'admin-subscriptions', label: language.startsWith('zh') ? '订阅管理' : 'Subscriptions', icon: Mail },
  ] : [];

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="mobile-top-nav fixed top-0 left-0 right-0 z-50 bg-[#05162a]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="mobile-top-nav-content flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="mobile-logo flex items-center cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <Logo size="nav" className="transition-transform duration-300 group-hover:scale-105" />
            </div>

            {/* Desktop Navigation */}
            <div className="mobile-top-nav-right flex items-center gap-3">
              {/* Language Switcher */}
              <div className="mobile-language-selector flex items-center gap-2 bg-white/5 rounded-full px-3 py-2 border border-white/10">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="appearance-none bg-transparent border-none text-white text-sm font-medium cursor-pointer focus:outline-none"
                >
                  <option value="zh-CN" className="bg-[#0a2540]">中文（简体）</option>
                  <option value="zh-TW" className="bg-[#0a2540]">中文（繁體）</option>
                  <option value="en" className="bg-[#0a2540]">English</option>
                  <option value="ja" className="bg-[#0a2540]">日本语</option>
                  <option value="es" className="bg-[#0a2540]">Español</option>
                  <option value="fr" className="bg-[#0a2540]">Français</option>
                  <option value="ar" className="bg-[#0a2540]">العربية</option>
                  <option value="hi" className="bg-[#0a2540]">हिन्दी</option>
                </select>
              </div>

              {/* User Menu (when logged in) */}
              {isAuthenticated() && (
                <UserMenu onNavigate={onNavigate} />
              )}

              {/* Auth Buttons (when not logged in) - 使用人形图标 */}
              {!isAuthenticated() && (
                <div className="mobile-auth-buttons flex items-center gap-2">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="mobile-login-button p-2.5 text-white hover:text-[#00a4e4] hover:bg-white/5 rounded-lg transition-all duration-300"
                    aria-label={language.startsWith('zh') ? '登录' : 'Login'}
                    title={language.startsWith('zh') ? '登录' : 'Login'}
                  >
                    <User className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="mobile-register-button p-2.5 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-lg transition-all duration-300"
                    aria-label={language.startsWith('zh') ? '注册' : 'Register'}
                    title={language.startsWith('zh') ? '注册' : 'Register'}
                  >
                    <UserPlus className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mobile-menu-button p-2 text-white hover:text-[#00a4e4] transition-colors md:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay - 使用 Portal 渲染到 body，避免受 #root 缩放影响 */}
      {createPortal(
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Sidebar Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 h-screen w-[450px] bg-gradient-to-br from-[#0a2540] via-[#0d2847] to-[#051429] z-[100] shadow-2xl overflow-y-auto"
                style={{ maxWidth: '100vw', paddingBottom: '120px' }}
              >
              {/* Animated Background Gradient Orbs */}
              <div className="absolute top-20 right-10 w-64 h-64 bg-[#00a4e4]/10 rounded-full blur-[100px] animate-pulse pointer-events-none"
                   style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-40 left-10 w-64 h-64 bg-[#3b5bdb]/10 rounded-full blur-[100px] animate-pulse pointer-events-none"
                   style={{ animationDuration: '10s', animationDelay: '2s' }} />

              {/* Noise Texture */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
                   style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

              {/* Grid Pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
              {/* Sidebar Header */}
              <div className="relative flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-sm">
                {/* Logo with glow */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Logo size="sm" />
                  <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#00a4e4]/30 to-[#3b5bdb]/30 -z-10"></div>
                </motion.div>

                {/* Close Button with enhanced styling */}
                <motion.button
                  onClick={() => setIsSidebarOpen(false)}
                  className="relative p-2 text-gray-400 hover:text-white transition-all duration-300 group"
                  aria-label="Close menu"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"></div>
                  <X className="w-6 h-6 relative z-10" />
                </motion.button>
              </div>

              {/* Sidebar Content */}
              <div className="relative px-8 py-8">
                {/* Navigation Section */}
                <div className="mb-12">
                  <motion.div
                    className="flex items-center gap-2 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                  >
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00a4e4]/30 to-transparent"></div>
                    <div className="text-xs uppercase tracking-widest text-[#00a4e4]/80 font-medium">
                      {language.startsWith('zh') ? '导航' : 'Navigation'}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00a4e4]/30 to-transparent"></div>
                  </motion.div>

                  <nav className="space-y-2">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.id;

                      return (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                          onClick={() => handleNavClick(item.id)}
                          className={`group relative block w-full text-left px-5 py-4 rounded-xl transition-all duration-300 overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-r from-[#00a4e4]/20 to-[#3b5bdb]/20 border border-[#00a4e4]/30'
                              : 'border border-white/5 hover:border-[#00a4e4]/30 hover:bg-white/5'
                          }`}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Active indicator glow */}
                          {isActive && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-[#00a4e4]/10 to-[#3b5bdb]/10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          
                          {/* Hover shimmer effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                              initial={{ x: '-100%' }}
                              whileHover={{ x: '200%' }}
                              transition={{ duration: 0.8 }}
                              style={{ width: '50%', skewX: '-20deg' }}
                            />
                          </div>
                          
                          <div className="relative flex items-center gap-4">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg transition-all duration-300 ${
                              isActive
                                ? 'bg-[#00a4e4]/20 text-[#00a4e4]'
                                : 'bg-white/5 text-gray-400 group-hover:bg-[#00a4e4]/10 group-hover:text-[#00a4e4]'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>

                            {/* Label */}
                            <span className={`flex-1 transition-colors duration-300 ${
                              isActive
                                ? 'text-white'
                                : 'text-gray-300 group-hover:text-white'
                            }`}>
                              {item.label}
                            </span>

                            {/* Arrow indicator */}
                            <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                              isActive
                                ? 'text-[#00a4e4] opacity-100 translate-x-0'
                                : 'text-gray-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#00a4e4]'
                            }`} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </nav>
                </div>



                {/* Admin Section */}
                {adminNavItems.length > 0 && (
                  <div className="mb-12">
                    <motion.div
                      className="flex items-center gap-2 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00a4e4]/30 to-transparent"></div>
                      <div className="text-xs uppercase tracking-widest text-[#00a4e4]/80 font-medium">
                        {language.startsWith('zh') ? '管理' : 'Admin'}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00a4e4]/30 to-transparent"></div>
                    </motion.div>

                    <nav className="space-y-2">
                      {adminNavItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;

                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.45 + index * 0.05 }}
                            onClick={() => handleNavClick(item.id)}
                            className={`group relative block w-full text-left px-5 py-4 rounded-xl transition-all duration-300 overflow-hidden ${
                              isActive
                                ? 'bg-gradient-to-r from-[#00a4e4]/20 to-[#3b5bdb]/20 border border-[#00a4e4]/30'
                                : 'border border-white/5 hover:border-[#00a4e4]/30 hover:bg-white/5'
                            }`}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#00a4e4]/10 to-[#3b5bdb]/10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}

                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '200%' }}
                                transition={{ duration: 0.8 }}
                                style={{ width: '50%', skewX: '-20deg' }}
                              />
                            </div>

                            <div className="relative flex items-center gap-4">
                              <div className={`p-2 rounded-lg transition-all duration-300 ${
                                isActive
                                  ? 'bg-[#00a4e4]/20 text-[#00a4e4]'
                                  : 'bg-white/5 text-gray-400 group-hover:bg-[#00a4e4]/10 group-hover:text-[#00a4e4]'
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>

                              <span className={`flex-1 transition-colors duration-300 ${
                                isActive
                                  ? 'text-white'
                                  : 'text-gray-300 group-hover:text-white'
                              }`}>
                                {item.label}
                              </span>

                              <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                                isActive
                                  ? 'text-[#00a4e4] opacity-100 translate-x-0'
                                  : 'text-gray-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#00a4e4]'
                              }`} />
                            </div>
                          </motion.button>
                        );
                      })}
                    </nav>
                  </div>
                )}

                {/* Footer */}
                <motion.div 
                  className="mt-12 pt-8 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      © 2025 S&L
                    </div>
                    <div>
                      {language.startsWith('zh') ? '版权所有' : 'All rights reserved'}
                    </div>
                  </div>
                  
                  {/* Decorative line accent */}
                  <motion.div 
                    className="mt-4 h-1 bg-gradient-to-r from-[#00a4e4] via-[#3b5bdb] to-transparent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
}
