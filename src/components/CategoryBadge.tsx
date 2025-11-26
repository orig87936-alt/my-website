/**
 * 新闻模块徽章组件
 * 显示文章所属的模块分类
 */

import React from 'react';
import { getCategoryByValue, getCategoryLabel } from '../constants/newsCategories';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium' | 'large';
  showBilingual?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'medium',
  showBilingual = false,
  className = ''
}) => {
  const { language } = useLanguage();
  const config = getCategoryByValue(category);

  if (!config) {
    return <span className={`category-badge ${className}`}>{category}</span>;
  }

  const getLabel = () => {
    if (showBilingual) {
      return `${config.labelEn} / ${config.labelZh}`;
    }
    return getCategoryLabel(category, language);
  };

  return (
    <span
      className={`category-badge category-badge-${size} ${className}`}
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderColor: config.color
      }}
    >
      {getLabel()}

      <style>{`
        .category-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-badge-small {
          font-size: 11px;
          padding: 2px 8px;
        }

        .category-badge-medium {
          font-size: 12px;
          padding: 4px 12px;
        }

        .category-badge-large {
          font-size: 14px;
          padding: 6px 16px;
        }

        .category-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </span>
  );
};

export default CategoryBadge;

