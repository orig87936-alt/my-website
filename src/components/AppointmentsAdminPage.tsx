import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Mail, Phone, User, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { appointmentsAPI, Appointment } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const statusConfig: Record<AppointmentStatus, { label: { zh: string; en: string }; color: string; icon: React.ElementType }> = {
  pending: {
    label: { zh: '待处理', en: 'Pending' },
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: AlertCircle,
  },
  confirmed: {
    label: { zh: '已确认', en: 'Confirmed' },
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: CheckCircle,
  },
  completed: {
    label: { zh: '已完成', en: 'Completed' },
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircle,
  },
  cancelled: {
    label: { zh: '已取消', en: 'Cancelled' },
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
  },
};

export const AppointmentsAdminPage: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isChinese = language.startsWith('zh');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const pageSize = 10;

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('Loading appointments with params:', { page, pageSize, statusFilter });

      const response = await appointmentsAPI.list({
        page,
        page_size: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      console.log('Appointments response:', response);
      setAppointments(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Failed to load appointments:', error);

      // 显示详细错误信息
      const errorMessage = error && typeof error === 'object' && 'detail' in error
        ? (error as any).detail
        : (isChinese ? '加载预约列表失败' : 'Failed to load appointments');

      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      setUpdating(appointmentId);
      await appointmentsAPI.update(appointmentId, { status: newStatus });
      
      showToast(
        isChinese ? '预约状态已更新' : 'Appointment status updated',
        'success'
      );
      
      // Reload appointments
      await loadAppointments();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      showToast(
        isChinese ? '更新预约状态失败' : 'Failed to update appointment status',
        'error'
      );
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isChinese ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isChinese ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1b2a] to-[#1b263b] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light text-white mb-2">
            {isChinese ? '预约管理' : 'Appointments Management'}
          </h1>
          <p className="text-gray-400">
            {isChinese ? '查看和管理所有预约信息' : 'View and manage all appointments'}
          </p>
        </motion.div>

        {/* Filters and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400" />
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#00a4e4] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {isChinese ? '全部' : 'All'} ({total})
            </button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as AppointmentStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[#00a4e4] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {isChinese ? config.label.zh : config.label.en}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadAppointments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {isChinese ? '刷新' : 'Refresh'}
          </button>
        </motion.div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00a4e4] animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {isChinese ? '暂无预约记录' : 'No appointments found'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment, index) => {
              const StatusIcon = statusConfig[appointment.status].icon;
              
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#00a4e4]/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Appointment Info */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-medium text-white mb-1">
                            {appointment.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {isChinese ? '预约编号' : 'Confirmation'}: {appointment.confirmation_number || appointment.id.slice(0, 8)}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusConfig[appointment.status].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {isChinese ? statusConfig[appointment.status].label.zh : statusConfig[appointment.status].label.en}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail className="w-4 h-4 text-[#00a4e4]" />
                          <span className="text-sm">{appointment.email}</span>
                        </div>
                        {appointment.phone && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone className="w-4 h-4 text-[#00a4e4]" />
                            <span className="text-sm">{appointment.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Appointment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-[#00a4e4]" />
                          <span className="text-sm">{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-[#00a4e4]" />
                          <span className="text-sm">{appointment.time_slot}</span>
                        </div>
                      </div>

                      {/* Service Type & Notes */}
                      {appointment.service_type && (
                        <div className="text-sm text-gray-400">
                          <span className="font-medium text-gray-300">{isChinese ? '服务类型' : 'Service'}:</span> {appointment.service_type}
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="text-sm text-gray-400">
                          <span className="font-medium text-gray-300">{isChinese ? '备注' : 'Notes'}:</span> {appointment.notes}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="text-xs text-gray-500 pt-2 border-t border-white/5">
                        {isChinese ? '创建时间' : 'Created'}: {formatDateTime(appointment.created_at)}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="lg:w-48 flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        disabled={appointment.status === 'confirmed' || updating === appointment.id}
                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === appointment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          isChinese ? '确认' : 'Confirm'
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        disabled={appointment.status === 'completed' || updating === appointment.id}
                        className="flex-1 lg:flex-none px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChinese ? '完成' : 'Complete'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        disabled={appointment.status === 'cancelled' || updating === appointment.id}
                        className="flex-1 lg:flex-none px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChinese ? '取消' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChinese ? '上一页' : 'Previous'}
            </button>
            <span className="text-gray-400 px-4">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChinese ? '下一页' : 'Next'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

