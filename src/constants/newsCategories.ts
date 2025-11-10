/**
 * 新闻模块分类常量
 * 定义6个新闻模块的中英文名称和颜色
 */

export interface NewsCategory {
  value: string;        // 后端存储的值
  labelZh: string;      // 中文显示名称
  labelEn: string;      // 英文显示名称
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
    labelEn: 'HEADLINE',
    color: '#00a4e4',
    description: '重要新闻和热点事件'
  },
  {
    value: 'regulatory',
    labelZh: '监管法规',
    labelEn: 'REGULATORY BILLS',
    color: '#3b5bdb',
    description: '政策法规和监管动态'
  },
  {
    value: 'analysis',
    labelZh: '分析报告',
    labelEn: 'ANALYSIS REPORTS',
    color: '#7950f2',
    description: '深度分析和研究报告'
  },
  {
    value: 'business',
    labelZh: '商业动态',
    labelEn: 'BUSINESS CHANGE',
    color: '#f59f00',
    description: '商业新闻和市场动态'
  },
  {
    value: 'enterprise',
    labelZh: '核心企业',
    labelEn: 'CORE ENTERPRISE',
    color: '#20c997',
    description: '企业新闻和公司动态'
  },
  {
    value: 'outlook',
    labelZh: '未来展望',
    labelEn: 'FUTURE OUTLOOK',
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

