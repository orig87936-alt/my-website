/**
 * Add/Edit Latest News Modal Component (V2)
 * T045-T048: Support 8 languages with auto-translation
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LiveNewsItem } from '../data/liveNewsData';
import { MultiLangInput } from './MultiLangInput';
import { X } from 'lucide-react';

interface AddNewsModalV2Props {
  news: LiveNewsItem | null;
  onSave: (news: LiveNewsItem) => void;
  onClose: () => void;
  language: string;
}

export function AddNewsModalV2({ news, onSave, onClose, language }: AddNewsModalV2Props) {
  const [formData, setFormData] = useState<LiveNewsItem>(
    news || {
      id: `live-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      readTime: {},
      title: {},
      category: 'business',
      summary: {}
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.time) {
      alert(language.startsWith('zh') ? '请填写时间' : 'Please fill in time');
      return;
    }

    if (!formData.title['zh'] || !formData.title['en']) {
      alert(language.startsWith('zh') ? '请填写简体中文和英文标题' : 'Please fill in Chinese and English titles');
      return;
    }

    if (!formData.summary['zh'] || !formData.summary['en']) {
      alert(language.startsWith('zh') ? '请填写简体中文和英文摘要' : 'Please fill in Chinese and English summaries');
      return;
    }

    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100] flex items-start justify-center overflow-y-auto py-8"
      onClick={onClose}
      style={{ overflowY: 'scroll' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a2540] rounded-2xl border border-white/10 w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-light text-white">
            {news
              ? (language.startsWith('zh') ? '编辑最新新闻' : 'Edit Latest News')
              : (language.startsWith('zh') ? '添加最新新闻' : 'Add Latest News')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Scrollable Content */}
          <div className="px-6 pt-4 pb-8 space-y-6">
            {/* Time */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {language.startsWith('zh') ? '时间' : 'Time'}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder="17:44"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {language.startsWith('zh') ? '分类' : 'Category'}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                required
              >
                <option value="business">{language.startsWith('zh') ? '商业' : 'Business'}</option>
                <option value="technology">{language.startsWith('zh') ? '技术' : 'Technology'}</option>
                <option value="finance">{language.startsWith('zh') ? '金融' : 'Finance'}</option>
                <option value="research">{language.startsWith('zh') ? '研究' : 'Research'}</option>
              </select>
            </div>

            {/* Read Time (Multi-Language) - 8 languages */}
            <MultiLangInput
              label={language.startsWith('zh') ? '阅读时间' : 'Read Time'}
              values={formData.readTime}
              onChange={(values) => setFormData({ ...formData, readTime: values })}
              type="text"
              placeholder="2分钟阅读 / 2 min read"
              requiredLangs={['zh']}
              expandedByDefault={false}
            />

            {/* Title (Multi-Language) - 8 languages */}
            <MultiLangInput
              label={language.startsWith('zh') ? '标题' : 'Title'}
              values={formData.title}
              onChange={(values) => setFormData({ ...formData, title: values })}
              type="text"
              placeholder={language.startsWith('zh') ? '输入新闻标题' : 'Enter news title'}
              requiredLangs={['zh']}
              expandedByDefault={false}
            />

            {/* Summary (Multi-Language) - 8 languages */}
            <MultiLangInput
              label={language.startsWith('zh') ? '摘要' : 'Summary'}
              values={formData.summary}
              onChange={(values) => setFormData({ ...formData, summary: values })}
              type="textarea"
              placeholder={language.startsWith('zh') ? '输入新闻摘要' : 'Enter news summary'}
              requiredLangs={['zh']}
              expandedByDefault={false}
              rows={4}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0a2540]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              {language.startsWith('zh') ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
            >
              {language.startsWith('zh') ? '保存' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

