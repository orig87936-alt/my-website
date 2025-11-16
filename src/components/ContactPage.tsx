import { Facebook, Twitter, Linkedin, Instagram, Youtube, Github } from 'lucide-react';
import { WeChatSVG, WeiboSVG, DouyinSVG, XiaohongshuSVG } from '../imports/chinese-social-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'motion/react';
import { useState } from 'react';
import { subscriptionAPI } from '../services/api';

export function ContactPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const socialMediaRow1 = [
    { icon: Linkedin, name: 'LinkedIn', url: '#', type: 'lucide' as const },
    { icon: Twitter, name: 'Twitter', url: '#', type: 'lucide' as const },
    { icon: Facebook, name: 'Facebook', url: '#', type: 'lucide' as const },
    { icon: Instagram, name: 'Instagram', url: '#', type: 'lucide' as const },
    { icon: Youtube, name: 'YouTube', url: '#', type: 'lucide' as const },
  ];

  const socialMediaRow2 = [
    { icon: Github, name: 'GitHub', url: '#', type: 'lucide' as const },
    { 
      icon: WeChatSVG, 
      name: language.startsWith('zh') ? '微信' : 'WeChat', 
      url: '#', 
      type: 'custom' as const 
    },
    { 
      icon: WeiboSVG, 
      name: language.startsWith('zh') ? '微博' : 'Weibo', 
      url: '#', 
      type: 'custom' as const 
    },
    { 
      icon: DouyinSVG, 
      name: language.startsWith('zh') ? '抖音' : 'Douyin', 
      url: '#', 
      type: 'custom' as const 
    },
    {
      icon: XiaohongshuSVG,
      name: language.startsWith('zh') ? '小红书' : 'RED',
      url: '#',
      type: 'custom' as const
    },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast(
        language.startsWith('zh') ? '请输入邮箱地址' : 'Please enter your email address',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        email,
        subscription_type: 'all',
        frequency: 'weekly'
      };
      console.log('Sending subscription request:', requestData);
      await subscriptionAPI.create(requestData);

      showToast(
        language.startsWith('zh')
          ? '订阅成功！请查收确认邮件。'
          : 'Subscription successful! Please check your email for confirmation.',
        'success'
      );

      setEmail('');
    } catch (error: any) {
      console.error('Subscription error:', error);

      const errorMessage = error.message || error.detail ||
        (language.startsWith('zh') ? '订阅失败，请稍后重试' : 'Subscription failed. Please try again later.');

      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {t('contact.hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {t('contact.hero.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="py-24 px-8">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl font-light text-white mb-6">
              {language.startsWith('zh') ? '订阅我们的邮件' : 'Subscribe to Our Newsletter'}
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              {language.startsWith('zh')
                ? '获取S&L的最新资讯、行业洞察和独家内容'
                : 'Get the latest news, insights and exclusive content from S&L'
              }
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language.startsWith('zh') ? '输入您的邮箱地址' : 'Enter your email address'}
                required
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#00a4e4] focus:ring-2 focus:ring-[#00a4e4]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-4 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-full transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? (language.startsWith('zh') ? '提交中...' : 'Submitting...')
                  : (language.startsWith('zh') ? '订阅' : 'Subscribe')
                }
              </button>
            </form>

            <p className="text-sm text-gray-400 mt-6">
              {language.startsWith('zh')
                ? '我们尊重您的隐私，不会分享您的邮箱地址'
                : 'We respect your privacy and will never share your email address'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 px-8 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-light text-white mb-12">
              {language.startsWith('zh') ? '关注我们' : 'Follow Us'}
            </h3>

            {/* First Row - 5 Icons */}
            <div className="flex justify-center items-center gap-6 mb-6">
              {socialMediaRow1.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group border border-white/10"
                    aria-label={social.name}
                  >
                    <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                  </motion.a>
                );
              })}
            </div>

            {/* Second Row - All Icons */}
            <div className="flex justify-center items-center gap-6">
              {socialMediaRow2.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index + 5) * 0.05 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group border border-white/10"
                    aria-label={social.name}
                  >
                    {social.type === 'lucide' ? (
                      <IconComponent className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                    ) : (
                      <div className="text-gray-300 group-hover:text-white transition-colors">
                        <IconComponent />
                      </div>
                    )}
                  </motion.a>
                );
              })}
            </div>

            {/* Contact Info Footer */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-sm">
                <div>
                  <div className="text-gray-400 mb-2">{language.startsWith('zh') ? '邮箱' : 'Email'}</div>
                  <a href="mailto:contact@sl-consulting.com" className="text-[#00a4e4] hover:underline">
                    contact@sl-consulting.com
                  </a>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">{language.startsWith('zh') ? '电话' : 'Phone'}</div>
                  <a href="tel:+864008888888" className="text-[#00a4e4] hover:underline">
                    +86 400 888 8888
                  </a>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">{language.startsWith('zh') ? '网站' : 'Website'}</div>
                  <a href="https://www.sl-consulting.com" className="text-[#00a4e4] hover:underline">
                    www.sl-consulting.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
