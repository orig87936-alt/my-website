/**
 * 订阅管理后台页面
 * 显示所有订阅者列表，支持筛选、搜索、管理
 */

import React, { useState, useEffect } from 'react';
import { subscriptionAPI, SubscriptionResponse } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Filter, Download, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED';
type SubscriptionType = 'ALL' | 'NEWS' | 'EVENTS' | 'UPDATES';
type SubscriptionFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export const SubscriptionAdminPage: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isChinese = language.startsWith('zh');

  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<SubscriptionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 加载订阅列表
  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      console.log('Loading subscriptions with filters:', { statusFilter, typeFilter });
      const response = await subscriptionAPI.getAll(
        0,
        1000,
        statusFilter === 'all' ? undefined : statusFilter,
        typeFilter === 'all' ? undefined : typeFilter
      );
      console.log('Subscriptions response:', response);

      // 检查响应数据结构
      if (response && Array.isArray(response.items)) {
        setSubscriptions(response.items);
      } else {
        console.error('Invalid response structure:', response);
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      showToast(
        isChinese ? '加载订阅列表失败' : 'Failed to load subscriptions',
        'error'
      );
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter, typeFilter]);

  // 删除订阅
  const handleDelete = async (id: number) => {
    if (!confirm(isChinese ? '确定要删除这个订阅吗？' : 'Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      await subscriptionAPI.delete(id);
      showToast(
        isChinese ? '删除成功' : 'Deleted successfully',
        'success'
      );
      loadSubscriptions();
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      showToast(
        isChinese ? '删除失败' : 'Failed to delete',
        'error'
      );
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      showToast(
        isChinese ? '请先选择要删除的订阅' : 'Please select subscriptions to delete',
        'warning'
      );
      return;
    }

    if (!confirm(isChinese ? `确定要删除选中的 ${selectedIds.size} 个订阅吗？` : `Are you sure you want to delete ${selectedIds.size} subscriptions?`)) {
      return;
    }

    try {
      await Promise.all(Array.from(selectedIds).map(id => subscriptionAPI.delete(id)));
      showToast(
        isChinese ? '批量删除成功' : 'Batch delete successful',
        'success'
      );
      setSelectedIds(new Set());
      loadSubscriptions();
    } catch (error) {
      console.error('Failed to batch delete:', error);
      showToast(
        isChinese ? '批量删除失败' : 'Batch delete failed',
        'error'
      );
    }
  };

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = ['Email', 'Type', 'Frequency', 'Status', 'Created At', 'Confirmed At'];
    const rows = filteredSubscriptions.map(sub => [
      sub.email,
      sub.subscription_type,
      sub.frequency,
      sub.status,
      new Date(sub.created_at).toLocaleString(),
      sub.confirmed_at ? new Date(sub.confirmed_at).toLocaleString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast(
      isChinese ? 'CSV 导出成功' : 'CSV exported successfully',
      'success'
    );
  };

  // 切换选择
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSubscriptions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubscriptions.map(sub => sub.id)));
    }
  };

  // 过滤订阅
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (searchQuery && !sub.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 统计数据
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'ACTIVE').length,
    pending: subscriptions.filter(s => s.status === 'PENDING').length,
    unsubscribed: subscriptions.filter(s => s.status === 'UNSUBSCRIBED').length,
  };

  // 状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'UNSUBSCRIBED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // 状态文本
  const getStatusText = (status: string) => {
    if (isChinese) {
      switch (status) {
        case 'ACTIVE': return '已激活';
        case 'PENDING': return '待确认';
        case 'UNSUBSCRIBED': return '已退订';
        default: return status;
      }
    } else {
      return status;
    }
  };

  // 类型文本
  const getTypeText = (type: string) => {
    if (isChinese) {
      switch (type) {
        case 'ALL': return '全部内容';
        case 'NEWS': return '新闻';
        case 'EVENTS': return '活动';
        case 'UPDATES': return '更新';
        default: return type;
      }
    } else {
      return type;
    }
  };

  // 频率文本
  const getFrequencyText = (frequency: string) => {
    if (isChinese) {
      switch (frequency) {
        case 'DAILY': return '每日';
        case 'WEEKLY': return '每周';
        case 'MONTHLY': return '每月';
        default: return frequency;
      }
    } else {
      return frequency;
    }
  };

  return (
    <div className="admin-page">
      {/* 页头 */}
      <div className="admin-header">
        <div>
          <h1>{isChinese ? '订阅管理' : 'Subscription Management'}</h1>
          <p className="subtitle">
            {isChinese ? `共 ${filteredSubscriptions.length} 个订阅` : `${filteredSubscriptions.length} subscriptions`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSubscriptions}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {isChinese ? '刷新' : 'Refresh'}
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            disabled={filteredSubscriptions.length === 0}
          >
            <Download className="w-4 h-4" />
            {isChinese ? '导出 CSV' : 'Export CSV'}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="btn btn-danger"
            >
              <Trash2 className="w-4 h-4" />
              {isChinese ? `删除 (${selectedIds.size})` : `Delete (${selectedIds.size})`}
            </button>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isChinese ? '总订阅' : 'Total'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isChinese ? '已激活' : 'Active'}</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isChinese ? '待确认' : 'Pending'}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isChinese ? '已退订' : 'Unsubscribed'}</p>
              <p className="text-2xl font-bold text-red-600">{stats.unsubscribed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isChinese ? '搜索邮箱' : 'Search Email'}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isChinese ? '输入邮箱地址...' : 'Enter email address...'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isChinese ? '状态' : 'Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{isChinese ? '全部状态' : 'All Status'}</option>
              <option value="ACTIVE">{isChinese ? '已激活' : 'Active'}</option>
              <option value="PENDING">{isChinese ? '待确认' : 'Pending'}</option>
              <option value="UNSUBSCRIBED">{isChinese ? '已退订' : 'Unsubscribed'}</option>
            </select>
          </div>

          {/* 类型筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isChinese ? '订阅类型' : 'Subscription Type'}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{isChinese ? '全部类型' : 'All Types'}</option>
              <option value="ALL">{isChinese ? '全部内容' : 'All Content'}</option>
              <option value="NEWS">{isChinese ? '新闻' : 'News'}</option>
              <option value="EVENTS">{isChinese ? '活动' : 'Events'}</option>
              <option value="UPDATES">{isChinese ? '更新' : 'Updates'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 订阅列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400">
              {isChinese ? '加载中...' : 'Loading...'}
            </p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {isChinese ? '暂无订阅' : 'No subscriptions'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {isChinese ? '邮箱' : 'Email'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {isChinese ? '类型' : 'Type'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {isChinese ? '频率' : 'Frequency'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {isChinese ? '状态' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {isChinese ? '创建时间' : 'Created At'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {isChinese ? '操作' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(subscription.id)}
                        onChange={() => toggleSelect(subscription.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getTypeText(subscription.subscription_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getFrequencyText(subscription.frequency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(subscription.status)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getStatusText(subscription.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title={isChinese ? '删除' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 100px 20px 40px 20px;
          min-height: 100vh;
          background-color: #0a1929;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 20px;
        }

        .admin-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
        }

        .subtitle {
          margin: 0;
          color: #b0bec5;
          font-size: 16px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #00a4e4;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-secondary {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-danger {
          background-color: #dc2626;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* 统计卡片样式 */
        .admin-page .bg-white {
          background-color: #1e293b !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-page .text-gray-600,
        .admin-page .text-gray-400 {
          color: #94a3b8 !important;
        }

        .admin-page .text-gray-900,
        .admin-page .text-white {
          color: #ffffff !important;
        }

        .admin-page .text-gray-700,
        .admin-page .text-gray-300 {
          color: #e2e8f0 !important;
        }

        /* 输入框和选择框样式 */
        .admin-page input,
        .admin-page select {
          background-color: #1e293b !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
        }

        .admin-page input::placeholder {
          color: #64748b !important;
        }

        .admin-page input:focus,
        .admin-page select:focus {
          border-color: #00a4e4 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 164, 228, 0.1);
        }

        /* 表格样式 */
        .admin-page table {
          background-color: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-page thead {
          background-color: #0f172a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-page th {
          color: #e2e8f0 !important;
          font-weight: 600;
          padding: 12px 16px;
          text-align: left;
        }

        .admin-page td {
          color: #cbd5e1 !important;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .admin-page tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* 复选框样式 */
        .admin-page input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #00a4e4;
        }

        /* 状态徽章样式 */
        .admin-page .inline-flex.items-center.px-2 {
          font-weight: 500;
        }

        /* 空状态样式 */
        .admin-page .text-center.py-12 {
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .admin-page {
            padding: 80px 16px 40px 16px;
          }

          .admin-header {
            flex-direction: column;
            align-items: stretch;
          }

          .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

