/**
 * 图片上传组件
 * 支持拖拽上传、点击选择、预览、进度显示
 */

import React, { useState, useRef, useCallback } from 'react';
import { uploadImage, createPreviewUrl, revokePreviewUrl } from '../services/uploadAPI';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  currentImageUrl,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setUploadProgress(0);

    // 创建预览
    const preview = createPreviewUrl(file);
    setPreviewUrl(preview);

    // 开始上传
    setIsUploading(true);

    try {
      const url = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      // 上传成功
      onUploadSuccess(url);
      setPreviewUrl(url);
      setIsUploading(false);
      setUploadProgress(100);

      // 释放预览 URL
      revokePreviewUrl(preview);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上传失败';
      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      setPreviewUrl(currentImageUrl || null);

      // 释放预览 URL
      revokePreviewUrl(preview);

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  }, [onUploadSuccess, onUploadError, currentImageUrl]);

  // 处理拖拽进入
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // 处理拖拽离开
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // 处理拖拽悬停
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 处理文件放置
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      } else {
        setError('请上传图片文件');
      }
    }
  }, [handleFileSelect]);

  // 处理点击选择文件
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 处理文件输入变化
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // 清除图片
  const handleClear = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`image-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        // 预览模式
        <div className="image-preview-container">
          <img src={previewUrl} alt="Preview" className="image-preview" />
          {isUploading && (
            <div className="upload-overlay">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="upload-progress-text">{uploadProgress}%</p>
            </div>
          )}
          {!isUploading && (
            <div className="image-actions">
              <button
                type="button"
                onClick={handleClick}
                className="btn-change-image"
              >
                更换图片
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn-remove-image"
              >
                移除
              </button>
            </div>
          )}
        </div>
      ) : (
        // 上传区域
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="upload-text-primary">
            {isDragging ? '放开以上传' : '拖拽图片到此处，或点击选择'}
          </p>
          <p className="upload-text-secondary">
            支持 JPG、PNG、WebP 格式，最大 5MB
          </p>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <style>{`
        .image-uploader {
          width: 100%;
        }

        .upload-dropzone {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f9fafb;
        }

        .upload-dropzone:hover {
          border-color: #00a4e4;
          background-color: #f0f9ff;
        }

        .upload-dropzone.dragging {
          border-color: #00a4e4;
          background-color: #e0f2fe;
          transform: scale(1.02);
        }

        .upload-icon {
          color: #9ca3af;
          margin-bottom: 12px;
        }

        .upload-text-primary {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .upload-text-secondary {
          font-size: 14px;
          color: #6b7280;
        }

        .image-preview-container {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background-color: #f3f4f6;
        }

        .image-preview {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          display: block;
        }

        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .upload-progress-bar {
          width: 80%;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
        }

        .upload-progress-fill {
          height: 100%;
          background-color: #00a4e4;
          transition: width 0.3s ease;
        }

        .upload-progress-text {
          color: white;
          font-size: 18px;
          font-weight: 600;
        }

        .image-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          display: flex;
          gap: 12px;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .image-preview-container:hover .image-actions {
          opacity: 1;
        }

        .btn-change-image,
        .btn-remove-image {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-change-image {
          background-color: #00a4e4;
          color: white;
        }

        .btn-change-image:hover {
          background-color: #0284c7;
        }

        .btn-remove-image {
          background-color: rgba(255, 255, 255, 0.9);
          color: #dc2626;
        }

        .btn-remove-image:hover {
          background-color: white;
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
        }

        .upload-error svg {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;

