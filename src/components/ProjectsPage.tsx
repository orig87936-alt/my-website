import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ExternalLink, Github, X, Filter } from 'lucide-react';

interface Project {
  id: string;
  title: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  longDescription: {
    zh: string;
    en: string;
  };
  image: string;
  tags: string[];
  category: 'web' | 'mobile' | 'blockchain' | 'ai' | 'other';
  demoUrl?: string;
  githubUrl?: string;
  year: number;
  featured: boolean;
}

// 示例项目数据
const projects: Project[] = [
  {
    id: '1',
    title: {
      zh: 'DeFi 交易平台',
      en: 'DeFi Trading Platform'
    },
    description: {
      zh: '基于以太坊的去中心化金融交易平台，支持多种代币交易和流动性挖矿',
      en: 'Ethereum-based decentralized finance trading platform with multi-token trading and liquidity mining'
    },
    longDescription: {
      zh: '这是一个完整的 DeFi 生态系统，包括 AMM 交易、流动性池、收益农场和治理功能。使用 Solidity 智能合约和 React 前端构建。',
      en: 'A complete DeFi ecosystem including AMM trading, liquidity pools, yield farming, and governance features. Built with Solidity smart contracts and React frontend.'
    },
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    tags: ['Blockchain', 'Solidity', 'React', 'Web3', 'DeFi'],
    category: 'blockchain',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/defi-platform',
    year: 2024,
    featured: true
  },
  {
    id: '2',
    title: {
      zh: 'AI 智能客服系统',
      en: 'AI Customer Service System'
    },
    description: {
      zh: '基于大语言模型的智能客服系统，支持多轮对话和知识库检索',
      en: 'LLM-based intelligent customer service system with multi-turn dialogue and knowledge base retrieval'
    },
    longDescription: {
      zh: '集成了 GPT-4 和向量数据库的智能客服解决方案，能够理解复杂查询并提供准确答案。支持多语言和自定义知识库。',
      en: 'An intelligent customer service solution integrating GPT-4 and vector databases, capable of understanding complex queries and providing accurate answers. Supports multiple languages and custom knowledge bases.'
    },
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
    tags: ['AI', 'NLP', 'Python', 'FastAPI', 'Vector DB'],
    category: 'ai',
    demoUrl: 'https://demo.example.com',
    year: 2024,
    featured: true
  },
  {
    id: '3',
    title: {
      zh: '企业管理系统',
      en: 'Enterprise Management System'
    },
    description: {
      zh: '全栈企业资源规划系统，包含人事、财务、项目管理等模块',
      en: 'Full-stack ERP system with HR, finance, and project management modules'
    },
    longDescription: {
      zh: '为中小企业设计的一体化管理平台，提供员工管理、财务报表、项目跟踪、客户关系管理等功能。采用微服务架构，支持高并发。',
      en: 'An integrated management platform designed for SMEs, providing employee management, financial reporting, project tracking, and CRM features. Built with microservices architecture for high concurrency.'
    },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Microservices'],
    category: 'web',
    year: 2023,
    featured: false
  },
  {
    id: '4',
    title: {
      zh: '移动健康应用',
      en: 'Mobile Health App'
    },
    description: {
      zh: '跨平台健康管理应用，支持运动追踪、饮食记录和健康数据分析',
      en: 'Cross-platform health management app with activity tracking, diet logging, and health data analytics'
    },
    longDescription: {
      zh: '使用 React Native 开发的健康管理应用，集成了可穿戴设备数据，提供个性化健康建议和目标追踪功能。',
      en: 'A health management app developed with React Native, integrating wearable device data and providing personalized health recommendations and goal tracking.'
    },
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    tags: ['React Native', 'Mobile', 'Health Tech', 'Firebase'],
    category: 'mobile',
    year: 2023,
    featured: false
  },
  {
    id: '5',
    title: {
      zh: 'NFT 艺术品市场',
      en: 'NFT Art Marketplace'
    },
    description: {
      zh: '数字艺术品 NFT 交易平台，支持铸造、拍卖和二级市场交易',
      en: 'Digital art NFT marketplace with minting, auction, and secondary market trading'
    },
    longDescription: {
      zh: '基于以太坊和 IPFS 的 NFT 市场，艺术家可以铸造和销售数字作品，收藏家可以参与拍卖和交易。支持版税分配和稀有度排名。',
      en: 'An NFT marketplace based on Ethereum and IPFS where artists can mint and sell digital artworks, and collectors can participate in auctions and trading. Supports royalty distribution and rarity ranking.'
    },
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop',
    tags: ['NFT', 'Ethereum', 'IPFS', 'Smart Contracts', 'Web3'],
    category: 'blockchain',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/nft-marketplace',
    year: 2023,
    featured: true
  },
  {
    id: '6',
    title: {
      zh: '实时协作白板',
      en: 'Real-time Collaboration Whiteboard'
    },
    description: {
      zh: '多人实时协作的在线白板工具，支持绘图、文本和图形',
      en: 'Multi-user real-time collaboration whiteboard with drawing, text, and shapes'
    },
    longDescription: {
      zh: '使用 WebSocket 和 Canvas API 构建的实时协作工具，支持无限画布、图层管理、历史记录和导出功能。适合远程团队协作。',
      en: 'A real-time collaboration tool built with WebSocket and Canvas API, supporting infinite canvas, layer management, history, and export features. Perfect for remote team collaboration.'
    },
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop',
    tags: ['WebSocket', 'Canvas', 'Real-time', 'Collaboration', 'TypeScript'],
    category: 'web',
    year: 2024,
    featured: false
  }
];

const categories = [
  { id: 'all', label: { zh: '全部', en: 'All' } },
  { id: 'web', label: { zh: 'Web 应用', en: 'Web Apps' } },
  { id: 'mobile', label: { zh: '移动应用', en: 'Mobile Apps' } },
  { id: 'blockchain', label: { zh: '区块链', en: 'Blockchain' } },
  { id: 'ai', label: { zh: '人工智能', en: 'AI' } },
  { id: 'other', label: { zh: '其他', en: 'Other' } }
];

export function ProjectsPage() {
  const { language } = useLanguage();
  const isChinese = language === 'zh';
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const featuredProjects = projects.filter(p => p.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2540] via-[#0d2847] to-[#0a2540]">
      {/* Hero Section */}
      <div style={{ paddingTop: '120px' }} className="pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-light text-white mb-6">
              {isChinese ? '项目展示' : 'Our Projects'}
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {isChinese
                ? '探索我们的创新项目，从区块链到人工智能，从 Web 应用到移动开发'
                : 'Explore our innovative projects, from blockchain to AI, from web apps to mobile development'}
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-white"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  {isChinese ? '筛选项目' : 'Filter Projects'}
                </span>
                <span className="text-[#00a4e4]">
                  {categories.find(c => c.id === selectedCategory)?.label[language]}
                </span>
              </button>
            </div>

            {/* Desktop Filter / Mobile Dropdown */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowFilters(false);
                    }}
                    className={`px-6 py-3 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? 'bg-[#00a4e4] text-white shadow-lg shadow-[#00a4e4]/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {category.label[language]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Featured Projects */}
          {selectedCategory === 'all' && featuredProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-20"
            >
              <h2 className="text-3xl font-light text-white mb-8 pb-3 border-b border-[#00a4e4]/30">
                {isChinese ? '精选项目' : 'Featured Projects'}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isChinese={isChinese}
                    onClick={() => setSelectedProject(project)}
                    delay={index * 0.1}
                    featured
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* All Projects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-light text-white mb-8 pb-3 border-b border-[#00a4e4]/30">
              {selectedCategory === 'all'
                ? (isChinese ? '所有项目' : 'All Projects')
                : categories.find(c => c.id === selectedCategory)?.label[language]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isChinese={isChinese}
                    onClick={() => setSelectedProject(project)}
                    delay={index * 0.05}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            isChinese={isChinese}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

