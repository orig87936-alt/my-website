/**
 * Edit Focus Point Modal Component (V2)
 * T032-T037: Support 8 languages with auto-translation
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FocusPointNews } from '../data/featuredNewsData';
import { MultiLangInput } from './MultiLangInput';
import { X } from 'lucide-react';

interface EditFocusPointModalV2Props {
  focusPoint: FocusPointNews;
  onSave: (focusPoint: FocusPointNews) => void;
  onClose: () => void;
  language: string;
}

export function EditFocusPointModalV2({ focusPoint, onSave, onClose, language }: EditFocusPointModalV2Props) {
  const [formData, setFormData] = useState<FocusPointNews>(focusPoint);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.image) {
      alert(language.startsWith('zh') ? '请填写图片URL' : 'Please fill in image URL');
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
            {language.startsWith('zh') ? '编辑焦点新闻' : 'Edit Focus Point News'}
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

            {/* Date (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '日期' : 'Date'}
              values={formData.date}
              onChange={(values) => setFormData({ ...formData, date: values })}
              type="text"
              placeholder="2025年11月2日 / Nov 2, 2025"
              requiredLangs={['zh', 'en']}
            />

            {/* Title (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '标题' : 'Title'}
              values={formData.title}
              onChange={(values) => setFormData({ ...formData, title: values })}
              type="text"
              placeholder={language.startsWith('zh') ? '输入新闻标题' : 'Enter news title'}
              requiredLangs={['zh', 'en']}
            />

            {/* Summary (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '摘要' : 'Summary'}
              values={formData.summary}
              onChange={(values) => setFormData({ ...formData, summary: values })}
              type="textarea"
              placeholder={language.startsWith('zh') ? '输入新闻摘要' : 'Enter news summary'}
              requiredLangs={['zh', 'en']}
              rows={3}
            />

            {/* Full Content (Multi-Language) */}
            <MultiLangInput
              label={language.startsWith('zh') ? '完整内容' : 'Full Content'}
              values={formData.fullContent}
              onChange={(values) => setFormData({ ...formData, fullContent: values })}
              type="textarea"
              placeholder={language.startsWith('zh') ? '输入完整新闻内容' : 'Enter full news content'}
              requiredLangs={['zh', 'en']}
              rows={10}
              expandedByDefault={false}
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

