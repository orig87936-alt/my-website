import { ImageWithFallback } from './figma/ImageWithFallback';

export function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-[#0b1b2e] text-white py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="mb-8">关于 S&L</h1>
          <p className="max-w-3xl text-white/90">
            我们是一家领先的全球投资咨询公司，致力于为客户提供专业的战略咨询和投资管理服务
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-[#00457a] mb-8">我们的使命</h2>
              <p className="text-[#0b1b2e]/80 mb-6">
                S&L 致力于通过专业的投资策略和咨询服务，帮助客户实现财富增长和业务目标。
              </p>
              <p className="text-[#0b1b2e]/80">
                我们相信，通过深入的市场洞察、创新的投资方法和卓越的执行能力，可以为投资者创造持续的价值。
              </p>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwMzY0NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Our Mission"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYwMzY0NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Our Vision"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-[#00457a] mb-8">我们的愿景</h2>
              <p className="text-[#0b1b2e]/80 mb-6">
                成为全球最受信赖的投资咨询公司，通过创新的投资策略和卓越的服务，推动全球经济的可持续发展。
              </p>
              <p className="text-[#0b1b2e]/80">
                我们致力于建立长期的合作关系，与客户共同成长，创造双赢的局面。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#f8f9fa] py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#00457a] text-center mb-16">核心价值观</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-[#00457a] rounded-lg flex items-center justify-center mb-6">
                <span className="text-white">01</span>
              </div>
              <h3 className="text-[#0b1b2e] mb-4">专业卓越</h3>
              <p className="text-[#0b1b2e]/70">
                我们追求专业卓越，不断提升服务质量，为客户提供最优质的咨询服务。
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-[#00457a] rounded-lg flex items-center justify-center mb-6">
                <span className="text-white">02</span>
              </div>
              <h3 className="text-[#0b1b2e] mb-4">诚信透明</h3>
              <p className="text-[#0b1b2e]/70">
                我们坚持诚信透明的原则，与客户建立互信的合作关系。
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-[#00457a] rounded-lg flex items-center justify-center mb-6">
                <span className="text-white">03</span>
              </div>
              <h3 className="text-[#0b1b2e] mb-4">创新驱动</h3>
              <p className="text-[#0b1b2e]/70">
                我们鼓励创新思维，不断探索新的投资机会和策略。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
