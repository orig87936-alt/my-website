/**
 * 文章状态徽章组件
 * 显示文章的发布状态（草稿/已发布/已归档）
 */

import React from 'react';
import { getStatusConfig } from '../constants/newsCategories';
import { useLanguage } from '../contexts/LanguageContext';

interface ArticleStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const ArticleStatusBadge: React.FC<ArticleStatusBadgeProps> = ({
  status,
  size = 'medium',
  className = ''
}) => {
  const { language } = useLanguage();
  const config = getStatusConfig(status);

  if (!config) {
    return null;
  }

  const label = language === 'zh' ? config.labelZh : config.labelEn;

  return (
    <span
      className={`status-badge status-badge-${size} ${className}`}
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderColor: config.color
      }}
    >
      <span className="status-dot" style={{ backgroundColor: config.color }} />
      {label}

      <style>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 500;
          border: 1px solid;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .status-badge-small {
          font-size: 12px;
          padding: 2px 8px;
          gap: 4px;
        }

        .status-badge-medium {
          font-size: 14px;
          padding: 4px 12px;
          gap: 6px;
        }

        .status-badge-large {
          font-size: 16px;
          padding: 6px 16px;
          gap: 8px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-badge-small .status-dot {
          width: 4px;
          height: 4px;
        }

        .status-badge-large .status-dot {
          width: 8px;
          height: 8px;
        }
      `}</style>
    </span>
  );
};

export default ArticleStatusBadge;

