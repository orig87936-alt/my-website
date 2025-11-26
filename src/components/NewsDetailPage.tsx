import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { getNewsArticle, NewsArticle } from '../data/newsData';
import { NewsEditorV2 } from './NewsEditorV2';
import { RelatedArticles } from './RelatedArticles';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NewsDetailPageProps {
  articleId: string;
  onBack: () => void;
  onNavigateToArticle?: (articleId: string) => void;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onStopEdit?: () => void;
}

export function NewsDetailPage({
  articleId,
  onBack,
  onNavigateToArticle,
  isEditing = false,
  onStartEdit,
  onStopEdit
}: NewsDetailPageProps) {
  const { language, t } = useLanguage();
  const { isAdmin } = useAuth();
  const [showEditor, setShowEditor] = useState(isEditing);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 判断是否为中文（简体或繁体）- 使用 useMemo 确保响应式更新
  const isChinese = useMemo(() => language === 'zh-CN' || language === 'zh-TW', [language]);

  // 同步外部编辑状态
  useEffect(() => {
    setShowEditor(isEditing);
  }, [isEditing]);

  // 加载文章数据
  useEffect(() => {
    async function loadArticle() {
      setIsLoading(true);
      const loadedArticle = await getNewsArticle(articleId);
      setArticle(loadedArticle);
      setIsLoading(false);
    }
    loadArticle();
  }, [articleId]);

  // 当文章ID改变时，滚动到页面顶部
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 平滑滚动
    });
  }, [articleId]);

  const handleEditorClose = async () => {
    setShowEditor(false);
    if (onStopEdit) {
      onStopEdit();
    }
    // 重新加载文章以显示更新
    const loadedArticle = await getNewsArticle(articleId);
    setArticle(loadedArticle);
  };

  const handleEditClick = () => {
    setShowEditor(true);
    if (onStartEdit) {
      onStartEdit();
    }
  };

  // 使用 useMemo 计算 displayArticle，确保响应式更新
  const displayArticle = useMemo(() => {
    if (!article) return null;

    // 语言映射：前端语言代码 -> 后端字段后缀
    const langMap: Record<string, string> = {
      'zh-CN': 'Zh',
      'zh-TW': 'ZhTw',
      'en': 'En',
      'ja': 'Ja',
      'es': 'Es',
      'fr': 'Fr',
      'ar': 'Ar',
      'hi': 'Hi'
    };

    const suffix = langMap[language] || 'En'; // 默认英文

    // 获取本地化字段的辅助函数
    const getLocalizedField = (fieldName: string) => {
      const key = `${fieldName}${suffix}` as keyof typeof article;

      // 如果当前语言的内容不存在，回退到英文,再回退到中文
      if (article[key]) {
        return article[key];
      } else if (article[`${fieldName}En` as keyof typeof article]) {
        return article[`${fieldName}En` as keyof typeof article];
      } else {
        return article[`${fieldName}Zh` as keyof typeof article];
      }
    };

    const title = getLocalizedField('title') as string;
    const content = getLocalizedField('content') as any;
    const currentIsChinese = language === 'zh-CN' || language === 'zh-TW';

    // Debug: Log content
    console.log('📰 NewsDetailPage getArticleContent:', {
      language,
      contentType: typeof content,
      isArray: Array.isArray(content),
      length: Array.isArray(content) ? content.length : 'N/A',
      content: content
    });

    return {
      title: title,
      date: getLocalizedField('date') as string,
      author: article.author,
      breadcrumbs: [
        { label: currentIsChinese ? '首页' : 'Home', link: 'home' },
        { label: currentIsChinese ? '新闻与洞察' : 'News and Insights', link: 'news' },
        { label: title.substring(0, 20) + '...', link: '' }
      ],
      image: article.image,
      imageCaption: getLocalizedField('imageCaption') as string,
      lead: getLocalizedField('lead') as string,
      content: content,
      relatedNews: []
    };
  }, [article, language]);

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a2540] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a4e4] mb-4"></div>
          <p className="text-white text-xl">{isChinese ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // 如果加载完成但文章不存在
  if (!displayArticle) {
    return (
      <div className="min-h-screen bg-[#0a2540] pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">{isChinese ? '文章未找到' : 'Article not found'}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-xl transition-all"
          >
            {isChinese ? '返回新闻列表' : 'Back to News'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2540] via-[#0d2847] to-[#0a2540]">
      {/* Editor Modal */}
      {showEditor && (
        <NewsEditorV2 articleId={articleId} onClose={handleEditorClose} />
      )}

      {/* Main Content */}
      <div style={{ paddingTop: '120px' }} className="pb-32">
        {/* Breadcrumbs and Back Button */}
        <div className="max-w-5xl mx-auto px-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            {/* Back Button - Enhanced style */}
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02, x: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group text-[#00a4e4] hover:text-white transition-all flex items-center gap-3 text-base font-light px-6 py-3 bg-white/5 hover:bg-[#00a4e4]/20 rounded-xl border border-[#00a4e4]/30 hover:border-[#00a4e4]/50 shadow-lg hover:shadow-[#00a4e4]/20"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>{isChinese ? '返回新闻列表' : 'Back to News'}</span>
            </motion.button>

            {/* Edit Button - Only for admins */}
            {isAdmin() && (
              <motion.button
                onClick={handleEditClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-xl transition-all text-base font-medium shadow-lg hover:shadow-[#00a4e4]/50"
              >
                <Edit className="w-5 h-5" />
                <span>{isChinese ? '编辑文章' : 'Edit Article'}</span>
              </motion.button>
            )}
          </div>

          {/* Breadcrumb Path - Enhanced */}
          <nav className="flex items-center gap-3 text-sm">
            {displayArticle.breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-3">
                {index > 0 && (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <span className={index === displayArticle.breadcrumbs.length - 1
                  ? 'text-[#00a4e4] font-medium'
                  : 'text-gray-400 hover:text-gray-200 transition-colors cursor-pointer'}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Article Header */}
        <div className="max-w-5xl mx-auto px-8 mb-12">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-light text-white mb-8 leading-tight max-w-4xl mx-auto">
              {displayArticle.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {displayArticle.date}
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {displayArticle.author}
              </span>
            </div>
          </motion.header>
        </div>

        {/* Featured Image - Same width as content */}
        {displayArticle.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto px-8 mb-16"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={displayArticle.image}
                alt={displayArticle.title}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '600px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/60 via-transparent to-transparent pointer-events-none" />
            </div>
            {displayArticle.imageCaption && (
              <p className="text-sm text-gray-400 mt-4 text-center italic">
                {displayArticle.imageCaption}
              </p>
            )}
          </motion.div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-8">

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg prose-invert max-w-none mb-32"
            style={{ textAlign: 'justify' }}
          >
            {/* Lead Paragraph with special styling */}
            <div className="relative mb-12 pb-8 border-b border-white/10">
              <p className="text-xl text-gray-200 leading-relaxed font-light first-letter:text-5xl first-letter:font-bold first-letter:text-[#00a4e4] first-letter:mr-2 first-letter:float-left" style={{ textAlign: 'justify' }}>
                {displayArticle.lead}
              </p>
            </div>

            {/* Main Content - Using MarkdownRenderer */}
            <MarkdownRenderer content={displayArticle.content} showTOC={false} />
          </motion.article>

          {/* Related News */}
          {displayArticle.relatedNews && displayArticle.relatedNews.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-20 pt-12 border-t border-white/10 mb-24"
            >
              <h2 className="text-3xl font-light text-white mb-8 pb-3 border-b border-[#00a4e4]/30">
                {isChinese ? '相关新闻' : 'Related News'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayArticle.relatedNews.map((news: any, index: number) => (
                  <div
                    key={index}
                    className="group bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/5 hover:border-[#00a4e4]/30"
                  >
                    <h3 className="text-lg font-light text-white mb-3 group-hover:text-[#00a4e4] transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {news.date}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Spacer before footer */}
        <div className="h-32"></div>
      </div>

      {/* Related Articles Section */}
      {article && onNavigateToArticle && (
        <RelatedArticles
          currentArticleId={articleId}
          category={article.category || 'analysis'}
          onNavigateToArticle={onNavigateToArticle}
        />
      )}

      {/* Footer - Enhanced */}
      <footer className="bg-gradient-to-b from-[#05162a] to-[#030f1d] border-t border-white/10 mt-16">
        <div className="max-w-[1440px] mx-auto px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-400">© 2025 S&L. {isChinese ? '版权所有' : 'All Rights Reserved'}.</p>
              <p className="text-xs text-gray-500">{isChinese ? '专业的新闻与洞察平台' : 'Professional News & Insights Platform'}</p>
            </div>
            <nav className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-[#00a4e4] transition-colors">
                {isChinese ? '隐私政策' : 'Privacy Policy'}
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#00a4e4] transition-colors">
                {isChinese ? '使用条款' : 'Terms of Use'}
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#00a4e4] transition-colors">
                {isChinese ? '联系我们' : 'Contact Us'}
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
