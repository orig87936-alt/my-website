import { ImageWithFallback } from './figma/ImageWithFallback';
import { TrendingUp, Shield, Users, BarChart3, Globe, Lightbulb } from 'lucide-react';

export function ServicesPage() {
  const services = [
    {
      icon: TrendingUp,
      title: '投资策略咨询',
      description: '为客户提供定制化的投资策略建议，帮助实现财富增长目标。',
      features: ['资产配置', '风险管理', '投资组合优化', '市场分析']
    },
    {
      icon: Shield,
      title: '风险管理',
      description: '全面的风险评估和管理解决方案，保护客户资产安全。',
      features: ['风险识别', '风险评估', '对冲策略', '合规管理']
    },
    {
      icon: Users,
      title: '并购咨询',
      description: '专业的并购交易咨询服务，助力企业实现战略目标。',
      features: ['目标筛选', '尽职调查', '估值分析', '交易执行']
    },
    {
      icon: BarChart3,
      title: '财务顾问',
      description: '提供全方位的财务规划和管理咨询服务。',
      features: ['财务规划', '预算管理', '绩效分析', '成本优化']
    },
    {
      icon: Globe,
      title: '市场研究',
      description: '深入的市场调研和行业分析，为决策提供数据支持。',
      features: ['市场分析', '竞争研究', '趋势预测', '行业报告']
    },
    {
      icon: Lightbulb,
      title: '战略规划',
      description: '帮助企业制定长期发展战略，实现可持续增长。',
      features: ['战略制定', '业务转型', '创新咨询', '组织优化']
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#00457a] to-[#0b1b2e] text-white py-32 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="mb-8">我们的服务</h1>
          <p className="max-w-3xl mx-auto text-white/90">
            S&L 提供全方位的投资咨询服务，助力企业和投资者实现目标
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-xl hover:border-[#00457a]/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-[#00457a] rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-[#0b1b2e] mb-4">{service.title}</h3>
                  <p className="text-[#0b1b2e]/70 mb-6">{service.description}</p>
                  
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[#0b1b2e]/70">
                        <div className="w-1.5 h-1.5 bg-[#fe782e] rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-[#f8f9fa] py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#00457a] text-center mb-4">服务流程</h2>
          <p className="text-center text-[#0b1b2e]/70 mb-16 max-w-2xl mx-auto">
            我们的专业团队将与您紧密合作，确保每个项目都能顺利完成
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: '需求分析', desc: '深入了解客户需求和目标' },
              { step: '02', title: '方案设计', desc: '制定定制化解决方案' },
              { step: '03', title: '执行实施', desc: '专业团队执行项目' },
              { step: '04', title: '持续优化', desc: '跟踪效果并持续改进' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-[#00457a] text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <span>{item.step}</span>
                </div>
                <h3 className="text-[#0b1b2e] mb-3">{item.title}</h3>
                <p className="text-[#0b1b2e]/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[#0b1b2e] mb-6">准备开始您的投资之旅？</h2>
          <p className="text-[#0b1b2e]/70 mb-8">
            联系我们的专业团队，获取定制化的投资咨询服务
          </p>
          <button className="bg-[#fe782e] text-white px-12 py-4 rounded hover:bg-[#e56924] transition-colors">
            联系我们
          </button>
        </div>
      </section>
    </div>
  );
}
