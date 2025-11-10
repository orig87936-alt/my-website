import { useState, useEffect } from 'react';
import { MessageCircle, Send, Calendar as CalendarIcon, ArrowRight, CheckCircle, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { appointmentsAPI, AppointmentConfirmation, AvailableSlot, chatAPI, ChatResponse, SourceReference } from '../services/api';

// Message type for chat
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
  sources?: SourceReference[];
}

export function ConsultingPage() {
  const { language, t } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('consulting.chat.welcome'),
      sender: 'bot',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

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

  const quickReplies = [
    t('consulting.chat.q1'),
    t('consulting.chat.q2'),
    t('consulting.chat.q3')
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  ];

  // Restore chat session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chat_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Optionally: load chat history
      // loadChatHistory(savedSessionId);
    }
  }, []);

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

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      // Call chat API
      const response: ChatResponse = await chatAPI.send({
        message: userMessage.text,
        session_id: sessionId || undefined
      });

      // Save session ID for multi-turn conversation
      if (!sessionId) {
        setSessionId(response.session_id);
        // Persist to localStorage
        localStorage.setItem('chat_session_id', response.session_id);
      }

      // Add bot response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response.message,
        sender: 'bot',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);

      // Fallback error message
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: language.startsWith('zh')
          ? '抱歉，我暂时无法回答。请稍后再试或联系人工客服。'
          : 'Sorry, I cannot respond right now. Please try again later or contact our support team.',
        sender: 'bot',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = async (reply: string) => {
    if (reply === t('consulting.chat.q2')) {
      setIsBookingOpen(true);
      return;
    }

    // Set input value and trigger send
    setInputValue(reply);

    // Simulate a small delay to show the input
    setTimeout(() => {
      handleSend();
    }, 100);
  };

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
              <MessageCircle className="w-4 h-4 text-[#00a4e4]" />
              <span className="text-sm text-gray-300">{t('consulting.chat.title')}</span>
            </div>
            <h1 className="text-6xl font-light text-white mb-6">
              {t('consulting.hero.title')}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              {t('consulting.hero.subtitle')}
            </p>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="group inline-flex items-center gap-3 bg-[#00a4e4] hover:bg-[#0088c2] text-white px-10 py-4 rounded-full transition-all"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="font-medium">{t('consulting.appointment.button')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Chatbot Section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-dark rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00a4e4] to-[#3b5bdb] p-6 flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {t('consulting.chat.title')}
                </h3>
                <p className="text-white/80 text-sm">
                  {language.startsWith('zh') ? '在线 · 即时响应' : 'Online · Instant Response'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-8 space-y-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-6 py-4 ${
                      message.sender === 'user'
                        ? 'bg-[#00a4e4] text-white'
                        : 'glass text-white'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">
                          {language.startsWith('zh') ? '参考来源：' : 'Sources:'}
                        </p>
                        <div className="space-y-2">
                          {message.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[#00a4e4] font-medium">
                                  {source.type === 'faq' ? '📋 FAQ' : '📰 Article'}
                                </span>
                                <span className="text-gray-300">{source.title}</span>
                              </div>
                              {source.snippet && (
                                <p className="text-gray-400 mt-1 line-clamp-2">{source.snippet}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isSending && (
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a4e4] to-[#3b5bdb] flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="glass text-white max-w-[75%] rounded-2xl px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-400">
                        {language.startsWith('zh') ? '正在思考...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && !isSending && (
              <div className="px-8 py-4 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-3">
                  {language.startsWith('zh') ? '推荐问题' : language === 'ja' ? 'おすすめの質問' : language === 'es' ? 'Preguntas Rápidas' : language === 'fr' ? 'Questions Rapides' : language === 'ar' ? 'أسئلة سريعة' : language === 'hi' ? 'त्वरित प्रश्न' : 'Quick Questions'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="glass px-4 py-2 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
                  placeholder={t('consulting.chat.placeholder')}
                  disabled={isSending}
                  className="flex-1 glass px-6 py-4 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a4e4] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !inputValue.trim()}
                  className="bg-[#00a4e4] hover:bg-[#0088c2] text-white p-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#00a4e4]"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
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
          {/* Close Button */}
          <button
            onClick={() => setIsBookingOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-50"
          >
            <X className="w-5 h-5" />
          </button>

          <DialogHeader>
            <DialogTitle className="text-xl text-white pr-8">
              {t('consulting.appointment.calendar.title')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              {t('consulting.appointment.desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
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
              <h3 className="mb-2 text-base font-medium text-white">
                {language.startsWith('zh') ? '选择日期' : 'Select Date'}
              </h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-white/10 scale-90"
                  disabled={(date) => date < new Date()}
                />
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="mb-2 text-base font-medium text-white">
                  {language.startsWith('zh') ? '选择时间' : 'Select Time'}
                  {loadingSlots && (
                    <span className="ml-2 text-xs text-gray-400">
                      {language.startsWith('zh') ? '加载中...' : 'Loading...'}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const slotInfo = availableSlots.find(s => s.time_slot === time);
                    const isAvailable = slotInfo?.available !== false;
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && setSelectedTime(time)}
                        disabled={!isAvailable || loadingSlots}
                        className={`py-2 text-sm rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#00a4e4] text-white border-[#00a4e4]'
                            : isAvailable
                            ? 'glass text-gray-300 border-white/10 hover:border-[#00a4e4]'
                            : 'bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed'
                        }`}
                      >
                        {time}
                        {!isAvailable && (
                          <div className="text-[10px] mt-0.5">
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
            <div className="text-center text-xs text-gray-500 pt-2 border-t border-white/5">
              {language.startsWith('zh')
                ? '💡 提示：可以滚动查看所有内容，点击右上角 ✕ 或背景区域关闭'
                : '💡 Tip: Scroll to view all content, click ✕ or background to close'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
