import { useState } from 'react';
import { Menu, X, Globe, Home, Briefcase, Newspaper, MessageSquare, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'business', label: t('nav.business'), icon: Briefcase },
    { id: 'news', label: t('nav.news'), icon: Newspaper },
    { id: 'consulting', label: t('nav.consulting'), icon: MessageSquare },
    { id: 'contact', label: t('nav.contact'), icon: Mail },
  ];

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05162a]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <div className="text-2xl font-light text-white tracking-tight">
                S&L
              </div>
            </div>

            {/* Right Side - Language Switcher & Menu Button */}
            <div className="flex items-center space-x-6">
              {/* Language Switcher */}
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                <Globe className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                    language === 'zh'
                      ? 'bg-[#00a4e4] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  中
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                    language === 'en'
                      ? 'bg-[#00a4e4] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-white hover:text-[#00a4e4] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
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
              style={{ maxWidth: '100vw' }}
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
                  className="text-3xl font-light text-white tracking-tight relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  S&L
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
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00a4e4]/30 to-transparent"></div>
                    <div className="text-xs uppercase tracking-widest text-[#00a4e4]/80 font-medium">
                      {language === 'zh' ? '导航' : 'Navigation'}
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
                          transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
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

                {/* Contact Info Section */}
                <motion.div 
                  className="pt-8 border-t border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.div 
                    className="flex items-center gap-2 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                  >
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#3b5bdb]/30 to-transparent"></div>
                    <div className="text-xs uppercase tracking-widest text-[#3b5bdb]/80 font-medium">
                      {language === 'zh' ? '联系方式' : 'Contact'}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#3b5bdb]/30 to-transparent"></div>
                  </motion.div>
                  
                  <div className="space-y-3">
                    {/* Email */}
                    <motion.div 
                      className="group p-4 rounded-xl border border-white/5 hover:border-[#00a4e4]/30 bg-white/5 hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#00a4e4]/10 text-[#00a4e4] group-hover:bg-[#00a4e4]/20 transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-400 text-xs mb-1">
                            {language === 'zh' ? '邮箱' : 'Email'}
                          </div>
                          <a 
                            href="mailto:info@sl-consulting.com" 
                            className="text-sm text-gray-200 hover:text-[#00a4e4] transition-colors break-all"
                          >
                            info@sl-consulting.com
                          </a>
                        </div>
                      </div>
                    </motion.div>

                    {/* Phone */}
                    <motion.div 
                      className="group p-4 rounded-xl border border-white/5 hover:border-[#00a4e4]/30 bg-white/5 hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.65 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#3b5bdb]/10 text-[#3b5bdb] group-hover:bg-[#3b5bdb]/20 transition-colors">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-400 text-xs mb-1">
                            {language === 'zh' ? '电话' : 'Phone'}
                          </div>
                          <a 
                            href="tel:+8612345678900" 
                            className="text-sm text-gray-200 hover:text-[#00a4e4] transition-colors"
                          >
                            +86 123 4567 8900
                          </a>
                        </div>
                      </div>
                    </motion.div>

                    {/* Address */}
                    <motion.div 
                      className="group p-4 rounded-xl border border-white/5 hover:border-[#00a4e4]/30 bg-white/5 hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#00a4e4]/10 text-[#00a4e4] group-hover:bg-[#00a4e4]/20 transition-colors">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-400 text-xs mb-1">
                            {language === 'zh' ? '地址' : 'Address'}
                          </div>
                          <div className="text-sm text-gray-200">
                            {language === 'zh' ? '中国 · 北京' : 'Beijing, China'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

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
                      {language === 'zh' ? '版权所有' : 'All rights reserved'}
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
      </AnimatePresence>
    </>
  );
}
