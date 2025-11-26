interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'nav';
  responsive?: boolean;
}

export function Logo({ className = '', size = 'md', responsive = false }: LogoProps) {
  const sizeMap = {
    xs: { width: 50, height: 50 },
    sm: { width: 70, height: 70 },
    md: { width: 140, height: 140 },
    lg: { width: 180, height: 180 },
    // 新增 nav 尺寸：适配导航栏，高度不超过顶栏，但放大显示
    // 桌面端顶栏高度80px，留出上下边距，使用高度65px
    // 移动端顶栏高度60px，留出上下边距，使用高度48px
    nav: { width: 'auto', height: 65 }
  };

  const sizeConfig = sizeMap[size];
  const width = sizeConfig.width;
  const height = sizeConfig.height;

  // 如果启用响应式，在移动端使用更小的尺寸
  const responsiveClass = responsive ? 'w-12 h-12 sm:w-[70px] sm:h-[70px]' : '';

  // nav 尺寸使用响应式高度
  const navResponsiveClass = size === 'nav' ? 'h-12 sm:h-[65px]' : '';

  const responsiveStyle = responsive ? {} :
    size === 'nav' ? { height: `${height}px`, width: 'auto' } :
    { width: `${width}px`, height: `${height}px` };

  return (
    <div
      className={`${className} ${responsiveClass} ${navResponsiveClass} flex items-center justify-center bg-[#05162a] rounded overflow-hidden`}
      style={{
        ...responsiveStyle,
        border: 'none',
        padding: 0,
        margin: 0
      }}
    >
      <img
        src="/logo-new.png"
        alt="S&L Logo"
        className={size === 'nav' ? 'h-full w-auto object-contain' : 'w-full h-full object-contain'}
        style={{
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  );
}

