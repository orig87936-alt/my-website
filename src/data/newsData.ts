// 新闻数据存储
// 管理员可以通过管理界面修改这些内容

import { articlesAPI, Article, ContentBlock as ApiContentBlock } from '../services/api';

export interface NewsArticle {
  id: string;
  titleZh: string;
  titleEn: string;
  dateZh: string;
  dateEn: string;
  author: string;
  category?: string; // Added for API integration
  image: string;
  imageCaptionZh: string;
  imageCaptionEn: string;
  leadZh: string;
  leadEn: string;
  contentZh: Array<{ type: 'paragraph' | 'heading' | 'list' | 'image' | 'code' | 'quote' | 'markdown'; text?: string; items?: string[]; url?: string; caption?: string; language?: string; level?: number; width?: number; height?: number }>;
  contentEn: Array<{ type: 'paragraph' | 'heading' | 'list' | 'image' | 'code' | 'quote' | 'markdown'; text?: string; items?: string[]; url?: string; caption?: string; language?: string; level?: number; width?: number; height?: number }>;
}

// 默认新闻数据
export const defaultNewsArticles: Record<string, NewsArticle> = {
  'news-insights': {
    id: 'news-insights',
    titleZh: '特朗普和习近平同意一年贸易休战——但关键细节仍不明确',
    titleEn: 'Trump and Xi agree to a one-year trade truce — but key details remain unclear',
    dateZh: '2025年5月11日',
    dateEn: 'May 11, 2025',
    author: 'FOCUS POINT',
    category: 'headline',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200',
    imageCaptionZh: '美国总统特朗普和中国领导人习近平在韩国达成一年期贸易休战协议。',
    imageCaptionEn: 'President Trump and Chinese leader Xi Jinping agreed to a one-year trade truce in South Korea.',
    leadZh: '北京承诺购买大豆、延迟稀土出口管制并遏制芬太尼——但美国让步的问题仍然存在。',
    leadEn: 'Beijing is pledging to buy soybeans, delay rare-earth export controls and curb fentanyl — but questions remain over what the U.S. gave up in return.',
    contentZh: [
      {
        type: 'paragraph',
        text: '美国总统唐纳德·特朗普和中国领导人习近平周四在韩国同意暂停一年的经济军备竞赛。但许多细节，包括中国和美国究竟向对方让步了什么，仍然不清楚。'
      },
      {
        type: 'heading',
        text: '协议的主要内容'
      },
      {
        type: 'paragraph',
        text: '根据初步报道，中国承诺增加购买美国大豆，延迟实施稀土出口管制措施，并加强对芬太尼前体化学品的管控。这些承诺被视为缓解两国紧张关系的重要步骤。'
      },
      {
        type: 'heading',
        text: '不确定性依然存在'
      },
      {
        type: 'paragraph',
        text: '尽管双方宣布了休战协议，但关键问题仍未得到解答。美国在谈判中做出了哪些让步？关税政策将如何调整？技术转让和知识产权保护问题是否得到解决？这些问题的答案将决定这一协议的实际效果。'
      }
    ],
    contentEn: [
      {
        type: 'paragraph',
        text: 'President Donald Trump and Chinese leader Xi Jinping agreed to a one-year pause in their economic arms race Thursday in South Korea. But many of the details, including what exactly China and the U.S. have conceded to each other, remain murky.'
      },
      {
        type: 'heading',
        text: 'Key Points of the Agreement'
      },
      {
        type: 'paragraph',
        text: 'According to preliminary reports, China has pledged to increase purchases of U.S. soybeans, delay the implementation of rare-earth export controls, and strengthen controls on fentanyl precursor chemicals. These commitments are seen as important steps to ease tensions between the two countries.'
      },
      {
        type: 'heading',
        text: 'Uncertainties Remain'
      },
      {
        type: 'paragraph',
        text: 'Despite the announcement of the truce, key questions remain unanswered. What concessions did the U.S. make in the negotiations? How will tariff policies be adjusted? Have issues of technology transfer and intellectual property protection been resolved? The answers to these questions will determine the actual effectiveness of this agreement.'
      }
    ]
  },
  'genius-act': {
    id: 'genius-act',
    titleZh: '特朗普总统签署GENIUS法案成为法律',
    titleEn: 'President Donald J. Trump Signs GENIUS Act into Law',
    dateZh: '2025年7月18日',
    dateEn: 'July 18, 2025',
    author: 'The White House',
    category: 'regulatory',
    image: 'https://images.unsplash.com/photo-1560221328-12fe60f83ab8?w=1200',
    imageCaptionZh: '特朗普总统签署GENIUS法案，使美国成为数字资产领域的全球领导者。',
    imageCaptionEn: 'President Trump signs the GENIUS Act, making America the leader in digital assets.',
    leadZh: '让美国成为数字资产领域的领导者：今天，唐纳德·J·特朗普总统签署了GENIUS法案，这是一项历史性的立法，将为美国引领全球数字货币革命铺平道路。',
    leadEn: 'MAKING AMERICA THE LEADER IN DIGITAL ASSETS: Today, President Donald J. Trump signed the GENIUS Act into law, a historic piece of legislation that will pave the way for the United States to lead the global digital currency revolution.',
    contentZh: [
      {
        type: 'paragraph',
        text: 'GENIUS法案优先考虑消费者保护，加强美元的储备货币地位，并增强我们的国家安全。该法案将使美国成为数字资产领域无可争议的领导者，为我国带来大规模投资和创新。'
      },
      {
        type: 'heading',
        text: '保护数字市场中的消费者'
      },
      {
        type: 'paragraph',
        text: '特朗普总统支持GENIUS法案，因为它保护消费者免受金融市场中不良行为者的侵害。这项期待已久的立法创建了首个联邦稳定币监管体系，通过严格的储备要求确保其稳定性和信任度。'
      },
      {
        type: 'list',
        items: [
          '这项期待已久的立法创建了首个联邦稳定币监管体系，通过严格的储备要求确保其稳定性和信任度。',
          'GENIUS法案要求100%的储备支持，包括美元或短期国债等流动资产，并要求发行人每月公开披露储备构成。',
          '稳定币发行人必须遵守严格的营销规则，以保护消费者免受欺骗性做法的侵害。目前，他们被禁止发布误导性声明，声称其稳定币由美国政府联邦保险或受法律保护。',
          'GENIUS法案通过全国范围内的许可证抢占各州法律，确保最终实现消费者保护。'
        ]
      },
      {
        type: 'paragraph',
        text: '在破产或清算事件中，GENIUS法案规定稳定币持有人优先于债权人，确保最终实现消费者保护。'
      },
      {
        type: 'heading',
        text: '确保美元作为全球储备货币的地位'
      },
      {
        type: 'paragraph',
        text: '通过要求美国国债和美元作为稳定币储备，GENIUS法案保护并产生对美国债务的增量需求，并将美元的地位确立为世界储备货币。'
      },
      {
        type: 'list',
        items: [
          '该法案将产生对美国债务的增量需求，并将美元的地位确立为世界储备货币。',
          '此外，GENIUS法案将在吸引数字资产活动到美国方面发挥关键作用，通过要求稳定币发行人将其资产存放在美元中，促进可观的经济增长和技术领导力。',
          'GENIUS法案将通过促进更清晰的规则和促进负责任的创新，在数字资产领域创造就业机会。'
        ]
      },
      {
        type: 'heading',
        text: '打击数字资产中的非法活动'
      },
      {
        type: 'paragraph',
        text: '通过稳定币问题的监管和注册，以及与财政部的协调，GENIUS法案增强了我们的国家安全。'
      },
      {
        type: 'list',
        items: [
          'GENIUS法案明确将稳定币发行人纳入《银行保密法》，从而要求稳定币发行人建立有效的反洗钱、制裁合规计划，包括风险评估、制裁清单验证和客户识别。',
          '该立法改善了财政部打击非法稳定币使用的能力，包括制裁规避和洗钱执法。',
          '所有稳定币发行人必须具备技术能力来冻结、扣押或开始支付，当依法要求时，必须遵守合法的冻结令，并在注册时向财政部提交技术能力证明。'
        ]
      },
      {
        type: 'heading',
        text: '兑现让美国成为加密货币之都的承诺'
      },
      {
        type: 'paragraph',
        text: '特朗普总统正在履行他的竞选承诺，将美国定位为全球数字资产的领导者。'
      },
      {
        type: 'list',
        items: [
          '特朗普总统承诺使美国成为"世界加密货币之都"。',
          '在就职典礼的第一周，特朗普总统签署了一项行政命令，以促进美国在数字资产方面的领导地位。',
          '特朗普总统签署了一项行政命令，建立战略比特币储备，将美国定位为数字资产领域的领导者——实际上，它将比其他任何国家都要好。如果我们不拥有它，其他国家将拥有它。我们将成为第一。',
          '特朗普总统长期以来一直是GENIUS法案的支持者——"这将使美国成为UNSPUTED数字资产领导者——实际上，它将比其他任何国家都要好。我们将与数字资产共存，而不是没有它们。这是我们的未来，我们的国家将从中受益。我们将与数字资产共存，而不是没有它们。这是我们的未来，我们的国家将从中受益。"'
        ]
      },
      {
        type: 'paragraph',
        text: '这是一个快速事实：GENIUS法案将使美国成为"UNSPUTED"数字资产领导者。没有延迟。这是我们一直在等待的"GENIUS"法案。现在它来了。我们将与数字资产共存，而不是没有它们。'
      }
    ],
    contentEn: [
      {
        type: 'paragraph',
        text: 'The GENIUS Act prioritizes consumer protection, strengthens the U.S. dollar\'s reserve currency status, and bolsters our national security. The GENIUS Act will make America the undisputed leader in digital assets, bringing massive investment and innovation to our country.'
      },
      {
        type: 'heading',
        text: 'PROTECTING CONSUMERS IN THE DIGITAL MARKET'
      },
      {
        type: 'paragraph',
        text: 'President Trump supports the GENIUS Act because it protects consumers from nefarious actors in financial markets.'
      },
      {
        type: 'list',
        items: [
          'This long-overdue legislation creates the first-ever Federal regulatory system for stablecoins, ensuring their stability and trust through strong reserve requirements.',
          'The GENIUS Act requires 100% reserve backing with liquid assets like U.S. dollars or short-term Treasuries and requires issuers to make monthly, public disclosures of the composition of reserves.',
          'Stablecoin issuers must comply with strict marketing rules to protect consumers from deceptive practices. Crucially, they are forbidden from making misleading claims that their stablecoins are federally insured or legal tender by the U.S. government.',
          'The GENIUS Act preempts State law through a nationwide license, ensuring a final backstop to consumer protection.'
        ]
      },
      {
        type: 'paragraph',
        text: 'In the event of insolvency or a stablecoin issuer\'s liquidation, the GENIUS Act prioritizes stablecoin holders over creditors, ensuring a final backstop to consumer protection.'
      },
      {
        type: 'heading',
        text: 'ENSURING U.S. DOLLAR GLOBAL RESERVE CURRENCY STATUS'
      },
      {
        type: 'paragraph',
        text: 'By taking demand for U.S. Treasuries and the U.S. dollar as stablecoin reserves, the GENIUS Act protects and generates incremental demand for U.S. debt and cements the dollar\'s status as the world\'s reserve currency.'
      },
      {
        type: 'list',
        items: [
          'The Act will generate incremental demand for U.S. debt and cement the dollar\'s status as the world\'s reserve currency by requiring stablecoin issuers to back their assets with U.S. dollars.',
          'Additionally, the GENIUS Act will play a key role in attracting digital asset activity to the United States, promoting considerable economic growth and technological leadership.',
          'The GENIUS Act will create jobs in the digital asset sector by promoting clearer rules and promoting responsible innovation.'
        ]
      },
      {
        type: 'heading',
        text: 'COMBATING ILLICIT ACTIVITY IN DIGITAL ASSETS'
      },
      {
        type: 'paragraph',
        text: 'Through regulation and registration of stablecoin issuers, along with coordination with the Treasury Department on sanctions, the GENIUS Act enhances our national security.'
      },
      {
        type: 'list',
        items: [
          'The GENIUS Act explicitly subjects stablecoin issuers to the Bank Secrecy Act, thereby requiring stablecoin issuers to establish effective anti-money laundering and sanctions compliance programs with risk assessments, sanctions list verification, and customer identification.',
          'This legislation improves the Treasury Department\'s ability to combat illicit stablecoin evasion and money laundering enforcement.',
          'All stablecoin issuers must possess the technical capability to freeze, freeze, or start payment when legally required and must comply with lawful orders to freeze and must submit technical capability certifications to the Treasury Department at registration.'
        ]
      },
      {
        type: 'heading',
        text: 'DELIVERING ON PROMISE TO MAKE AMERICA THE CRYPTO CAPITAL OF THE WORLD'
      },
      {
        type: 'paragraph',
        text: 'President Trump is fulfilling his campaign promise to position America as the global leader in digital assets.'
      },
      {
        type: 'list',
        items: [
          'President Trump promised to make the United States the "crypto capital of the world."',
          'In his first week in office, President Trump signed an Executive Order to promote United States leadership in digital assets.',
          'President Trump signed an Executive Order to establish a Strategic Bitcoin Reserve, positioning the United States as a leader among nations in government digital asset strategy—"actually, it\'s going to be better than any other Nation. If we don\'t own it, other Nations are going to own it. We are going to be first."',
          'President Trump has long been a proponent of the GENIUS Act—"It\'s going to make America the UNSPUTED LEADER in Digital Assets—actually, it\'s going to be better than any other Nation. We are going to own the future, and our Nation is going to own it. We are going to own it with Digital Assets like never before!"'
        ]
      },
      {
        type: 'paragraph',
        text: 'LIGHTNING FAST FACT: The GENIUS Act will make America the "UNSPUTED" leader in Digital Assets. NO DELAYS. This is the "GENIUS" Act we\'ve been waiting for. Get it? It\'s here. We are going to own it with Digital Assets like never before!'
      }
    ]
  },
  'ai-hallucination': {
    id: 'ai-hallucination',
    titleZh: 'OpenAI 2025最新研究：AI模型产生"幻觉"，竟是被我们"教坏"的',
    titleEn: 'OpenAI 2025 Latest Research: AI Model "Hallucinations" Are Actually Caused by How We Train Them',
    dateZh: '2025年',
    dateEn: '2025',
    author: 'OpenAI Research Team',
    category: 'analysis',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200',
    imageCaptionZh: 'AI模型的"幻觉"问题源于训练机制的系统性缺陷。',
    imageCaptionEn: 'AI model "hallucinations" stem from systematic flaws in training mechanisms.',
    leadZh: '天下苦模型"幻觉"久矣！因为"幻觉"(hallucination)直接破坏了大模型的可靠性和可信度，导致LLM在很多场景（如医疗、法律、金融）不敢使用。问题这么明显，为什么一直没有解决？因为模型"幻觉"并非"神秘缺陷"，是源于预训练阶段的统计压力和微调阶段的评价机制偏差，是当前LLM核心架构和训练目标的"必然副产品"。',
    leadEn: 'The world has long suffered from model "hallucinations"! Because "hallucination" directly undermines the reliability and credibility of large models, preventing LLMs from being used in many scenarios (such as medical, legal, financial). Why hasn\'t this obvious problem been solved? Because model "hallucination" is not a "mysterious defect," but stems from statistical pressure in the pre-training phase and evaluation mechanism bias in the fine-tuning phase—it is an "inevitable byproduct" of current LLM core architecture and training objectives.',
    contentZh: [
      {
        type: 'heading',
        text: '什么是"幻觉"？'
      },
      {
        type: 'paragraph',
        text: '幻觉(hallucination)是指大语言模型生成的、听起来合理流畅但实际上错误或毫无事实依据的内容（overconfident, plausible falsehoods）。'
      },
      {
        type: 'paragraph',
        text: '举个例子：当你问模型"SNvSaTOJrizPoCrZZhC3L2rSxCjmOVRT71UO1aoPac的解密结果是什么？"，它可能不会说"我不知道"，而是自信地编造一段看似可信但完全错误的解释。这种"一本正经地胡说八道"就是典型的模型幻觉。'
      },
      {
        type: 'heading',
        text: '"幻觉"有什么影响？'
      },
      {
        type: 'paragraph',
        text: '影响了确定性和信任。即使是最先进的语言模型，依然无法完全避免幻觉。这就像是一个极其博学但有时会信口开河的专家：大多数时候很有帮助，但时不时会给出完全错误的答案，而且说得跟真的一样。'
      },
      {
        type: 'paragraph',
        text: '这种问题使得用户难以完全信任模型的输出，从而限制了其在医疗诊断、法律咨询等高风险领域的应用。'
      },
      {
        type: 'heading',
        text: '为什么"幻觉"持续存在？'
      },
      {
        type: 'list',
        items: [
          '规模效应掩盖了问题：在LLM发展的初期，研究人员更关注通过扩大模型和数据规模来解决能力问题（如理解复杂指令、进行推理）。事实性错误被视为一个可以被规模效应缓解的次要问题。事实上，扩大规模确实减少了某些类型的错误，但并未根除。',
          '评估难度大：自动化地评估生成文本的事实准确性本身就是一个巨大的技术挑战。缺乏高效、准确的评估指标，使得衡量和追踪该问题的进展变得困难。',
          '问题根源在于架构核心：由于问题源于"下一个词预测"这一根本范式，在不颠覆现有架构的前提下，只能缓解而难以根治。这需要一个范式级别的改变，而非简单的修补。'
        ]
      },
      {
        type: 'heading',
        text: '"幻觉"从何而来？'
      },
      {
        type: 'paragraph',
        text: '要理解LLM为什么"幻觉"，我们得先知道它是怎么工作的。你把AI想象成一个"超级自动补全"。'
      },
      {
        type: 'paragraph',
        text: '你有没有用过手机打字的"联想输入"或"自动补全"功能？你打"今天天"，它可能会建议"气真好"。大语言模型就是这个功能的超级无敌升级版。'
      },
      {
        type: 'list',
        items: [
          '它读了海量的书、文章、网页：它的"训练"过程就是阅读互联网上几乎所有的文本，学习单词、句子和概念之间的统计规律。',
          '它的核心任务是"猜下一个词"：当你给它一个提示（比如"请解释一下相对论"），它不会去"思考"，而是根据它从海量数据中学到的模式，一个词一个词地预测最可能跟在后面的词是什么。',
          '它是个"概率大师"：对于每一个位置，它都会计算成千上万个词出现的概率，然后选择概率最高的那个（或者在前几个里面随机选一个）。就这样，"相对论是"、"由"、"爱因斯坦"、"提出的"……一个个词连起来，就形成了一句完整的、流畅的话。'
        ]
      },
      {
        type: 'paragraph',
        text: '问题就出在"概率"和"流畅"上。'
      },
      {
        type: 'heading',
        text: '为什么"超级自动补全"会产生"幻觉"？'
      },
      {
        type: 'paragraph',
        text: '1. "模仿"而不是"理解"'
      },
      {
        type: 'paragraph',
        text: 'AI学到了人类说话的"样子"，但没有真正理解话语背后的"意思"。模型学会了"什么词通常跟着什么词"。比如，它发现"爱因斯坦"和"物理学家"、"相对论"、"E=mc²"这些词经常一起出现。所以当你问起爱因斯坦，它就能流利地组织这些词。但它并不知道"爱因斯坦"是一个人，"相对论"是一个物理理论。它只是在玩一个极其复杂的"词语接龙"游戏。'
      },
      {
        type: 'paragraph',
        text: '这就导致：如果训练数据里有错误（比如网上有文章错误地说"爱因斯坦发明了电话"），或者它为了让句子"看起来"更完整而强行接龙，它就会非常自信地输出错误信息。'
      },
      {
        type: 'paragraph',
        text: '2. 训练数据的"偏见"和"缺失"'
      },
      {
        type: 'paragraph',
        text: 'AI的知识完全来自它读过的书和网页，而这些内容本身就不完美。'
      },
      {
        type: 'list',
        items: [
          '数据偏见：互联网数据可能存在错误、过时信息、偏见或虚假新闻。AI学到了所有这些，好的坏的都学。所以它可能会输出带有偏见或者过时的观点。',
          '数据缺失：如果AI的训练数据里没有某个非常小众或最新的信息（比如"2024年某公司的最新财报"），当你问到时，它不会说"我不知道"。为了完成"生成一个流畅回答"的任务，它会根据已有的、最相关的模式"捏造"一个听起来合理的答案。这就是典型的"幻觉"。'
        ]
      },
      {
        type: 'paragraph',
        text: '3. 追求"流畅性"胜过"真实性"'
      },
      {
        type: 'paragraph',
        text: 'AI的首要目标是让说出来的话通顺、好听，而不是确保每句话都正确。模型的训练目标就是最大化"生成文本的流畅度和可能性"。一个语法混乱、断断续续的答案在它看来是"不好"的。而一个流畅、完整、自信的答案，即使是编的，在它的评分体系里也是"更好"的。所以，它宁愿"编一个完美的谎言，也不愿说一句磕绊的真话"。'
      },
      {
        type: 'heading',
        text: '幻觉产生的两大根源'
      },
      {
        type: 'paragraph',
        text: '从幻觉的产生机制，我们可以将模型产生"幻觉"比喻为一场疾病的"先天病因"和"错误治疗方案"。'
      },
      {
        type: 'paragraph',
        text: '根源一：预训练阶段的"先天病因"'
      },
      {
        type: 'paragraph',
        text: '预训练的本质是让模型学习海量文本中的统计规律。论文通过一个巧妙的类比解释了为什么这个过程必然会产生错误：'
      },
      {
        type: 'list',
        items: [
          '"不治之症"：不可学习的模式（外在幻觉）- 像"某人的生日"、"某本书的出版日期"这类事实之间毫无逻辑规律。如果这个事实在训练数据中只出现一次，模型就像试图记住一张只瞥过一眼的脸，其幻觉率将趋近于这些"单例"在训练数据中的比例。',
          '"机能缺陷"：模型能力不足（内在幻觉）- 即使数据中存在规律，如果模型自身"智力"或"结构"有局限，无法捕捉这种规律，也会产生幻觉。譬如，古老的n-gram模型在结构上就无法理解长句子前后的逻辑关系。',
          '计算上的"绝症"：有些问题（如解密）在计算上本就无解，理想模型应拒绝回答。',
          '"水土不服"：当用户提问的方式与训练数据风格差异巨大时，模型容易表现失常。',
          '"病从口入"：训练数据中本身包含的错误、偏见和虚假信息会被模型学会并再现。'
        ]
      },
      {
        type: 'paragraph',
        text: '根源二：后训练阶段的"错误治疗方案"'
      },
      {
        type: 'paragraph',
        text: '即使预训练后的模型存在"先天病因"，为什么后续的"治疗"（对齐训练，微调）没有根治它？论文指出了一个关键原因：我们的"疗效评估体系"（评测基准）开错了药方，在奖励"猜答案"而非"诚实"。'
      },
      {
        type: 'paragraph',
        text: '这就像一场考试：如果猜对了得分，不猜得零分，那么理性选择就是尽量猜。当前几乎所有主流评测（如MMLU、GPQA等）都采用这种"非对即错"的评分方式，系统性地鼓励了模型在不确定时胡乱猜测，而不是坦然承认"我不知道"。'
      },
      {
        type: 'paragraph',
        text: '你可以把AI想象成一个总被逼着考试的学生。现在的规则是："不答=0分，蒙错=0分，蒙对=满分"→学生疯狂蒙题。这导致了一个恶性循环——为了在考试中拿高分，模型不得不学会过度自信和编造。'
      },
      {
        type: 'heading',
        text: '怎么办？改变游戏规则'
      },
      {
        type: 'paragraph',
        text: '既然问题的根源在于评估体系的激励错位，那么解决方案也必须从这里入手。不是简单地增加更多的幻觉评估，而是对现有的、有影响力的主流评估基准进行系统性的改造。这是一种社会技术学的缓解策略。'
      },
      {
        type: 'paragraph',
        text: '所以，仅仅在模型层面努力（如RAG、RLHF）是治标不治本，必须改变激励模型行为的"竞赛规则"本身。'
      },
      {
        type: 'paragraph',
        text: '核心方案：在主流评测中引入"显式置信度目标"'
      },
      {
        type: 'paragraph',
        text: '具体做法：修改评测的评分规则。在每个问题后面附加明确的指令，例如："请仅在置信度>90%时回答。答对得1分，答错扣9分，回答\'我不知道\'得0分"'
      },
      {
        type: 'paragraph',
        text: '为什么这能解决问题？'
      },
      {
        type: 'list',
        items: [
          '根治"错误治疗"：它彻底改变了优化目标。现在，模型需要进行风险计算——盲目猜测可能被狠狠扣分，而诚实承认不知道反而是更安全、更理性的选择。',
          '对齐核心目标：模型的优化目标（在评测中得高分）与人类期望（获得可靠信息）变得一致。',
          '培养"行为校准"：模型会学会在确有把握时自信回答，不确定时保持沉默，成为一个更诚实的助手。'
        ]
      },
      {
        type: 'heading',
        text: '如何落地'
      },
      {
        type: 'list',
        items: [
          '在提示中加入置信度约束："仅当你置信度>t时回答；答错扣t/(1-t)，IDK=0"。',
          '业务评估同时跟踪三项指标：准确率、错误率（幻觉率）、拒答率，避免仅看准确率。',
          '高危场景默认启用高阈值（如t=0.75），宁可少答不可错答；低风险场景下调阈值以提升覆盖。',
          '迭代评测：在现有基准中加入"承认不确定性"的奖励项或惩罚错答，形成新的排行榜信号。'
        ]
      },
      {
        type: 'heading',
        text: '小结'
      },
      {
        type: 'list',
        items: [
          '幻觉是什么：AI自信地编造错误信息。',
          '根本原因：AI本质是一个基于概率的"词语接龙大师"，它的目标是生成流畅的文本，而不是正确的文本，验收规则有缺陷。它模仿形式而非理解内涵，且其知识受限于有缺陷的训练数据。',
          '解决方向：给它配"外挂硬盘"（RAG）、像训狗一样教它诚实（对齐训练）、让它学会给答案标注"参考文献"（溯源）。',
          '边界与讨论：幻觉不可根除，但可被管理；小型模型表达力有限时，更应优先"说不"。'
        ]
      }
    ],
    contentEn: [
      {
        type: 'heading',
        text: 'What is "Hallucination"?'
      },
      {
        type: 'paragraph',
        text: 'Hallucination refers to content generated by large language models that sounds reasonable and fluent but is actually incorrect or has no factual basis (overconfident, plausible falsehoods).'
      },
      {
        type: 'paragraph',
        text: 'For example: when you ask the model "What is the decryption result of SNvSaTOJrizPoCrZZhC3L2rSxCjmOVRT71UO1aoPac?", it may not say "I don\'t know," but instead confidently fabricate a seemingly credible but completely incorrect explanation. This "seriously talking nonsense" is a typical model hallucination.'
      },
      {
        type: 'heading',
        text: 'What is the Impact of "Hallucinations"?'
      },
      {
        type: 'paragraph',
        text: 'It affects certainty and trust. Even the most advanced language models still cannot completely avoid hallucinations. It\'s like an extremely knowledgeable expert who sometimes speaks off the cuff: most of the time very helpful, but occasionally gives completely wrong answers that sound just as convincing.'
      },
      {
        type: 'paragraph',
        text: 'This problem makes it difficult for users to fully trust the model\'s output, thereby limiting its application in high-risk areas such as medical diagnosis and legal consulting.'
      },
      {
        type: 'heading',
        text: 'Why Do "Hallucinations" Persist?'
      },
      {
        type: 'list',
        items: [
          'Scale effects masked the problem: In the early development of LLMs, researchers focused more on solving capability issues (such as understanding complex instructions and reasoning) by scaling up models and data. Factual errors were seen as a secondary problem that could be mitigated by scale effects. In fact, scaling did reduce certain types of errors, but did not eradicate them.',
          'Evaluation difficulty: Automatically evaluating the factual accuracy of generated text is itself a huge technical challenge. The lack of efficient and accurate evaluation metrics makes it difficult to measure and track progress on this issue.',
          'The root cause lies in the core architecture: Since the problem stems from the fundamental paradigm of "next word prediction," it can only be mitigated but not eradicated without overturning the existing architecture. This requires a paradigm-level change, not simple patching.'
        ]
      },
      {
        type: 'heading',
        text: 'Where Do "Hallucinations" Come From?'
      },
      {
        type: 'paragraph',
        text: 'To understand why LLMs "hallucinate," we need to first know how they work. Think of AI as a "super autocomplete."'
      },
      {
        type: 'paragraph',
        text: 'Have you ever used the "predictive input" or "autocomplete" feature on your phone? You type "today wea" and it might suggest "ther is nice." Large language models are the super upgraded version of this feature.'
      },
      {
        type: 'list',
        items: [
          'It has read massive amounts of books, articles, and web pages: Its "training" process is reading almost all text on the internet, learning statistical patterns between words, sentences, and concepts.',
          'Its core task is "guessing the next word": When you give it a prompt (like "please explain relativity"), it doesn\'t "think," but predicts word by word what is most likely to follow based on patterns learned from massive data.',
          'It\'s a "probability master": For each position, it calculates the probability of thousands of words appearing, then selects the one with the highest probability (or randomly selects from the top few). Just like that, "relativity is," "by," "Einstein," "proposed"... words connect one by one to form a complete, fluent sentence.'
        ]
      },
      {
        type: 'paragraph',
        text: 'The problem lies in "probability" and "fluency."'
      },
      {
        type: 'heading',
        text: 'Why Does "Super Autocomplete" Produce "Hallucinations"?'
      },
      {
        type: 'paragraph',
        text: '1. "Imitation" Rather Than "Understanding"'
      },
      {
        type: 'paragraph',
        text: 'AI has learned the "appearance" of human speech, but hasn\'t truly understood the "meaning" behind the words. The model has learned "what words usually follow what words." For example, it finds that "Einstein" and "physicist," "relativity," "E=mc²" often appear together. So when you ask about Einstein, it can fluently organize these words. But it doesn\'t know that "Einstein" is a person, or that "relativity" is a physics theory. It\'s just playing an extremely complex "word chain" game.'
      },
      {
        type: 'paragraph',
        text: 'This leads to: if there are errors in the training data (like an article online incorrectly saying "Einstein invented the telephone"), or if it forces word chains to make sentences "look" more complete, it will very confidently output incorrect information.'
      },
      {
        type: 'paragraph',
        text: '2. "Bias" and "Gaps" in Training Data'
      },
      {
        type: 'paragraph',
        text: 'AI\'s knowledge comes entirely from the books and web pages it has read, and this content itself is imperfect.'
      },
      {
        type: 'list',
        items: [
          'Data bias: Internet data may contain errors, outdated information, biases, or fake news. AI learns all of this, both good and bad. So it may output biased or outdated views.',
          'Data gaps: If AI\'s training data doesn\'t include some very niche or latest information (like "a company\'s latest financial report in 2024"), when you ask about it, it won\'t say "I don\'t know." To complete the task of "generating a fluent answer," it will "fabricate" a reasonable-sounding answer based on existing, most relevant patterns. This is typical "hallucination."'
        ]
      },
      {
        type: 'paragraph',
        text: '3. Pursuing "Fluency" Over "Truth"'
      },
      {
        type: 'paragraph',
        text: 'AI\'s primary goal is to make what it says smooth and pleasant, not to ensure every sentence is correct. The model\'s training objective is to maximize "fluency and likelihood of generated text." A grammatically confused, stuttering answer is "bad" in its view. While a fluent, complete, confident answer, even if fabricated, is "better" in its scoring system. So, it would rather "fabricate a perfect lie than speak a stumbling truth."'
      },
      {
        type: 'heading',
        text: 'Two Major Sources of Hallucinations'
      },
      {
        type: 'paragraph',
        text: 'From the mechanism of hallucination generation, we can compare model "hallucinations" to a disease\'s "congenital causes" and "wrong treatment plans."'
      },
      {
        type: 'paragraph',
        text: 'Source One: "Congenital Causes" in the Pre-training Phase'
      },
      {
        type: 'paragraph',
        text: 'The essence of pre-training is to let the model learn statistical patterns in massive text. The paper explains through a clever analogy why this process inevitably produces errors:'
      },
      {
        type: 'list',
        items: [
          '"Incurable disease": Unlearnable patterns (Extrinsic Hallucinations) - Facts like "someone\'s birthday" or "a book\'s publication date" have no logical pattern between them. If this fact appears only once in training data, the model is like trying to remember a face glimpsed only once, and its hallucination rate will approach the proportion of these "single instances" in training data.',
          '"Functional defect": Insufficient model capability (Intrinsic Hallucinations) - Even if patterns exist in data, if the model\'s own "intelligence" or "structure" has limitations and cannot capture these patterns, it will also produce hallucinations. For example, old n-gram models structurally cannot understand logical relationships between long sentences.',
          'Computationally "incurable": Some problems (like decryption) are computationally unsolvable, and ideal models should refuse to answer.',
          '"Acclimatization": When users ask questions in a style vastly different from training data, models tend to perform poorly.',
          '"Disease from the mouth": Errors, biases, and false information contained in training data itself will be learned and reproduced by the model.'
        ]
      },
      {
        type: 'paragraph',
        text: 'Source Two: "Wrong Treatment Plans" in the Post-training Phase'
      },
      {
        type: 'paragraph',
        text: 'Even if pre-trained models have "congenital causes," why didn\'t subsequent "treatment" (alignment training, fine-tuning) cure it? The paper points out a key reason: our "efficacy evaluation system" (evaluation benchmarks) prescribed the wrong medicine, rewarding "guessing answers" rather than "honesty."'
      },
      {
        type: 'paragraph',
        text: 'It\'s like an exam: if guessing correctly gets points and not guessing gets zero, then the rational choice is to guess as much as possible. Almost all current mainstream evaluations (like MMLU, GPQA, etc.) adopt this "right or wrong" scoring method, systematically encouraging models to randomly guess when uncertain rather than honestly admitting "I don\'t know."'
      },
      {
        type: 'paragraph',
        text: 'You can imagine AI as a student constantly forced to take exams. The current rule is: "No answer = 0 points, wrong guess = 0 points, correct guess = full points" → students frantically guess. This leads to a vicious cycle—to get high scores on exams, models have to learn to be overconfident and fabricate.'
      },
      {
        type: 'heading',
        text: 'What to Do? Change the Game Rules'
      },
      {
        type: 'paragraph',
        text: 'Since the root of the problem lies in the misalignment of evaluation system incentives, the solution must also start here. It\'s not simply adding more hallucination evaluations, but systematically reforming existing, influential mainstream evaluation benchmarks. This is a socio-technical mitigation strategy.'
      },
      {
        type: 'paragraph',
        text: 'Therefore, efforts at the model level alone (like RAG, RLHF) treat symptoms but not the root cause. We must change the "competition rules" that incentivize model behavior itself.'
      },
      {
        type: 'paragraph',
        text: 'Core Solution: Introduce "Explicit Confidence Targets" in Mainstream Evaluations'
      },
      {
        type: 'paragraph',
        text: 'Specific approach: Modify evaluation scoring rules. Add explicit instructions after each question, such as: "Please answer only when confidence > 90%. Correct answer gets 1 point, wrong answer deducts 9 points, answering \'I don\'t know\' gets 0 points"'
      },
      {
        type: 'paragraph',
        text: 'Why can this solve the problem?'
      },
      {
        type: 'list',
        items: [
          'Cure "wrong treatment": It completely changes the optimization objective. Now, models need to perform risk calculations—blind guessing may be heavily penalized, while honestly admitting not knowing is actually a safer, more rational choice.',
          'Align core objectives: The model\'s optimization objective (getting high scores in evaluations) becomes consistent with human expectations (obtaining reliable information).',
          'Cultivate "behavioral calibration": Models will learn to answer confidently when certain, remain silent when uncertain, becoming a more honest assistant.'
        ]
      },
      {
        type: 'heading',
        text: 'How to Implement'
      },
      {
        type: 'list',
        items: [
          'Add confidence constraints in prompts: "Answer only when your confidence > t; wrong answer deducts t/(1-t), IDK = 0".',
          'Business evaluations should track three metrics simultaneously: accuracy, error rate (hallucination rate), refusal rate, avoiding looking only at accuracy.',
          'High-risk scenarios default to high thresholds (like t=0.75), preferring fewer answers over wrong answers; low-risk scenarios lower thresholds to improve coverage.',
          'Iterative evaluation: Add reward items for "admitting uncertainty" or penalties for wrong answers in existing benchmarks, forming new leaderboard signals.'
        ]
      },
      {
        type: 'heading',
        text: 'Summary'
      },
      {
        type: 'list',
        items: [
          'What hallucinations are: AI confidently fabricating incorrect information.',
          'Root cause: AI is essentially a probability-based "word chain master," its goal is to generate fluent text, not correct text, and the acceptance rules are flawed. It imitates form rather than understanding connotation, and its knowledge is limited by flawed training data.',
          'Solution direction: Give it an "external hard drive" (RAG), train it to be honest like training a dog (alignment training), let it learn to annotate answers with "references" (traceability).',
          'Boundaries and discussion: Hallucinations cannot be eradicated but can be managed; when small models have limited expressiveness, they should prioritize "saying no."'
        ]
      }
    ]
  },
  'state-of-crypto-2025': {
    id: 'state-of-crypto-2025',
    titleZh: 'State of Crypto 2025：稳定币、机构采用与AI',
    titleEn: 'State of Crypto 2025: Stablecoins, Institutional Adoption, and AI',
    dateZh: '2025年10月23日',
    dateEn: 'October 23, 2025',
    author: 'a16z crypto',
    category: 'business',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200',
    imageCaptionZh: '2025年，世界正在走向链上。',
    imageCaptionEn: 'This is the year the world came onchain.',
    leadZh: '这是世界走向链上的一年。加密货币在2025年的故事是行业成熟的故事。简而言之，加密货币长大了：传统金融巨头和科技挑战者正在提供或推出加密产品；区块链现在每秒处理超过3,400笔交易；稳定币年交易量达到46万亿美元；超过1750亿美元存放在比特币和以太坊交易所交易产品中。',
    leadEn: 'This is the year the world came onchain. The story of crypto in 2025 is one of industry maturation. In short, crypto grew up: Traditional financial incumbents and tech-native challengers are offering or launching crypto products; Blockchains now process over 3,400 transactions per second; Stablecoins power $46 trillion in annual transactions; Over $175 billion sits in Bitcoin and Ethereum exchange-traded products.',
    contentZh: [
      {
        type: 'heading',
        text: '加密市场规模庞大、全球化且不断增长'
      },
      {
        type: 'paragraph',
        text: '2025年，加密货币总市值首次突破4万亿美元门槛，标志着行业的广泛进步。加密移动钱包用户数量也达到历史新高，比去年增长20%。'
      },
      {
        type: 'paragraph',
        text: '从敌对的监管环境转向更加支持的环境，加上这些技术的加速采用——从稳定币到传统金融资产的代币化再到其他新兴用例——将定义下一个周期。'
      },
      {
        type: 'paragraph',
        text: '我们估计目前有大约4000万至7000万活跃加密用户，比去年增加约1000万。这是估计拥有加密货币的7.16亿人的一小部分，比去年增长16%。这也是大约1.81亿月活跃链上地址的一小部分，比去年下降18%。'
      },
      {
        type: 'paragraph',
        text: '被动加密持有者（拥有加密货币但不在链上交易的人）和活跃用户（定期在链上交易的人）之间的差距代表了加密建设者接触更多已经拥有加密货币的潜在用户的机会。'
      },
      {
        type: 'paragraph',
        text: '加密货币是全球性的，但世界不同地区似乎以不同的方式使用它。移动钱包使用量（链上活动的指标）在阿根廷、哥伦比亚、印度和尼日利亚等新兴市场增长最快。特别是阿根廷，在货币危机不断升级的情况下，过去三年加密移动钱包使用量增长了16倍。'
      },
      {
        type: 'paragraph',
        text: '与此同时，对代币兴趣的指标更倾向于发达国家。这些国家（特别是澳大利亚和韩国）的活动可能更专注于交易和投机，而不是发展中国家的用户行为。'
      },
      {
        type: 'paragraph',
        text: '比特币仍占加密货币总市值的一半以上，作为价值储存手段在投资者中获得了吸引力，创下了126,000美元以上的历史新高。与此同时，以太坊和Solana恢复了2022年后大部分的跌幅。'
      },
      {
        type: 'paragraph',
        text: '随着区块链继续扩展，随着费用市场的成熟，随着新应用的出现，某些指标变得更加重要；其中之一是"真实经济价值"——衡量人们实际为使用区块链支付多少的指标。Hyperliquid和Solana今天占收入产生经济活动的53%，这与前几年比特币和以太坊的主导地位有显著不同。'
      },
      {
        type: 'paragraph',
        text: '在建设者方面，加密货币仍然是多链的，比特币、以太坊（及其L2）和Solana吸引了最多的开发者。以太坊与其L2相结合，是2025年新开发者的首选目的地。与此同时，Solana是增长最快的生态系统之一，过去两年建设者兴趣增长了78%。'
      },
      {
        type: 'heading',
        text: '金融机构拥抱加密货币'
      },
      {
        type: 'paragraph',
        text: '2025年是机构采用之年。在去年的State of Crypto报告中指出稳定币已经找到产品市场契合度仅五天后，Stripe就宣布有意收购稳定币基础设施平台Bridge。竞赛开始了：传统金融公司也准备公开进行稳定币行动。'
      },
      {
        type: 'paragraph',
        text: '几个月后，Circle的数十亿美元IPO标志着稳定币发行商作为主流金融机构的到来。7月，两党GENIUS法案成为法律，为建设者和机构提供了他们前进所需的清晰度。此后几个月，SEC文件中提到稳定币的次数增长了64%，主要金融机构继续发布一系列公告。'
      },
      {
        type: 'paragraph',
        text: '机构采用迅速加速。传统机构——包括花旗集团、富达、摩根大通、万事达、摩根士丹利和Visa——现在正在（或计划）直接向消费者提供加密产品，允许他们购买、出售和持有数字资产，以及股票、交易所交易产品和其他传统工具。与此同时，PayPal和Shopify等平台正在加倍投入支付，并为商家和客户之间的日常交易构建基础设施。'
      },
      {
        type: 'paragraph',
        text: '除了直接产品外，主要金融科技公司——包括Circle、Robinhood和Stripe——正在积极开发或已宣布计划开发新的区块链，专注于支付、真实世界资产和稳定币。这些举措可能会将更多支付流程带到链上，鼓励企业采用，并最终创建一个更大、更快、更全球化的金融系统。'
      },
      {
        type: 'paragraph',
        text: '这些公司拥有庞大的分销网络。如果开发继续进行，加密货币可能会深度整合到我们每天使用的金融服务中。'
      },
      {
        type: 'paragraph',
        text: '交易所交易产品是机构投资的另一个关键驱动力，目前链上加密持有量超过1750亿美元，比一年前的650亿美元增长169%。'
      },
      {
        type: 'paragraph',
        text: 'BlackRock的iShares比特币信托（IBIT）被认为是有史以来交易量最大的比特币交易所交易产品发行，后续的以太坊交易所交易产品在最近几个月也看到了显著的资金流入。'
      },
      {
        type: 'paragraph',
        text: '这些产品使加密货币更容易获得，释放了历史上一直处于行业边缘的大量机构资本。'
      },
      {
        type: 'paragraph',
        text: '上市交易的"数字资产国库"（DAT）公司——在其资产负债表上持有加密货币的实体，就像企业国库持有现金一样——现在总共持有流通中比特币和以太坊总量的约4%。这些DAT与交易所交易产品相结合，现在持有比特币和以太坊代币供应量的约10%。'
      },
      {
        type: 'heading',
        text: '稳定币走向主流'
      },
      {
        type: 'paragraph',
        text: '没有什么比稳定币的崛起更能标志2025年加密货币的成熟。在过去几年，稳定币主要用于结算投机性加密交易；在过去几年中，它们已成为发送美元的最快、最便宜、最全球化的方式——在不到一秒钟内以不到一美分的成本，几乎可以到达世界任何地方。'
      },
      {
        type: 'paragraph',
        text: '今年，它们成为链上经济的支柱。'
      },
      {
        type: 'paragraph',
        text: '稳定币在过去一年完成了46万亿美元的总交易量，增长106%。虽然这不是完全可比的（因为这个数字主要代表金融流动，而不是卡网络的零售支付），但这几乎是Visa的三倍，接近ACH网络的规模，后者支撑着整个美国银行系统。'
      },
      {
        type: 'paragraph',
        text: '在调整基础上——这是一种更好的有机活动衡量标准，试图过滤掉机器人和其他人为膨胀的活动——稳定币在过去12个月中完成了9万亿美元，比一年前增长87%。这是PayPal吞吐量的五倍多，是Visa的一半以上。'
      },
      {
        type: 'paragraph',
        text: '采用正在加速。月度调整后的稳定币交易量已爆炸至历史新高，仅在2025年9月就接近1.25万亿美元。'
      },
      {
        type: 'paragraph',
        text: '值得注意的是，这种活动在很大程度上与更广泛的加密交易量无关——表明稳定币的非投机性使用，更重要的是，它们的产品市场契合度。'
      },
      {
        type: 'paragraph',
        text: '稳定币总供应量也处于历史新高，现在超过3000亿美元。市场上最大的稳定币占主导地位：Tether和USDC占总供应量的87%。2025年9月，以太坊和Tron区块链上结算了7720亿美元的稳定币交易（调整后），占所有交易量的64%。虽然这两个发行商和链占稳定币活动的大部分，但新链和发行商之间的增长也在加速。'
      },
      {
        type: 'paragraph',
        text: '稳定币现在是全球宏观经济力量：超过1%的美元现在以代币化稳定币的形式存在于公共区块链上，稳定币现在是美国国债的第17大持有者，比去年的第20位上升。总共，稳定币持有超过1500亿美元的美国国债——超过许多主权国家。'
      },
      {
        type: 'paragraph',
        text: '与此同时，美国国债正在激增，而全球对该债务的需求正在减弱。30年来首次，外国央行持有的黄金储备多于美国国债。'
      },
      {
        type: 'paragraph',
        text: '但稳定币正在逆势而上：超过99%的稳定币以美元计价，预计到2030年将增长10倍至超过3万亿美元，在未来几年为美国债务提供潜在强大且可持续的需求来源。'
      },
      {
        type: 'paragraph',
        text: '即使外国央行减少其国债持有量，稳定币也在加强美元主导地位。'
      },
      {
        type: 'heading',
        text: '加密货币在美国比以往更强大'
      },
      {
        type: 'paragraph',
        text: '美国已经扭转了其以前对加密货币的敌对立场，重振了建设者的信心。'
      },
      {
        type: 'paragraph',
        text: '今年GENIUS法案的通过和众议院对CLARITY法案的批准标志着两党共识，即加密货币既会长期存在，也准备在美国蓬勃发展。这些法案共同建立了稳定币、市场结构和数字资产监管的框架，平衡了创新与投资者保护。该立法得到了第14178号行政命令的补充，该命令撤销了早期的反加密指令，并创建了一个跨机构工作组以现代化联邦数字资产政策。'
      },
      {
        type: 'paragraph',
        text: '监管环境正在为建设者铺平道路，以实现代币作为新数字原语的潜力，类似于网站对于前几代互联网的意义。随着监管清晰度的提高，更多的网络代币将能够通过产生归属于代币持有者的收入来完成其经济循环——为互联网创造一个自我维持的新经济引擎，让更多用户在系统中拥有利益。'
      },
      {
        type: 'heading',
        text: '世界正在走向链上'
      },
      {
        type: 'paragraph',
        text: '链上经济——曾经是早期采用者的小众游乐场——已经发展成为一个拥有数千万月度参与者的多部门市场。现在近五分之一的现货交易量发生在去中心化交易所。'
      },
      {
        type: 'paragraph',
        text: '随着交易量在过去一年增长近8倍，永续期货在加密投机者中爆炸式增长。像Hyperliquid这样的去中心化永续交易所已经处理了数万亿美元的交易，今年产生了超过10亿美元的年化收入——这些数字与一些中心化交易所相媲美。'
      },
      {
        type: 'paragraph',
        text: '真实世界资产（RWA）——传统资产，如美国国债、货币市场基金、私人信贷和房地产，在链上表示（"代币化"）——连接加密货币和传统金融。代币化RWA的总市场为300亿美元，在过去两年中增长了近4倍。'
      },
      {
        type: 'paragraph',
        text: '除了金融之外，2025年区块链最雄心勃勃的前沿之一是DePIN，即去中心化物理基础设施网络。'
      },
      {
        type: 'paragraph',
        text: 'DeFi重新构想了金融，DePIN正在重新构想物理基础设施，包括电信和交通网络、能源网格等。机会是巨大的：世界经济论坛预测DePIN类别到2028年将增长到3.5万亿美元。'
      },
      {
        type: 'paragraph',
        text: 'Helium网络是最著名的例子。这个草根无线网络现在通过超过111,000个用户运营的热点为140万日活跃用户提供5G蜂窝覆盖。'
      },
      {
        type: 'paragraph',
        text: '预测市场在2024年美国总统选举周期期间进入主流，最受欢迎的平台Polymarket和Kalshi的月交易量达到数十亿美元。尽管面临对它们是否能在选举年之外维持参与度的怀疑，但这些平台自2025年初以来的交易量增长了近5倍，接近之前的高点。'
      },
      {
        type: 'paragraph',
        text: '在缺乏监管清晰度的情况下，memecoin蓬勃发展。去年推出了超过1300万个memecoin。这一趋势似乎在最近几个月有所降温——9月的发行量比1月少56%——因为健全的政策和两党立法为更有生产力的区块链用例铺平了道路。'
      },
      {
        type: 'paragraph',
        text: 'NFT市场交易量远未达到2022年的峰值，但月活跃买家数量一直在增长。这些趋势似乎表明消费者行为从投机转向收藏，这是由Solana和Base等链上更便宜的区块空间的出现所促成的。'
      },
      {
        type: 'heading',
        text: '区块链基础设施（几乎）准备就绪'
      },
      {
        type: 'paragraph',
        text: '所有这些活动如果没有区块链基础设施的重大进步是不可能的。'
      },
      {
        type: 'paragraph',
        text: '在短短五年内，主要区块链网络的总交易吞吐量增长了100多倍。那时，区块链每秒处理不到25笔交易。现在它们每秒处理3,400笔交易，与纳斯达克完成的交易或Stripe在黑色星期五的全球吞吐量相当——而且成本只是历史成本的一小部分。'
      },
      {
        type: 'paragraph',
        text: '在区块链生态系统中，Solana已成为最突出的之一。其高性能、低费用架构现在支撑着从DePIN项目到NFT市场的一切，其原生应用在过去一年产生了30亿美元的收入。计划中的升级预计将在年底前将网络容量翻倍。'
      },
      {
        type: 'paragraph',
        text: '以太坊继续执行其扩展路线图，其大部分经济活动迁移到L2，如Arbitrum、Base和Optimism。L2上的平均交易成本已从2021年的约24美元降至今天的不到1美分，使以太坊链接的区块空间变得便宜且丰富。'
      },
      {
        type: 'paragraph',
        text: '桥接允许区块链互操作。像LayerZero和Circle的跨链传输协议这样的协议允许用户在多链系统中移动资产。Hyperliquid的规范桥今年迄今也达到了740亿美元的交易量。'
      },
      {
        type: 'paragraph',
        text: '隐私正在重回前台，可能是更广泛采用的先决条件。增长兴趣的指标：2025年与加密隐私相关的Google搜索激增；Zcash的屏蔽池供应增长至近400万ZEC；Railgun的月交易流量超过2亿美元。'
      },
      {
        type: 'paragraph',
        text: '更多势头迹象：以太坊基金会成立了新的隐私团队；Paxos与Aleo合作推出私密、合规的稳定币（USAD）；外国资产控制办公室解除了对去中心化隐私协议Tornado Cash的制裁。我们预计随着加密货币继续走向主流，这一趋势在未来几年将获得更大的势头。'
      },
      {
        type: 'paragraph',
        text: '同样，零知识（ZK）和简洁证明系统正在从数十年的学术研究迅速发展成为关键基础设施。零知识系统现在已集成到rollup、合规工具，甚至主流网络服务中——Google的新ZK身份系统就是一个例子。'
      },
      {
        type: 'paragraph',
        text: '与此同时，区块链正在加速后量子路线图。大约7500亿美元的比特币位于易受未来量子攻击的地址中。美国政府计划到2035年将联邦系统过渡到后量子密码算法。'
      },
      {
        type: 'heading',
        text: 'AI与加密货币正在融合'
      },
      {
        type: 'paragraph',
        text: '除其他进展外，2022年ChatGPT的推出将AI带到了公众关注的前沿——为加密货币带来了明确的机会。从跟踪来源和IP许可到为代理提供支付轨道，加密货币可能是AI一些最紧迫挑战的解决方案。'
      },
      {
        type: 'paragraph',
        text: '像World这样的去中心化身份系统已经验证了超过1700万人，可以提供"人类证明"并帮助区分人和机器人。'
      },
      {
        type: 'paragraph',
        text: '像x402这样的协议标准正在成为自主AI代理的潜在金融支柱，帮助它们进行微交易、访问API并在没有中介的情况下结算支付——Gartner估计到2030年这一经济可能达到30万亿美元。'
      },
      {
        type: 'paragraph',
        text: '与此同时，AI的计算层正在围绕少数科技巨头整合，引发了对中心化和审查的担忧。仅OpenAI和Anthropic两家公司就控制了88%的"AI原生"公司收入。亚马逊、微软和谷歌控制着63%的云基础设施市场，而NVIDIA持有94%的数据中心GPU市场。这些不平衡在过去几年推动了"七巨头"公司的两位数季度净收入增长，而标普493其余公司的总收益增长未能超过通胀。'
      },
      {
        type: 'paragraph',
        text: '区块链为AI系统明显的中心化力量提供了平衡。'
      },
      {
        type: 'paragraph',
        text: '在AI热潮中，一些建设者已经从加密货币转向。我们的分析表明，自ChatGPT推出以来，约有1000个工作岗位从加密货币转向AI。但这个数字已被来自其他领域（如传统金融和科技）加入加密货币的同等数量的建设者所抵消。'
      },
      {
        type: 'heading',
        text: '下一步是什么'
      },
      {
        type: 'paragraph',
        text: '这让我们处于什么位置？随着更大的监管清晰度即将到来，代币通过费用产生真实收入的道路正在清晰。传统金融和金融科技对加密货币的采用将继续加速；稳定币将升级遗留系统并在全球范围内民主化金融访问；新的消费产品将带来下一波加密用户上链。'
      },
      {
        type: 'paragraph',
        text: '我们拥有基础设施、分销渠道，并希望很快拥有监管清晰度，以将这项技术推向主流。是时候升级金融系统、重建全球支付轨道，并创建世界应得的互联网了。'
      },
      {
        type: 'paragraph',
        text: '十七年过去了，加密货币正在离开青春期，进入成年期。'
      }
    ],
    contentEn: [
      {
        type: 'heading',
        text: 'The Market is Big, Global, and Growing'
      },
      {
        type: 'paragraph',
        text: 'In 2025, the total crypto market cap crossed the $4 trillion threshold for the first time, marking the industry\'s broad progress. The number of crypto mobile wallet users also reached all-time highs, up 20% from last year.'
      },
      {
        type: 'paragraph',
        text: 'The shift from a hostile regulatory environment to a much more supportive one, alongside accelerating adoption of these technologies — from stablecoins to the tokenization of traditional financial assets to other emerging use cases — will define the next cycle.'
      },
      {
        type: 'paragraph',
        text: 'We estimate that there are roughly 40-70 million active crypto users, an increase of about 10 million over the last year. This is a fraction of the estimated 716 million people who own crypto, up 16% from last year. It\'s also a fraction of the approximately 181 million monthly active addresses onchain, down 18% from last year.'
      },
      {
        type: 'paragraph',
        text: 'The gap between passive crypto holders (people who own crypto but don\'t transact onchain) and active users (people who transact onchain regularly) represents an opportunity for crypto builders to reach more potential users who already own crypto.'
      },
      {
        type: 'paragraph',
        text: 'Crypto is global, but different parts of the world appear to use it in different ways. Mobile wallet usage, an indicator of onchain activity, is growing fastest in emerging markets like Argentina, Colombia, India, and Nigeria. In particular, Argentina has seen a 16x increase in crypto mobile wallet usage over the last three years, amid an escalating currency crisis.'
      },
      {
        type: 'paragraph',
        text: 'Meanwhile, indicators of interest in tokens skew more toward developed nations. Activity in these countries — particularly Australia and South Korea — may be more focused on trading and speculating compared to user behaviors in developing countries.'
      },
      {
        type: 'paragraph',
        text: 'Bitcoin, which still represents more than half of crypto\'s total market cap, hit an all-time high above $126,000 as it gained traction among investors as a store of value. Meanwhile, Ethereum and Solana recovered much of their post-2022 drawdowns.'
      },
      {
        type: 'paragraph',
        text: 'As blockchains continue to scale, as fee markets mature, and as new applications emerge, certain metrics are becoming more important; one of these is "real economic value" — a measure of how much people are actually paying to use blockchains. Hyperliquid and Solana account for 53% of revenue-generating economic activity today, a significant departure from the dominance of Bitcoin and Ethereum in previous years.'
      },
      {
        type: 'paragraph',
        text: 'On the builder side, crypto remains multichain, with Bitcoin, Ethereum (and its L2s), and Solana attracting the most developers. Ethereum, combined with its L2s, was the top destination for new developers in 2025. Meanwhile, Solana is one of the fastest-growing ecosystems, with builder interest increasing by 78% in the last two years.'
      },
      {
        type: 'heading',
        text: 'Financial Institutions Have Embraced Crypto'
      },
      {
        type: 'paragraph',
        text: '2025 is the year of institutional adoption. Just five days after stating that stablecoins had found product-market fit in last year\'s State of Crypto report, Stripe announced its intent to acquire stablecoin infrastructure platform Bridge. The race was on: Traditional finance companies were ready to make public stablecoin moves, too.'
      },
      {
        type: 'paragraph',
        text: 'A few months later, Circle\'s billion-dollar IPO marked the arrival of stablecoin issuers as mainstream financial institutions. And in July, the bipartisan GENIUS Act passed into law, providing builders and institutions with the clarity they needed to move forward. In the months since, mentions of stablecoins in SEC filings have grown 64%, and a flurry of announcements have continued to follow from major financial institutions.'
      },
      {
        type: 'paragraph',
        text: 'Institutional adoption has ramped up quickly. Traditional institutions — including Citigroup, Fidelity, JPMorgan, Mastercard, Morgan Stanley, and Visa — are now offering (or planning to offer) crypto products directly to consumers, allowing them to buy, sell, and hold digital assets, alongside equities, exchange-traded products, and other traditional instruments. Platforms like PayPal and Shopify, meanwhile, are doubling down on payments and building infrastructure for daily transactions between merchants and customers.'
      },
      {
        type: 'paragraph',
        text: 'Beyond direct offerings, major fintechs — including Circle, Robinhood, and Stripe — are actively developing, or have announced plans to develop, new blockchains, focusing on payments, real-world assets, and stablecoins. These initiatives could bring more payment flows onchain, encourage enterprise adoption, and ultimately create a bigger, faster, and more global financial system.'
      },
      {
        type: 'paragraph',
        text: 'These companies have massive distribution. If development continues, crypto could become deeply integrated into the financial services we use every day.'
      },
      {
        type: 'paragraph',
        text: 'Exchange-traded products are another key driver of institutional investment, with over $175 billion in onchain crypto holdings today, up 169% from $65 billion a year ago.'
      },
      {
        type: 'paragraph',
        text: 'BlackRock\'s iShares Bitcoin Trust (IBIT) has been cited as the most traded Bitcoin exchange-traded product launch of all time, and the follow-on Ethereum exchange-traded products have seen notable inflows in recent months.'
      },
      {
        type: 'paragraph',
        text: 'These products make crypto more accessible, unlocking a significant amount of institutional capital that has historically been on the sidelines of the industry.'
      },
      {
        type: 'paragraph',
        text: 'Publicly traded "digital asset treasury" (DAT) companies — entities that hold crypto on their balance sheets, much like corporate treasuries hold cash — now collectively hold about 4% of the total Bitcoin and Ethereum in circulation. These DATs, combined with exchange-traded products, now hold around 10% of both Bitcoin\'s and Ethereum\'s token supplies.'
      },
      {
        type: 'heading',
        text: 'Stablecoins Went Mainstream'
      },
      {
        type: 'paragraph',
        text: 'Nothing signals crypto\'s maturity in 2025 more than the rise of stablecoins. In years past, stablecoins were used mostly to settle speculative crypto trades; as of the last couple years, they have become the fastest, cheapest, and most global way to send a dollar — in less than one second for less than one cent, almost anywhere in the world.'
      },
      {
        type: 'paragraph',
        text: 'And this year, they became the backbone of the onchain economy.'
      },
      {
        type: 'paragraph',
        text: 'Stablecoins have done $46 trillion in total transaction volume in the last year, up 106% from the year before. And, while not an apples-to-apples comparison since this figure mostly represents financial flows (versus retail payments for card networks), this is nearly three times that of Visa and approaching that of the ACH network, which plumbs the entire U.S. banking system.'
      },
      {
        type: 'paragraph',
        text: 'On an adjusted basis — a better measure of organic activity that attempts to filter out bots and other artificially inflationary activity — stablecoins have done $9 trillion in the last 12 months, up 87% from a year ago. This is more than five times PayPal\'s throughput, and more than half of Visa\'s.'
      },
      {
        type: 'paragraph',
        text: 'Adoption is accelerating. Monthly adjusted stablecoin transaction volume has exploded to new all-time highs, approaching $1.25 trillion in September 2025, alone.'
      },
      {
        type: 'paragraph',
        text: 'Notably, this activity was largely uncorrelated with broader crypto trading volume — indicating the non-speculative use of stablecoins and, more to the point, their product-market fit.'
      },
      {
        type: 'paragraph',
        text: 'The total stablecoin supply is also at record highs, now over $300 billion. The market\'s largest stablecoins dominate: Tether and USDC account for 87% of the total supply. $772 billion in stablecoin transactions (adjusted) were settled on Ethereum and Tron blockchains in September 2025, 64% of all transaction volume. While these two issuers and chains account for the majority of stablecoin activity, growth among new chains and issuers is also gaining steam.'
      },
      {
        type: 'paragraph',
        text: 'Stablecoins are now a global macroeconomic force: More than 1% of all U.S. dollars now exist as tokenized stablecoins on public blockchains, and stablecoins are now the #17 holder of U.S. Treasuries, up from #20 last year. Altogether, stablecoins hold over $150 billion in U.S. Treasuries — more than many sovereign nations.'
      },
      {
        type: 'paragraph',
        text: 'Meanwhile, the U.S. national debt is surging even as global demand for that debt wanes. For the first time in 30 years, foreign central banks hold more reserves in gold than U.S. Treasuries.'
      },
      {
        type: 'paragraph',
        text: 'But stablecoins are bucking the trend: Over 99% of stablecoins are denominated in USD, and they are projected to grow 10x to more than $3 trillion by 2030, presenting a potentially strong and sustainable source of demand for U.S. debt in the years ahead.'
      },
      {
        type: 'paragraph',
        text: 'Even as foreign central banks reduce their Treasury holdings, stablecoins are strengthening dollar dominance.'
      },
      {
        type: 'heading',
        text: 'Crypto is Stronger Than Ever in the United States'
      },
      {
        type: 'paragraph',
        text: 'The U.S. has reversed its formerly antagonistic stance toward crypto, reviving builder confidence.'
      },
      {
        type: 'paragraph',
        text: 'The passage of the GENIUS Act and the House approval of the CLARITY Act this year signal a bipartisan consensus that crypto is both here to stay and ready to thrive in the U.S. Together, these bills establish a framework for stablecoins, market structure, and digital asset oversight that balances innovation with investor protection. The legislation was complemented by Executive Order 14178, which reversed earlier anti-crypto directives and created a cross-agency task force to modernize federal digital-asset policy.'
      },
      {
        type: 'paragraph',
        text: 'The regulatory environment is clearing a path for builders to realize the potential of tokens as a new digital primitive, akin to what websites were for previous generations of the internet. With regulatory clarity, more network tokens will be able to complete their economic loop by generating revenue that accrues to tokenholders — creating a new economic engine for the internet that is self-sustaining and that gives more users a stake in the system.'
      },
      {
        type: 'heading',
        text: 'The World is Coming Onchain'
      },
      {
        type: 'paragraph',
        text: 'The onchain economy — once a niche playground for early adopters — has evolved into a multi-sector marketplace with tens of millions of monthly participants. Nearly one-fifth of all spot trading volume now happens on decentralized exchanges.'
      },
      {
        type: 'paragraph',
        text: 'With volumes up nearly 8x in the last year, perpetual futures have exploded among crypto speculators. Decentralized perps exchanges like Hyperliquid have processed trillions of dollars in trades, and generated more than $1 billion in annualized revenue this year — numbers that rival some centralized exchanges.'
      },
      {
        type: 'paragraph',
        text: 'Real-world assets (RWAs) — traditional assets such as U.S. Treasuries, money-market funds, private credit, and real estate that are represented onchain ("tokenized") — bridge crypto and traditional finance. The total market for tokenized RWAs sits at $30 billion, up nearly 4x in the last two years.'
      },
      {
        type: 'paragraph',
        text: 'Beyond finance, one of the most ambitious frontiers for blockchains in 2025 is DePIN, or decentralized physical infrastructure networks.'
      },
      {
        type: 'paragraph',
        text: 'Where DeFi reimagined finance, DePIN is reimagining physical infrastructure, including telecom and transportation networks, energy grids, and more. The opportunity is huge: The World Economic Forum projects the DePIN category will grow to $3.5 trillion by 2028.'
      },
      {
        type: 'paragraph',
        text: 'The Helium network is the best-known example. The grassroots wireless network now provides 5G cellular coverage to 1.4 million daily active users across more than 111,000 user-operated hotspots.'
      },
      {
        type: 'paragraph',
        text: 'Prediction markets broke into the mainstream during the 2024 U.S. presidential election cycle with the most popular platforms, Polymarket and Kalshi, seeing billions in combined monthly trading volume. Despite facing skepticism over whether they could sustain engagement outside election years, these platforms have seen trading volume increase nearly 5x since the start of 2025, nearing previous highs.'
      },
      {
        type: 'paragraph',
        text: 'In the absence of regulatory clarity, memecoins flourished. Over 13 million memecoins launched in the last year. This trend appears to be cooling down in recent months — there were 56% fewer launches in September than in January — as sound policy and bipartisan legislation clears the way for more productive blockchain use cases.'
      },
      {
        type: 'paragraph',
        text: 'NFT market volume is nowhere near its peak in 2022, but the number of monthly active buyers has been growing. These trends appear to signal a shift in consumer behavior from speculating to collecting, one enabled by the advent of cheaper blockspace across chains like Solana and Base.'
      },
      {
        type: 'heading',
        text: 'Blockchain Infrastructure is (Almost) Ready for Prime Time'
      },
      {
        type: 'paragraph',
        text: 'All of this activity wouldn\'t be possible without major advances in blockchain infrastructure.'
      },
      {
        type: 'paragraph',
        text: 'In just five years, aggregate transaction throughput across major blockchain networks has increased more than 100x. Then, blockchains processed fewer than 25 transactions per second. Now they process 3,400 transactions per second, on par with completed trades on the Nasdaq or Stripe\'s global throughput on Black Friday — and at a fraction of the historical cost.'
      },
      {
        type: 'paragraph',
        text: 'Among blockchain ecosystems, Solana has emerged as one of the most prominent. Its high-performance, low-fee architecture now underpins everything from DePIN projects to NFT marketplaces, with its native applications generating $3 billion in revenue in the past year. Planned upgrades are expected to double the network\'s capacity by year-end.'
      },
      {
        type: 'paragraph',
        text: 'Ethereum continues to execute on its scaling roadmap, with most of its economic activity migrating to L2s such as Arbitrum, Base, and Optimism. Average transaction costs on L2s have dropped from around $24 in 2021 to less than one cent today, making Ethereum-linked blockspace cheap and abundant.'
      },
      {
        type: 'paragraph',
        text: 'Bridges are allowing blockchains to interoperate. Protocols like LayerZero and Circle\'s Cross-Chain Transfer Protocol allow users to move assets across a multichain system. Hyperliquid\'s canonical bridge also reached $74 billion in volume year to date.'
      },
      {
        type: 'paragraph',
        text: 'Privacy is returning to the foreground and could be a prerequisite for wider adoption. Indicators of growing interest: Google searches related to crypto privacy surged in 2025; Zcash\'s shielded pool supply grew to nearly 4 million ZEC; and Railgun\'s transaction flows surpassed $200 million monthly.'
      },
      {
        type: 'paragraph',
        text: 'More signs of momentum: The Ethereum Foundation formed a new privacy team; Paxos partnered with Aleo on a private, compliant stablecoin (USAD); and the Office of Foreign Assets Control lifted sanctions on decentralized privacy protocol Tornado Cash. We expect this trend to gain even more momentum in the years ahead as crypto continues to go mainstream.'
      },
      {
        type: 'paragraph',
        text: 'Likewise, zero-knowledge (ZK) and succinct proof systems are rapidly evolving from decades-old academic research into critical infrastructure. Zero-knowledge systems are now integrated across rollups, compliance tools, and even mainstream web services — Google\'s new ZK identity system being one example.'
      },
      {
        type: 'paragraph',
        text: 'At the same time, blockchains are accelerating post-quantum roadmaps. Roughly $750 billion in bitcoin sits in addresses vulnerable to future quantum attacks. The U.S. government plans to transition federal systems to post-quantum cryptographic algorithms by 2035.'
      },
      {
        type: 'heading',
        text: 'AI and Crypto Are Converging'
      },
      {
        type: 'paragraph',
        text: 'Among other advancements, the launch of ChatGPT in 2022 brought AI to the forefront of public attention — with clear opportunities for crypto. From tracking provenance and IP licensing to providing payment rails for agents, crypto may be the solution for some of AI\'s most pressing challenges.'
      },
      {
        type: 'paragraph',
        text: 'Decentralized identity systems like World, which has verified more than 17 million people, can provide "proof of human" and help differentiate people from bots.'
      },
      {
        type: 'paragraph',
        text: 'Protocol standards such as x402 are emerging as a potential financial backbone for autonomous AI agents, helping them make micro-transactions, access APIs, and settle payments without intermediaries — an economy that Gartner estimates could reach $30 trillion by 2030.'
      },
      {
        type: 'paragraph',
        text: 'Meanwhile, AI\'s compute layer is consolidating around a handful of tech giants, raising concerns about centralization and censorship. Just two companies, OpenAI and Anthropic, control 88% of "AI-native" company revenue. Amazon, Microsoft, and Google control 63% of the cloud infrastructure market, while NVIDIA holds 94% of the data center GPU market. These imbalances have fueled double-digit quarterly net income growth for the "Magnificent 7" companies over the last few years, while earnings growth of the remaining S&P 493 in aggregate have failed to outpace inflation.'
      },
      {
        type: 'paragraph',
        text: 'Blockchains offer a counterbalance to the apparent centralizing forces of AI systems.'
      },
      {
        type: 'paragraph',
        text: 'Amid the AI excitement, some builders have pivoted away from crypto. Our analysis suggests that about 1,000 jobs shifted from crypto to AI since the launch of ChatGPT. But this number has been offset by an equivalent number of builders joining crypto from other areas, like traditional finance and tech.'
      },
      {
        type: 'heading',
        text: 'What\'s Next'
      },
      {
        type: 'paragraph',
        text: 'Where does that leave us? With greater regulatory clarity on the horizon, a path is clearing for tokens to generate real revenue via fees. TradFi and fintech adoption of crypto will continue to accelerate; stablecoins will upgrade legacy systems and democratize financial access globally; and new consumer products will bring the next wave of crypto users onchain.'
      },
      {
        type: 'paragraph',
        text: 'We have the infrastructure, the distribution, and hopefully soon, the regulatory clarity to take this technology mainstream. It\'s time to upgrade the financial system, rebuild global payment rails, and create the internet that the world deserves.'
      },
      {
        type: 'paragraph',
        text: 'Seventeen years in, crypto is leaving its adolescence and entering adulthood.'
      }
    ]
  },
  'manus-ai': {
    id: 'manus-ai',
    titleZh: 'Manus AI：能力、局限性与市场定位',
    titleEn: 'Manus AI: Capabilities, Limitations, and Market Position',
    dateZh: '2025年3月12日',
    dateEn: 'March 12, 2025',
    author: 'Siberia Fund',
    category: 'enterprise',
    image: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200',
    imageCaptionZh: 'Manus AI代表了自主AI代理技术的重大进步。',
    imageCaptionEn: 'Manus AI represents a significant advancement in autonomous AI agent technology.',
    leadZh: 'Manus AI由中国初创公司Monica（隶属于Butterfly Effect集团）开发，最近作为一个值得注意的自主AI代理出现，旨在跨各个领域执行复杂任务。它的推出引发了关于其能力、局限性以及在竞争激烈的AI领域中的地位的讨论。',
    leadEn: 'Manus AI, developed by the Chinese startup Monica under the Butterfly Effect group, has recently emerged as a notable autonomous AI agent designed to execute complex tasks across various domains. Its introduction has sparked discussions regarding its capabilities, limitations, and position within the competitive AI landscape.',
    contentZh: [
      {
        type: 'heading',
        text: 'Manus AI的能力'
      },
      {
        type: 'paragraph',
        text: 'Manus AI通过几个先进功能脱颖而出：'
      },
      {
        type: 'list',
        items: [
          '自主任务执行：与提供建议的传统AI助手不同，Manus AI可以独立执行任务，如整理简历、分析股票趋势和构建网站。',
          '多模态处理：该AI代理能够处理各种数据类型，包括文本、图像和代码，使其能够生成报告、分析视觉内容和自动化编程任务。',
          '高级工具集成：Manus AI无缝集成外部应用程序，如网络浏览器、代码编辑器和数据库管理系统，增强了其在自动化工作流程和决策过程中的实用性。'
        ]
      },
      {
        type: 'heading',
        text: '局限性和改进领域'
      },
      {
        type: 'paragraph',
        text: '尽管具有令人期待的功能，Manus AI仍表现出某些局限性：'
      },
      {
        type: 'list',
        items: [
          '易出错：批评者指出，Manus AI有出错的倾向，引发了对其在没有人工监督的情况下执行任务的可靠性的担忧。',
          '隐私和数据安全：存在关于数据隐私和安全的担忧，特别是关于Manus AI在任务执行期间如何处理用户信息。',
          '格式和呈现：评估指出，虽然Manus AI可以执行数据分析和生成报告，但这些输出的格式和呈现通常缺乏专业的精致度，表明这些领域需要改进。'
        ]
      },
      {
        type: 'heading',
        text: '市场比较和优势'
      },
      {
        type: 'paragraph',
        text: '在自主AI代理的竞争格局中，Manus AI在几个方面脱颖而出：'
      },
      {
        type: 'list',
        items: [
          '性能基准：据报道，Manus AI在GAIA基准测试中取得了最先进的性能，在现实世界问题解决任务中超越了OpenAI的GPT-4和微软的AI系统等模型。',
          '自主功能：其自主执行任务的能力使Manus AI成为比主要提供建议的模型（如GPT-4）更通用、更强大的助手。'
        ]
      }
    ],
    contentEn: [
      {
        type: 'heading',
        text: 'Capabilities of Manus AI'
      },
      {
        type: 'paragraph',
        text: 'Manus AI distinguishes itself through several advanced features:'
      },
      {
        type: 'list',
        items: [
          'Autonomous Task Execution: Unlike traditional AI assistants that provide suggestions, Manus AI can independently perform tasks such as sorting résumés, analyzing stock trends, and building websites.',
          'Multi-Modal Processing: The AI agent is capable of handling various data types, including text, images, and code, enabling it to generate reports, analyze visual content, and automate programming tasks.',
          'Advanced Tool Integration: Manus AI seamlessly integrates with external applications like web browsers, code editors, and database management systems, enhancing its utility in automating workflows and decision-making processes.'
        ]
      },
      {
        type: 'heading',
        text: 'Limitations and Areas for Improvement'
      },
      {
        type: 'paragraph',
        text: 'Despite its promising features, Manus AI exhibits certain limitations:'
      },
      {
        type: 'list',
        items: [
          'Error Susceptibility: Critics have pointed out that Manus AI has a tendency to make errors, raising concerns about its reliability in executing tasks without human oversight.',
          'Privacy and Data Security: There are apprehensions regarding data privacy and security, particularly concerning how Manus AI handles user information during task execution.',
          'Formatting and Presentation: Evaluations have noted that while Manus AI can perform data analysis and generate reports, the formatting and presentation of these outputs often lack professional polish, indicating a need for improvement in these areas.'
        ]
      },
      {
        type: 'heading',
        text: 'Market Comparison and Benefits'
      },
      {
        type: 'paragraph',
        text: 'In the competitive landscape of autonomous AI agents, Manus AI stands out in several respects:'
      },
      {
        type: 'list',
        items: [
          'Performance Benchmarks: Manus AI has reportedly achieved state-of-the-art performance in the GAIA benchmark, surpassing models like OpenAI\'s GPT-4 and Microsoft\'s AI systems in real-world problem-solving tasks.',
          'Autonomous Functionality: Its ability to autonomously execute tasks positions Manus AI as a more versatile and powerful assistant compared to models that primarily offer suggestions, such as GPT-4.'
        ]
      }
    ]
  },
  'global-economy-2025': {
    id: 'global-economy-2025',
    titleZh: '2025年全球经济增长将加速，尽管面临挑战',
    titleEn: 'Global economic growth set to strengthen in 2025 despite hurdles',
    dateZh: '2024年12月10日',
    dateEn: 'Dec 10, 2024',
    author: 'GlobalData',
    category: 'outlook',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
    imageCaptionZh: '全球经济在2025年将实现加速增长，尽管面临地缘政治紧张局势和政策不确定性等挑战。',
    imageCaptionEn: 'The global economy is poised for accelerated growth in 2025 despite challenges such as geopolitical tensions and policy uncertainties.',
    leadZh: '随着我们步入2025年，全球经济有望实现加速增长，尽管面临地缘政治紧张局势和可能扰乱增长并加深区域不平等的政策转变等挑战。新政府下的美国政策方向可能重塑国际贸易、货币政策和经济合作。从积极的一面来看，通胀缓解和主要经济体央行的支持性措施带来了乐观情绪。在此背景下，根据GlobalData的预测，全球经济预计将在2025年增长2.54%，高于2024年预计的2.52%。',
    leadEn: 'As we step into 2025, the global economy is poised for accelerated growth despite challenges such as geopolitical tensions and potential shifts in policy that could disrupt growth and deepen regional inequalities. The direction of US policy under a new administration could reshape international trade, monetary policy, and economic cooperation. On the brighter side, easing inflation and supportive measures from central banks across key economies offer a sense of optimism. Against this backdrop, the global economy is forecast to grow by 2.54% in 2025, up from a projected 2.52% growth in 2024, according to GlobalData.',
    contentZh: [
      {
        type: 'heading',
        text: '区域增长展望'
      },
      {
        type: 'paragraph',
        text: 'GlobalData最新报告《全球宏观经济展望 - 2024年第四季度更新》预测，欧洲（从2024年的1.40%增至2025年的1.52%）、亚太地区（从3.51%增至3.63%）和中东及非洲（MEA）（从2.31%增至3.74%）的增长将加速。随着全球通胀压力缓解，世界各地的央行采取了宽松的货币政策，预计将刺激消费和投资，支持整体全球增长。'
      },
      {
        type: 'heading',
        text: '通胀趋势与货币政策'
      },
      {
        type: 'paragraph',
        text: 'GlobalData预测全球通胀率将从2023年的5.80%降至2024年的4.28%，预计2025年将进一步降至3.45%。2025年，所有地区的通胀预计都将下降：美洲（不包括阿根廷和委内瑞拉）从5.04%降至4.54%，亚太地区从4.54%降至4.31%，欧洲从4.17%降至3.28%，中东及非洲从24.85%降至16.37%。'
      }
    ],
    contentEn: [
      {
        type: 'heading',
        text: 'Regional Growth Outlook'
      },
      {
        type: 'paragraph',
        text: 'GlobalData\'s latest report "Global Macroeconomic Outlook – Q4 2024 Update" projects increased growth in Europe (1.40% in 2024 to 1.52% in 2025), Asia-Pacific (3.51% to 3.63%), and the Middle East & Africa (MEA) (2.31% to 3.74%). As global inflationary pressures ease, central banks worldwide have adopted accommodative monetary policies, which are expected to stimulate consumption and investment, supporting overall global growth.'
      },
      {
        type: 'heading',
        text: 'Inflation Trends and Monetary Policy'
      },
      {
        type: 'paragraph',
        text: 'GlobalData forecasts the global inflation rate to decrease from 5.80% in 2023 to 4.28% in 2024, with a further decline to 3.45% anticipated in 2025. In 2025, inflation is expected to drop across all regions: the Americas (excluding Argentina and Venezuela) to 4.54% from 5.04%, Asia-Pacific to 4.31% from 4.54%, Europe to 3.28% from 4.17%, and the MEA to 16.37% from 24.85%.'
      }
    ]
  }
};

// 从 localStorage 获取新闻数据
// ============================================================================
// Data Conversion Functions (API ↔ Local Format)
// ============================================================================

/**
 * Convert API Article format to local NewsArticle format
 */
function convertApiToLocal(apiArticle: Article): NewsArticle {
  // Parse published date
  const publishedDate = new Date(apiArticle.published_at);

  // Format dates
  const dateZh = publishedDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateEn = publishedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Convert content blocks
  const convertContent = (blocks: ApiContentBlock[]) => {
    return blocks.map(block => {
      if (block.type === 'list') {
        return { type: 'list' as const, items: block.items || [] };
      } else if (block.type === 'heading') {
        return { type: 'heading' as const, text: block.text || '', level: block.level };
      } else if (block.type === 'markdown') {
        // ✅ 保留 markdown 类型，以便 MarkdownRenderer 可以正确解析
        return { type: 'markdown' as const, text: block.text || '' };
      } else if (block.type === 'paragraph') {
        return { type: 'paragraph' as const, text: block.text || '' };
      } else if (block.type === 'image') {
        // ✅ 保留图片块的所有属性
        return {
          type: 'image' as const,
          url: block.url || '',
          caption: block.caption || '',
          width: block.width,
          height: block.height
        };
      } else if (block.type === 'code') {
        // ✅ 保留代码块的所有属性
        return { type: 'code' as const, text: block.text || '', language: block.language || 'text' };
      } else if (block.type === 'quote') {
        // ✅ 保留引用块的所有属性
        return { type: 'quote' as const, text: block.text || '' };
      } else {
        // 未知类型，转换为段落
        return { type: 'paragraph' as const, text: block.text || '' };
      }
    });
  };

  return {
    id: apiArticle.id,
    titleZh: apiArticle.title_zh,
    titleEn: apiArticle.title_en,
    dateZh,
    dateEn,
    author: apiArticle.author,
    category: apiArticle.category, // Include category from API
    image: apiArticle.image_url || '',
    imageCaptionZh: '', // Not in API model, use empty string
    imageCaptionEn: '', // Not in API model, use empty string
    leadZh: apiArticle.summary_zh,
    leadEn: apiArticle.summary_en,
    contentZh: convertContent(apiArticle.content_zh),
    contentEn: convertContent(apiArticle.content_en),
  };
}

/**
 * Convert local NewsArticle format to API Article format
 */
function convertLocalToApi(newsArticle: NewsArticle): Partial<Article> {
  // Convert content blocks
  const convertContent = (blocks: Array<{ type: 'paragraph' | 'heading' | 'list' | 'image' | 'code' | 'quote' | 'markdown'; text?: string; items?: string[]; url?: string; caption?: string; language?: string; level?: number; width?: number; height?: number }>): ApiContentBlock[] => {
    // If there's only one block and it contains Markdown syntax (headings, images, etc.),
    // treat it as a single markdown block
    if (blocks.length === 1 && blocks[0].type === 'paragraph') {
      const text = blocks[0].text || '';
      const hasMarkdownSyntax =
        text.includes('![') ||  // Markdown images
        text.includes('<img') || // HTML images
        text.match(/^#{1,6}\s/m) || // Markdown headings
        text.includes('\n\n'); // Multiple paragraphs

      if (hasMarkdownSyntax) {
        // Send as a single markdown block
        return [{ type: 'markdown', text: text }];
      }
    }

    // Otherwise, convert each block individually
    return blocks.map(block => {
      if (block.type === 'list') {
        return { type: 'list', items: block.items || [] };
      } else if (block.type === 'heading') {
        return { type: 'heading', text: block.text || '', level: block.level };
      } else if (block.type === 'image') {
        // ✅ 保留图片块的所有属性
        return {
          type: 'image',
          url: block.url || '',
          caption: block.caption || '',
          width: block.width,
          height: block.height
        };
      } else if (block.type === 'code') {
        // ✅ 保留代码块的所有属性
        return { type: 'code', text: block.text || '', language: block.language || 'text' };
      } else if (block.type === 'quote') {
        // ✅ 保留引用块的所有属性
        return { type: 'quote', text: block.text || '' };
      } else if (block.type === 'markdown') {
        // ✅ 保留 markdown 块
        return { type: 'markdown', text: block.text || '' };
      } else {
        // paragraph 类型
        return { type: 'paragraph', text: block.text || '' };
      }
    });
  };

  // ⚠️ 注意：NewsArticle 的 leadZh/leadEn 实际上对应后端的 summary_zh/summary_en
  // 因为历史原因，前端的命名和后端不一致
  const apiData: any = {
    id: newsArticle.id,
    title_zh: newsArticle.titleZh,
    title_en: newsArticle.titleEn,
    summary_zh: newsArticle.leadZh,  // 前端的 leadZh 对应后端的 summary_zh
    summary_en: newsArticle.leadEn,  // 前端的 leadEn 对应后端的 summary_en
    content_zh: convertContent(newsArticle.contentZh),
    content_en: convertContent(newsArticle.contentEn),
    author: newsArticle.author,
    category: newsArticle.category || 'headline',
    status: 'published' as const,
  };

  // Only add optional fields if they have values
  if (newsArticle.image) {
    apiData.image_url = newsArticle.image;
  }
  if (newsArticle.imageCaptionZh) {
    apiData.image_caption_zh = newsArticle.imageCaptionZh;
  }
  if (newsArticle.imageCaptionEn) {
    apiData.image_caption_en = newsArticle.imageCaptionEn;
  }

  return apiData;
}

// ============================================================================
// Cache Management
// ============================================================================

const CACHE_KEY = 'newsArticles_cache';
const CACHE_TIMESTAMP_KEY = 'newsArticles_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;

  const cacheTime = parseInt(timestamp, 10);
  const now = Date.now();
  return (now - cacheTime) < CACHE_DURATION;
}

/**
 * Get articles from cache
 */
function getFromCache(): Record<string, NewsArticle> | null {
  if (!isCacheValid()) return null;

  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch (e) {
    console.error('Failed to parse cached articles:', e);
    return null;
  }
}

/**
 * Save articles to cache
 */
function saveToCache(articles: Record<string, NewsArticle>): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
}

/**
 * Clear cache
 */
function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

// ============================================================================
// Public API Functions (with API integration)
// ============================================================================

/**
 * Get all news articles (from API only - no cache)
 */
export async function getNewsArticles(): Promise<Record<string, NewsArticle>> {
  // Fetch from API directly (no cache)
  try {
    console.log('🌐 Fetching articles from API...');
    const response = await articlesAPI.list({
      page_size: 100,
      status: 'published'
    });

    const articles: Record<string, NewsArticle> = {};
    response.items.forEach(apiArticle => {
      articles[apiArticle.id] = convertApiToLocal(apiArticle);
    });

    console.log(`✅ Fetched ${response.items.length} articles from API`);
    return articles;
  } catch (error) {
    console.error('❌ Failed to fetch articles from API:', error);
    // Return empty object - always use real data from database
    return {};
  }
}

/**
 * Get single news article by ID (from API)
 */
export async function getNewsArticle(id: string): Promise<NewsArticle | null> {
  try {
    console.log(`🌐 Fetching article ${id} from API...`);
    const apiArticle = await articlesAPI.get(id);
    return convertApiToLocal(apiArticle);
  } catch (error) {
    console.error(`❌ Failed to fetch article ${id} from API:`, error);

    // Fallback to cache or default
    const cached = getFromCache();
    if (cached && cached[id]) {
      console.log('📦 Using cached article');
      return cached[id];
    }

    // Fallback to default articles
    if (defaultNewsArticles[id]) {
      console.log('📚 Using default article');
      return defaultNewsArticles[id];
    }

    return null;
  }
}

/**
 * Update news article (save to API only - no cache)
 */
export async function updateNewsArticle(id: string, article: NewsArticle): Promise<void> {
  try {
    console.log(`🌐 Updating article ${id} via API...`);
    console.log('📝 Article data:', article);
    const apiData = convertLocalToApi(article);
    console.log('📤 API data to be sent:', apiData);

    // Validate required fields
    if (!apiData.title_zh || apiData.title_zh.trim().length === 0) {
      throw new Error('中文标题不能为空');
    }
    if (!apiData.title_en || apiData.title_en.trim().length === 0) {
      throw new Error('英文标题不能为空');
    }
    if (!apiData.summary_zh || apiData.summary_zh.trim().length < 20) {
      throw new Error('中文摘要至少需要20个字符');
    }
    if (!apiData.summary_en || apiData.summary_en.trim().length < 20) {
      throw new Error('英文摘要至少需要20个字符');
    }

    console.log('✅ Validation passed, sending to API...');
    await articlesAPI.update(id, apiData);
    console.log('✅ Article updated successfully');
  } catch (error) {
    console.error(`❌ Failed to update article ${id}:`, error);
    throw error;
  }
}

/**
 * Create new article (save to API only - no cache)
 */
export async function createNewsArticle(article: NewsArticle): Promise<void> {
  try {
    console.log('🌐 Creating new article via API...');
    console.log('📝 Article data:', article);
    const apiData = convertLocalToApi(article);

    // Remove id field when creating new article (backend will generate UUID)
    // This is important because the article might have a non-UUID id (e.g., 'manus-ai')
    delete apiData.id;

    console.log('📤 API data to be sent:', apiData);

    // Validate required fields
    if (!apiData.title_zh || apiData.title_zh.trim().length === 0) {
      throw new Error('中文标题不能为空');
    }
    if (!apiData.title_en || apiData.title_en.trim().length === 0) {
      throw new Error('英文标题不能为空');
    }
    if (!apiData.summary_zh || apiData.summary_zh.trim().length < 20) {
      throw new Error('中文摘要至少需要20个字符');
    }
    if (!apiData.summary_en || apiData.summary_en.trim().length < 20) {
      throw new Error('英文摘要至少需要20个字符');
    }

    console.log('✅ Validation passed, sending to API...');
    await articlesAPI.create(apiData as any);
    console.log('✅ Article created successfully');
  } catch (error) {
    console.error('❌ Failed to create article:', error);
    throw error;
  }
}

/**
 * Delete article (via API only - no cache)
 */
export async function deleteNewsArticle(id: string): Promise<void> {
  try {
    console.log(`🌐 Deleting article ${id} via API...`);
    await articlesAPI.delete(id);
    console.log('✅ Article deleted successfully');
  } catch (error) {
    console.error(`❌ Failed to delete article ${id}:`, error);
    throw error;
  }
}

// ============================================================================
// Legacy Functions (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use getNewsArticles() instead (now async)
 */
export function getNewsArticlesSync(): Record<string, NewsArticle> {
  const cached = getFromCache();
  if (cached) return cached;
  return defaultNewsArticles;
}

/**
 * Save articles to localStorage (legacy)
 * @deprecated Cache is now managed automatically
 */
export function saveNewsArticles(articles: Record<string, NewsArticle>): void {
  saveToCache(articles);
}

/**
 * Reset to default articles
 * @deprecated Not needed with API integration
 */
export function resetNewsArticles(): void {
  clearCache();
}

