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

  const isChinese = language === 'zh-CN' || language === 'zh-TW';

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
      setError(isChinese ? '加载相关文章失败' : 'Failed to load related articles');
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
    if (isChinese) {
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {isChinese ? '暂无更多文章' : 'No more articles available'}
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
            {isChinese ? '相关文章' : 'Related Articles'}
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
                      alt={isChinese ? article.title_zh : article.title_en}
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
                    {isChinese ? article.title_zh : article.title_en}
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-300 mb-4 flex-1 line-clamp-3">
                    {truncateText(
                      isChinese ? article.summary_zh : article.summary_en,
                      120
                    )}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center text-[#00a4e4] group-hover:gap-2 transition-all">
                    <span className="text-sm font-medium">
                      {isChinese ? '阅读更多' : 'Read More'}
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
                  <span>{isChinese ? '加载中...' : 'Loading...'}</span>
                </>
              ) : (
                <>
                  <span>{isChinese ? '加载更多' : 'Load More'}</span>
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

