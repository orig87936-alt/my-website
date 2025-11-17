// 实时新闻数据
// 这个文件存储新闻页面的实时新闻列表
// 管理员可以通过编辑这个文件来添加、修改或删除新闻
// T045-T050: 支持8种语言

import { MultiLangContent } from './featuredNewsData';

export interface LiveNewsItem {
  id: string;
  time: string;
  readTime: MultiLangContent;
  title: MultiLangContent;
  category: 'business' | 'technology' | 'finance' | 'research';
  summary: MultiLangContent;
}

// 实时新闻列表
// 添加新闻：在数组开头添加新的对象
// 删除新闻：删除对应的对象
// 修改新闻：编辑对应对象的内容
export const liveNewsList: LiveNewsItem[] = [
  {
    id: 'live-1',
    time: '17:44',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': 'Gate将首发上线Dino Tycoon (TYCOON)现货交易',
      'zh-TW': 'Gate將首發上線Dino Tycoon (TYCOON)現貨交易',
      'en': 'Gate to Launch Dino Tycoon (TYCOON) Spot Trading'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，据官方公告，Gate 将于 11 月 4 日 17:00（UTC+8）首发上线 Dino Tycoon (TYCOON) 现货交易。',
      'zh-TW': 'PANews 11月2日消息，據官方公告，Gate 將於 11 月 4 日 17:00（UTC+8）首發上線 Dino Tycoon (TYCOON) 現貨交易。',
      'en': 'PANews November 2nd - According to official announcement, Gate will launch Dino Tycoon (TYCOON) spot trading on November 4th at 17:00 (UTC+8).'
    }
  },
  {
    id: 'live-2',
    time: '17:40',
    readTime: {
      'zh-CN': '3分钟阅读',
      'zh-TW': '3分鐘閱讀',
      'en': '3 min read'
    },
    title: {
      'zh-CN': 'Ethereum Hong Kong Hub在2025香港数字资产论坛公布成立',
      'zh-TW': 'Ethereum Hong Kong Hub在2025香港數字資產論壇公布成立',
      'en': 'Ethereum Hong Kong Hub Announced at 2025 Hong Kong Digital Assets Forum'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，在今日举办的2025香港数字资产论坛上，Ethereum Hong Kong Hub 正式揭牌成立。香港立法会议员（科技创新界）邱达根、以太坊基金会执行董事 Tomasz Stańczak、SNZ Holding 首席执行官兼联合创始人施展华及首席投资官王克一共同为该创新基地揭牌。该基地由 SNZ发起，以太坊基金会参与共建，生态伙伴代表和与会嘉宾共同见证。',
      'zh-TW': 'PANews 11月2日消息，在今日舉辦的2025香港數字資產論壇上，Ethereum Hong Kong Hub 正式揭牌成立。香港立法會議員（科技創新界）邱達根、以太坊基金會執行董事 Tomasz Stańczak、SNZ Holding 首席執行官兼聯合創始人施展華及首席投資官王克一共同為該創新基地揭牌。該基地由 SNZ發起，以太坊基金會參與共建，生態夥伴代表和與會嘉賓共同見證。',
      'en': 'PANews November 2nd - At today\'s 2025 Hong Kong Digital Assets Forum, Ethereum Hong Kong Hub was officially unveiled. Hong Kong Legislative Council Member (Technology Innovation) Qiu Dagen, Ethereum Foundation Executive Director Tomasz Stańczak, SNZ Holding CEO and Co-founder Shi Zhanhua, and Chief Investment Officer Wang Keyi jointly unveiled the innovation hub.'
    }
  },
  {
    id: 'live-3',
    time: '17:28',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': 'Deribit亚太商务负责人：目前币场活动性对比"10.11崩盘"前还差15%-20%',
      'zh-TW': 'Deribit亞太商務負責人：目前幣場活動性對比"10.11崩盤"前還差15%-20%',
      'en': 'Deribit APAC Head: Current Market Activity 15%-20% Lower Than Pre-"10.11 Crash"'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，Deribit 亚太商务负责人 Lin 在 X 平台发文表示，目前币场活动性对比"10.11 崩盘"前还差 15%-20%，美股又是跌伏的，所以资金大多被吸走，美股还在创新高，只要美股跌住，等流动性年底还是有行情，但近期很难有大涨。',
      'zh-TW': 'PANews 11月2日消息，Deribit 亞太商務負責人 Lin 在 X 平台發文表示，目前幣場活動性對比"10.11 崩盤"前還差 15%-20%，美股又是跌伏的，所以資金大多被吸走，美股還在創新高，只要美股跌住，等流動性年底還是有行情，但近期很難有大漲。',
      'en': 'PANews November 2nd - Deribit APAC Head Lin posted on X platform that current market activity is 15%-20% lower than pre-"10.11 crash" levels. US stocks are volatile, absorbing most of the capital. As long as US stocks decline, there may be opportunities by year-end, but significant gains are unlikely in the near term.'
    }
  },
  {
    id: 'live-4',
    time: '17:12',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '全网DASH合约总持仓突破7000万美元，创历史新高',
      'zh-TW': '全網DASH合約總持倉突破7000萬美元，創歷史新高',
      'en': 'Total DASH Contract Open Interest Breaks $70M, Hits All-Time High'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，据Coinglass最新数据显示，全网DASH合约总持仓达到93.65万枚，持仓市值突破7000万美元，达到7110.23万美元，创历史新高，过去24小时增幅84.41%；其中币安DASH合约持仓量触及50.01万枚，持仓市值为1723.58万美元；Bybit的DASH合约持仓量触及22.72万枚，持仓市值为1723.58万美元。',
      'zh-TW': 'PANews 11月2日消息，據Coinglass最新數據顯示，全網DASH合約總持倉達到93.65萬枚，持倉市值突破7000萬美元，達到7110.23萬美元，創歷史新高，過去24小時增幅84.41%；其中幣安DASH合約持倉量觸及50.01萬枚，持倉市值為1723.58萬美元；Bybit的DASH合約持倉量觸及22.72萬枚，持倉市值為1723.58萬美元。',
      'en': 'PANews November 2nd - According to Coinglass data, total DASH contract open interest reached 936,500 DASH, with a market value exceeding $70M at $71.1M, hitting an all-time high with an 84.41% increase in the past 24 hours. Binance DASH contract holdings reached 500,100 DASH worth $17.24M, while Bybit\'s DASH contract holdings reached 227,200 DASH worth $17.24M.'
    }
  },
  {
    id: 'live-5',
    time: '16:58',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '数据：10月交易活动排名前五的区块链生态系统均实现正增长',
      'zh-TW': '數據：10月交易活動排名前五的區塊鏈生態系統均實現正增長',
      'en': 'Data: Top 5 Blockchain Ecosystems by Trading Activity All Achieved Positive Growth in October'
    },
    category: 'research',
    summary: {
      'zh-CN': 'PANews 11月2日消息，据Routescan 发推披露，10 月份交易活动排名前五的区块链生态系统均实现正增长：Base 增长 8.5%，Solana 增长 6.3%，BNB Chain 增长 5.2%，Polygon 增长 4.7%，Arbitrum 增长 3.9%。',
      'zh-TW': 'PANews 11月2日消息，據Routescan 發推披露，10 月份交易活動排名前五的區塊鏈生態系統均實現正增長：Base 增長 8.5%，Solana 增長 6.3%，BNB Chain 增長 5.2%，Polygon 增長 4.7%，Arbitrum 增長 3.9%。',
      'en': 'PANews November 2nd - According to Routescan, the top 5 blockchain ecosystems by trading activity all achieved positive growth in October: Base +8.5%, Solana +6.3%, BNB Chain +5.2%, Polygon +4.7%, Arbitrum +3.9%.'
    }
  },
  {
    id: 'live-6',
    time: '16:45',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '欧洲刑警组织承诺将加大国际合作和投入以调查加密货币犯罪',
      'zh-TW': '歐洲刑警組織承諾將加大國際合作和投入以調查加密貨幣犯罪',
      'en': 'Europol Commits to Increased International Cooperation to Investigate Crypto Crime'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，据Decrypt 报道，欧洲刑警组织欧洲金融和经济犯罪中心（EFECC）负责人本周警告称，利用加密货币和区块链进行犯罪活动的手段"日益复杂"，并承诺将加大国际合作和投入以调查此类犯罪。',
      'zh-TW': 'PANews 11月2日消息，據Decrypt 報道，歐洲刑警組織歐洲金融和經濟犯罪中心（EFECC）負責人本週警告稱，利用加密貨幣和區塊鏈進行犯罪活動的手段"日益複雜"，並承諾將加大國際合作和投入以調查此類犯罪。',
      'en': 'PANews November 2nd - According to Decrypt, the head of Europol\'s European Financial and Economic Crime Centre (EFECC) warned this week that criminal activities using cryptocurrency and blockchain are becoming "increasingly sophisticated" and pledged to increase international cooperation and investment to investigate such crimes.'
    }
  },
  {
    id: 'live-7',
    time: '16:32',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '萨尔瓦多过去7日增持6枚比特币，目前持仓达6367.18枚',
      'zh-TW': '薩爾瓦多過去7日增持6枚比特幣，目前持倉達6367.18枚',
      'en': 'El Salvador Adds 6 BTC in Past 7 Days, Total Holdings Reach 6,367.18 BTC'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，萨尔瓦多过去7日共增持6枚比特币，目前其比特币持仓达6,367.18枚，总价值达7.03亿美元。',
      'zh-TW': 'PANews 11月2日消息，薩爾瓦多過去7日共增持6枚比特幣，目前其比特幣持倉達6,367.18枚，總價值達7.03億美元。',
      'en': 'PANews November 2nd - El Salvador has added 6 BTC in the past 7 days, bringing its total Bitcoin holdings to 6,367.18 BTC, valued at $703 million.'
    }
  },
  {
    id: 'live-8',
    time: '16:18',
    readTime: {
      'zh-CN': '3分钟阅读',
      'zh-TW': '3分鐘閱讀',
      'en': '3 min read'
    },
    title: {
      'zh-CN': '观点：代币化银行存款缺乏稳定币的灵活性和技术特性',
      'zh-TW': '觀點：代幣化銀行存款缺乏穩定幣的靈活性和技術特性',
      'en': 'Opinion: Tokenized Bank Deposits Lack Flexibility and Technical Features of Stablecoins'
    },
    category: 'research',
    summary: {
      'zh-CN': 'PANews 11月2日消息，据Cointelegraph 报道，银行和金融机构已经开始尝试代币化银行存款，即将银行余额记录在区块链上，哥伦比亚商学院兼职教授Omid Malekan 认为，代币化银行存款缺乏稳定币的灵活性和技术特性，稳定币可以在任何时间、任何地点使用，而代币化存款则受到银行营业时间和监管限制的约束。',
      'zh-TW': 'PANews 11月2日消息，據Cointelegraph 報道，銀行和金融機構已經開始嘗試代幣化銀行存款，即將銀行餘額記錄在區塊鏈上，哥倫比亞商學院兼職教授Omid Malekan 認為，代幣化銀行存款缺乏穩定幣的靈活性和技術特性，穩定幣可以在任何時間、任何地點使用，而代幣化存款則受到銀行營業時間和監管限制的約束。',
      'en': 'PANews November 2nd - According to Cointelegraph, banks and financial institutions have begun experimenting with tokenized bank deposits, recording bank balances on blockchain. Columbia Business School adjunct professor Omid Malekan argues that tokenized bank deposits lack the flexibility and technical features of stablecoins, which can be used anytime, anywhere, while tokenized deposits are constrained by banking hours and regulatory restrictions.'
    }
  },
  {
    id: 'live-9',
    time: '16:05',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': 'FTX债权人实际加密资产回收率仅9%至46%',
      'zh-TW': 'FTX債權人實際加密資產回收率僅9%至46%',
      'en': 'FTX Creditors\' Actual Crypto Asset Recovery Rate Only 9% to 46%'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，FTX 债权人代表Sunil 发推表示，FTX债权人实际上并未获得全额偿付，实际加密货币回收率为9%至46%，但考虑到支付143%时加密货币价格较高，实际回收率可能更低。额外回收将来自部分项目对FTX 债权人的空投。',
      'zh-TW': 'PANews 11月2日消息，FTX 債權人代表Sunil 發推表示，FTX債權人實際上並未獲得全額償付，實際加密貨幣回收率為9%至46%，但考慮到支付143%時加密貨幣價格較高，實際回收率可能更低。額外回收將來自部分項目對FTX 債權人的空投。',
      'en': 'PANews November 2nd - FTX creditor representative Sunil posted that FTX creditors did not actually receive full repayment, with actual crypto recovery rates of 9% to 46%. Considering the higher crypto prices when 143% was paid, actual recovery rates may be even lower. Additional recovery will come from airdrops to FTX creditors from certain projects.'
    }
  },
  {
    id: 'live-10',
    time: '15:52',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '本周NFT交易额下跌约30%至9580万美元',
      'zh-TW': '本週NFT交易額下跌約30%至9580萬美元',
      'en': 'Weekly NFT Trading Volume Drops ~30% to $95.8M'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，据Crypto.news 报道，CryptoSlam 数据显示，过去一周NFT 交易额下跌约30%至9580 万美元。以太坊仍然是NFT 交易的主导区块链，交易额为3660 万美元，环比下降32%。本周最昂贵的NFT 销售是CryptoPunks #7378，以212,36.44 美元（51 ETH）的价格售出。',
      'zh-TW': 'PANews 11月2日消息，據Crypto.news 報道，CryptoSlam 數據顯示，過去一週NFT 交易額下跌約30%至9580 萬美元。以太坊仍然是NFT 交易的主導區塊鏈，交易額為3660 萬美元，環比下降32%。本週最昂貴的NFT 銷售是CryptoPunks #7378，以212,36.44 美元（51 ETH）的價格售出。',
      'en': 'PANews November 2nd - According to Crypto.news, CryptoSlam data shows NFT trading volume dropped ~30% to $95.8M in the past week. Ethereum remains the dominant blockchain for NFT trading with $36.6M in volume, down 32% week-over-week. The most expensive NFT sale this week was CryptoPunks #7378, sold for $212,364.44 (51 ETH).'
    }
  },
  {
    id: 'live-11',
    time: '15:38',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '纳斯达克上市的以太坊财库公司FG Nexus本周增持约1.5万枚ETH',
      'zh-TW': '納斯達克上市的以太坊財庫公司FG Nexus本週增持約1.5萬枚ETH',
      'en': 'Nasdaq-Listed Ethereum Treasury Company FG Nexus Adds ~15K ETH This Week'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月2日消息，纳斯达克上市的以太坊财库公司FG Nexus 本周增持约1.5 万枚ETH，目前该公司持有约5.5 万枚ETH，价值约2.15 亿美元。',
      'zh-TW': 'PANews 11月2日消息，納斯達克上市的以太坊財庫公司FG Nexus 本週增持約1.5 萬枚ETH，目前該公司持有約5.5 萬枚ETH，價值約2.15 億美元。',
      'en': 'PANews November 2nd - Nasdaq-listed Ethereum treasury company FG Nexus added approximately 15,000 ETH this week, bringing its total holdings to approximately 55,000 ETH, valued at around $215 million.'
    }
  },
  {
    id: 'live-12',
    time: '15:25',
    readTime: {
      'zh-CN': '3分钟阅读',
      'zh-TW': '3分鐘閱讀',
      'en': '3 min read'
    },
    title: {
      'zh-CN': 'ZKsync联合创始人：Atlas升级带来超过1.5万TPS交易速度',
      'zh-TW': 'ZKsync聯合創始人：Atlas升級帶來超過1.5萬TPS交易速度',
      'en': 'ZKsync Co-founder: Atlas Upgrade Brings Over 15K TPS Transaction Speed'
    },
    category: 'technology',
    summary: {
      'zh-CN': 'PANews 11月1日消息，ZKsync 联合创始人Alex 在X 平台发布的《以太坊现已成为ZKsync的主要资本枢纽》文章中称，ZKsync Atlas 升级带来了超过1.5 万TPS 的交易速度、1 秒的ZK 证明生成时间以及显著降低的交易成本。',
      'zh-TW': 'PANews 11月1日消息，ZKsync 聯合創始人Alex 在X 平台發布的《以太坊現已成為ZKsync的主要資本樞紐》文章中稱，ZKsync Atlas 升級帶來了超過1.5 萬TPS 的交易速度、1 秒的ZK 證明生成時間以及顯著降低的交易成本。',
      'en': 'PANews November 1st - ZKsync co-founder Alex stated in an article titled "Ethereum is Now ZKsync\'s Primary Capital Hub" on X platform that the ZKsync Atlas upgrade brings over 15,000 TPS transaction speed, 1-second ZK proof generation time, and significantly reduced transaction costs.'
    }
  },
  {
    id: 'live-13',
    time: '15:10',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '比特币生产成本达到112,084美元',
      'zh-TW': '比特幣生產成本達到112,084美元',
      'en': 'Bitcoin Production Cost Reaches $112,084'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月1日消息，据MarcoMicro数据显示，目前比特币生产成本达到112,084美元。',
      'zh-TW': 'PANews 11月1日消息，據MarcoMicro數據顯示，目前比特幣生產成本達到112,084美元。',
      'en': 'PANews November 1st - According to MarcoMicro data, the current Bitcoin production cost has reached $112,084.'
    }
  },
  {
    id: 'live-14',
    time: '14:55',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '港股上市公司恒月控股购入6.12枚BTC，总持仓达35.6枚',
      'zh-TW': '港股上市公司恒月控股購入6.12枚BTC，總持倉達35.6枚',
      'en': 'Hong Kong-Listed Hengyue Holdings Purchases 6.12 BTC, Total Holdings Reach 35.6 BTC'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月1日消息，据港交所公告，港股上市公司恒月控股披露已利用可用现金储备斥资524.2万港元购入6.12枚BTC，截至目前该公司已通过公开市场买入总计35.6枚比特币，价值约合3,930万港元。',
      'zh-TW': 'PANews 11月1日消息，據港交所公告，港股上市公司恒月控股披露已利用可用現金儲備斥資524.2萬港元購入6.12枚BTC，截至目前該公司已通過公開市場買入總計35.6枚比特幣，價值約合3,930萬港元。',
      'en': 'PANews November 1st - According to Hong Kong Stock Exchange announcement, Hong Kong-listed Hengyue Holdings disclosed it has used available cash reserves to purchase 6.12 BTC for HK$5.242 million. To date, the company has purchased a total of 35.6 Bitcoin through the open market, valued at approximately HK$39.3 million.'
    }
  },
  {
    id: 'live-15',
    time: '14:40',
    readTime: {
      'zh-CN': '2分钟阅读',
      'zh-TW': '2分鐘閱讀',
      'en': '2 min read'
    },
    title: {
      'zh-CN': '胜率100%巨鲸比特币多单加仓40枚BTC，最新持仓量达1070.02枚',
      'zh-TW': '勝率100%巨鯨比特幣多單加倉40枚BTC，最新持倉量達1070.02枚',
      'en': '100% Win-Rate Whale Adds 40 BTC to Long Position, Total Holdings Reach 1,070.02 BTC'
    },
    category: 'business',
    summary: {
      'zh-CN': 'PANews 11月1日消息，据链上分析师Ai姨监测，胜率100%巨鲸比特币多单加仓40枚BTC，最新持仓量达1070.02枚BTC，持仓均价为111,045美元，浮盈约1,500万美元。',
      'zh-TW': 'PANews 11月1日消息，據鏈上分析師Ai姨監測，勝率100%巨鯨比特幣多單加倉40枚BTC，最新持倉量達1070.02枚BTC，持倉均價為111,045美元，浮盈約1,500萬美元。',
      'en': 'PANews November 1st - According to on-chain analyst Ai Yi, a whale with 100% win rate added 40 BTC to long position, bringing total holdings to 1,070.02 BTC with an average entry price of $111,045 and unrealized profit of approximately $15 million.'
    }
  }
];

