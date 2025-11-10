/**
 * 图片上传 API 客户端
 * 提供图片上传和删除功能
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * 上传图片响应
 */
export interface UploadImageResponse {
  url: string;
}

/**
 * 上传进度回调
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 获取认证 token
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * 上传图片文件
 * 
 * @param file - 要上传的图片文件
 * @param onProgress - 上传进度回调（可选）
 * @returns 图片 URL
 * @throws Error 如果上传失败
 */
export async function uploadImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('不支持的文件类型。请上传 JPG、PNG 或 WebP 格式的图片。');
  }

  // 验证文件大小（5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('文件太大。最大支持 5MB。');
  }

  // 创建 FormData
  const formData = new FormData();
  formData.append('file', file);

  // 获取认证 token
  const token = getAuthToken();
  if (!token) {
    throw new Error('未登录。请先登录后再上传图片。');
  }

  try {
    // 使用 XMLHttpRequest 以支持进度回调
    if (onProgress) {
      return await uploadWithProgress(formData, token, onProgress);
    }

    // 使用 fetch 进行简单上传
    const response = await fetch(`${API_BASE_URL}/api/v1/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `上传失败: ${response.statusText}`);
    }

    const data: UploadImageResponse = await response.json();
    
    // 返回完整的 URL
    return `${API_BASE_URL}${data.url}`;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('上传图片时发生未知错误');
  }
}

/**
 * 使用 XMLHttpRequest 上传图片（支持进度）
 */
function uploadWithProgress(
  formData: FormData,
  token: string,
  onProgress: UploadProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // 监听完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: UploadImageResponse = JSON.parse(xhr.responseText);
          resolve(`${API_BASE_URL}${data.url}`);
        } catch (error) {
          reject(new Error('解析响应失败'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.detail || `上传失败: ${xhr.statusText}`));
        } catch {
          reject(new Error(`上传失败: ${xhr.statusText}`));
        }
      }
    });

    // 监听错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误，上传失败'));
    });

    // 监听中止
    xhr.addEventListener('abort', () => {
      reject(new Error('上传已取消'));
    });

    // 发送请求
    xhr.open('POST', `${API_BASE_URL}/api/v1/upload/image`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}

/**
 * 删除图片
 * 
 * @param imageUrl - 图片 URL
 * @throws Error 如果删除失败
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('未登录。请先登录后再删除图片。');
  }

  // 从完整 URL 中提取相对路径
  let relativeUrl = imageUrl;
  if (imageUrl.startsWith(API_BASE_URL)) {
    relativeUrl = imageUrl.replace(API_BASE_URL, '');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/upload/image?url=${encodeURIComponent(relativeUrl)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `删除失败: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('删除图片时发生未知错误');
  }
}

/**
 * 验证图片 URL 是否有效
 * 
 * @param url - 图片 URL
 * @returns 是否有效
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // 检查是否是有效的 URL
  try {
    new URL(url);
    return true;
  } catch {
    // 检查是否是相对路径
    return url.startsWith('/uploads/images/');
  }
}

/**
 * 从文件创建预览 URL
 * 
 * @param file - 图片文件
 * @returns 预览 URL（需要在组件卸载时调用 URL.revokeObjectURL 释放）
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * 释放预览 URL
 * 
 * @param url - 预览 URL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

