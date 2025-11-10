interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: { width: 70, height: 70 },
    md: { width: 140, height: 140 },
    lg: { width: 180, height: 180 }
  };

  const { width, height } = sizeMap[size];

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#05162a',
        border: 'none',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
        borderRadius: '4px'
      }}
    >
      <img
        src="/logo.jpg"
        alt="S&L Logo"
        style={{
          width: '130%',
          height: '130%',
          objectFit: 'cover',
          objectPosition: 'center',
          border: 'none',
          display: 'block',
          transform: 'scale(1.3)'
        }}
      />
    </div>
  );
}

