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
  currentStep?: string; // 当前处理步骤
  stepDetails?: string; // 步骤详情
}

// T025: 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { code: 'zh-tw', name: '繁体中文', nativeName: '繁體中文' },
  { code: 'en', name: '英语', nativeName: 'English' },
  { code: 'ja', name: '日语', nativeName: '日本語' },
  { code: 'es', name: '西班牙语', nativeName: 'Español' },
  { code: 'fr', name: '法语', nativeName: 'Français' },
  { code: 'ar', name: '阿拉伯语', nativeName: 'العربية' },
  { code: 'hi', name: '印地语', nativeName: 'हिन्दी' },
];

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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']); // T025: 默认选择英语

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
    const allowedTypes = ['.md', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('不支持的文件类型', {
        description: '请上传 .md、.docx 或图片文件（JPG、PNG、WebP）',
      });
      return;
    }

    // Validate file size (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('文件太大', {
        description: '文件大小不能超过 100MB',
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
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // T026: 语言选择处理函数
  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => {
      const newSelection = prev.includes(langCode)
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode];

      // 自动启用/禁用翻译功能
      if (newSelection.length > 0 && !autoTranslate) {
        setAutoTranslate(true);
      } else if (newSelection.length === 0 && autoTranslate) {
        setAutoTranslate(false);
      }

      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedLanguages(SUPPORTED_LANGUAGES.map(lang => lang.code));
    // 自动启用翻译功能
    if (!autoTranslate) {
      setAutoTranslate(true);
    }
  };

  const handleDeselectAll = () => {
    setSelectedLanguages([]);
    // 自动禁用翻译功能
    if (autoTranslate) {
      setAutoTranslate(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState({
      status: 'uploading',
      progress: 0,
      currentStep: '上传文件',
      stepDetails: '正在上传文档到服务器...'
    });

    try {
      // 模拟上传进度，并显示不同阶段
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 5, 90);

        let step = '上传文件';
        let details = '正在上传文档到服务器...';

        if (currentProgress >= 20 && currentProgress < 40) {
          step = '解析文档';
          details = '正在解析文档内容和结构...';
        } else if (currentProgress >= 40 && currentProgress < 60) {
          step = '提取图片';
          details = '正在提取并上传文档中的图片...';
        } else if (currentProgress >= 60 && currentProgress < 80) {
          step = '生成元数据';
          details = '正在使用AI生成标题、摘要和关键词...';
        } else if (currentProgress >= 80) {
          step = autoTranslate ? '自动翻译' : '最后处理';
          details = autoTranslate
            ? `正在翻译到 ${selectedLanguages.length} 种语言，请耐心等待...`
            : '正在完成最后的处理步骤...';
        }

        setUploadState(prev => ({
          ...prev,
          progress: currentProgress,
          currentStep: step,
          stepDetails: details
        }));
      }, 300);

      // T027: 使用选中的语言列表
      const uploadOptions = {
        auto_translate: autoTranslate,
        target_langs: selectedLanguages,
      };

      console.log('📤 Uploading document with options:', uploadOptions);
      console.log('  - autoTranslate:', autoTranslate);
      console.log('  - selectedLanguages:', selectedLanguages);

      const result = await uploadDocument(selectedFile, uploadOptions);

      clearInterval(progressInterval);

      setUploadState({
        status: 'success',
        progress: 100,
        result,
        currentStep: '完成',
        stepDetails: '文档处理完成！'
      });

      toast.success('文档上传成功', {
        description: `已解析文档${result.parse_result?.images?.length > 0 ? `，提取了 ${result.parse_result.images.length} 张图片` : ''}`,
      });
    } catch (error: any) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: error.message || '上传失败',
        currentStep: '错误',
        stepDetails: error.message || '上传失败，请重试'
      });

      toast.error('上传失败', {
        description: error.message || '请稍后重试',
      });
    }
  };

  const handleUseContent = () => {
    console.log('🔵🔵🔵 handleUseContent called', {
      has_result: !!uploadState.result,
      result_keys: uploadState.result ? Object.keys(uploadState.result) : [],
      has_parse_result: !!uploadState.result?.parse_result
    });
    if (uploadState.result) {
      console.log('🔵🔵🔵 Calling onUploadSuccess with result:', uploadState.result);
      onUploadSuccess(uploadState.result);
      console.log('🔵🔵🔵 onUploadSuccess called, now calling handleClose');
      handleClose();
    } else {
      console.error('❌ No result to use!');
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
                <div className="space-y-4">
                  {/* T025-T026: Language Selection - Always visible */}
                  <div className="p-4 bg-white/5 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">
                        翻译到其他语言 ({selectedLanguages.length}/7)
                        {selectedLanguages.length > 0 && (
                          <span className="ml-2 text-xs text-[#00a4e4]">✓ 已启用自动翻译</span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-xs px-2 py-1 bg-[#00a4e4]/20 hover:bg-[#00a4e4]/30 text-[#00a4e4] rounded transition-colors"
                        >
                          全选
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-colors"
                        >
                          清空
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <label
                          key={lang.code}
                          className={`
                            flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                            ${selectedLanguages.includes(lang.code)
                              ? 'bg-[#00a4e4]/20 border border-[#00a4e4]/50'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLanguages.includes(lang.code)}
                            onChange={() => handleLanguageToggle(lang.code)}
                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#00a4e4] focus:ring-[#00a4e4]"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-white">{lang.nativeName}</div>
                            <div className="text-xs text-gray-400">{lang.name}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadState.status === 'uploading' && (
                  <div className="space-y-4">
                    {/* Current Step */}
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-[#00a4e4] animate-spin" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {uploadState.currentStep || '处理中'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {uploadState.stepDetails || '正在处理文档...'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">处理进度</span>
                        <span className="text-[#00a4e4] font-semibold">{uploadState.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadState.progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-gradient-to-r from-[#00a4e4] to-[#0080b8]"
                        />
                      </div>
                    </div>

                    {/* Processing Steps Indicator */}
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {[
                        { name: '上传', progress: 20 },
                        { name: '解析', progress: 40 },
                        { name: '图片', progress: 60 },
                        { name: 'AI', progress: 80 },
                        { name: autoTranslate ? '翻译' : '完成', progress: 100 }
                      ].map((step, index) => (
                        <div key={index} className="text-center">
                          <div className={`
                            w-full h-1 rounded-full mb-1 transition-colors
                            ${uploadState.progress >= step.progress
                              ? 'bg-[#00a4e4]'
                              : 'bg-white/10'
                            }
                          `} />
                          <div className={`
                            text-xs transition-colors
                            ${uploadState.progress >= step.progress
                              ? 'text-[#00a4e4] font-semibold'
                              : 'text-gray-500'
                            }
                          `}>
                            {step.name}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Helpful Tips */}
                    {uploadState.progress >= 80 && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-300">
                            {autoTranslate
                              ? `正在翻译到 ${selectedLanguages.length} 种语言，这可能需要 ${selectedLanguages.length * 5}-${selectedLanguages.length * 10} 秒，请耐心等待...`
                              : '正在完成最后的处理步骤，马上就好...'
                            }
                          </div>
                        </div>
                      </div>
                    )}
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

