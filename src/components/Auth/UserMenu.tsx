import { useState, useRef, useEffect } from 'react';
import { User, Settings, Heart, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface UserMenuProps {
  onNavigate?: (page: string) => void;
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAdmin } = useAuth();
  const { language } = useLanguage();
  const isChinese = language.startsWith('zh');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleMenuItemClick = (page?: string) => {
    setIsOpen(false);
    if (page && onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10 hover:bg-white/10 transition-colors"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <User className="w-4 h-4 text-[#00a4e4]" />
        )}
        <span className="text-sm text-white">{user.display_name || user.email}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          user.role === 'ADMIN'
            ? 'bg-[#00a4e4]/20 text-[#00a4e4]'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {user.role === 'ADMIN'
            ? (isChinese ? '管理员' : 'Admin')
            : user.role === 'USER'
            ? (isChinese ? '用户' : 'User')
            : (isChinese ? '访客' : 'Visitor')
          }
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-[#0d2847] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#00a4e4]/10 to-[#3b5bdb]/10">
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00a4e4]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#00a4e4]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.display_name || user.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Profile */}
              <button
                onClick={() => handleMenuItemClick('profile')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                {isChinese ? '个人资料' : 'Profile'}
              </button>

              {/* Favorites (for registered users) */}
              {user.role !== 'VISITOR' && (
                <button
                  onClick={() => handleMenuItemClick('favorites')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  {isChinese ? '我的收藏' : 'My Favorites'}
                </button>
              )}

              {/* Admin Dashboard (for admins only) */}
              {isAdmin() && (
                <>
                  <div className="my-2 border-t border-white/10"></div>
                  <button
                    onClick={() => handleMenuItemClick('admin-news')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#00a4e4] hover:bg-white/5 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    {isChinese ? '管理后台' : 'Admin Dashboard'}
                  </button>
                </>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isChinese ? '退出登录' : 'Logout'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

