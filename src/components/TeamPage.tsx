import { ImageWithFallback } from './figma/ImageWithFallback';
import { Linkedin, Mail } from 'lucide-react';

export function TeamPage() {
  const leadership = [
    {
      name: '张伟',
      title: '创始人兼首席执行官',
      bio: '拥有20年投资管理经验，曾任职于多家知名投资机构',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
    },
    {
      name: '李娜',
      title: '首席投资官',
      bio: '资深投资专家，专注于私募股权和成长投资领域',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
    },
    {
      name: '王明',
      title: '首席财务官',
      bio: '财务管理专家，曾在多家上市公司担任高级财务职位',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
    },
    {
      name: '陈静',
      title: '首席运营官',
      bio: '运营管理专家，致力于提升公司运营效率和服务质量',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
    }
  ];

  const team = [
    {
      name: '刘强',
      title: '高级投资顾问',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    },
    {
      name: '赵敏',
      title: '投资分析师',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    },
    {
      name: '孙涛',
      title: '风险管理总监',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    },
    {
      name: '周丽',
      title: '财务分析师',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
    },
    {
      name: '吴峰',
      title: '市场研究总监',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    },
    {
      name: '郑雪',
      title: '客户关系经理',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-[#0b1b2e] text-white py-32 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="mb-8">我们的团队</h1>
          <p className="max-w-3xl mx-auto text-white/90">
            S&L 汇聚了来自全球的顶尖投资专业人才
          </p>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#00457a] text-center mb-4">领导团队</h2>
          <p className="text-center text-[#0b1b2e]/70 mb-16 max-w-2xl mx-auto">
            经验丰富的领导团队，带领公司不断前行
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((member, index) => (
              <div key={index} className="group">
                <div className="aspect-square overflow-hidden rounded-lg mb-6 bg-gray-100">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-[#0b1b2e] mb-2">{member.name}</h3>
                <p className="text-[#fe782e] mb-3">{member.title}</p>
                <p className="text-[#0b1b2e]/70 mb-4">{member.bio}</p>
                <div className="flex gap-3">
                  <button className="w-9 h-9 border border-[#00457a]/30 rounded flex items-center justify-center hover:bg-[#00457a] hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 border border-[#00457a]/30 rounded flex items-center justify-center hover:bg-[#00457a] hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="bg-[#f8f9fa] py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#00457a] text-center mb-4">专业团队</h2>
          <p className="text-center text-[#0b1b2e]/70 mb-16 max-w-2xl mx-auto">
            我们的专业团队为客户提供全方位的投资咨询服务
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-[#0b1b2e] mb-1">{member.name}</h4>
                <p className="text-[#0b1b2e]/70">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#00457a] to-[#0b1b2e] rounded-2xl p-16 text-center text-white">
            <h2 className="mb-6">加入我们的团队</h2>
            <p className="max-w-2xl mx-auto mb-8 text-white/90">
              我们正在寻找有才华、有激情的专业人士加入我们的团队
            </p>
            <button className="bg-[#fe782e] text-white px-12 py-4 rounded hover:bg-[#e56924] transition-colors">
              查看职位
            </button>
          </div>
        </div>
      </section>

      {/* Team Image */}
      <section className="bg-[#f8f9fa] py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-[21/9] overflow-hidden rounded-2xl shadow-xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NjAzNjQ2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Team Collaboration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
