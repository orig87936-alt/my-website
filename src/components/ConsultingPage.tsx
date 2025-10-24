import { useState } from 'react';
import { MessageCircle, Send, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export function ConsultingPage() {
  const { language } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: language === 'zh' 
        ? "您好！我是S&L投资咨询智能助手。有什么可以帮助您的吗？"
        : "Hello! I'm S&L AI assistant. How can I help you?",
      sender: 'bot',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickReplies = language === 'zh' 
    ? ["咨询投资服务", "预约咨询", "了解更多", "联系顾问"]
    : ["Investment Services", "Book Consultation", "Learn More", "Contact Advisor"];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: language === 'zh'
          ? "感谢您的咨询。我们的专业顾问会尽快与您联系。"
          : "Thank you for your inquiry. Our advisors will contact you soon.",
        sender: 'bot' as const,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    if (reply === "预约咨询" || reply === "Book Consultation") {
      setIsBookingOpen(true);
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      text: reply,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert(language === 'zh' ? '请选择日期和时间' : 'Please select date and time');
      return;
    }
    alert(language === 'zh' ? '预约成功！' : 'Booking successful!');
    setIsBookingOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a2540] pt-20">
      {/* Hero Section */}
      <section className="py-24 px-8 border-b border-white/10">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <MessageCircle className="w-4 h-4 text-[#00a4e4]" />
              <span className="text-sm text-gray-300">{language === 'zh' ? 'AI智能咨询' : 'AI Smart Consulting'}</span>
            </div>
            <h1 className="text-6xl font-light text-white mb-6">
              {language === 'zh' ? '专业投资咨询服务' : 'Professional Investment Consulting'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              {language === 'zh'
                ? '24/7智能助手为您服务 · 专业顾问团队支持 · 一对一定制咨询'
                : '24/7 AI Assistant · Expert Team Support · Personalized Consulting'
              }
            </p>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="group inline-flex items-center gap-3 bg-[#00a4e4] hover:bg-[#0088c2] text-white px-10 py-4 rounded-full transition-all"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="font-medium">{language === 'zh' ? '预约咨询' : 'Book Consultation'}</span>
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
                  {language === 'zh' ? 'S&L 智能助手' : 'S&L AI Assistant'}
                </h3>
                <p className="text-white/80 text-sm">
                  {language === 'zh' ? '在线 · 即时响应' : 'Online · Instant Response'}
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
                    <p className="leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-8 py-4 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-3">
                  {language === 'zh' ? '推荐问题' : 'Quick Questions'}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'zh' ? '输入您的问题...' : 'Type your question...'}
                  className="flex-1 glass px-6 py-4 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                />
                <button
                  onClick={handleSend}
                  className="bg-[#00a4e4] hover:bg-[#0088c2] text-white p-4 rounded-full transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#0a2540] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {language === 'zh' ? '预约咨询服务' : 'Book Consultation Service'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {language === 'zh'
                ? '选择您方便的日期和时间，我们的专业顾问将为您提供一对一咨询服务'
                : 'Choose your preferred date and time for personalized consultation'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <h3 className="mb-4 text-white">{language === 'zh' ? '选择日期' : 'Select Date'}</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-white/10"
                disabled={(date) => date < new Date()}
              />
            </div>

            {selectedDate && (
              <div>
                <h3 className="mb-4 text-white">{language === 'zh' ? '选择时间' : 'Select Time'}</h3>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-lg border transition-all ${
                        selectedTime === time
                          ? 'bg-[#00a4e4] text-white border-[#00a4e4]'
                          : 'glass text-gray-300 border-white/10 hover:border-[#00a4e4]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <Button
                onClick={handleBooking}
                className="w-full bg-[#00a4e4] hover:bg-[#0088c2] text-lg py-6"
              >
                {language === 'zh' ? '确认预约' : 'Confirm Booking'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
