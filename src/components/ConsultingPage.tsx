import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ArrowRight, CheckCircle, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { appointmentsAPI, AppointmentConfirmation, AvailableSlot } from '../services/api';

// Message type for chat - REMOVED (备份在 ConsultingPage_ChatbotBackup.tsx)

export function ConsultingPage() {
  const { language, t } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Chat state - REMOVED (备份在 ConsultingPage_ChatbotBackup.tsx)

  // Appointment form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    notes: ''
  });

  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<AppointmentConfirmation | null>(null);

  // quickReplies - REMOVED (备份在 ConsultingPage_ChatbotBackup.tsx)

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  ];

  // Chat session restoration - REMOVED (备份在 ConsultingPage_ChatbotBackup.tsx)

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const response = await appointmentsAPI.getAvailableSlots(dateStr);
      setAvailableSlots(response.slots);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      // Fallback: mark all slots as available
      setAvailableSlots(timeSlots.map(slot => ({ time_slot: slot, available: true })));
    } finally {
      setLoadingSlots(false);
    }
  };

  // handleSend and handleQuickReply - REMOVED (备份在 ConsultingPage_ChatbotBackup.tsx)

  const handleBooking = async () => {
    // Validation
    if (!selectedDate || !selectedTime) {
      setBookingError(language.startsWith('zh') ? '请选择日期和时间' : 'Please select date and time');
      return;
    }

    if (!formData.name || !formData.email) {
      setBookingError(language.startsWith('zh') ? '请填写姓名和邮箱' : 'Please fill in name and email');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const appointmentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        appointment_date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
        time_slot: selectedTime,
        service_type: formData.serviceType || undefined,
        notes: formData.notes || undefined,
      };

      const confirmation = await appointmentsAPI.create(appointmentData);

      // Show confirmation modal
      setConfirmationData(confirmation);
      setShowConfirmation(true);
      setIsBookingOpen(false);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        notes: ''
      });
      setSelectedDate(undefined);
      setSelectedTime('');

    } catch (error: any) {
      console.error('Booking failed:', error);
      setBookingError(
        error.detail ||
        (language.startsWith('zh') ? '预约失败，请重试' : 'Booking failed, please try again')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a2540] pt-32">
      {/* Hero Section */}
      <section className="py-24 px-8 border-b border-white/10">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <CalendarIcon className="w-4 h-4 text-[#00a4e4]" />
              <span className="text-sm text-gray-300">
                {language.startsWith('zh') ? '专业咨询服务' : language === 'ja' ? 'プロフェッショナルコンサルティング' : language === 'es' ? 'Consultoría Profesional' : language === 'fr' ? 'Conseil Professionnel' : language === 'ar' ? 'استشارات احترافية' : language === 'hi' ? 'पेशेवर परामर्श' : 'Professional Consulting'}
              </span>
            </div>
            <h1 className="text-6xl font-light text-white mb-6">
              {t('consulting.hero.title')}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              {t('consulting.hero.subtitle')}
            </p>
            <button
              onClick={() => {
                console.log('预约按钮被点击');
                setIsBookingOpen(true);
                console.log('isBookingOpen 设置为 true');
              }}
              className="group inline-flex items-center gap-3 bg-[#00a4e4] hover:bg-[#0088c2] text-white px-10 py-4 rounded-full transition-all"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="font-medium">{t('consulting.appointment.button')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Calendar Section - 精美日历预约 */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language.startsWith('zh') ? '选择预约时间' : language === 'ja' ? '予約時間を選択' : language === 'es' ? 'Seleccione Fecha' : language === 'fr' ? 'Choisir une Date' : language === 'ar' ? 'اختر التاريخ' : language === 'hi' ? 'तारीख चुनें' : 'Select Appointment Date'}
            </h2>
            <p className="text-gray-400 text-lg">
              {language.startsWith('zh') ? '点击日期即可进入预约表单' : language === 'ja' ? '日付をクリックして予約フォームに進む' : language === 'es' ? 'Haga clic en una fecha para reservar' : language === 'fr' ? 'Cliquez sur une date pour réserver' : language === 'ar' ? 'انقر على التاريخ للحجز' : language === 'hi' ? 'बुकिंग के लिए तारीख पर क्लिक करें' : 'Click on a date to book an appointment'}
            </p>
          </motion.div>

          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-dark rounded-3xl p-8 md:p-12 max-w-4xl mx-auto"
          >
            {/* Calendar - 放大并居中 */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-[#00a4e4]/10 to-[#3b5bdb]/10 rounded-2xl p-6 sm:p-12 border border-white/10 inline-block">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      setIsBookingOpen(true);
                    }
                  }}
                  disabled={{ before: new Date() }}
                  fromMonth={new Date()} // 允许从当前月份开始导航
                  captionLayout="buttons" // 使用按钮布局，隐藏下拉菜单
                  className="rounded-lg"
                  classNames={{
                    day_selected: "bg-[#00a4e4] text-white hover:bg-[#0088c2] hover:text-white focus:bg-[#00a4e4] focus:text-white",
                    day_today: "bg-transparent text-white font-normal", // 今天不显示蓝色
                    nav_button: "hover:bg-white/10 text-white", // 导航按钮样式
                  }}
                />
              </div>
            </div>

            {/* Service Types - 横向布局 */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: '💼',
                  title: language.startsWith('zh') ? '商业咨询' : language === 'ja' ? 'ビジネスコンサルティング' : language === 'es' ? 'Consultoría Empresarial' : language === 'fr' ? 'Conseil en Affaires' : language === 'ar' ? 'استشارات الأعمال' : language === 'hi' ? 'व्यापार परामर्श' : 'Business Consulting',
                  desc: language.startsWith('zh') ? '战略规划、市场分析' : language === 'ja' ? '戦略計画、市場分析' : language === 'es' ? 'Planificación Estratégica' : language === 'fr' ? 'Planification Stratégique' : language === 'ar' ? 'التخطيط الاستراتيجي' : language === 'hi' ? 'रणनीतिक योजना' : 'Strategic Planning, Market Analysis'
                },
                {
                  icon: '💻',
                  title: language.startsWith('zh') ? '技术咨询' : language === 'ja' ? '技術コンサルティング' : language === 'es' ? 'Consultoría Técnica' : language === 'fr' ? 'Conseil Technique' : language === 'ar' ? 'استشارات تقنية' : language === 'hi' ? 'तकनीकी परामर्श' : 'Technical Consulting',
                  desc: language.startsWith('zh') ? 'IT解决方案、数字化转型' : language === 'ja' ? 'ITソリューション、デジタル変革' : language === 'es' ? 'Soluciones IT' : language === 'fr' ? 'Solutions IT' : language === 'ar' ? 'حلول تكنولوجيا المعلومات' : language === 'hi' ? 'आईटी समाधान' : 'IT Solutions, Digital Transformation'
                },
                {
                  icon: '📊',
                  title: language.startsWith('zh') ? '财务咨询' : language === 'ja' ? '財務コンサルティング' : language === 'es' ? 'Consultoría Financiera' : language === 'fr' ? 'Conseil Financier' : language === 'ar' ? 'استشارات مالية' : language === 'hi' ? 'वित्तीय परामर्श' : 'Financial Consulting',
                  desc: language.startsWith('zh') ? '投资规划、风险管理' : language === 'ja' ? '投資計画、リスク管理' : language === 'es' ? 'Planificación de Inversiones' : language === 'fr' ? 'Planification des Investissements' : language === 'ar' ? 'تخطيط الاستثمار' : language === 'hi' ? 'निवेश योजना' : 'Investment Planning, Risk Management'
                }
              ].map((service, idx) => (
                <div key={idx} className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group text-center">
                  <span className="text-4xl block mb-3">{service.icon}</span>
                  <h5 className="text-white font-medium group-hover:text-[#00a4e4] transition-colors mb-2">
                    {service.title}
                  </h5>
                  <p className="text-gray-400 text-sm">{service.desc}</p>
                </div>
              ))}
            </div>


          </motion.div>
        </div>
      </section>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && confirmationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a2540] rounded-2xl border border-white/10 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-light text-white text-center mb-2">
                {language.startsWith('zh') ? '预约成功！' : 'Booking Confirmed!'}
              </h2>

              {/* Message */}
              <p className="text-gray-400 text-center mb-6">
                {confirmationData.message}
              </p>

              {/* Appointment Details */}
              <div className="bg-white/5 rounded-lg p-6 space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {language.startsWith('zh') ? '确认号' : 'Confirmation #'}
                  </span>
                  <span className="text-[#00a4e4] font-mono font-medium">
                    {confirmationData.appointment.confirmation_number}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {language.startsWith('zh') ? '姓名' : 'Name'}
                  </span>
                  <span className="text-white">
                    {confirmationData.appointment.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {language.startsWith('zh') ? '日期' : 'Date'}
                  </span>
                  <span className="text-white">
                    {confirmationData.appointment.appointment_date}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {language.startsWith('zh') ? '时间' : 'Time'}
                  </span>
                  <span className="text-white">
                    {confirmationData.appointment.time_slot}
                  </span>
                </div>

                {confirmationData.appointment.service_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {language.startsWith('zh') ? '服务类型' : 'Service'}
                    </span>
                    <span className="text-white">
                      {confirmationData.appointment.service_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Email Notice */}
              <p className="text-sm text-gray-400 text-center mb-6">
                {language.startsWith('zh')
                  ? '确认邮件已发送至您的邮箱，请查收。'
                  : 'A confirmation email has been sent to your inbox.'}
              </p>

              {/* Close Button */}
              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full bg-[#00a4e4] hover:bg-[#0088c2] text-white py-3 rounded-lg transition-colors font-medium"
              >
                {language.startsWith('zh') ? '关闭' : 'Close'}
              </button>

              {/* Close Icon */}
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-[#0a2540] border-white/10 my-4">
          <DialogHeader>
            <DialogTitle className="text-base md:text-xl text-white">
              {t('consulting.appointment.calendar.title')}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-gray-400">
              {t('consulting.appointment.desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 overflow-y-auto">
            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-white">
                {language.startsWith('zh') ? '联系信息' : 'Contact Information'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    {language.startsWith('zh') ? '姓名' : 'Name'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                    placeholder={language.startsWith('zh') ? '请输入您的姓名' : 'Enter your name'}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    {language.startsWith('zh') ? '邮箱' : 'Email'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                    placeholder={language.startsWith('zh') ? '请输入您的邮箱' : 'Enter your email'}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    {language.startsWith('zh') ? '电话' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                    placeholder={language.startsWith('zh') ? '请输入您的电话' : 'Enter your phone'}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    {language.startsWith('zh') ? '服务类型' : 'Service Type'}
                  </label>
                  <input
                    type="text"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                    placeholder={language.startsWith('zh') ? '咨询服务' : 'Consulting Service'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  {language.startsWith('zh') ? '备注' : 'Notes'}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] resize-none"
                  placeholder={language.startsWith('zh') ? '请输入备注信息' : 'Enter any notes'}
                />
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <h3 className="mb-2 text-sm md:text-base font-medium text-white">
                {language.startsWith('zh') ? '选择日期' : 'Select Date'}
              </h3>
              <div className="flex justify-center -mx-2 md:mx-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-white/10 scale-[0.8] md:scale-90"
                  disabled={{ before: new Date() }}
                  captionLayout="buttons"
                />
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="mb-2 text-sm md:text-base font-medium text-white">
                  {language.startsWith('zh') ? '选择时间' : 'Select Time'}
                  {loadingSlots && (
                    <span className="ml-2 text-xs text-gray-400">
                      {language.startsWith('zh') ? '加载中...' : 'Loading...'}
                    </span>
                  )}
                </h3>
                {/* Time slots grid: 3 columns on mobile, 4 on desktop */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                  {timeSlots.map((time) => {
                    const slotInfo = availableSlots.find(s => s.time_slot === time);
                    const isAvailable = slotInfo?.available !== false;
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && setSelectedTime(time)}
                        disabled={!isAvailable || loadingSlots}
                        className={`py-1.5 md:py-2 text-xs md:text-sm rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#00a4e4] text-white border-[#00a4e4]'
                            : isAvailable
                            ? 'glass text-gray-300 border-white/10 hover:border-[#00a4e4]'
                            : 'bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed'
                        }`}
                      >
                        {time}
                        {!isAvailable && (
                          <div className="text-[9px] md:text-[10px] mt-0.5">
                            {language.startsWith('zh') ? '已满' : 'Full'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {bookingError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                <p className="text-red-400 text-xs">{bookingError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            {/* Submit Button */}
            {selectedDate && selectedTime && (
              <Button
                onClick={handleBooking}
                disabled={isSubmitting}
                className="w-full bg-[#00a4e4] hover:bg-[#0088c2] text-base py-3 disabled:opacity-50"
              >
                {isSubmitting
                  ? (language.startsWith('zh') ? '提交中...' : 'Submitting...')
                  : t('consulting.appointment.calendar.confirm')
                }
              </Button>
            )}

            {/* Help Text */}
            <div className="text-center text-xs text-gray-500">
              {language.startsWith('zh')
                ? '💡 提示：可以滚动查看所有内容'
                : '💡 Tip: Scroll to view all content'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
