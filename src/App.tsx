import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { BusinessPage } from './components/BusinessPage';
import { NewsPage } from './components/NewsPage';
import { ConsultingPage } from './components/ConsultingPage';
import { ContactPage } from './components/ContactPage';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'business':
        return <BusinessPage />;
      case 'news':
        return <NewsPage />;
      case 'consulting':
        return <ConsultingPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        {renderPage()}
      </div>
    </LanguageProvider>
  );
}
