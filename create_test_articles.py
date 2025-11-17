"""
创建测试文章脚本 - 为6个分类各创建5篇包含多张图片的文章
分类：headline, regulatory, analysis, business, enterprise, outlook
"""
import asyncio
import httpx
from datetime import datetime, timedelta
import random

# API 配置
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Unsplash 图片库（不同主题）
IMAGES = {
    "headline": [
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=600&fit=crop",
    ],
    "regulatory": [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop",
    ],
    "analysis": [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=600&fit=crop",
    ],
    "business": [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=800&h=600&fit=crop",
    ],
    "enterprise": [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop",
    ],
    "outlook": [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
    ],
}

# 文章模板数据 - 头条新闻
HEADLINE_ARTICLES = [
    {
        "title_zh": "全球经济复苏加速，多国央行调整货币政策",
        "title_en": "Global Economic Recovery Accelerates, Central Banks Adjust Monetary Policies",
        "summary_zh": "随着疫情影响逐渐减弱，全球主要经济体呈现强劲复苏态势，多国央行开始调整货币政策应对通胀压力。",
        "summary_en": "As the impact of the pandemic gradually weakens, major global economies show strong recovery momentum, and central banks in many countries begin to adjust monetary policies to address inflationary pressures.",
        "lead_zh": "国际货币基金组织（IMF）最新报告显示，2024年全球经济增长预期上调至3.5%，主要得益于发达经济体的强劲表现和新兴市场的持续增长。",
        "lead_en": "The latest report from the International Monetary Fund (IMF) shows that global economic growth expectations for 2024 have been raised to 3.5%, mainly due to the strong performance of developed economies and continued growth in emerging markets.",
    },
    {
        "title_zh": "人工智能技术突破，ChatGPT用户突破2亿",
        "title_en": "AI Technology Breakthrough, ChatGPT Users Exceed 200 Million",
        "summary_zh": "OpenAI宣布ChatGPT全球用户数突破2亿，标志着人工智能技术进入大规模应用阶段。",
        "summary_en": "OpenAI announces that ChatGPT global users have exceeded 200 million, marking the entry of artificial intelligence technology into the large-scale application stage.",
        "lead_zh": "这一里程碑事件凸显了生成式AI技术的快速普及，各行各业正在积极探索AI应用场景，推动数字化转型进程。",
        "lead_en": "This milestone event highlights the rapid popularization of generative AI technology, with various industries actively exploring AI application scenarios and promoting digital transformation processes.",
    },
    {
        "title_zh": "气候峰会达成历史性协议，承诺2050年实现碳中和",
        "title_en": "Climate Summit Reaches Historic Agreement, Commits to Carbon Neutrality by 2050",
        "summary_zh": "在最新一届联合国气候变化大会上，195个国家共同签署了具有法律约束力的碳中和协议。",
        "summary_en": "At the latest United Nations Climate Change Conference, 195 countries jointly signed a legally binding carbon neutrality agreement.",
        "lead_zh": "这项协议要求各国制定详细的减排路线图，并建立透明的监督机制，确保全球温升控制在1.5摄氏度以内。",
        "lead_en": "This agreement requires countries to develop detailed emission reduction roadmaps and establish transparent supervision mechanisms to ensure that global temperature rise is controlled within 1.5 degrees Celsius.",
    },
    {
        "title_zh": "量子计算取得重大进展，IBM发布1000量子比特处理器",
        "title_en": "Major Progress in Quantum Computing, IBM Releases 1000-Qubit Processor",
        "summary_zh": "IBM公司成功研发出全球首款超过1000量子比特的量子处理器，为量子计算商业化应用铺平道路。",
        "summary_en": "IBM has successfully developed the world's first quantum processor with more than 1000 qubits, paving the way for commercial applications of quantum computing.",
        "lead_zh": "这一突破性成果将加速药物研发、材料科学、金融建模等领域的创新，预计未来5年内将看到首批商业化量子计算应用。",
        "lead_en": "This breakthrough will accelerate innovation in drug development, materials science, financial modeling and other fields, with the first batch of commercial quantum computing applications expected within the next 5 years.",
    },
    {
        "title_zh": "全球芯片短缺缓解，半导体产业投资创新高",
        "title_en": "Global Chip Shortage Eases, Semiconductor Industry Investment Hits Record High",
        "summary_zh": "经过两年的供应链调整，全球芯片短缺问题显著缓解，各国加大半导体产业投资力度。",
        "summary_en": "After two years of supply chain adjustments, the global chip shortage has significantly eased, with countries increasing investment in the semiconductor industry.",
        "lead_zh": "美国、欧盟、中国等主要经济体纷纷出台芯片法案，计划未来十年投资超过5000亿美元建设本土半导体产业链。",
        "lead_en": "Major economies such as the United States, the European Union, and China have introduced chip bills, planning to invest more than $500 billion in building domestic semiconductor industry chains over the next decade.",
    },
]

# 分析报告
ANALYSIS_ARTICLES = [
    {
        "title_zh": "2024年全球科技行业发展趋势深度分析",
        "title_en": "In-Depth Analysis of Global Technology Industry Development Trends in 2024",
        "summary_zh": "本报告深入分析2024年全球科技行业的主要发展趋势，包括AI、云计算、5G等领域的最新进展和未来展望。",
        "summary_en": "This report provides an in-depth analysis of major development trends in the global technology industry in 2024, including the latest progress and future outlook in AI, cloud computing, 5G and other fields.",
        "lead_zh": "随着数字化转型加速，全球科技行业正经历深刻变革。人工智能、云计算、5G等技术的快速发展正在重塑商业模式和产业格局。",
        "lead_en": "With the acceleration of digital transformation, the global technology industry is undergoing profound changes. The rapid development of technologies such as artificial intelligence, cloud computing, and 5G is reshaping business models and industrial landscapes.",
    },
    {
        "title_zh": "新能源汽车市场竞争格局分析报告",
        "title_en": "Analysis Report on New Energy Vehicle Market Competition Landscape",
        "summary_zh": "深入分析全球新能源汽车市场的竞争格局，评估主要厂商的市场地位和发展策略。",
        "summary_en": "In-depth analysis of the competitive landscape of the global new energy vehicle market, evaluating the market position and development strategies of major manufacturers.",
        "lead_zh": "2024年新能源汽车市场继续保持高速增长，中国、欧洲、美国三大市场呈现不同的发展特点和竞争态势。",
        "lead_en": "The new energy vehicle market continues to maintain rapid growth in 2024, with the three major markets of China, Europe, and the United States showing different development characteristics and competitive situations.",
    },
    {
        "title_zh": "金融科技创新应用场景研究报告",
        "title_en": "Research Report on Fintech Innovation Application Scenarios",
        "summary_zh": "系统梳理金融科技在支付、信贷、投资等领域的创新应用，分析技术驱动的金融服务变革。",
        "summary_en": "Systematically sort out the innovative applications of fintech in payment, credit, investment and other fields, and analyze technology-driven financial service transformation.",
        "lead_zh": "金融科技正在深刻改变传统金融服务模式，区块链、AI、大数据等技术的应用为金融创新提供了新的可能性。",
        "lead_en": "Fintech is profoundly changing traditional financial service models, and the application of technologies such as blockchain, AI, and big data provides new possibilities for financial innovation.",
    },
    {
        "title_zh": "全球供应链重构趋势分析",
        "title_en": "Analysis of Global Supply Chain Restructuring Trends",
        "summary_zh": "分析后疫情时代全球供应链重构的主要趋势，包括区域化、数字化、绿色化等方向。",
        "summary_en": "Analyze the main trends of global supply chain restructuring in the post-pandemic era, including regionalization, digitalization, and greening.",
        "lead_zh": "疫情暴露了全球供应链的脆弱性，企业正在重新评估供应链策略，追求更高的韧性和可持续性。",
        "lead_en": "The pandemic has exposed the fragility of global supply chains, and companies are re-evaluating supply chain strategies to pursue greater resilience and sustainability.",
    },
    {
        "title_zh": "元宇宙产业发展现状与前景分析",
        "title_en": "Analysis of Metaverse Industry Development Status and Prospects",
        "summary_zh": "全面分析元宇宙产业的发展现状、技术基础、应用场景和未来发展前景。",
        "summary_en": "Comprehensive analysis of the development status, technical foundation, application scenarios and future development prospects of the metaverse industry.",
        "lead_zh": "元宇宙作为下一代互联网形态，正在吸引科技巨头和资本的大量投入，虽然仍处于早期阶段，但发展潜力巨大。",
        "lead_en": "As the next generation of Internet form, the metaverse is attracting massive investment from tech giants and capital. Although still in its early stages, it has huge development potential.",
    },
]

# 商业动态
BUSINESS_ARTICLES = [
    {
        "title_zh": "特斯拉发布新一代电动卡车，进军商用车市场",
        "title_en": "Tesla Releases New Generation Electric Truck, Enters Commercial Vehicle Market",
        "summary_zh": "特斯拉正式发布Semi电动卡车量产版，续航里程达800公里，标志着公司正式进军商用车市场。",
        "summary_en": "Tesla officially released the production version of the Semi electric truck with a range of 800 kilometers, marking the company's official entry into the commercial vehicle market.",
        "lead_zh": "这款电动卡车采用特斯拉最新的电池技术和自动驾驶系统，预计将改变物流运输行业的格局。",
        "lead_en": "This electric truck uses Tesla's latest battery technology and autonomous driving system, and is expected to change the landscape of the logistics and transportation industry.",
    },
    {
        "title_zh": "亚马逊宣布投资100亿美元建设云计算基础设施",
        "title_en": "Amazon Announces $10 Billion Investment in Cloud Computing Infrastructure",
        "summary_zh": "亚马逊云科技（AWS）宣布未来三年投资100亿美元，在全球新建多个数据中心，扩大云服务能力。",
        "summary_en": "Amazon Web Services (AWS) announced a $10 billion investment over the next three years to build multiple new data centers globally and expand cloud service capabilities.",
        "lead_zh": "这一投资计划旨在满足快速增长的云计算需求，特别是AI和机器学习应用的计算需求。",
        "lead_en": "This investment plan aims to meet the rapidly growing demand for cloud computing, especially the computing needs of AI and machine learning applications.",
    },
    {
        "title_zh": "微软完成对暴雪的收购，游戏业务大幅扩张",
        "title_en": "Microsoft Completes Acquisition of Blizzard, Significantly Expands Gaming Business",
        "summary_zh": "微软以690亿美元完成对动视暴雪的收购，成为全球第三大游戏公司，仅次于腾讯和索尼。",
        "summary_en": "Microsoft completed the acquisition of Activision Blizzard for $69 billion, becoming the world's third-largest gaming company after Tencent and Sony.",
        "lead_zh": "这笔交易为微软带来了《使命召唤》、《魔兽世界》等知名游戏IP，大幅增强了其在游戏市场的竞争力。",
        "lead_en": "This deal brings Microsoft well-known game IPs such as Call of Duty and World of Warcraft, significantly enhancing its competitiveness in the gaming market.",
    },
    {
        "title_zh": "苹果推出混合现实头显Vision Pro，开启空间计算新时代",
        "title_en": "Apple Launches Mixed Reality Headset Vision Pro, Opens New Era of Spatial Computing",
        "summary_zh": "苹果正式发布首款混合现实头显Vision Pro，售价3499美元，将于明年初上市。",
        "summary_en": "Apple officially released its first mixed reality headset Vision Pro, priced at $3,499, which will be launched early next year.",
        "lead_zh": "Vision Pro采用苹果自研的M2和R1芯片，支持眼动追踪和手势控制，被视为空间计算时代的开端。",
        "lead_en": "Vision Pro uses Apple's self-developed M2 and R1 chips, supports eye tracking and gesture control, and is seen as the beginning of the spatial computing era.",
    },
    {
        "title_zh": "字节跳动全球营收突破1000亿美元，超越腾讯",
        "title_en": "ByteDance Global Revenue Exceeds $100 Billion, Surpasses Tencent",
        "summary_zh": "字节跳动2024年全球营收预计突破1000亿美元，首次超越腾讯，成为中国最大的互联网公司。",
        "summary_en": "ByteDance's global revenue in 2024 is expected to exceed $100 billion, surpassing Tencent for the first time and becoming China's largest Internet company.",
        "lead_zh": "TikTok的全球成功和国内抖音的持续增长是字节跳动营收快速增长的主要驱动力。",
        "lead_en": "The global success of TikTok and the continued growth of Douyin in China are the main drivers of ByteDance's rapid revenue growth.",
    },
]

# 核心企业
ENTERPRISE_ARTICLES = [
    {
        "title_zh": "华为发布鸿蒙4.0系统，生态设备突破7亿台",
        "title_en": "Huawei Releases HarmonyOS 4.0, Ecosystem Devices Exceed 700 Million",
        "summary_zh": "华为正式发布鸿蒙4.0操作系统，搭载鸿蒙系统的设备数量突破7亿台，生态建设取得重大进展。",
        "summary_en": "Huawei officially released HarmonyOS 4.0, with the number of devices equipped with HarmonyOS exceeding 700 million, making significant progress in ecosystem construction.",
        "lead_zh": "鸿蒙4.0带来了全新的分布式能力和AI功能，进一步提升了多设备协同体验，标志着华为在操作系统领域的突破。",
        "lead_en": "HarmonyOS 4.0 brings new distributed capabilities and AI functions, further enhancing the multi-device collaboration experience, marking Huawei's breakthrough in the operating system field.",
    },
    {
        "title_zh": "比亚迪新能源汽车销量全球第一，超越特斯拉",
        "title_en": "BYD New Energy Vehicle Sales Rank First Globally, Surpassing Tesla",
        "summary_zh": "比亚迪2024年新能源汽车销量达到300万辆，超越特斯拉成为全球新能源汽车销量冠军。",
        "summary_en": "BYD's new energy vehicle sales reached 3 million units in 2024, surpassing Tesla to become the global champion in new energy vehicle sales.",
        "lead_zh": "比亚迪在电池技术、智能驾驶等领域的持续创新，以及在海外市场的快速扩张，是其销量增长的关键因素。",
        "lead_en": "BYD's continuous innovation in battery technology, intelligent driving and other fields, as well as its rapid expansion in overseas markets, are key factors in its sales growth.",
    },
    {
        "title_zh": "宁德时代发布新一代钠离子电池，成本降低30%",
        "title_en": "CATL Releases New Generation Sodium-Ion Battery, Cost Reduced by 30%",
        "summary_zh": "宁德时代发布第二代钠离子电池，能量密度提升至200Wh/kg，成本较锂电池降低30%。",
        "summary_en": "CATL released the second generation sodium-ion battery with energy density increased to 200Wh/kg and cost reduced by 30% compared to lithium batteries.",
        "lead_zh": "钠离子电池的突破将为储能和低端电动车市场提供更经济的解决方案，有望加速新能源的普及。",
        "lead_en": "The breakthrough in sodium-ion batteries will provide more economical solutions for energy storage and low-end electric vehicle markets, and is expected to accelerate the popularization of new energy.",
    },
    {
        "title_zh": "阿里巴巴完成组织架构调整，聚焦云计算和AI",
        "title_en": "Alibaba Completes Organizational Structure Adjustment, Focuses on Cloud Computing and AI",
        "summary_zh": "阿里巴巴完成史上最大规模组织架构调整，将云计算和AI业务提升为核心战略，投入1000亿元加速发展。",
        "summary_en": "Alibaba completed the largest organizational structure adjustment in its history, elevating cloud computing and AI business to core strategy, investing 100 billion yuan to accelerate development.",
        "lead_zh": "此次调整旨在应对数字经济新趋势，强化技术驱动的业务增长，提升整体竞争力。",
        "lead_en": "This adjustment aims to respond to new trends in the digital economy, strengthen technology-driven business growth, and enhance overall competitiveness.",
    },
    {
        "title_zh": "台积电3纳米工艺量产，苹果成为首个客户",
        "title_en": "TSMC 3nm Process Mass Production, Apple Becomes First Customer",
        "summary_zh": "台积电宣布3纳米制程工艺正式量产，苹果A17芯片成为首个采用该工艺的产品。",
        "summary_en": "TSMC announced that the 3nm process technology has officially entered mass production, with Apple's A17 chip becoming the first product to adopt this process.",
        "lead_zh": "3纳米工艺相比5纳米性能提升15%，功耗降低30%，将为智能手机和高性能计算带来显著提升。",
        "lead_en": "The 3nm process improves performance by 15% and reduces power consumption by 30% compared to 5nm, bringing significant improvements to smartphones and high-performance computing.",
    },
]

# 未来展望
OUTLOOK_ARTICLES = [
    {
        "title_zh": "2030年人工智能产业展望：AGI时代即将到来",
        "title_en": "2030 AI Industry Outlook: AGI Era Approaching",
        "summary_zh": "预测到2030年，人工通用智能（AGI）将取得重大突破，AI将在更多领域达到或超越人类水平。",
        "summary_en": "It is predicted that by 2030, Artificial General Intelligence (AGI) will make major breakthroughs, and AI will reach or exceed human levels in more fields.",
        "lead_zh": "随着计算能力的提升和算法的进步，AGI的实现正在加速，这将彻底改变人类社会的生产和生活方式。",
        "lead_en": "With the improvement of computing power and the advancement of algorithms, the realization of AGI is accelerating, which will completely change the production and lifestyle of human society.",
    },
    {
        "title_zh": "可再生能源将在2035年成为主要能源来源",
        "title_en": "Renewable Energy Will Become Main Energy Source by 2035",
        "summary_zh": "国际能源署预测，到2035年可再生能源将占全球能源消费的60%以上，化石能源时代将逐步结束。",
        "summary_en": "The International Energy Agency predicts that by 2035, renewable energy will account for more than 60% of global energy consumption, and the fossil fuel era will gradually end.",
        "lead_zh": "太阳能、风能等可再生能源成本持续下降，加上储能技术的突破，正在推动能源结构的根本性转变。",
        "lead_en": "The continuous decline in the cost of renewable energy such as solar and wind, coupled with breakthroughs in energy storage technology, is driving a fundamental transformation of the energy structure.",
    },
    {
        "title_zh": "太空经济：2040年市场规模将达1万亿美元",
        "title_en": "Space Economy: Market Size Will Reach $1 Trillion by 2040",
        "summary_zh": "随着商业航天的快速发展，太空经济市场规模预计将从目前的4000亿美元增长到2040年的1万亿美元。",
        "summary_en": "With the rapid development of commercial spaceflight, the space economy market size is expected to grow from the current $400 billion to $1 trillion by 2040.",
        "lead_zh": "卫星互联网、太空旅游、小行星采矿等新兴业务将成为太空经济增长的主要驱动力。",
        "lead_en": "Emerging businesses such as satellite Internet, space tourism, and asteroid mining will become the main drivers of space economy growth.",
    },
    {
        "title_zh": "生物技术革命：基因编辑将消除遗传疾病",
        "title_en": "Biotechnology Revolution: Gene Editing Will Eliminate Genetic Diseases",
        "summary_zh": "CRISPR等基因编辑技术的成熟应用，预计将在未来20年内消除大部分遗传性疾病。",
        "summary_en": "The mature application of gene editing technologies such as CRISPR is expected to eliminate most genetic diseases within the next 20 years.",
        "lead_zh": "基因治疗、精准医疗等技术的发展，将彻底改变人类对抗疾病的方式，大幅延长人类寿命。",
        "lead_en": "The development of technologies such as gene therapy and precision medicine will completely change the way humans fight diseases and significantly extend human lifespan.",
    },
    {
        "title_zh": "智慧城市2050：全球80%人口将生活在智慧城市",
        "title_en": "Smart Cities 2050: 80% of Global Population Will Live in Smart Cities",
        "summary_zh": "预计到2050年，全球80%的人口将生活在智慧城市，享受高效、便捷、可持续的城市服务。",
        "summary_en": "It is expected that by 2050, 80% of the global population will live in smart cities, enjoying efficient, convenient, and sustainable urban services.",
        "lead_zh": "5G、物联网、AI等技术的融合应用，将使城市管理更加智能化，居民生活更加便利。",
        "lead_en": "The integrated application of technologies such as 5G, IoT, and AI will make city management more intelligent and residents' lives more convenient.",
    },
]

# 监管法规
REGULATORY_ARTICLES = [
    {
        "title_zh": "欧盟通过《人工智能法案》，全球首部AI监管法律正式生效",
        "title_en": "EU Passes AI Act, World's First AI Regulation Law Takes Effect",
        "summary_zh": "欧盟议会正式通过《人工智能法案》，对高风险AI系统实施严格监管，违规企业将面临巨额罚款。",
        "summary_en": "The European Parliament officially passed the Artificial Intelligence Act, implementing strict supervision of high-risk AI systems, with violating companies facing huge fines.",
        "lead_zh": "该法案将AI系统分为四个风险等级，对高风险应用如生物识别、关键基础设施等实施严格审查，罚款最高可达全球营业额的6%。",
        "lead_en": "The Act classifies AI systems into four risk levels, implementing strict review of high-risk applications such as biometric identification and critical infrastructure, with fines up to 6% of global turnover.",
    },
    {
        "title_zh": "美国SEC发布加密货币监管新规，要求交易所注册登记",
        "title_en": "US SEC Issues New Cryptocurrency Regulations, Requires Exchange Registration",
        "summary_zh": "美国证券交易委员会（SEC）发布加密货币交易所监管新规，要求所有平台在6个月内完成注册。",
        "summary_en": "The US Securities and Exchange Commission (SEC) issued new regulations for cryptocurrency exchanges, requiring all platforms to complete registration within 6 months.",
        "lead_zh": "新规要求交易所建立完善的客户保护机制、反洗钱系统和市场监控体系，标志着美国加密货币监管进入新阶段。",
        "lead_en": "The new regulations require exchanges to establish comprehensive customer protection mechanisms, anti-money laundering systems, and market monitoring systems, marking a new stage in US cryptocurrency regulation.",
    },
    {
        "title_zh": "中国发布《数据安全法实施条例》，强化数据跨境流动管理",
        "title_en": "China Issues Data Security Law Implementation Regulations, Strengthens Cross-Border Data Flow Management",
        "summary_zh": "国家网信办发布《数据安全法实施条例》，对重要数据和个人信息的跨境传输提出更严格要求。",
        "summary_en": "The Cyberspace Administration of China issued the Data Security Law Implementation Regulations, proposing stricter requirements for cross-border transmission of important data and personal information.",
        "lead_zh": "条例明确了数据分类分级保护制度，要求企业对重要数据进行安全评估，并建立数据出境安全管理机制。",
        "lead_en": "The regulations clarify the data classification and grading protection system, requiring companies to conduct security assessments of important data and establish data export security management mechanisms.",
    },
    {
        "title_zh": "英国推出《在线安全法案》，社交媒体平台需承担内容审核责任",
        "title_en": "UK Launches Online Safety Bill, Social Media Platforms Must Take Content Moderation Responsibility",
        "summary_zh": "英国议会通过《在线安全法案》，要求社交媒体平台主动识别和删除有害内容，保护未成年人网络安全。",
        "summary_en": "The UK Parliament passed the Online Safety Bill, requiring social media platforms to proactively identify and remove harmful content to protect minors' online safety.",
        "lead_zh": "法案赋予监管机构对平台的审查权，违规企业可能面临高达全球营业额10%的罚款，甚至被禁止在英国运营。",
        "lead_en": "The bill grants regulatory authorities the power to review platforms, with violating companies potentially facing fines of up to 10% of global turnover or even being banned from operating in the UK.",
    },
    {
        "title_zh": "日本修订《个人信息保护法》，加强生物识别数据保护",
        "title_en": "Japan Revises Personal Information Protection Act, Strengthens Biometric Data Protection",
        "summary_zh": "日本政府修订《个人信息保护法》，将面部识别、指纹等生物识别数据列为敏感个人信息，实施更严格保护。",
        "summary_en": "The Japanese government revised the Personal Information Protection Act, classifying biometric data such as facial recognition and fingerprints as sensitive personal information for stricter protection.",
        "lead_zh": "修订案要求企业在收集和使用生物识别数据前必须获得明确同意，并建立完善的数据安全保护措施。",
        "lead_en": "The amendment requires companies to obtain explicit consent before collecting and using biometric data and establish comprehensive data security protection measures.",
    },
]


async def login_admin():
    """管理员登录"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/admin-login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data["access_token"]
        else:
            print(f"❌ 登录失败：{response.status_code}")
            print(response.text)
            return None


async def create_article(token: str, category: str, article_data: dict, images: list):
    """创建文章"""
    # 生成包含图片的内容
    content_zh = f"""# {article_data['title_zh']}

![主图]({images[0]})

## 概述

{article_data['lead_zh']}

## 详细分析

![分析图表]({images[1]})

这是一个重要的发展趋势，值得我们深入关注和研究。从多个维度来看，这一变化将对行业产生深远影响。

### 第一部分：背景介绍

![背景资料]({images[2]})

在当前的市场环境下，我们看到了许多积极的信号。各方参与者都在积极应对变化，寻找新的机遇。

相关数据显示，这一领域的发展速度超出预期，市场规模持续扩大，参与者数量不断增加。

### 第二部分：影响分析

![影响评估]({images[3]})

这一变化带来的影响是多方面的：

- **经济影响**：将推动相关产业的发展，创造新的就业机会
- **社会影响**：改变人们的生活方式，提升生活质量
- **技术影响**：促进技术创新和应用，加速数字化转型
- **政策影响**：引导政策制定方向，完善监管框架

专家指出，这些影响将在未来几年内逐步显现，需要各方密切关注并做好准备。

### 第三部分：未来展望

![未来趋势]({images[4]})

展望未来，我们有理由相信这一趋势将持续发展。主要原因包括：

1. **技术进步**：相关技术不断成熟，应用场景不断拓展
2. **市场需求**：用户需求持续增长，市场潜力巨大
3. **政策支持**：各国政府出台支持政策，营造良好环境
4. **资本青睐**：投资者看好发展前景，资金持续流入

各方需要密切关注市场动态，及时调整策略，抓住发展机遇。

## 结论

综合来看，这是一个值得关注的重要发展。我们将持续跟踪报道相关进展，为读者提供最新资讯。
"""

    content_en = f"""# {article_data['title_en']}

![Main Image]({images[0]})

## Overview

{article_data['lead_en']}

## Detailed Analysis

![Analysis Chart]({images[1]})

This is an important development trend that deserves our in-depth attention and research. From multiple dimensions, this change will have a profound impact on the industry.

### Part 1: Background Introduction

![Background Information]({images[2]})

In the current market environment, we see many positive signals. All participants are actively responding to changes and seeking new opportunities.

Related data shows that the development speed in this field exceeds expectations, with market scale continuing to expand and the number of participants constantly increasing.

### Part 2: Impact Analysis

![Impact Assessment]({images[3]})

The impact of this change is multifaceted:

- **Economic Impact**: Will drive the development of related industries and create new employment opportunities
- **Social Impact**: Change people's lifestyles and improve quality of life
- **Technological Impact**: Promote technological innovation and application, accelerate digital transformation
- **Policy Impact**: Guide policy-making direction and improve regulatory framework

Experts point out that these impacts will gradually emerge in the coming years, requiring close attention and preparation from all parties.

### Part 3: Future Outlook

![Future Trends]({images[4]})

Looking ahead, we have reason to believe that this trend will continue to develop. Main reasons include:

1. **Technological Progress**: Related technologies continue to mature, application scenarios continue to expand
2. **Market Demand**: User demand continues to grow, market potential is huge
3. **Policy Support**: Governments around the world introduce supportive policies, creating a favorable environment
4. **Capital Favor**: Investors are optimistic about development prospects, funds continue to flow in

All parties need to pay close attention to market dynamics, adjust strategies in a timely manner, and seize development opportunities.

## Conclusion

Overall, this is an important development worth paying attention to. We will continue to track and report on related progress, providing readers with the latest information.
"""

    article_payload = {
        "title_zh": article_data["title_zh"],
        "title_en": article_data["title_en"],
        "summary_zh": article_data["summary_zh"],
        "summary_en": article_data["summary_en"],
        "lead_zh": article_data["lead_zh"],
        "lead_en": article_data["lead_en"],
        "content_zh": [{"type": "markdown", "text": content_zh}],
        "content_en": [{"type": "markdown", "text": content_en}],
        "category": category,
        "status": "published",
        "published_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/articles",
            json=article_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code in [200, 201]:
            print(f"  ✅ {article_data['title_zh'][:40]}...")
            return response.json()
        else:
            print(f"  ❌ 失败：{response.status_code} - {article_data['title_zh'][:40]}...")
            print(f"     错误详情：{response.text}")
            return None


async def main():
    print("=" * 80)
    print("🚀 开始创建测试文章（6个分类 × 5篇 = 30篇）")
    print("=" * 80)

    # 登录
    print("\n🔐 正在登录...")
    token = await login_admin()
    if not token:
        return

    print("✅ 登录成功！\n")

    # 创建头条新闻
    print("📰 创建头条新闻 (headline) - 5篇...")
    for article in HEADLINE_ARTICLES:
        await create_article(token, "headline", article, IMAGES["headline"])
        await asyncio.sleep(0.5)

    # 创建监管法规
    print("\n📜 创建监管法规 (regulatory) - 5篇...")
    for article in REGULATORY_ARTICLES:
        await create_article(token, "regulatory", article, IMAGES["regulatory"])
        await asyncio.sleep(0.5)

    # 创建分析报告
    print("\n📊 创建分析报告 (analysis) - 5篇...")
    for article in ANALYSIS_ARTICLES:
        await create_article(token, "analysis", article, IMAGES["analysis"])
        await asyncio.sleep(0.5)

    # 创建商业动态
    print("\n💼 创建商业动态 (business) - 5篇...")
    for article in BUSINESS_ARTICLES:
        await create_article(token, "business", article, IMAGES["business"])
        await asyncio.sleep(0.5)

    # 创建核心企业
    print("\n🏢 创建核心企业 (enterprise) - 5篇...")
    for article in ENTERPRISE_ARTICLES:
        await create_article(token, "enterprise", article, IMAGES["enterprise"])
        await asyncio.sleep(0.5)

    # 创建未来展望
    print("\n🔮 创建未来展望 (outlook) - 5篇...")
    for article in OUTLOOK_ARTICLES:
        await create_article(token, "outlook", article, IMAGES["outlook"])
        await asyncio.sleep(0.5)

    print("\n" + "=" * 80)
    print("🎉 测试文章创建完成！")
    print("=" * 80)
    print("\n📊 统计：")
    print(f"  - headline (头条新闻): {len(HEADLINE_ARTICLES)} 篇")
    print(f"  - regulatory (监管法规): {len(REGULATORY_ARTICLES)} 篇")
    print(f"  - analysis (分析报告): {len(ANALYSIS_ARTICLES)} 篇")
    print(f"  - business (商业动态): {len(BUSINESS_ARTICLES)} 篇")
    print(f"  - enterprise (核心企业): {len(ENTERPRISE_ARTICLES)} 篇")
    print(f"  - outlook (未来展望): {len(OUTLOOK_ARTICLES)} 篇")
    print(f"  - 总计: {len(HEADLINE_ARTICLES) + len(REGULATORY_ARTICLES) + len(ANALYSIS_ARTICLES) + len(BUSINESS_ARTICLES) + len(ENTERPRISE_ARTICLES) + len(OUTLOOK_ARTICLES)} 篇")


if __name__ == "__main__":
    asyncio.run(main())

