/**
 * Mobile Scale Detector
 * 移动端缩放检测工具
 * 
 * 提供设备检测和缩放比例计算功能
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
  recommendedScale: number;
  deviceName: string;
}

/**
 * 获取当前设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation = width < height ? 'portrait' : 'landscape';
  
  let type: DeviceInfo['type'] = 'desktop';
  let recommendedScale = 1;
  let deviceName = 'Desktop';

  // 小屏手机竖屏
  if (width <= 480 && orientation === 'portrait') {
    type = 'mobile';
    recommendedScale = 0.65;
    deviceName = 'Small Phone (Portrait)';
  }
  // 大屏手机竖屏
  else if (width > 480 && width <= 768 && orientation === 'portrait') {
    type = 'mobile';
    recommendedScale = 0.75;
    deviceName = 'Large Phone (Portrait)';
  }
  // 手机横屏
  else if (width <= 768 && orientation === 'landscape') {
    type = 'mobile';
    recommendedScale = 0.85;
    deviceName = 'Phone (Landscape)';
  }
  // 平板竖屏
  else if (width > 768 && width <= 1024 && orientation === 'portrait') {
    type = 'tablet';
    recommendedScale = 0.85;
    deviceName = 'Tablet (Portrait)';
  }
  // 平板横屏
  else if (width > 768 && width <= 1280 && orientation === 'landscape') {
    type = 'tablet';
    recommendedScale = 0.95;
    deviceName = 'Tablet (Landscape)';
  }
  // 桌面端
  else {
    type = 'desktop';
    recommendedScale = 1;
    deviceName = 'Desktop';
  }

  return {
    type,
    orientation,
    screenWidth: width,
    screenHeight: height,
    recommendedScale,
    deviceName,
  };
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  const info = getDeviceInfo();
  return info.type === 'mobile' || info.type === 'tablet';
}

/**
 * 获取推荐的缩放比例
 */
export function getRecommendedScale(): number {
  return getDeviceInfo().recommendedScale;
}

/**
 * 启用移动端缩放
 */
export function enableMobileScale(): void {
  document.body.classList.add('enable-mobile-scale');
  localStorage.setItem('mobile-scale-enabled', 'true');
}

/**
 * 禁用移动端缩放
 */
export function disableMobileScale(): void {
  document.body.classList.remove('enable-mobile-scale');
  localStorage.setItem('mobile-scale-enabled', 'false');
}

/**
 * 检查移动端缩放是否已启用
 */
export function isMobileScaleEnabled(): boolean {
  return document.body.classList.contains('enable-mobile-scale');
}

/**
 * 切换移动端缩放
 */
export function toggleMobileScale(): boolean {
  const isEnabled = isMobileScaleEnabled();
  
  if (isEnabled) {
    disableMobileScale();
    return false;
  } else {
    enableMobileScale();
    return true;
  }
}

/**
 * 自动启用移动端缩放(如果是移动设备且用户之前启用过)
 */
export function autoEnableMobileScale(): void {
  const saved = localStorage.getItem('mobile-scale-enabled');
  
  if (saved === 'true' && isMobileDevice()) {
    enableMobileScale();
  }
}

/**
 * 获取当前缩放比例
 */
export function getCurrentScale(): number {
  if (!isMobileScaleEnabled()) {
    return 1;
  }
  
  return getRecommendedScale();
}

/**
 * 在控制台显示设备信息(调试用)
 */
export function logDeviceInfo(): void {
  const info = getDeviceInfo();
  const isEnabled = isMobileScaleEnabled();
  const currentScale = getCurrentScale();
  
  console.group('📱 Mobile Scale Detector');
  console.log('Device Type:', info.type);
  console.log('Device Name:', info.deviceName);
  console.log('Orientation:', info.orientation);
  console.log('Screen Size:', `${info.screenWidth}x${info.screenHeight}`);
  console.log('Recommended Scale:', info.recommendedScale);
  console.log('Scale Enabled:', isEnabled);
  console.log('Current Scale:', currentScale);
  console.groupEnd();
}

