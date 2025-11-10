import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getNewsArticle, updateNewsArticle, NewsArticle } from '../data/newsData';

interface NewsEditorProps {
  articleId: string;
  onClose: () => void;
}

export function NewsEditor({ articleId, onClose }: NewsEditorProps) {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      const loadedArticle = await getNewsArticle(articleId);
      if (loadedArticle) {
        console.log('Loaded article:', loadedArticle);
        console.log('ContentZh length:', loadedArticle.contentZh?.length);
        console.log('ContentEn length:', loadedArticle.contentEn?.length);
        setArticle(loadedArticle);
      }
    }
    loadArticle();
  }, [articleId]);

  if (!isAdmin()) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-xl font-medium">
              {language === 'zh' ? '权限不足' : 'Access Denied'}
            </h3>
          </div>
          <p className="text-gray-300 mb-6">
            {language === 'zh' 
              ? '只有管理员可以编辑新闻内容' 
              : 'Only administrators can edit news content'}
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-lg transition-colors"
          >
            {language === 'zh' ? '关闭' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 保存到 API
      await updateNewsArticle(articleId, article);

      setIsSaving(false);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Failed to save article:', error);
      setIsSaving(false);
      // TODO: Show error message to user
      alert(isChinese ? '保存失败，请重试' : 'Failed to save, please try again');
    }
    
    // 3秒后关闭成功提示
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const addContentBlock = (lang: 'zh' | 'en') => {
    const newBlock = { type: 'paragraph' as const, text: '' };
    if (lang === 'zh') {
      setArticle({ ...article, contentZh: [...article.contentZh, newBlock] });
    } else {
      setArticle({ ...article, contentEn: [...article.contentEn, newBlock] });
    }
  };

  const removeContentBlock = (lang: 'zh' | 'en', index: number) => {
    if (lang === 'zh') {
      const newContent = article.contentZh.filter((_, i) => i !== index);
      setArticle({ ...article, contentZh: newContent });
    } else {
      const newContent = article.contentEn.filter((_, i) => i !== index);
      setArticle({ ...article, contentEn: newContent });
    }
  };

  const updateContentBlock = (lang: 'zh' | 'en', index: number, field: 'type' | 'text', value: string) => {
    if (lang === 'zh') {
      const newContent = [...article.contentZh];
      if (field === 'type') {
        newContent[index].type = value as 'paragraph' | 'heading';
      } else {
        newContent[index].text = value;
      }
      setArticle({ ...article, contentZh: newContent });
    } else {
      const newContent = [...article.contentEn];
      if (field === 'type') {
        newContent[index].type = value as 'paragraph' | 'heading';
      } else {
        newContent[index].text = value;
      }
      setArticle({ ...article, contentEn: newContent });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8"
      onClick={(e) => {
        // 点击背景关闭
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#0a2540] rounded-2xl border border-white/10 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 固定在顶部 */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-[#0a2540] rounded-t-2xl">
          <h2 className="text-xl md:text-2xl font-light text-white">
            {language === 'zh' ? '编辑新闻' : 'Edit News'}
          </h2>
          <div className="flex items-center gap-2 md:gap-3">
            {saveSuccess && (
              <span className="text-xs md:text-sm text-green-400">
                {language === 'zh' ? '保存成功！' : 'Saved!'}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-lg transition-colors disabled:opacity-50 text-sm md:text-base"
            >
              <Save className="w-4 h-4" />
              <span className="hidden md:inline">
                {isSaving ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存' : 'Save')}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={language === 'zh' ? '关闭' : 'Close'}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Content - 可滚动区域 */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 中文标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '中文标题' : 'Chinese Title'}
              </label>
              <input
                type="text"
                value={article.titleZh}
                onChange={(e) => setArticle({ ...article, titleZh: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>

            {/* 英文标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '英文标题' : 'English Title'}
              </label>
              <input
                type="text"
                value={article.titleEn}
                onChange={(e) => setArticle({ ...article, titleEn: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>

            {/* 中文日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '中文日期' : 'Chinese Date'}
              </label>
              <input
                type="text"
                value={article.dateZh}
                onChange={(e) => setArticle({ ...article, dateZh: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>

            {/* 英文日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '英文日期' : 'English Date'}
              </label>
              <input
                type="text"
                value={article.dateEn}
                onChange={(e) => setArticle({ ...article, dateEn: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>

            {/* 作者 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '作者' : 'Author'}
              </label>
              <input
                type="text"
                value={article.author}
                onChange={(e) => setArticle({ ...article, author: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>

            {/* 图片URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '图片URL' : 'Image URL'}
              </label>
              <input
                type="text"
                value={article.image}
                onChange={(e) => setArticle({ ...article, image: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>

            {/* 中文导语 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '中文导语' : 'Chinese Lead'}
              </label>
              <textarea
                value={article.leadZh}
                onChange={(e) => setArticle({ ...article, leadZh: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>

            {/* 英文导语 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh' ? '英文导语' : 'English Lead'}
              </label>
              <textarea
                value={article.leadEn}
                onChange={(e) => setArticle({ ...article, leadEn: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            </div>
          </div>

          {/* 分隔线 - 测试可见性 */}
          <div className="border-t-4 border-yellow-500 my-8 py-4 bg-yellow-900/30">
            <p className="text-yellow-400 text-center text-xl font-bold animate-pulse">
              ⚠️⚠️⚠️ 如果你能看到这行黄色文字，说明滚动正常 ⚠️⚠️⚠️
            </p>
            <p className="text-red-500 text-center text-2xl font-bold mt-4">
              🔴 这是第二行测试文字 - 应该非常显眼！🔴
            </p>
          </div>

          {/* 中文内容 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                {language === 'zh' ? '中文内容' : 'Chinese Content'}
                <span className="ml-2 text-xs text-yellow-400">
                  (DEBUG: {article.contentZh?.length || 0} blocks)
                </span>
              </label>
              <button
                onClick={() => addContentBlock('zh')}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#00a4e4]/20 hover:bg-[#00a4e4]/30 text-[#00a4e4] rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {language === 'zh' ? '添加段落' : 'Add Paragraph'}
              </button>
            </div>
            <div className="space-y-4">
              {article.contentZh.map((block, index) => (
                <div key={index} className="glass rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <select
                      value={block.type}
                      onChange={(e) => updateContentBlock('zh', index, 'type', e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                    >
                      <option value="paragraph">{language === 'zh' ? '段落' : 'Paragraph'}</option>
                      <option value="heading">{language === 'zh' ? '标题' : 'Heading'}</option>
                    </select>
                    <button
                      onClick={() => removeContentBlock('zh', index)}
                      className="ml-auto p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={block.text}
                    onChange={(e) => updateContentBlock('zh', index, 'text', e.target.value)}
                    rows={block.type === 'heading' ? 2 : 4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] resize-none"
                    placeholder={block.type === 'heading' ? (language === 'zh' ? '输入标题...' : 'Enter heading...') : (language === 'zh' ? '输入段落内容...' : 'Enter paragraph...')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 英文内容 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                {language === 'zh' ? '英文内容' : 'English Content'}
              </label>
              <button
                onClick={() => addContentBlock('en')}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#00a4e4]/20 hover:bg-[#00a4e4]/30 text-[#00a4e4] rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {language === 'zh' ? '添加段落' : 'Add Paragraph'}
              </button>
            </div>
            <div className="space-y-4">
              {article.contentEn.map((block, index) => (
                <div key={index} className="glass rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <select
                      value={block.type}
                      onChange={(e) => updateContentBlock('en', index, 'type', e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                    >
                      <option value="paragraph">{language === 'zh' ? '段落' : 'Paragraph'}</option>
                      <option value="heading">{language === 'zh' ? '标题' : 'Heading'}</option>
                    </select>
                    <button
                      onClick={() => removeContentBlock('en', index)}
                      className="ml-auto p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={block.text}
                    onChange={(e) => updateContentBlock('en', index, 'text', e.target.value)}
                    rows={block.type === 'heading' ? 2 : 4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] resize-none"
                    placeholder={block.type === 'heading' ? (language === 'zh' ? '输入标题...' : 'Enter heading...') : (language === 'zh' ? '输入段落内容...' : 'Enter paragraph...')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 提示信息 */}
          <div className="space-y-3">
            <div className="glass rounded-lg p-4 border border-[#00a4e4]/20">
              <p className="text-sm text-gray-300">
                {language === 'zh'
                  ? '💡 提示：修改后点击右上角"保存"按钮保存更改。'
                  : '💡 Tip: Click "Save" button at top right to save changes.'}
              </p>
            </div>

            {/* 关闭提示 */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 text-center">
                {language === 'zh'
                  ? '点击右上角 ✕ 按钮或点击背景区域关闭编辑器'
                  : 'Click ✕ button or click outside to close editor'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

