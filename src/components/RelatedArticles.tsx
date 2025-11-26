import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { articlesAPI, Article } from '../services/api';

interface RelatedArticlesProps {
  currentArticleId: string;
  category: string;
  onNavigateToArticle: (articleId: string) => void;
}

export function RelatedArticles({ currentArticleId, category, onNavigateToArticle }: RelatedArticlesProps) {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 6;

  // 判断是否为中文（简体或繁体）
  const isChinese = language === 'zh-CN' || language === 'zh-TW';

  // Helper function to get localized field with fallback
  const getLocalizedField = (article: Article, field: 'title' | 'summary'): string => {
    const fieldMap = {
      'zh-CN': field === 'title' ? article.title_zh : article.summary_zh,
      'zh-TW': field === 'title' ? article.title_zh_tw : article.summary_zh_tw,
      'en': field === 'title' ? article.title_en : article.summary_en,
      'ja': field === 'title' ? article.title_ja : article.summary_ja,
      'es': field === 'title' ? article.title_es : article.summary_es,
      'fr': field === 'title' ? article.title_fr : article.summary_fr,
      'ar': field === 'title' ? article.title_ar : article.summary_ar,
      'hi': field === 'title' ? article.title_hi : article.summary_hi,
    };

    // Return current language or fallback to English or Chinese
    return fieldMap[language] || fieldMap['en'] || fieldMap['zh-CN'] || '';
  };

  // Load initial articles
  useEffect(() => {
    loadArticles(1, true);
  }, [currentArticleId, category]);

  const loadArticles = async (pageNum: number, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await articlesAPI.list({
        category,
        exclude_id: currentArticleId,
        page: pageNum,
        page_size: pageSize,
        status: 'published',
      });

      if (isInitial) {
        setArticles(response.items);
      } else {
        setArticles(prev => [...prev, ...response.items]);
      }

      setHasMore(pageNum < response.total_pages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load related articles:', err);
      const errorMessages = {
        'zh-CN': '加载相关文章失败',
        'zh-TW': '載入相關文章失敗',
        'en': 'Failed to load related articles',
        'ja': '関連記事の読み込みに失敗しました',
        'es': 'Error al cargar artículos relacionados',
        'fr': 'Échec du chargement des articles connexes',
        'ar': 'فشل تحميل المقالات ذات الصلة',
        'hi': 'संबंधित लेख लोड करने में विफल',
      };
      setError(errorMessages[language] || errorMessages['en']);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadArticles(page + 1, false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap = {
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW',
      'en': 'en-US',
      'ja': 'ja-JP',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
    };
    const locale = localeMap[language] || 'en-US';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a4e4]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    const noArticlesMessages = {
      'zh-CN': '暂无更多文章',
      'zh-TW': '暫無更多文章',
      'en': 'No more articles available',
      'ja': 'これ以上の記事はありません',
      'es': 'No hay más artículos disponibles',
      'fr': 'Aucun autre article disponible',
      'ar': 'لا توجد مقالات أخرى متاحة',
      'hi': 'कोई और लेख उपलब्ध नहीं है',
    };
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {noArticlesMessages[language] || noArticlesMessages['en']}
        </p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-[#0a2540] to-[#051429]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {{
              'zh-CN': '相关文章',
              'zh-TW': '相關文章',
              'en': 'Related Articles',
              'ja': '関連記事',
              'es': 'Artículos relacionados',
              'fr': 'Articles connexes',
              'ar': 'مقالات ذات صلة',
              'hi': 'संबंधित लेख',
            }[language] || 'Related Articles'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00a4e4] to-[#3b5bdb]"></div>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onNavigateToArticle(article.id)}
            >
              <div className="bg-[#0d2847] rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-[#00a4e4]/20 transition-all duration-300 h-full flex flex-col">
                {/* Article Image */}
                {article.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={getLocalizedField(article, 'title')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d2847] to-transparent opacity-60"></div>
                  </div>
                )}

                {/* Article Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Category & Date */}
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <span className="px-3 py-1 bg-[#00a4e4]/20 text-[#00a4e4] rounded-full">
                      {article.category}
                    </span>
                    <span className="text-gray-400">
                      {formatDate(article.published_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00a4e4] transition-colors line-clamp-2">
                    {getLocalizedField(article, 'title')}
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-300 mb-4 flex-1 line-clamp-3">
                    {truncateText(
                      getLocalizedField(article, 'summary'),
                      120
                    )}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center text-[#00a4e4] group-hover:gap-2 transition-all">
                    <span className="text-sm font-medium">
                      {{
                        'zh-CN': '阅读更多',
                        'zh-TW': '閱讀更多',
                        'en': 'Read More',
                        'ja': '続きを読む',
                        'es': 'Leer más',
                        'fr': 'Lire la suite',
                        'ar': 'اقرأ المزيد',
                        'hi': 'और पढ़ें',
                      }[language] || 'Read More'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-gradient-to-r from-[#00a4e4] to-[#3b5bdb] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00a4e4]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{{
                    'zh-CN': '加载中...',
                    'zh-TW': '載入中...',
                    'en': 'Loading...',
                    'ja': '読み込み中...',
                    'es': 'Cargando...',
                    'fr': 'Chargement...',
                    'ar': 'جاري التحميل...',
                    'hi': 'लोड हो रहा है...',
                  }[language] || 'Loading...'}</span>
                </>
              ) : (
                <>
                  <span>{{
                    'zh-CN': '加载更多',
                    'zh-TW': '載入更多',
                    'en': 'Load More',
                    'ja': 'もっと読み込む',
                    'es': 'Cargar más',
                    'fr': 'Charger plus',
                    'ar': 'تحميل المزيد',
                    'hi': 'और लोड करें',
                  }[language] || 'Load More'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* No More Articles Message */}
        {!hasMore && articles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400">
              {isChinese ? '已显示所有相关文章' : 'All related articles shown'}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

