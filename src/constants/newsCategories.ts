/**
 * 新闻模块分类常量
 * 定义6个新闻模块的中英文名称和颜色
 */

export interface NewsCategory {
  value: string;        // 后端存储的值
  labelZh: string;      // 中文简体
  labelZhTw: string;    // 中文繁体
  labelEn: string;      // 英文
  labelEs: string;      // 西班牙语
  labelFr: string;      // 法语
  labelAr: string;      // 阿拉伯语
  labelJa: string;      // 日语
  labelHi: string;      // 印地语
  color: string;        // 模块主题颜色
  description?: string; // 模块描述（可选）
}

/**
 * 6个新闻模块配置
 */
export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    value: 'headline',
    labelZh: '头条新闻',
    labelZhTw: '頭條新聞',
    labelEn: 'HEADLINE',
    labelEs: 'TITULAR',
    labelFr: 'TITRE',
    labelAr: 'عنوان رئيسي',
    labelJa: 'ヘッドライン',
    labelHi: 'शीर्षक',
    color: '#00a4e4',
    description: '重要新闻和热点事件'
  },
  {
    value: 'regulatory',
    labelZh: '监管法规',
    labelZhTw: '監管法規',
    labelEn: 'REGULATORY BILLS',
    labelEs: 'REGULACIONES',
    labelFr: 'RÉGLEMENTATIONS',
    labelAr: 'اللوائح التنظيمية',
    labelJa: '規制法案',
    labelHi: 'नियामक विधेयक',
    color: '#3b5bdb',
    description: '政策法规和监管动态'
  },
  {
    value: 'analysis',
    labelZh: '分析报告',
    labelZhTw: '分析報告',
    labelEn: 'ANALYSIS REPORTS',
    labelEs: 'INFORMES DE ANÁLISIS',
    labelFr: 'RAPPORTS D\'ANALYSE',
    labelAr: 'تقارير التحليل',
    labelJa: '分析レポート',
    labelHi: 'विश्लेषण रिपोर्ट',
    color: '#7950f2',
    description: '深度分析和研究报告'
  },
  {
    value: 'business',
    labelZh: '商业动态',
    labelZhTw: '商業動態',
    labelEn: 'BUSINESS CHANGE',
    labelEs: 'CAMBIOS EMPRESARIALES',
    labelFr: 'CHANGEMENTS COMMERCIAUX',
    labelAr: 'التغييرات التجارية',
    labelJa: 'ビジネス変化',
    labelHi: 'व्यापार परिवर्तन',
    color: '#f59f00',
    description: '商业新闻和市场动态'
  },
  {
    value: 'enterprise',
    labelZh: '核心企业',
    labelZhTw: '核心企業',
    labelEn: 'CORE ENTERPRISE',
    labelEs: 'EMPRESA CENTRAL',
    labelFr: 'ENTREPRISE PRINCIPALE',
    labelAr: 'المؤسسة الأساسية',
    labelJa: 'コア企業',
    labelHi: 'मुख्य उद्यम',
    color: '#20c997',
    description: '企业新闻和公司动态'
  },
  {
    value: 'outlook',
    labelZh: '未来展望',
    labelZhTw: '未來展望',
    labelEn: 'FUTURE OUTLOOK',
    labelEs: 'PERSPECTIVAS FUTURAS',
    labelFr: 'PERSPECTIVES D\'AVENIR',
    labelAr: 'التوقعات المستقبلية',
    labelJa: '将来の見通し',
    labelHi: 'भविष्य का दृष्टिकोण',
    color: '#ff6b6b',
    description: '行业趋势和未来预测'
  }
];

/**
 * 根据 value 获取模块配置
 */
export function getCategoryByValue(value: string): NewsCategory | undefined {
  return NEWS_CATEGORIES.find(cat => cat.value === value);
}

/**
 * 根据 value 获取中文名称
 */
export function getCategoryLabelZh(value: string): string {
  const category = getCategoryByValue(value);
  return category ? category.labelZh : value;
}

/**
 * 根据 value 获取英文名称
 */
export function getCategoryLabelEn(value: string): string {
  const category = getCategoryByValue(value);
  return category ? category.labelEn : value;
}

/**
 * 根据 value 获取双语名称（英文 / 中文）
 */
export function getCategoryBilingualLabel(value: string): string {
  const category = getCategoryByValue(value);
  if (!category) return value;
  return `${category.labelEn} / ${category.labelZh}`;
}

/**
 * 根据语言代码获取分类标签
 */
export function getCategoryLabel(value: string, language: string): string {
  const category = getCategoryByValue(value);
  if (!category) return value;

  switch (language) {
    case 'zh-CN':
      return category.labelZh;
    case 'zh-TW':
      return category.labelZhTw;
    case 'en':
      return category.labelEn;
    case 'es':
      return category.labelEs;
    case 'fr':
      return category.labelFr;
    case 'ar':
      return category.labelAr;
    case 'ja':
      return category.labelJa;
    case 'hi':
      return category.labelHi;
    default:
      return category.labelEn; // 默认返回英文
  }
}

/**
 * 根据 value 获取颜色
 */
export function getCategoryColor(value: string): string {
  const category = getCategoryByValue(value);
  return category ? category.color : '#666666';
}

/**
 * 文章状态常量
 */
export const ARTICLE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

export type ArticleStatus = typeof ARTICLE_STATUSES[keyof typeof ARTICLE_STATUSES];

/**
 * 状态显示配置
 */
export interface StatusConfig {
  value: ArticleStatus;
  labelZh: string;
  labelEn: string;
  color: string;
}

export const STATUS_CONFIGS: StatusConfig[] = [
  {
    value: 'draft',
    labelZh: '草稿',
    labelEn: 'Draft',
    color: '#868e96'
  },
  {
    value: 'published',
    labelZh: '已发布',
    labelEn: 'Published',
    color: '#51cf66'
  },
  {
    value: 'archived',
    labelZh: '已归档',
    labelEn: 'Archived',
    color: '#fa5252'
  }
];

/**
 * 根据状态值获取状态配置
 */
export function getStatusConfig(status: string): StatusConfig | undefined {
  return STATUS_CONFIGS.find(s => s.value === status);
}

/**
 * 根据状态值获取中文标签
 */
export function getStatusLabelZh(status: string): string {
  const config = getStatusConfig(status);
  return config ? config.labelZh : status;
}

/**
 * 根据状态值获取英文标签
 */
export function getStatusLabelEn(status: string): string {
  const config = getStatusConfig(status);
  return config ? config.labelEn : status;
}

/**
 * 根据状态值获取颜色
 */
export function getStatusColor(status: string): string {
  const config = getStatusConfig(status);
  return config ? config.color : '#666666';
}

