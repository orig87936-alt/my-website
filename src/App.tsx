import { useState, useEffect, lazy, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingProvider } from './contexts/LoadingContext';

// 懒加载非关键页面组件
const BusinessPage = lazy(() => import('./components/BusinessPage').then(m => ({ default: m.BusinessPage })));
const NewsPage = lazy(() => import('./components/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsDetailPage = lazy(() => import('./components/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })));
const ConsultingPage = lazy(() => import('./components/ConsultingPage').then(m => ({ default: m.ConsultingPage })));
const ContactPage = lazy(() => import('./components/ContactPage').then(m => ({ default: m.ContactPage })));

// 懒加载管理员页面（仅管理员需要）
const DataExporter = lazy(() => import('./components/DataExporter').then(m => ({ default: m.DataExporter })));
const NewsAdminPage = lazy(() => import('./components/NewsAdminPage').then(m => ({ default: m.NewsAdminPage })));
const AppointmentsAdminPage = lazy(() => import('./components/AppointmentsAdminPage').then(m => ({ default: m.AppointmentsAdminPage })));
const SubscriptionAdminPage = lazy(() => import('./components/SubscriptionAdminPage').then(m => ({ default: m.SubscriptionAdminPage })));

// 懒加载订阅相关页面
const SubscriptionConfirm = lazy(() => import('./pages/SubscriptionConfirm').then(m => ({ default: m.SubscriptionConfirm })));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe').then(m => ({ default: m.Unsubscribe })));

// 加载中组件
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 检查 URL 参数来处理订阅确认和退订
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    // 检查是否是订阅确认页面
    if (path.includes('/subscription/confirm') || params.has('confirm_subscription')) {
      setCurrentPage('subscription-confirm');
    }
    // 检查是否是退订页面
    else if (path.includes('/unsubscribe') || params.has('unsubscribe')) {
      setCurrentPage('unsubscribe');
    }
  }, []);

  const navigateToArticle = (id: string) => {
    setArticleId(id);
    setIsEditing(false);
    setCurrentPage('news-detail');
    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navigateToEdit = (id: string) => {
    setArticleId(id);
    setIsEditing(true);
    setCurrentPage('news-detail');
    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navigateBack = () => {
    setArticleId(null);
    setIsEditing(false);
    setCurrentPage('news');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'business':
        return <BusinessPage />;
      case 'news':
        return <NewsPage onNavigateToArticle={navigateToArticle} />;
      case 'news-detail':
        return articleId ? (
          <NewsDetailPage
            articleId={articleId}
            onBack={navigateBack}
            onNavigateToArticle={navigateToArticle}
            isEditing={isEditing}
            onStartEdit={() => setIsEditing(true)}
            onStopEdit={() => setIsEditing(false)}
          />
        ) : (
          <NewsPage onNavigateToArticle={navigateToArticle} />
        );
      case 'consulting':
        return <ConsultingPage />;
      case 'contact':
        return <ContactPage />;
      case 'data-exporter':
        return <DataExporter />;
      case 'admin-news':
        // 仅管理员可访问
        if (user?.role === 'ADMIN') {
          return (
            <NewsAdminPage
              onNavigateToArticle={navigateToArticle}
              onNavigateToEdit={navigateToEdit}
            />
          );
        } else {
          return <HomePage />;
        }
      case 'admin-appointments':
        // 仅管理员可访问
        if (user?.role === 'ADMIN') {
          return <AppointmentsAdminPage />;
        } else {
          return <HomePage />;
        }
      case 'admin-subscriptions':
        // 仅管理员可访问
        if (user?.role === 'ADMIN') {
          return <SubscriptionAdminPage />;
        } else {
          return <HomePage />;
        }
      case 'subscription-confirm':
        return <SubscriptionConfirm onNavigate={setCurrentPage} />;
      case 'unsubscribe':
        return <Unsubscribe onNavigate={setCurrentPage} />;
      default:
        return <HomePage />;
    }
  };

  // 订阅确认和退订页面不显示导航栏
  const hideNavigation = currentPage === 'subscription-confirm' || currentPage === 'unsubscribe';

  return (
    <div className="min-h-screen">
      {!hideNavigation && <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />}
      <Suspense fallback={<PageLoader />}>
        {renderPage()}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <LoadingProvider>
            <AppContent />
          </LoadingProvider>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
