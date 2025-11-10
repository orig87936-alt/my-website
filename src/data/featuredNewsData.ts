// 焦点新闻和特色文章数据
// 管理员可以通过编辑这个文件来修改焦点新闻和特色文章

export interface FocusPointNews {
  id: string;
  image: string;
  date: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
  title: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
  summary: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
  fullContent: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
}

export interface FeaturedArticle {
  id: string;
  image: string;
  category: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
  date: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
  title: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
  description: {
    'zh-CN': string;
    'zh-TW': string;
    'en': string;
  };
  link: string;
}

// 焦点新闻（页面顶部的大新闻）
export const focusPointNews: FocusPointNews = {
  id: 'focus-1',
  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=675&fit=crop',
  date: {
    'zh-CN': '2025年11月2日',
    'zh-TW': '2025年11月2日',
    'en': 'Nov 2, 2025'
  },
  title: {
    'zh-CN': 'Trump和Xi达成一年贸易休战协议——但关键细节仍不明确',
    'zh-TW': 'Trump和Xi達成一年貿易休戰協議——但關鍵細節仍不明確',
    'en': 'Trump and Xi agree to a one-year trade truce — but key details remain unclear'
  },
  summary: {
    'zh-CN': '美国总统特朗普和中国国家主席习近平达成了为期一年的贸易休战协议，暂时缓解了两国之间持续数月的贸易紧张局势。',
    'zh-TW': '美國總統特朗普和中國國家主席習近平達成了為期一年的貿易休戰協議，暫時緩解了兩國之間持續數月的貿易緊張局勢。',
    'en': 'US President Trump and Chinese President Xi Jinping have agreed to a one-year trade truce, temporarily easing months of trade tensions between the two nations.'
  },
  fullContent: {
    'zh-CN': '美国总统特朗普和中国国家主席习近平达成了为期一年的贸易休战协议，暂时缓解了两国之间持续数月的贸易紧张局势。\n\n根据白宫发布的声明，双方同意在未来12个月内暂停新的关税措施，并承诺通过对话解决现有的贸易争端。然而，协议的具体条款尚未公开，引发了市场和分析人士的广泛关注。\n\n主要要点包括：\n• 双方同意暂停新关税措施12个月\n• 建立高级别贸易谈判机制\n• 承诺在技术转让和知识产权保护方面加强合作\n• 现有关税的处理方式仍待明确\n\n经济学家指出，虽然这一协议为全球市场带来了短期稳定，但长期影响仍需观察。关键细节的缺失，特别是关于现有关税的处理和执行机制，可能会影响协议的实际效果。\n\n金融市场对这一消息反应积极，亚洲股市普遍上涨，美元指数小幅走弱。分析师认为，这一协议可能为全球供应链的重组提供喘息空间，但企业仍需为长期的不确定性做好准备。',
    'zh-TW': '美國總統特朗普和中國國家主席習近平達成了為期一年的貿易休戰協議，暫時緩解了兩國之間持續數月的貿易緊張局勢。\n\n根據白宮發布的聲明，雙方同意在未來12個月內暫停新的關稅措施，並承諾通過對話解決現有的貿易爭端。然而，協議的具體條款尚未公開，引發了市場和分析人士的廣泛關注。\n\n主要要點包括：\n• 雙方同意暫停新關稅措施12個月\n• 建立高級別貿易談判機制\n• 承諾在技術轉讓和知識產權保護方面加強合作\n• 現有關稅的處理方式仍待明確\n\n經濟學家指出，雖然這一協議為全球市場帶來了短期穩定，但長期影響仍需觀察。關鍵細節的缺失，特別是關於現有關稅的處理和執行機制，可能會影響協議的實際效果。\n\n金融市場對這一消息反應積極，亞洲股市普遍上漲，美元指數小幅走弱。分析師認為，這一協議可能為全球供應鏈的重組提供喘息空間，但企業仍需為長期的不確定性做好準備。',
    'en': 'US President Trump and Chinese President Xi Jinping have agreed to a one-year trade truce, temporarily easing months of trade tensions between the two nations.\n\nAccording to a White House statement, both sides have agreed to suspend new tariff measures for the next 12 months and committed to resolving existing trade disputes through dialogue. However, specific terms of the agreement have not been disclosed, raising widespread concern among markets and analysts.\n\nKey points include:\n• Both sides agree to suspend new tariff measures for 12 months\n• Establishment of high-level trade negotiation mechanism\n• Commitment to strengthen cooperation on technology transfer and intellectual property protection\n• Treatment of existing tariffs remains unclear\n\nEconomists note that while this agreement brings short-term stability to global markets, long-term impacts remain to be seen. The lack of key details, particularly regarding the treatment of existing tariffs and enforcement mechanisms, may affect the agreement\'s actual effectiveness.\n\nFinancial markets reacted positively to the news, with Asian stock markets generally rising and the US dollar index weakening slightly. Analysts believe this agreement may provide breathing room for global supply chain reorganization, but businesses still need to prepare for long-term uncertainty.'
  }
};

// 特色文章列表（6篇文章）
export const featuredArticles: FeaturedArticle[] = [
  {
    id: 'news-insights',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    category: {
      'zh-CN': '头条新闻',
      'zh-TW': '頭條新聞',
      'en': 'HEADLINE'
    },
    date: {
      'zh-CN': '2025年5月11日',
      'zh-TW': '2025年5月11日',
      'en': 'May 11, 2025'
    },
    title: {
      'zh-CN': '特朗普和习近平同意一年贸易休战',
      'zh-TW': '特朗普和習近平同意一年貿易休戰',
      'en': 'Trump and Xi agree to a one-year trade truce'
    },
    description: {
      'zh-CN': '北京承诺购买大豆、延迟稀土出口管制并遏制芬太尼——但美国让步的问题仍然存在。',
      'zh-TW': '北京承諾購買大豆、延遲稀土出口管制並遏制芬太尼——但美國讓步的問題仍然存在。',
      'en': 'Beijing is pledging to buy soybeans, delay rare-earth export controls and curb fentanyl.'
    },
    link: 'news-insights'
  },
  {
    id: 'genius-act',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop',
    category: {
      'zh-CN': '监管法案',
      'zh-TW': '監管法案',
      'en': 'REGULATORY BILLS'
    },
    date: {
      'zh-CN': '2025年7月18日',
      'zh-TW': '2025年7月18日',
      'en': 'July 18, 2025'
    },
    title: {
      'zh-CN': '特朗普总统签署GENIUS法案',
      'zh-TW': '特朗普總統簽署GENIUS法案',
      'en': 'President Trump Signs GENIUS Act'
    },
    description: {
      'zh-CN': '这是一项历史性的立法，将为美国引领全球数字货币革命铺平道路。',
      'zh-TW': '這是一項歷史性的立法，將為美國引領全球數字貨幣革命鋪平道路。',
      'en': 'A historic piece of legislation that will pave the way for the United States to lead the global digital currency revolution.'
    },
    link: 'genius-act'
  },
  {
    id: 'ai-hallucination',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    category: {
      'zh-CN': '分析报告',
      'zh-TW': '分析報告',
      'en': 'ANALYSIS REPORTS'
    },
    date: {
      'zh-CN': '2025年',
      'zh-TW': '2025年',
      'en': '2025'
    },
    title: {
      'zh-CN': 'OpenAI：AI模型产生"幻觉"',
      'zh-TW': 'OpenAI：AI模型產生"幻覺"',
      'en': 'OpenAI: AI Model "Hallucinations"'
    },
    description: {
      'zh-CN': 'AI模型的"幻觉"问题源于训练机制的系统性缺陷，是当前LLM核心架构的"必然副产品"。',
      'zh-TW': 'AI模型的"幻覺"問題源於訓練機制的系統性缺陷，是當前LLM核心架構的"必然副產品"。',
      'en': 'AI model "hallucinations" stem from systematic flaws in training mechanisms.'
    },
    link: 'ai-hallucination'
  },
  {
    id: 'state-of-crypto-2025',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=600&fit=crop',
    category: {
      'zh-CN': '商业变革',
      'zh-TW': '商業變革',
      'en': 'BUSINESS CHANGE'
    },
    date: {
      'zh-CN': '2025年10月23日',
      'zh-TW': '2025年10月23日',
      'en': 'October 23, 2025'
    },
    title: {
      'zh-CN': 'State of Crypto 2025',
      'zh-TW': 'State of Crypto 2025',
      'en': 'State of Crypto 2025'
    },
    description: {
      'zh-CN': '稳定币、机构采用与AI的融合，2025年加密货币行业状态报告。',
      'zh-TW': '穩定幣、機構採用與AI的融合，2025年加密貨幣行業狀態報告。',
      'en': 'Stablecoins, institutional adoption, and AI convergence in the 2025 crypto industry report.'
    },
    link: 'state-of-crypto-2025'
  },
  {
    id: 'manus-ai',
    image: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&h=600&fit=crop',
    category: {
      'zh-CN': '核心企业',
      'zh-TW': '核心企業',
      'en': 'CORE ENTERPRISE'
    },
    date: {
      'zh-CN': '2025年3月12日',
      'zh-TW': '2025年3月12日',
      'en': 'March 12, 2025'
    },
    title: {
      'zh-CN': 'Manus AI分析报告',
      'zh-TW': 'Manus AI分析報告',
      'en': 'Manus AI Analysis Report'
    },
    description: {
      'zh-CN': 'Manus AI的能力、局限性与市场定位深度分析报告。',
      'zh-TW': 'Manus AI的能力、局限性與市場定位深度分析報告。',
      'en': 'In-depth analysis of Manus AI capabilities, limitations, and market positioning.'
    },
    link: 'manus-ai'
  },
  {
    id: 'global-economy-2025',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    category: {
      'zh-CN': '未来展望',
      'zh-TW': '未來展望',
      'en': 'FUTURE OUTLOOK'
    },
    date: {
      'zh-CN': '2024年12月10日',
      'zh-TW': '2024年12月10日',
      'en': 'Dec 10, 2024'
    },
    title: {
      'zh-CN': '2025年全球经济展望',
      'zh-TW': '2025年全球經濟展望',
      'en': '2025 Global Economy Outlook'
    },
    description: {
      'zh-CN': '全球经济增长将加速，尽管面临地缘政治紧张局势和政策不确定性等挑战。',
      'zh-TW': '全球經濟增長將加速，儘管面臨地緣政治緊張局勢和政策不確定性等挑戰。',
      'en': 'Global economic growth set to strengthen despite geopolitical tensions and policy uncertainties.'
    },
    link: 'global-economy-2025'
  }
];

