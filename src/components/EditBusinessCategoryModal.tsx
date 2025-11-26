import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export interface BusinessCategory {
  icon: any;
  title: string;
  description: string;
  returnRange: string;
  color: string;
  image: string;
}

interface EditBusinessCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: BusinessCategory | null;
  onSave: (updatedCategory: BusinessCategory) => void;
  categoryType: 'neweconomy' | 'traditional';
  categoryIndex: number;
}

export function EditBusinessCategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
  categoryType,
  categoryIndex
}: EditBusinessCategoryModalProps) {
  const { language } = useLanguage();
  const isChinese = language.startsWith('zh');

  const [formData, setFormData] = useState<BusinessCategory | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({ ...category });
    }
  }, [category]);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0a2540] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-white">
              {isChinese ? '编辑业务类别' : 'Edit Business Category'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '标题' : 'Title'}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00a4e4]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '描述' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00a4e4] resize-none"
              />
            </div>

            {/* Return Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '预计年化收益' : 'Expected Annual Return'}
              </label>
              <input
                type="text"
                value={formData.returnRange}
                onChange={(e) => setFormData({ ...formData, returnRange: e.target.value })}
                placeholder="e.g., 25~35%"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00a4e4]"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '颜色' : 'Color'}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00a4e4]"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isChinese ? '图片 URL' : 'Image URL'}
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00a4e4]"
              />
              {formData.image && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              {isChinese ? '取消' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isChinese ? '保存' : 'Save'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

