import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { uploadDocument } from '../services/api';
import DocumentPreviewPanel from './DocumentPreviewPanel';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (result: any) => void;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'parsing' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    const allowedTypes = ['.md', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('不支持的文件类型', {
        description: '请上传 .md 或 .docx 文件',
      });
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('文件太大', {
        description: '文件大小不能超过 10MB',
      });
      return;
    }

    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState({ status: 'uploading', progress: 0 });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await uploadDocument(selectedFile, {
        auto_translate: autoTranslate,
        target_lang: 'en',
      });

      clearInterval(progressInterval);

      setUploadState({
        status: 'success',
        progress: 100,
        result,
      });

      toast.success('文档上传成功', {
        description: '文档已解析，请预览内容',
      });
    } catch (error: any) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: error.message || '上传失败',
      });

      toast.error('上传失败', {
        description: error.message || '请稍后重试',
      });
    }
  };

  const handleUseContent = () => {
    if (uploadState.result) {
      onUploadSuccess(uploadState.result);
      handleClose();
    }
  };

  const handleClose = () => {
    setUploadState({ status: 'idle', progress: 0 });
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-gradient-to-br from-[#0a2540] to-[#0d2847] rounded-2xl shadow-2xl"
          style={{ height: '90vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00a4e4]/10 rounded-lg">
                <Upload className="w-6 h-6 text-[#00a4e4]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">上传文档</h2>
                <p className="text-sm text-gray-400">支持 Markdown (.md) 和 Word (.docx) 文件</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content - Scrollable Area */}
          <div
            className="p-6 overflow-y-auto"
            style={{ flex: '1 1 auto', minHeight: 0 }}
          >
            {uploadState.status === 'idle' || uploadState.status === 'uploading' ? (
              <div className="space-y-6">
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                    transition-all duration-300
                    ${isDragActive
                      ? 'border-[#00a4e4] bg-[#00a4e4]/10'
                      : 'border-white/20 hover:border-[#00a4e4]/50 hover:bg-white/5'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-[#00a4e4]/10 rounded-full">
                      <FileText className="w-12 h-12 text-[#00a4e4]" />
                    </div>
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-white">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-white">
                          {isDragActive ? '放开以上传文件' : '拖拽文件到这里，或点击选择'}
                        </p>
                        <p className="text-sm text-gray-400">
                          支持 .md 和 .docx 文件，最大 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    id="autoTranslate"
                    checked={autoTranslate}
                    onChange={(e) => setAutoTranslate(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#00a4e4] focus:ring-[#00a4e4]"
                  />
                  <label htmlFor="autoTranslate" className="text-sm text-gray-300 cursor-pointer">
                    自动翻译内容到英文
                  </label>
                </div>

                {/* Upload Progress */}
                {uploadState.status === 'uploading' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">上传进度</span>
                      <span className="text-[#00a4e4] font-semibold">{uploadState.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadState.progress}%` }}
                        className="h-full bg-gradient-to-r from-[#00a4e4] to-[#0080b8]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : uploadState.status === 'success' && uploadState.result ? (
              <DocumentPreviewPanel result={uploadState.result} />
            ) : uploadState.status === 'error' ? (
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="p-4 bg-red-500/10 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">上传失败</h3>
                  <p className="text-gray-400">{uploadState.error}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10" style={{ flexShrink: 0 }}>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              取消
            </button>
            {uploadState.status === 'success' ? (
              <button
                onClick={handleUseContent}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00a4e4] to-[#0080b8] text-white font-semibold hover:shadow-lg hover:shadow-[#00a4e4]/50 transition-all"
              >
                使用此内容
              </button>
            ) : (
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadState.status === 'uploading'}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00a4e4] to-[#0080b8] text-white font-semibold hover:shadow-lg hover:shadow-[#00a4e4]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadState.status === 'uploading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    上传文档
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentUploadDialog;

