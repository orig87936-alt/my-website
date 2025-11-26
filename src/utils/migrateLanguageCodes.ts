/**
 * Migrate language codes from old format to new format
 * Old: 'zh', 'zh-tw'
 * New: 'zh-CN', 'zh-TW'
 */

export function migrateLanguageCodes() {
  try {
    // Migrate liveNewsList
    const liveNewsData = localStorage.getItem('liveNewsList');
    if (liveNewsData) {
      const liveNews = JSON.parse(liveNewsData);
      if (Array.isArray(liveNews)) {
        const migrated = liveNews.map((news: any) => ({
          ...news,
          readTime: migrateObject(news.readTime),
          title: migrateObject(news.title),
          summary: migrateObject(news.summary),
        }));
        localStorage.setItem('liveNewsList', JSON.stringify(migrated));
        console.log('✅ Migrated liveNewsList language codes');
      }
    }

    // Migrate focusPointNews
    const focusPointData = localStorage.getItem('focusPointNews');
    if (focusPointData) {
      const focusPoint = JSON.parse(focusPointData);
      const migrated = {
        ...focusPoint,
        date: migrateObject(focusPoint.date),
        title: migrateObject(focusPoint.title),
        summary: migrateObject(focusPoint.summary),
        fullContent: migrateObject(focusPoint.fullContent),
      };
      localStorage.setItem('focusPointNews', JSON.stringify(migrated));
      console.log('✅ Migrated focusPointNews language codes');
    }

    // Migrate featuredArticles
    const featuredData = localStorage.getItem('featuredArticles');
    if (featuredData) {
      const featured = JSON.parse(featuredData);
      if (Array.isArray(featured)) {
        const migrated = featured.map((article: any) => ({
          ...article,
          category: migrateObject(article.category),
          date: migrateObject(article.date),
          title: migrateObject(article.title),
          description: migrateObject(article.description),
        }));
        localStorage.setItem('featuredArticles', JSON.stringify(migrated));
        console.log('✅ Migrated featuredArticles language codes');
      }
    }

    console.log('🎉 Language code migration completed!');
  } catch (error) {
    console.error('❌ Error migrating language codes:', error);
  }
}

function migrateObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const migrated: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = migrateKey(key);
    migrated[newKey] = value;
  }
  return migrated;
}

function migrateKey(key: string): string {
  const keyMap: Record<string, string> = {
    'zh': 'zh-CN',
    'zh-tw': 'zh-TW',
    'en': 'en',
    'ja': 'ja',
    'es': 'es',
    'fr': 'fr',
    'ar': 'ar',
    'hi': 'hi',
  };
  return keyMap[key] || key;
}

