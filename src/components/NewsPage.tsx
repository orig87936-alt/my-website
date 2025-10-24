import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Clock } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export function NewsPage() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featuredNews = {
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ld3MlMjBtZWV0aW5nfGVufDF8fHx8MTc2MDM2NTkwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    date: language === 'zh' ? '2024年1月15日' : 'Jan 15, 2024',
    title: language === 'zh' ? 'S&L荣获「年度最佳咨询公司」大奖' : 'S&L Wins "Consulting Firm of the Year" Award',
    description: language === 'zh' 
      ? '我们非常自豪地宣布，S&L凭借在数字化转型领域的卓越贡献和创新解决方案，被评为「年度最佳咨询公司」。'
      : 'We are proud to announce that S&L has been named "Consulting Firm of the Year" for our outstanding contributions in digital transformation.'
  };

  const latestNews = [
    {
      time: language === 'zh' ? '17分钟' : '17 mins',
      readTime: language === 'zh' ? '3分钟阅读' : '3 min read',
      title: language === 'zh' ? 'S&L宣布扩大亚太地区业务布局' : 'S&L Announces Expansion in Asia-Pacific',
      category: 'business'
    },
    {
      time: language === 'zh' ? '29分钟' : '29 mins',
      readTime: language === 'zh' ? '7分钟阅读' : '7 min read',
      title: language === 'zh' ? '新研究报告：人工智能在金融服务中的未来趋势' : 'New Report: Future Trends of AI in Financial Services',
      category: 'research'
    },
    {
      time: language === 'zh' ? '30分钟' : '30 mins',
      readTime: language === 'zh' ? '5分钟阅读' : '5 min read',
      title: language === 'zh' ? 'Web3技术推动企业数字化转型的三大关键' : 'Three Keys of Web3 Driving Enterprise Digital Transformation',
      category: 'technology'
    },
    {
      time: language === 'zh' ? '45分钟' : '45 mins',
      readTime: language === 'zh' ? '4分钟阅读' : '4 min read',
      title: language === 'zh' ? '公司宣布与Tech Innovators建立战略合作伙伴关系' : 'Company Announces Strategic Partnership with Tech Innovators',
      category: 'partnership'
    },
  ];

  const newsArticles = [
    {
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      date: language === 'zh' ? '2024年1月10日' : 'Jan 10, 2024',
      title: language === 'zh' ? '新研究报告：人工智能在金融服务中的未来' : 'New Research Report: The Future of AI in Financial Services',
      description: language === 'zh' ? '我们最新的研究报告深入探讨了人工智能如何重塑金融行业。' : 'Our latest research explores how AI is reshaping the financial industry.'
    },
    {
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      date: language === 'zh' ? '2024年1月8日' : 'Jan 8, 2024',
      title: language === 'zh' ? 'S&L宣布与Tech Innovators建立战略合作伙伴关系' : 'S&L Announces Strategic Partnership with Tech Innovators',
      description: language === 'zh' ? '通过此次合作，我们将结合双方的专业知识。' : 'Through this partnership, we combine expertise from both sides.'
    },
    {
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      date: language === 'zh' ? '2024年1月5日' : 'Jan 5, 2024',
      title: language === 'zh' ? '欢迎新任首席技术官加入我们的领导团队' : 'Welcome New CTO to Our Leadership Team',
      description: language === 'zh' ? '行业资深人士李明博士已加入S&L。' : 'Industry veteran Dr. Li Ming has joined S&L.'
    },
    {
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800',
      date: language === 'zh' ? '2024年1月3日' : 'Jan 3, 2024',
      title: language === 'zh' ? 'S&L扩大亚太地区业务布局' : 'S&L Expands Operations in Asia-Pacific',
      description: language === 'zh' ? '我们很高兴宣布在亚太地区开设新的办事处。' : 'We are excited to announce new office openings across the Asia-Pacific region.'
    },
    {
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      date: language === 'zh' ? '2023年12月28日' : 'Dec 28, 2023',
      title: language === 'zh' ? 'Web3技术推动企业数字化转型' : 'Web3 Technology Driving Enterprise Digital Transformation',
      description: language === 'zh' ? '探索Web3如何为企业创造新的商业机会。' : 'Exploring how Web3 creates new business opportunities for enterprises.'
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      date: language === 'zh' ? '2023年12月25日' : 'Dec 25, 2023',
      title: language === 'zh' ? '年度回顾：2023年投资市场趋势分析' : 'Year in Review: 2023 Investment Market Trends',
      description: language === 'zh' ? '回顾2023年的主要投资趋势和市场表现。' : 'A look back at major investment trends and market performance in 2023.'
    },
  ];

  const categories = [
    { id: 'all', label: language === 'zh' ? '全部类别' : 'All Categories' },
    { id: 'business', label: language === 'zh' ? '业务动态' : 'Business Updates' },
    { id: 'research', label: language === 'zh' ? '研究报告' : 'Research Reports' },
    { id: 'technology', label: language === 'zh' ? '技术创新' : 'Tech Innovation' },
  ];

  return (
    <div className="min-h-screen bg-[#0a2540] pt-20">
      {/* Hero Section */}
      <section className="py-24 px-8 border-b border-white/10">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-light text-white mb-6"
          >
            {language === 'zh' ? '新闻与洞察' : 'News & Insights'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {language === 'zh' 
              ? '了解S&L的最新动态、行业见解和重要公告'
              : 'Stay updated with S&L\'s latest news, industry insights and important announcements'
            }
          </motion.p>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-20 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative overflow-hidden rounded-2xl group cursor-pointer"
            >
              <ImageWithFallback
                src={featuredNews.image}
                alt={featuredNews.title}
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/50 to-transparent" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="text-sm text-[#00a4e4] uppercase tracking-wider">
                {language === 'zh' ? '重要新闻' : 'FEATURED NEWS'}
              </div>
              <p className="text-gray-400">{featuredNews.date}</p>
              <h2 className="text-4xl font-light text-white leading-tight">{featuredNews.title}</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{featuredNews.description}</p>
              <button className="group flex items-center gap-2 text-[#00a4e4] hover:gap-3 transition-all">
                <span>{language === 'zh' ? '阅读全文' : 'Read Full Article'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* News Grid - 6 Cards */}
      <section className="py-20 px-8 bg-[#05162a]/50">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-4xl font-light text-white mb-12">{language === 'zh' ? '最新发布' : 'Latest Updates'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group glass rounded-2xl overflow-hidden cursor-pointer hover:bg-white/5 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-400 text-sm mb-3">{article.date}</p>
                  <h3 className="text-xl font-light text-white mb-3 group-hover:text-[#00a4e4] transition-colors leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{article.description}</p>
                  <div className="flex items-center gap-2 text-[#00a4e4] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">{language === 'zh' ? '了解更多' : 'Learn More'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section - Scrollable */}
      <section className="py-20 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-light text-white">Latest</h2>
            
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

          {/* Scrollable Container */}
          <div className="relative h-[500px] overflow-hidden rounded-2xl border border-white/10">
            {/* Gradient Overlays */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a2540] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a2540] to-transparent z-10 pointer-events-none" />
            
            {/* Auto-scrolling Content */}
            <div className="h-full overflow-y-auto scrollbar-hide hover:scrollbar-default scroll-smooth">
              <div className="space-y-4 p-4">
                {/* Duplicate the list for continuous scrolling effect */}
                {[...latestNews, ...latestNews, ...latestNews]
                  .filter(news => selectedCategory === 'all' || news.category === selectedCategory)
                  .map((news, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (index % 4) * 0.05 }}
                      className="group flex items-center gap-6 p-6 glass rounded-xl hover:bg-white/5 transition-all cursor-pointer"
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
                      <ArrowRight className="w-5 h-5 text-[#00a4e4] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
