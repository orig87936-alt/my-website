/**
 * Mobile Scale Toggle Component
 * 移动端缩放开关组件
 * 
 * 这个组件提供一个可视化的开关,用于启用/禁用移动端缩放
 * 仅在移动设备上显示
 */

import { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export function MobileScaleToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 从 localStorage 读取设置
  useEffect(() => {
    const saved = localStorage.getItem('mobile-scale-enabled');
    const enabled = saved === 'true';
    setIsEnabled(enabled);
    
    if (enabled) {
      document.body.classList.add('enable-mobile-scale');
    }
  }, []);

  // 切换缩放
  const toggleScale = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    if (newState) {
      document.body.classList.add('enable-mobile-scale');
      localStorage.setItem('mobile-scale-enabled', 'true');
    } else {
      document.body.classList.remove('enable-mobile-scale');
      localStorage.setItem('mobile-scale-enabled', 'false');
    }
  };

  // 仅在移动设备上显示
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <button
        onClick={toggleScale}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
          transition-all duration-300 backdrop-blur-md
          ${isEnabled 
            ? 'bg-[#00a4e4] text-white' 
            : 'bg-white/10 text-white border border-white/20'
          }
          hover:scale-105 active:scale-95
        `}
        aria-label={isEnabled ? '禁用移动端缩放' : '启用移动端缩放'}
      >
        {isEnabled ? (
          <>
            <Smartphone className="w-5 h-5" />
            <span className="text-sm font-medium">缩放已启用</span>
          </>
        ) : (
          <>
            <Monitor className="w-5 h-5" />
            <span className="text-sm font-medium">启用缩放</span>
          </>
        )}
      </button>
      
      {/* 提示信息 */}
      {isEnabled && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-black/90 text-white text-xs rounded-lg backdrop-blur-md">
          <p className="mb-1 font-medium">✨ 移动端缩放已启用</p>
          <p className="opacity-80">
            页面将等比例缩小以适应手机屏幕,保持与桌面端相同的布局。
          </p>
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black/90"></div>
        </div>
      )}
    </div>
  );
}

