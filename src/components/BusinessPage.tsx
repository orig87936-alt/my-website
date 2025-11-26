import { ImageWithFallback } from './figma/ImageWithFallback';
import { Brain, Network, Wallet, Factory, Building2, Zap, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export function BusinessPage() {
  const { t, language } = useLanguage();

  const newEconomyCategories = [
    {
      icon: Brain,
      title: t('business.neweconomy.ai'),
      description: t('business.neweconomy.ai.desc'),
      returnRange: '8%~20%',
      color: '#3b5bdb',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjAzNjQ2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: Network,
      title: t('business.neweconomy.web3'),
      description: t('business.neweconomy.web3.desc'),
      returnRange: '5%~10%',
      color: '#7c3aed',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwY3J5cHRvY3VycmVuY3l8ZW58MXx8fHwxNzYwMzY0NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: Wallet,
      title: t('business.neweconomy.fintech'),
      description: t('business.neweconomy.fintech.desc'),
      returnRange: '3%~8%',
      color: '#059669',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW50ZWNoJTIwYmFua2luZ3xlbnwxfHx8fDE3NjAzNjQ2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ];

  const traditionalCategories = [
    {
      icon: Factory,
      title: t('business.traditional.manufacturing'),
      description: t('business.traditional.manufacturing.desc'),
      returnRange: '-5%~-8%',
      color: '#6b7280',
      image: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwaW5kdXN0cnl8ZW58MXx8fHwxNzYwMzY0NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: Building2,
      title: t('business.traditional.realestate'),
      description: t('business.traditional.realestate.desc'),
      returnRange: '-5%~-10%',
      color: '#ea580c',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwY29uc3RydWN0aW9ufGVufDF8fHx8MTc2MDM2NDYwMHww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: Zap,
      title: t('business.traditional.energy'),
      description: t('business.traditional.energy.desc'),
      returnRange: '-4%~-8%',
      color: '#dc2626',
      image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGVuZXJneSUyMG9pbHxlbnwxfHx8fDE3NjAzNjQ2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a2540] pt-32">
      {/* Hero Section */}
      <section className="py-24 px-8 border-b border-white/10">
        <div className="max-w-[1440px] mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-light text-white mb-6"
          >
            {t('business.hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl"
          >
            {t('business.hero.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* New Economy Column */}
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-light text-white mb-3">{t('business.neweconomy.title')}</h2>
              </div>

              <div className="space-y-6">
                {newEconomyCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={index}
                      className="group relative overflow-hidden rounded-2xl cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.3 }
                      }}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <ImageWithFallback
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110"
                        />
                        <div 
                          className="absolute inset-0 opacity-90"
                          style={{ 
                            background: `linear-gradient(135deg, ${category.color}dd 0%, ${category.color}99 100%)`
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="relative h-[280px] flex flex-col justify-between p-8 text-white">
                        <div className="flex items-start justify-between">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-110"
                            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                          >
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="text-right">
                            <p className="text-sm opacity-80 mb-1">{language.startsWith('zh') ? '预计年化收益' : 'Expected Annual Return'}</p>
                            <p className="text-2xl font-light">{category.returnRange}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-light mb-3">{category.title}</h3>
                          <p className="text-white/90 mb-4">{category.description}</p>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm">{language.startsWith('zh') ? '了解更多' : 'Learn more'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Traditional Industries Column */}
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-light text-white mb-3">{t('business.traditional.title')}</h2>
              </div>

              <div className="space-y-6">
                {traditionalCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={index}
                      className="group relative overflow-hidden rounded-2xl cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: (index + 3) * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.3 }
                      }}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <ImageWithFallback
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110"
                        />
                        <div 
                          className="absolute inset-0 opacity-90"
                          style={{ 
                            background: `linear-gradient(135deg, ${category.color}dd 0%, ${category.color}99 100%)`
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="relative h-[280px] flex flex-col justify-between p-8 text-white">
                        <div className="flex items-start justify-between">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-110"
                            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                          >
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="text-right">
                            <p className="text-sm opacity-80 mb-1">{language.startsWith('zh') ? '预计年化收益' : 'Expected Annual Return'}</p>
                            <p className="text-2xl font-light">{category.returnRange}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-light mb-3">{category.title}</h3>
                          <p className="text-white/90 mb-4">{category.description}</p>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm">{language.startsWith('zh') ? '了解更多' : 'Learn more'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy and Value Creation Section */}
      <section className="py-20 px-8 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-10 hover:bg-white/5 transition-all duration-300"
            >
              <h3 className="text-3xl font-light text-white mb-6">
                {t('business.strategy.title')}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t('business.strategy.desc')}
              </p>
            </motion.div>

            {/* Value Creation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-10 hover:bg-white/5 transition-all duration-300"
            >
              <h3 className="text-3xl font-light text-white mb-6">
                {t('business.value.title')}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t('business.value.desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
