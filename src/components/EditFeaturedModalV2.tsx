/**
 * Edit Featured Article Modal Component (V2)
 * T038-T041: Support 8 languages with auto-translation
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FeaturedArticle } from '../data/featuredNewsData';
import { MultiLangInput } from './MultiLangInput';
import { X } from 'lucide-react';

interface EditFeaturedModalV2Props {
  article: FeaturedArticle | null;
  onSave: (article: FeaturedArticle) => void;
  onClose: () => void;
  language: string;
}

export function EditFeaturedModalV2({ article, onSave, onClose, language }: EditFeaturedModalV2Props) {
  const [formData, setFormData] = useState<FeaturedArticle>(
    article || {
      id: `featured-${Date.now()}`,
      image: '',
      category: {},
      date: {},
      title: {},
      description: {},
      link: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.image || !formData.link) {
      alert(language.startsWith('zh') ? '请填写图片URL和链接' : 'Please fill in image URL and link');
      return;
    }

    if (!formData.title['zh'] || !formData.title['en']) {
      alert(language.startsWith('zh') ? '请填写简体中文和英文标题' : 'Please fill in Chinese and English titles');
      return;
    }

    if (!formData.description['zh'] || !formData.description['en']) {
      alert(language.startsWith('zh') ? '请填写简体中文和英文描述' : 'Please fill in Chinese and English descriptions');
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
            {article
              ? (language.startsWith('zh') ? '编辑特色文章' : 'Edit Featured Article')
              : (language.startsWith('zh') ? '添加特色文章' : 'Add Featured Article')}
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
            {/* Image URL */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {language.startsWith('zh') ? '图片URL' : 'Image URL'}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder="https://..."
                required
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 w-full h-48 object-cover rounded-lg" />
              )}
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {language.startsWith('zh') ? '文章链接' : 'Article Link'}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder="news-insights"
                required
              />
            </div>

            {/* Category (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '分类' : 'Category'}
              values={formData.category}
              onChange={(values) => setFormData({ ...formData, category: values })}
              type="text"
              placeholder="HEADLINE / 头条新闻"
              requiredLangs={['zh', 'en']}
            />

            {/* Date (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '日期' : 'Date'}
              values={formData.date}
              onChange={(values) => setFormData({ ...formData, date: values })}
              type="text"
              placeholder="2025年5月11日 / May 11, 2025"
              requiredLangs={['zh', 'en']}
            />

            {/* Title (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '标题' : 'Title'}
              values={formData.title}
              onChange={(values) => setFormData({ ...formData, title: values })}
              type="text"
              placeholder={language.startsWith('zh') ? '输入文章标题' : 'Enter article title'}
              requiredLangs={['zh', 'en']}
            />

            {/* Description (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '描述' : 'Description'}
              values={formData.description}
              onChange={(values) => setFormData({ ...formData, description: values })}
              type="textarea"
              placeholder={language.startsWith('zh') ? '输入文章描述' : 'Enter article description'}
              requiredLangs={['zh', 'en']}
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

