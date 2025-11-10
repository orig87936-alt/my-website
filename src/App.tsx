import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { BusinessPage } from './components/BusinessPage';
import { NewsPage } from './components/NewsPage';
import { NewsDetailPage } from './components/NewsDetailPage';
import { ConsultingPage } from './components/ConsultingPage';
import { ContactPage } from './components/ContactPage';
import { DataExporter } from './components/DataExporter';
import { NewsAdminPage } from './components/NewsAdminPage';
import { AppointmentsAdminPage } from './components/AppointmentsAdminPage';
import { SubscriptionAdminPage } from './components/SubscriptionAdminPage';
import { SubscriptionConfirm } from './pages/SubscriptionConfirm';
import { Unsubscribe } from './pages/Unsubscribe';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingProvider } from './contexts/LoadingContext';

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
  };

  const navigateToEdit = (id: string) => {
    setArticleId(id);
    setIsEditing(true);
    setCurrentPage('news-detail');
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
      {renderPage()}
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
