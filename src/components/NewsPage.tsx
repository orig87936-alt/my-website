import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { liveNewsList as initialLiveNewsList, LiveNewsItem } from '../data/liveNewsData';
import { focusPointNews as initialFocusPointNews, featuredArticles as initialFeaturedArticles, FocusPointNews, FeaturedArticle } from '../data/featuredNewsData';

interface NewsPageProps {
  onNavigateToArticle: (articleId: string) => void;
}

export function NewsPage({ onNavigateToArticle }: NewsPageProps) {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [isFocusExpanded, setIsFocusExpanded] = useState(false);
  const [liveNewsList, setLiveNewsList] = useState<LiveNewsItem[]>(initialLiveNewsList);
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<LiveNewsItem | null>(null);

  // Focus Point News state
  const [focusPointNews, setFocusPointNews] = useState<FocusPointNews>(initialFocusPointNews);
  const [isFocusEditModalOpen, setIsFocusEditModalOpen] = useState(false);

  // Featured Articles state
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>(initialFeaturedArticles);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [editingFeatured, setEditingFeatured] = useState<FeaturedArticle | null>(null);

  // Load news from localStorage or use initial data
  useEffect(() => {
    console.log('📰 Loading news data...');
    console.log('Initial data counts:', {
      liveNews: initialLiveNewsList.length,
      featured: initialFeaturedArticles.length
    });

    const savedNews = localStorage.getItem('liveNewsList');
    if (savedNews) {
      try {
        const parsed = JSON.parse(savedNews);
        // Validate structure
        const isValid = parsed && Array.isArray(parsed) &&
          (parsed.length === 0 || parsed.every((news: any) =>
            news.readTime && typeof news.readTime === 'object' &&
            news.title && typeof news.title === 'object' &&
            news.summary && typeof news.summary === 'object' &&
            news.readTime['zh-CN'] && news.title['zh-CN'] && news.summary['zh-CN']
          ));

        if (isValid) {
          console.log('✅ Loaded liveNewsList from localStorage:', parsed.length, 'items');
          setLiveNewsList(parsed);
        } else {
          console.warn('⚠️ Saved news has invalid structure, using initial data');
          localStorage.removeItem('liveNewsList');
          setLiveNewsList(initialLiveNewsList);
        }
      } catch (error) {
        console.error('❌ Failed to parse saved news:', error);
        localStorage.removeItem('liveNewsList');
        setLiveNewsList(initialLiveNewsList);
      }
    } else {
      console.log('⚠️ No saved news, using initial data:', initialLiveNewsList.length, 'items');
      setLiveNewsList(initialLiveNewsList);
    }

    // Load focus point news
    const savedFocusPoint = localStorage.getItem('focusPointNews');
    if (savedFocusPoint) {
      try {
        const parsed = JSON.parse(savedFocusPoint);
        // Validate structure
        if (parsed && parsed.title && typeof parsed.title === 'object' &&
            parsed.date && typeof parsed.date === 'object' &&
            parsed.summary && typeof parsed.summary === 'object') {
          console.log('✅ Loaded focusPointNews from localStorage');
          setFocusPointNews(parsed);
        } else {
          console.warn('⚠️ Saved focus point has invalid structure, using initial data');
          localStorage.removeItem('focusPointNews');
          setFocusPointNews(initialFocusPointNews);
        }
      } catch (error) {
        console.error('❌ Failed to parse saved focus point:', error);
        localStorage.removeItem('focusPointNews');
        setFocusPointNews(initialFocusPointNews);
      }
    } else {
      console.log('⚠️ No saved focus point, using initial data');
      setFocusPointNews(initialFocusPointNews);
    }

    // Load featured articles
    const savedFeatured = localStorage.getItem('featuredArticles');
    if (savedFeatured) {
      try {
        const parsed = JSON.parse(savedFeatured);
        // Validate that the data has the correct structure
        const isValid = parsed && Array.isArray(parsed) && parsed.length > 0 &&
          parsed.every((article: any) =>
            article.category && typeof article.category === 'object' &&
            article.date && typeof article.date === 'object' &&
            article.title && typeof article.title === 'object' &&
            article.description && typeof article.description === 'object' &&
            article.category['zh-CN'] && article.category['zh-TW'] && article.category['en']
          );

        if (isValid) {
          console.log('✅ Loaded featuredArticles from localStorage:', parsed.length, 'items');
          setFeaturedArticles(parsed);
        } else {
          console.warn('⚠️ Saved featured articles have invalid structure, using initial data');
          localStorage.removeItem('featuredArticles');
          setFeaturedArticles(initialFeaturedArticles);
        }
      } catch (error) {
        console.error('❌ Failed to parse saved featured articles:', error);
        localStorage.removeItem('featuredArticles');
        setFeaturedArticles(initialFeaturedArticles);
      }
    } else {
      console.log('⚠️ No saved featured articles, using initial data:', initialFeaturedArticles.length, 'items');
      setFeaturedArticles(initialFeaturedArticles);
    }
  }, []);

  // Save news to localStorage whenever it changes
  const saveNewsToStorage = (newsList: LiveNewsItem[]) => {
    localStorage.setItem('liveNewsList', JSON.stringify(newsList));
    setLiveNewsList(newsList);
  };

  // Helper function to get translated content with fallback
  // 支持中文简体、中文繁体和英文，其他语言显示英文
  const getMultiLangContent = (content: { 'zh-CN': string; 'zh-TW': string; 'en': string } | undefined) => {
    if (!content) {
      console.error('getMultiLangContent received undefined content');
      return '';
    }
    if (language === 'zh-CN') return content['zh-CN'] || '';
    if (language === 'zh-TW') return content['zh-TW'] || '';
    // For all other languages (en, ja, es, fr, ar, hi), return English as fallback
    return content['en'] || '';
  };

  // Delete news item
  const handleDeleteNews = (newsId: string) => {
    if (window.confirm(language.startsWith('zh') ? '确定要删除这条新闻吗？' : 'Are you sure you want to delete this news?')) {
      const updatedList = liveNewsList.filter(news => news.id !== newsId);
      saveNewsToStorage(updatedList);
    }
  };

  // Add or update news item
  const handleSaveNews = (newsItem: LiveNewsItem) => {
    if (editingNews) {
      // Update existing news
      const updatedList = liveNewsList.map(news =>
        news.id === newsItem.id ? newsItem : news
      );
      saveNewsToStorage(updatedList);
    } else {
      // Add new news at the beginning
      const updatedList = [newsItem, ...liveNewsList];
      saveNewsToStorage(updatedList);
    }
    setIsAddNewsModalOpen(false);
    setEditingNews(null);
  };

  // Save and update focus point news
  const handleSaveFocusPoint = (focusPoint: FocusPointNews) => {
    localStorage.setItem('focusPointNews', JSON.stringify(focusPoint));
    setFocusPointNews(focusPoint);
    setIsFocusEditModalOpen(false);
  };

  // Save and update featured article
  const handleSaveFeatured = (article: FeaturedArticle) => {
    if (editingFeatured) {
      // Update existing article
      const updatedList = featuredArticles.map(a =>
        a.id === article.id ? article : a
      );
      localStorage.setItem('featuredArticles', JSON.stringify(updatedList));
      setFeaturedArticles(updatedList);
    } else {
      // Add new article
      const updatedList = [...featuredArticles, article];
      localStorage.setItem('featuredArticles', JSON.stringify(updatedList));
      setFeaturedArticles(updatedList);
    }
    setIsFeaturedModalOpen(false);
    setEditingFeatured(null);
  };

  // Delete featured article
  const handleDeleteFeatured = (articleId: string) => {
    if (window.confirm(language.startsWith('zh') ? '确定要删除这篇文章吗？' : 'Are you sure you want to delete this article?')) {
      const updatedList = featuredArticles.filter(a => a.id !== articleId);
      localStorage.setItem('featuredArticles', JSON.stringify(updatedList));
      setFeaturedArticles(updatedList);
    }
  };

  // 使用导入的焦点新闻数据
  const focusPoint = {
    image: focusPointNews.image,
    date: getMultiLangContent(focusPointNews.date),
    title: getMultiLangContent(focusPointNews.title),
    summary: getMultiLangContent(focusPointNews.summary),
    fullContent: getMultiLangContent(focusPointNews.fullContent)
  };

  // 使用导入的实时新闻数据，并转换为组件需要的格式
  const latestNews = liveNewsList
    .filter(news => news && news.readTime && news.title && news.summary)
    .map(news => ({
      time: news.time,
      readTime: getMultiLangContent(news.readTime),
      title: getMultiLangContent(news.title),
      category: news.category,
      summary: getMultiLangContent(news.summary)
    }));

  // 使用导入的特色文章数据，并转换为组件需要的格式
  const newsArticles = featuredArticles.map(article => ({
    image: article.image,
    category: getMultiLangContent(article.category),
    date: getMultiLangContent(article.date),
    title: getMultiLangContent(article.title),
    description: getMultiLangContent(article.description),
    link: article.link
  }));

  const categories = [
    { id: 'all', label: t('news.category.all') },
    { id: 'business', label: t('news.category.business') },
    { id: 'technology', label: t('news.category.technology') },
    { id: 'finance', label: t('news.category.finance') },
  ];

  return (
    <div className="min-h-screen bg-[#0a2540] pt-32">
      {/* Hero Section */}
      <section className="py-24 px-8 border-b border-white/10">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-light text-white mb-6"
          >
            {t('news.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {t('news.hero.description')}
          </motion.p>
        </div>
      </section>

      {/* Focus Point */}
      <section className="py-20 px-8">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#00a4e4] uppercase tracking-wider mb-2">
                    {t('news.featured.title')}
                  </div>
                  <p className="text-gray-400 text-sm">{focusPoint.date}</p>
                </div>
                {isAdmin() && (
                  <button
                    onClick={() => setIsFocusEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{language.startsWith('zh') ? '编辑' : 'Edit'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-xl group"
                >
                  <ImageWithFallback
                    src={focusPoint.image}
                    alt={focusPoint.title}
                    className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/80 via-transparent to-transparent" />
                </motion.div>

                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-light text-white leading-tight">
                    {focusPoint.title}
                  </h2>

                  {/* Summary - Always visible */}
                  <p className="text-gray-300 leading-relaxed">
                    {focusPoint.summary}
                  </p>

                  {/* Expandable Full Content */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isFocusExpanded ? 'auto' : 0,
                      opacity: isFocusExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4 text-gray-300 leading-relaxed whitespace-pre-line border-t border-white/10">
                      {focusPoint.fullContent}
                    </div>
                  </motion.div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => setIsFocusExpanded(!isFocusExpanded)}
                    className="group flex items-center gap-2 text-[#00a4e4] hover:gap-3 transition-all mt-4"
                  >
                    <span>
                      {isFocusExpanded
                        ? (language.startsWith('zh') ? '收起' : language === 'ja' ? '閉じる' : language === 'es' ? 'Mostrar Menos' : language === 'fr' ? 'Afficher Moins' : language === 'ar' ? 'عرض أقل' : language === 'hi' ? 'कम दिखाएं' : 'Show Less')
                        : t('news.readmore')
                      }
                    </span>
                    <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isFocusExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Grid - 6 Cards */}
      <section className="py-20 px-8 bg-[#05162a]/50">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-light text-white">{t('news.latest.title')}</h2>
            {isAdmin() && (
              <button
                onClick={() => {
                  setEditingFeatured(null);
                  setIsFeaturedModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-full transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>{language.startsWith('zh') ? '添加文章' : 'Add Article'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article, index) => {
              const actualArticle = featuredArticles.find(a => a.image === article.image);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 relative"
                >
                  {/* Admin Controls */}
                  {isAdmin() && actualArticle && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFeatured(actualArticle);
                          setIsFeaturedModalOpen(true);
                        }}
                        className="p-2 bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
                        title={language.startsWith('zh') ? '编辑' : 'Edit'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFeatured(actualArticle.id);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title={language.startsWith('zh') ? '删除' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      // 如果是 PDF 文件，在新标签页打开
                      if (article.link.endsWith('.pdf')) {
                        window.open(article.link, '_blank');
                      }
                      // 如果是外部链接，在新标签页打开
                      else if (article.link.startsWith('http')) {
                        window.open(article.link, '_blank');
                      }
                      // 否则使用内部导航
                      else {
                        onNavigateToArticle(article.link.replace('/', ''));
                      }
                    }}
                  >
                    <div className="aspect-video overflow-hidden">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      {/* Category Badge - moved below image */}
                      <div className="inline-block bg-[#00a4e4] text-white px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-3">
                        {article.category}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{article.date}</p>
                      <h3 className="text-xl font-light text-white mb-4 group-hover:text-[#00a4e4] transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[#00a4e4] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm">{t('news.readmore')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest News Section - Scrollable */}
      <section className="py-20 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-light text-white">{t('news.live.title')}</h2>

            <div className="flex items-center gap-4">
              {isAdmin() && (
                <button
                  onClick={() => {
                    setEditingNews(null);
                    setIsAddNewsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>{language.startsWith('zh') ? '添加新闻' : 'Add News'}</span>
                </button>
              )}

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass px-6 py-3 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0a2540]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrollable Container */}
          <div className="relative h-[500px] overflow-hidden rounded-2xl border border-white/10">
            {/* Gradient Overlays */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a2540] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a2540] to-transparent z-10 pointer-events-none" />
            
            {/* Auto-scrolling Content */}
            <div className="h-full overflow-y-auto scrollbar-hide hover:scrollbar-default scroll-smooth">
              <div className="space-y-4 p-4">
                {/* Show original list only once for admin editing, or duplicate for scrolling effect */}
                {(isAdmin() ? latestNews : [...latestNews, ...latestNews, ...latestNews])
                  .filter(news => selectedCategory === 'all' || news.category === selectedCategory)
                  .map((news, index) => {
                    // For admin, use the actual news item from liveNewsList to get the correct id
                    const actualNews = isAdmin() ? liveNewsList.find(n => n.time === news.time && n.title['zh-CN'] === news.title) : null;

                    return (
                      <div key={index} className="relative">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (index % 4) * 0.05 }}
                          className="group flex items-center gap-6 p-6 glass rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedNews(news);
                            setClickedIndex(index);
                            setIsModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-4 text-gray-400 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{news.time}</span>
                            </div>
                            <div className="w-px h-4 bg-gray-600" />
                            <span className="text-sm text-gray-500">{news.readTime}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-lg text-white group-hover:text-[#00a4e4] transition-colors">
                              {news.title}
                            </p>
                          </div>

                          {/* Admin Controls */}
                          {isAdmin() && actualNews && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDeleteNews(actualNews.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                title={language.startsWith('zh') ? '删除' : 'Delete'}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}

                          <ArrowRight className="w-5 h-5 text-[#00a4e4] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>

                      {/* Inline Expanded Content */}
                      {isModalOpen && clickedIndex === index && selectedNews && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
                            {/* Close Button */}
                            <div className="flex justify-end mb-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsModalOpen(false);
                                  setClickedIndex(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors p-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                              {/* Title */}
                              <h3 className="text-xl font-normal text-white leading-tight">
                                {selectedNews.title}
                              </h3>

                              {/* Summary */}
                              <p className="text-gray-300 text-base leading-relaxed">
                                {selectedNews.summary}
                              </p>

                              {/* Meta Info */}
                              <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-500">
                                <span>{selectedNews.readTime}</span>
                                <div className="flex gap-4">
                                  <button className="hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                  </button>
                                  <button className="hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit News Modal */}
      {isAddNewsModalOpen && (
        <AddNewsModal
          news={editingNews}
          onSave={handleSaveNews}
          onClose={() => {
            setIsAddNewsModalOpen(false);
            setEditingNews(null);
          }}
          language={language}
        />
      )}

      {/* Edit Focus Point Modal */}
      {isFocusEditModalOpen && (
        <EditFocusPointModal
          focusPoint={focusPointNews}
          onSave={handleSaveFocusPoint}
          onClose={() => setIsFocusEditModalOpen(false)}
          language={language}
        />
      )}

      {/* Add/Edit Featured Article Modal */}
      {isFeaturedModalOpen && (
        <EditFeaturedModal
          article={editingFeatured}
          onSave={handleSaveFeatured}
          onClose={() => {
            setIsFeaturedModalOpen(false);
            setEditingFeatured(null);
          }}
          language={language}
        />
      )}
    </div>
  );
}

// Add News Modal Component
interface AddNewsModalProps {
  news: LiveNewsItem | null;
  onSave: (news: LiveNewsItem) => void;
  onClose: () => void;
  language: string;
}

function AddNewsModal({ news, onSave, onClose, language }: AddNewsModalProps) {
  const [formData, setFormData] = useState<LiveNewsItem>(
    news || {
      id: `live-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      readTime: {
        'zh-CN': '2分钟阅读',
        'zh-TW': '2分鐘閱讀',
        'en': '2 min read'
      },
      title: {
        'zh-CN': '',
        'zh-TW': '',
        'en': ''
      },
      category: 'business',
      summary: {
        'zh-CN': '',
        'zh-TW': '',
        'en': ''
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one language has content
    if (!formData.title['zh-CN'] && !formData.title['zh-TW'] && !formData.title['en']) {
      alert(language.startsWith('zh') ? '请至少填写一种语言的标题' : 'Please fill in at least one language title');
      return;
    }

    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100] flex items-start justify-center overflow-y-auto py-8"
      onClick={onClose}
      style={{ overflowY: 'scroll' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a2540] rounded-2xl border border-white/10 w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-light text-white">
            {news ? (language.startsWith('zh') ? '编辑新闻' : 'Edit News') : (language.startsWith('zh') ? '添加新闻' : 'Add News')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Scrollable Content */}
          <div className="px-6 pt-4 pb-8 space-y-4">
            {/* Time and Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  {language.startsWith('zh') ? '时间' : 'Time'}
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="17:44"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  {language.startsWith('zh') ? '分类' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                >
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="research">Research</option>
                </select>
              </div>
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '阅读时间' : 'Read Time'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.readTime['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    readTime: { ...formData.readTime, 'zh-CN': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="简体"
                />
                <input
                  type="text"
                  value={formData.readTime['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    readTime: { ...formData.readTime, 'zh-TW': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="繁體"
                />
                <input
                  type="text"
                  value={formData.readTime['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    readTime: { ...formData.readTime, 'en': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="EN"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '标题' : 'Title'} *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.title['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'zh-CN': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="简体中文标题"
                />
                <input
                  type="text"
                  value={formData.title['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'zh-TW': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="繁體中文標題"
                />
                <input
                  type="text"
                  value={formData.title['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'en': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="English Title"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '摘要' : 'Summary'}
              </label>
              <div className="space-y-2">
                <textarea
                  value={formData.summary['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    summary: { ...formData.summary, 'zh-CN': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[80px]"
                  placeholder="简体中文摘要"
                />
                <textarea
                  value={formData.summary['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    summary: { ...formData.summary, 'zh-TW': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[80px]"
                  placeholder="繁體中文摘要"
                />
                <textarea
                  value={formData.summary['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    summary: { ...formData.summary, 'en': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[80px]"
                  placeholder="English Summary"
                />
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0a2540]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              {language.startsWith('zh') ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
            >
              {language.startsWith('zh') ? '保存' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Edit Focus Point Modal Component
interface EditFocusPointModalProps {
  focusPoint: FocusPointNews;
  onSave: (focusPoint: FocusPointNews) => void;
  onClose: () => void;
  language: string;
}

function EditFocusPointModal({ focusPoint, onSave, onClose, language }: EditFocusPointModalProps) {
  const [formData, setFormData] = useState<FocusPointNews>(focusPoint);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100] flex items-start justify-center overflow-y-auto py-8"
      onClick={onClose}
      style={{ overflowY: 'scroll' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a2540] rounded-2xl border border-white/10 w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-light text-white">
            {language.startsWith('zh') ? '编辑焦点新闻' : 'Edit Focus Point News'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Scrollable Content */}
          <div className="px-6 pt-4 pb-8 space-y-4">
            {/* Image URL */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '图片URL' : 'Image URL'}
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder="https://..."
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '日期' : 'Date'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.date['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    date: { ...formData.date, 'zh-CN': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="简体"
                />
                <input
                  type="text"
                  value={formData.date['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    date: { ...formData.date, 'zh-TW': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="繁體"
                />
                <input
                  type="text"
                  value={formData.date['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    date: { ...formData.date, 'en': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="EN"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '标题' : 'Title'}
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.title['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'zh-CN': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="简体中文标题"
                />
                <input
                  type="text"
                  value={formData.title['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'zh-TW': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="繁體中文標題"
                />
                <input
                  type="text"
                  value={formData.title['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'en': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="English Title"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '摘要' : 'Summary'}
              </label>
              <div className="space-y-2">
                <textarea
                  value={formData.summary['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    summary: { ...formData.summary, 'zh-CN': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[60px]"
                  placeholder="简体中文摘要"
                />
                <textarea
                  value={formData.summary['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    summary: { ...formData.summary, 'zh-TW': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[60px]"
                  placeholder="繁體中文摘要"
                />
                <textarea
                  value={formData.summary['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    summary: { ...formData.summary, 'en': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[60px]"
                  placeholder="English Summary"
                />
              </div>
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '完整内容' : 'Full Content'}
              </label>
              <div className="space-y-2">
                <textarea
                  value={formData.fullContent['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    fullContent: { ...formData.fullContent, 'zh-CN': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[100px]"
                  placeholder="简体中文完整内容"
                />
                <textarea
                  value={formData.fullContent['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    fullContent: { ...formData.fullContent, 'zh-TW': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[100px]"
                  placeholder="繁體中文完整內容"
                />
                <textarea
                  value={formData.fullContent['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    fullContent: { ...formData.fullContent, 'en': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[100px]"
                  placeholder="English Full Content"
                />
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0a2540]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              {language.startsWith('zh') ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
            >
              {language.startsWith('zh') ? '保存' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Edit Featured Article Modal Component
interface EditFeaturedModalProps {
  article: FeaturedArticle | null;
  onSave: (article: FeaturedArticle) => void;
  onClose: () => void;
  language: string;
}

function EditFeaturedModal({ article, onSave, onClose, language }: EditFeaturedModalProps) {
  const [formData, setFormData] = useState<FeaturedArticle>(
    article || {
      id: `featured-${Date.now()}`,
      image: '',
      date: {
        'zh-CN': '',
        'zh-TW': '',
        'en': ''
      },
      title: {
        'zh-CN': '',
        'zh-TW': '',
        'en': ''
      },
      description: {
        'zh-CN': '',
        'zh-TW': '',
        'en': ''
      },
      link: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image || !formData.link) {
      alert(language.startsWith('zh') ? '请填写图片URL和链接' : 'Please fill in image URL and link');
      return;
    }

    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100] flex items-start justify-center overflow-y-auto py-8"
      onClick={onClose}
      style={{ overflowY: 'scroll' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a2540] rounded-2xl border border-white/10 w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-light text-white">
            {article ? (language.startsWith('zh') ? '编辑文章' : 'Edit Article') : (language.startsWith('zh') ? '添加文章' : 'Add Article')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Scrollable Content */}
          <div className="px-6 pt-4 pb-8 space-y-4">
            {/* Image URL */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '图片URL' : 'Image URL'} *
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder="https://..."
                required
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '链接' : 'Link'} *
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder="/article-link or https://..."
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '日期' : 'Date'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.date['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    date: { ...formData.date, 'zh-CN': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="简体"
                />
                <input
                  type="text"
                  value={formData.date['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    date: { ...formData.date, 'zh-TW': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="繁體"
                />
                <input
                  type="text"
                  value={formData.date['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    date: { ...formData.date, 'en': e.target.value }
                  })}
                  className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="EN"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '标题' : 'Title'}
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.title['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'zh-CN': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="简体中文标题"
                />
                <input
                  type="text"
                  value={formData.title['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'zh-TW': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="繁體中文標題"
                />
                <input
                  type="text"
                  value={formData.title['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, 'en': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                  placeholder="English Title"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                {language.startsWith('zh') ? '描述' : 'Description'}
              </label>
              <div className="space-y-2">
                <textarea
                  value={formData.description['zh-CN']}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, 'zh-CN': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[80px]"
                  placeholder="简体中文描述"
                />
                <textarea
                  value={formData.description['zh-TW']}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, 'zh-TW': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[80px]"
                  placeholder="繁體中文描述"
                />
                <textarea
                  value={formData.description['en']}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, 'en': e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] min-h-[80px]"
                  placeholder="English Description"
                />
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0a2540]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              {language.startsWith('zh') ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
            >
              {language.startsWith('zh') ? '保存' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
