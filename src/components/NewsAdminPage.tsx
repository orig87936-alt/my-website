/**
 * 新闻管理后台主页面
 * 显示所有文章列表，支持筛选、搜索、创建、编辑、删除
 */

import React, { useState, useEffect } from 'react';
import { articlesAPI, Article } from '../services/api';
import { NEWS_CATEGORIES } from '../constants/newsCategories';
import { ARTICLE_STATUSES } from '../constants/newsCategories';
import { ArticleStatusBadge } from './ArticleStatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { NewsCreateForm } from './NewsCreateForm';
import DocumentUploadDialog from './DocumentUploadDialog';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface NewsAdminPageProps {
  onNavigateToArticle: (id: string) => void;
  onNavigateToEdit: (id: string) => void;
}

export const NewsAdminPage: React.FC<NewsAdminPageProps> = ({
  onNavigateToArticle,
  onNavigateToEdit
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 筛选和搜索状态
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // UI 状态
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 检查权限 - 如果不是管理员，显示错误信息
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-page">
        <div className="error-container">
          <h2>{language === 'zh' ? '权限不足' : 'Access Denied'}</h2>
          <p>{language === 'zh' ? '只有管理员可以访问此页面' : 'Only administrators can access this page'}</p>
        </div>
      </div>
    );
  }

  // 加载文章列表
  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      // 管理后台需要加载所有状态的文章
      // 分别加载 published, draft, archived 状态的文章
      const [publishedRes, draftRes, archivedRes] = await Promise.all([
        articlesAPI.list({ page: 1, page_size: 100, status: 'published' }),
        articlesAPI.list({ page: 1, page_size: 100, status: 'draft' }),
        articlesAPI.list({ page: 1, page_size: 100, status: 'archived' }),
      ]);

      // 合并所有文章
      const allArticles = [
        ...publishedRes.items,
        ...draftRes.items,
        ...archivedRes.items,
      ];

      setArticles(allArticles);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setError(err instanceof Error ? err.message : '加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // 筛选文章
  const filteredArticles = articles.filter(article => {
    // 模块筛选
    if (categoryFilter !== 'all' && article.category !== categoryFilter) {
      return false;
    }

    // 状态筛选
    if (statusFilter !== 'all' && article.status !== statusFilter) {
      return false;
    }

    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title_zh.toLowerCase().includes(query) ||
        article.title_en.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // 删除文章
  const handleDelete = async (id: string) => {
    if (!confirm(language === 'zh' ? '确定要删除这篇文章吗？' : 'Are you sure you want to delete this article?')) {
      return;
    }

    setDeletingId(id);

    try {
      console.log('Deleting article:', id);
      await articlesAPI.delete(id);
      console.log('Article deleted successfully');
      await loadArticles();
    } catch (err) {
      console.error('Delete article error:', err);

      // 显示详细错误信息
      const errorMessage = err && typeof err === 'object' && 'detail' in err
        ? (err as any).detail
        : (err instanceof Error ? err.message : (language === 'zh' ? '删除失败' : 'Delete failed'));

      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{language === 'zh' ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>{language === 'zh' ? '新闻管理' : 'News Management'}</h1>
          <p className="subtitle">
            {language === 'zh' ? `共 ${filteredArticles.length} 篇文章` : `${filteredArticles.length} articles`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadDialog(true)}
            className="btn btn-secondary"
          >
            📄 {language === 'zh' ? '上传文档' : 'Upload Document'}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            + {language === 'zh' ? '创建新文章' : 'Create Article'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* 筛选和搜索 */}
      <div className="filters-bar">
        <div className="filters-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{language === 'zh' ? '所有模块' : 'All Categories'}</option>
            {NEWS_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.labelEn} / {cat.labelZh}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{language === 'zh' ? '所有状态' : 'All Statuses'}</option>
            <option value={ARTICLE_STATUSES.DRAFT}>{language === 'zh' ? '草稿' : 'Draft'}</option>
            <option value={ARTICLE_STATUSES.PUBLISHED}>{language === 'zh' ? '已发布' : 'Published'}</option>
            <option value={ARTICLE_STATUSES.ARCHIVED}>{language === 'zh' ? '已归档' : 'Archived'}</option>
          </select>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'zh' ? '搜索标题...' : 'Search titles...'}
          className="search-input"
        />
      </div>

      {/* 文章列表 */}
      <div className="articles-grid">
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <p>{language === 'zh' ? '没有找到文章' : 'No articles found'}</p>
          </div>
        ) : (
          filteredArticles.map(article => (
            <div key={article.id} className="article-card">
              {article.image_url && (
                <div className="article-image">
                  <img src={article.image_url} alt={article.title_zh} />
                </div>
              )}
              <div className="article-content">
                <div className="article-badges">
                  <CategoryBadge category={article.category} size="small" />
                  <ArticleStatusBadge status={article.status} size="small" />
                </div>
                <h3 className="article-title">
                  {language === 'zh' ? article.title_zh : article.title_en}
                </h3>
                <p className="article-meta">
                  {article.author} · {formatDate(article.published_at)}
                </p>
                <p className="article-summary">
                  {language === 'zh' ? article.summary_zh : article.summary_en}
                </p>
                <div className="article-actions">
                  <button
                    onClick={() => onNavigateToArticle(article.id)}
                    className="btn-action btn-view"
                  >
                    {language === 'zh' ? '查看' : 'View'}
                  </button>
                  <button
                    onClick={() => onNavigateToEdit(article.id)}
                    className="btn-action btn-edit"
                  >
                    {language === 'zh' ? '编辑' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="btn-action btn-delete"
                    disabled={deletingId === article.id}
                  >
                    {deletingId === article.id
                      ? (language === 'zh' ? '删除中...' : 'Deleting...')
                      : (language === 'zh' ? '删除' : 'Delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 文档上传对话框 */}
      <DocumentUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadSuccess={(result) => {
          setUploadedData(result);
          setShowUploadDialog(false);
          setShowCreateForm(true);
        }}
      />

      {/* 创建表单模态框 */}
      {showCreateForm && (
        <NewsCreateForm
          initialData={uploadedData}
          onSuccess={() => {
            setShowCreateForm(false);
            setUploadedData(null);
            loadArticles();
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setUploadedData(null);
          }}
        />
      )}

      <style>{`
        .admin-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 100px 20px 40px 20px;
          min-height: 100vh;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .admin-page {
            padding: 80px 16px 40px 16px;
          }

          .admin-header {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .admin-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          color: #111827;
        }

        .subtitle {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background-color: #00a4e4;
          color: white;
        }

        .btn-primary:hover {
          background-color: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-secondary {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .alert-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filters-group {
          display: flex;
          gap: 12px;
          flex: 1;
        }

        .filter-select,
        .search-input {
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .filter-select {
          min-width: 180px;
        }

        .search-input {
          min-width: 250px;
        }

        .filter-select:focus,
        .search-input:focus {
          outline: none;
          border-color: #00a4e4;
          box-shadow: 0 0 0 3px rgba(0, 164, 228, 0.1);
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .article-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .article-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .article-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background-color: #f3f4f6;
        }

        .article-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .article-content {
          padding: 20px;
        }

        .article-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .article-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .article-meta {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #6b7280;
        }

        .article-summary {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #4b5563;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .article-actions {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
        }

        .btn-view {
          background-color: white;
          color: #00a4e4;
          border-color: #00a4e4;
        }

        .btn-view:hover {
          background-color: #f0f9ff;
        }

        .btn-edit {
          background-color: white;
          color: #7950f2;
          border-color: #7950f2;
        }

        .btn-edit:hover {
          background-color: #f3f0ff;
        }

        .btn-delete {
          background-color: white;
          color: #dc2626;
          border-color: #dc2626;
        }

        .btn-delete:hover:not(:disabled) {
          background-color: #fef2f2;
        }

        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }

        .error-container h2 {
          color: #dc2626;
          font-size: 24px;
          margin: 0;
        }

        .error-container p {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #00a4e4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .articles-grid {
            grid-template-columns: 1fr;
          }

          .filters-bar {
            flex-direction: column;
          }

          .filters-group {
            flex-direction: column;
          }

          .filter-select,
          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsAdminPage;

