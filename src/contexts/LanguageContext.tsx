import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.business': '业务类别',
    'nav.news': '新闻',
    'nav.consulting': '咨询',
    'nav.contact': '联系我们',
    
    // HomePage
    'home.hero.title': '全球视野 精准投资',
    'home.hero.subtitle': '专注传统行业与新经济领域的战略投资',
    'home.stats.projects': '投资项目',
    'home.stats.capital': '管理资本',
    'home.stats.returns': '年均回报',
    'home.stats.years': '行业经验',
    'home.featured.title': '特色业务',
    'home.featured.traditional': '传统行业投资',
    'home.featured.traditional.desc': '深耕制造业、能源、基础设施等核心领域',
    'home.featured.neweconomy': '新经济投资',
    'home.featured.neweconomy.desc': '布局科技、消费升级、数字经济等新兴赛道',
    'home.featured.advisory': '战略咨询',
    'home.featured.advisory.desc': '提供专业的投资策略与企业咨询服务',
    
    // BusinessPage
    'business.hero.title': '业务类别',
    'business.hero.subtitle': '传统企业、创业板等、新经济为中的涉及行业以及估值模型',
    'business.traditional.title': '传统行业',
    'business.traditional.subtitle': '稳健投资 价值创造',
    'business.traditional.desc': '在制造业、能源、基础设施等传统领域，我们凭借深厚的行业洞察和丰富的运营经验，为客户创造长期稳定的价值回报。',
    'business.traditional.manufacturing': '传统制造业',
    'business.traditional.manufacturing.desc': '制造、重工、精密机械制造',
    'business.traditional.realestate': '房地产开发',
    'business.traditional.realestate.desc': '房地产开发、建筑设计',
    'business.traditional.energy': '传统能源',
    'business.traditional.energy.desc': '石油、煤炭、传统发电产业',
    'business.neweconomy.title': '新经济',
    'business.neweconomy.subtitle': '创新驱动 未来布局',
    'business.neweconomy.desc': '紧跟时代脉搏，在科技创新、消费升级、数字经济等新兴领域进行前瞻性投资布局，把握未来发展机遇。',
    'business.neweconomy.ai': '人工智能',
    'business.neweconomy.ai.desc': '机器学习、计算机视觉、自然语言处理',
    'business.neweconomy.web3': 'Web3 & 区块链',
    'business.neweconomy.web3.desc': 'DeFi、NFT、智能合约技术',
    'business.neweconomy.fintech': '金融科技',
    'business.neweconomy.fintech.desc': '数字支付、智能投顾、区块链金融',
    
    // NewsPage
    'news.hero.title': '新闻资讯',
    'news.hero.subtitle': '洞察市场动态 把握投资机遇',
    'news.featured.title': '特色报道',
    'news.latest.title': '最新发布',
    'news.live.title': 'Latest 实时动态',
    'news.live.subtitle': '第一时间掌握市场动态',
    'news.readmore': '阅读更多',
    'news.minsread': '分钟阅读',
    
    // ConsultingPage
    'consulting.hero.title': '专业咨询服务',
    'consulting.hero.subtitle': '智能咨询助手 · 专业团队支持 · 预约一对一服务',
    'consulting.chat.title': 'AI 智能咨询',
    'consulting.chat.placeholder': '请输入您的问题...',
    'consulting.chat.send': '发送',
    'consulting.chat.welcome': '您好！我是S&L的智能助手。请问有什么可以帮助您的？',
    'consulting.chat.q1': '请介绍一下S&L的投资领域',
    'consulting.chat.q2': '如何预约咨询服务？',
    'consulting.chat.q3': '你们的投资策略是什么？',
    'consulting.services.title': '咨询服务',
    'consulting.services.strategy': '投资策略咨询',
    'consulting.services.strategy.desc': '为您量身定制投资组合策略',
    'consulting.services.market': '市场分析',
    'consulting.services.market.desc': '深度行业研究与趋势分析',
    'consulting.services.risk': '风险评估',
    'consulting.services.risk.desc': '全方位投资风险管理方案',
    'consulting.services.advisory': '企业咨询',
    'consulting.services.advisory.desc': '战略规划与运营优化建议',
    'consulting.appointment.title': '预约咨询',
    'consulting.appointment.desc': '点击预约一对一专业咨询服务',
    'consulting.appointment.button': '预约咨询',
    'consulting.appointment.calendar.title': '选择咨询时间',
    'consulting.appointment.calendar.name': '您的姓名',
    'consulting.appointment.calendar.email': '邮箱地址',
    'consulting.appointment.calendar.phone': '联系电话',
    'consulting.appointment.calendar.message': '咨询内容（可选）',
    'consulting.appointment.calendar.confirm': '确认预约',
    'consulting.appointment.calendar.cancel': '取消',
    
    // ContactPage
    'contact.hero.title': '连接全球投资者社区',
    'contact.hero.subtitle': '关注我们的社交平台，获取最新投资洞察与市场动态',
    'contact.social.title': '关注我们',
    'contact.social.subtitle': '在全球各大社交平台与我们互动，获取最新资讯',
    'contact.offices.title': '办公地点',
    'contact.offices.subtitle': '我们在全球主要城市设有办公室，为客户提供便捷的服务',
    'contact.offices.beijing': '北京',
    'contact.offices.beijing.address': '北京市朝阳区建国门外大街1号',
    'contact.offices.shanghai': '上海',
    'contact.offices.shanghai.address': '上海市浦东新区陆家嘴环路1000号',
    'contact.offices.shenzhen': '深圳',
    'contact.offices.shenzhen.address': '深圳市福田区深南大道1号',
    'contact.offices.hongkong': '香港',
    'contact.offices.hongkong.address': '香港中环金融街1号',
    'contact.app.title': '移动应用',
    'contact.app.subtitle': '下载 S&L Insights App，随时随地获取最新投资洞察',
    
    // Common
    'company.name': 'S&L',
    'company.tagline': 'Strategic Investment Advisory & Management',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.business': 'Business',
    'nav.news': 'News',
    'nav.consulting': 'Consulting',
    'nav.contact': 'Contact',
    
    // HomePage
    'home.hero.title': 'Global Vision, Precise Investment',
    'home.hero.subtitle': 'Strategic Investment in Traditional Industries and New Economy',
    'home.stats.projects': 'Projects',
    'home.stats.capital': 'AUM',
    'home.stats.returns': 'Annual Returns',
    'home.stats.years': 'Years Experience',
    'home.featured.title': 'Featured Services',
    'home.featured.traditional': 'Traditional Industries',
    'home.featured.traditional.desc': 'Deep expertise in manufacturing, energy, and infrastructure',
    'home.featured.neweconomy': 'New Economy',
    'home.featured.neweconomy.desc': 'Focus on technology, consumption upgrade, and digital economy',
    'home.featured.advisory': 'Strategic Advisory',
    'home.featured.advisory.desc': 'Professional investment strategy and corporate advisory services',
    
    // BusinessPage
    'business.hero.title': 'Business Categories',
    'business.hero.subtitle': 'Traditional enterprises, growth boards, and valuation models in the new economy',
    'business.traditional.title': 'Traditional Industries',
    'business.traditional.subtitle': 'Stable Investment, Value Creation',
    'business.traditional.desc': 'In traditional sectors such as manufacturing, energy, and infrastructure, we leverage deep industry insights and operational expertise to create long-term stable returns for our clients.',
    'business.traditional.manufacturing': 'Traditional Manufacturing',
    'business.traditional.manufacturing.desc': 'Manufacturing, heavy industry, precision machinery',
    'business.traditional.realestate': 'Real Estate Development',
    'business.traditional.realestate.desc': 'Real estate development, architectural design',
    'business.traditional.energy': 'Traditional Energy',
    'business.traditional.energy.desc': 'Oil, coal, traditional power generation',
    'business.neweconomy.title': 'New Economy',
    'business.neweconomy.subtitle': 'Innovation Driven, Future Focused',
    'business.neweconomy.desc': 'Staying ahead of the curve, we make forward-looking investments in emerging sectors such as technology innovation, consumption upgrade, and digital economy to capture future opportunities.',
    'business.neweconomy.ai': 'Artificial Intelligence',
    'business.neweconomy.ai.desc': 'Machine learning, computer vision, NLP',
    'business.neweconomy.web3': 'Web3 & Blockchain',
    'business.neweconomy.web3.desc': 'DeFi, NFT, smart contract technology',
    'business.neweconomy.fintech': 'Fintech',
    'business.neweconomy.fintech.desc': 'Digital payments, robo-advisory, blockchain finance',
    
    // NewsPage
    'news.hero.title': 'News & Insights',
    'news.hero.subtitle': 'Market Intelligence, Investment Opportunities',
    'news.featured.title': 'Featured Stories',
    'news.latest.title': 'Latest Updates',
    'news.live.title': 'Live Updates',
    'news.live.subtitle': 'Real-time market insights',
    'news.readmore': 'Read More',
    'news.minsread': 'min read',
    
    // ConsultingPage
    'consulting.hero.title': 'Professional Consulting Services',
    'consulting.hero.subtitle': 'AI Assistant · Expert Team · Personalized Service',
    'consulting.chat.title': 'AI Consulting Assistant',
    'consulting.chat.placeholder': 'Type your question...',
    'consulting.chat.send': 'Send',
    'consulting.chat.welcome': 'Hello! I am the S&L AI assistant. How can I help you today?',
    'consulting.chat.q1': 'Tell me about S&L\'s investment areas',
    'consulting.chat.q2': 'How to book a consultation?',
    'consulting.chat.q3': 'What is your investment strategy?',
    'consulting.services.title': 'Consulting Services',
    'consulting.services.strategy': 'Investment Strategy',
    'consulting.services.strategy.desc': 'Customized portfolio strategy for you',
    'consulting.services.market': 'Market Analysis',
    'consulting.services.market.desc': 'In-depth industry research and trend analysis',
    'consulting.services.risk': 'Risk Assessment',
    'consulting.services.risk.desc': 'Comprehensive investment risk management',
    'consulting.services.advisory': 'Corporate Advisory',
    'consulting.services.advisory.desc': 'Strategic planning and operational optimization',
    'consulting.appointment.title': 'Book Consultation',
    'consulting.appointment.desc': 'Schedule one-on-one professional consulting service',
    'consulting.appointment.button': 'Book Now',
    'consulting.appointment.calendar.title': 'Select Consultation Time',
    'consulting.appointment.calendar.name': 'Your Name',
    'consulting.appointment.calendar.email': 'Email Address',
    'consulting.appointment.calendar.phone': 'Phone Number',
    'consulting.appointment.calendar.message': 'Message (Optional)',
    'consulting.appointment.calendar.confirm': 'Confirm Booking',
    'consulting.appointment.calendar.cancel': 'Cancel',
    
    // ContactPage
    'contact.hero.title': 'Connect with Global Investor Community',
    'contact.hero.subtitle': 'Follow our social platforms for latest investment insights and market updates',
    'contact.social.title': 'Follow Us',
    'contact.social.subtitle': 'Connect with us on global social platforms for latest updates',
    'contact.offices.title': 'Office Locations',
    'contact.offices.subtitle': 'We have offices in major cities worldwide to serve you better',
    'contact.offices.beijing': 'Beijing',
    'contact.offices.beijing.address': 'No.1 Jianguomenwai Avenue, Chaoyang District, Beijing',
    'contact.offices.shanghai': 'Shanghai',
    'contact.offices.shanghai.address': 'No.1000 Lujiazui Ring Road, Pudong New Area, Shanghai',
    'contact.offices.shenzhen': 'Shenzhen',
    'contact.offices.shenzhen.address': 'No.1 Shennan Avenue, Futian District, Shenzhen',
    'contact.offices.hongkong': 'Hong Kong',
    'contact.offices.hongkong.address': 'No.1 Financial Street, Central, Hong Kong',
    'contact.app.title': 'Mobile App',
    'contact.app.subtitle': 'Download S&L Insights App for investment insights anytime, anywhere',
    
    // Common
    'company.name': 'S&L',
    'company.tagline': 'Strategic Investment Advisory & Management',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
