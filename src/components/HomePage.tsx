import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, useScroll, useTransform } from 'motion/react';
import videoFile from '../assets/aa5b69881025d98f3974c2d1a5a4812c_raw.mp4';

export function HomePage() {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  
  // Parallax effect for hero section - smoother transitions
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 0.5, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2540] via-[#0e2d50] to-[#051429] relative">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00a4e4]/20 rounded-full blur-[120px] animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3b5bdb]/20 rounded-full blur-[120px] animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Video Hero Section - Full Screen */}
      <motion.section
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a2540] via-[#0d2847] to-[#051429]"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      >
        {/* Video Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 mb-12 text-center px-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide">
            {language.startsWith('zh') ? '视频标题' : 'SOLID ITRATIVE EVOLUTION'}
          </h1>
        </motion.div>

        {/* Video Container */}
        <div className="relative z-10 w-full flex items-center justify-center flex-1">
          {!isPlaying ? (
            <div className="w-full h-full flex items-center justify-center">
              {/* Video Window with Play Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="relative w-[90%] max-w-5xl aspect-video rounded-3xl overflow-hidden glass shadow-2xl"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a3654]/80 via-[#0d2847]/90 to-[#0a2540]/85 flex items-center justify-center">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                      style={{ width: '50%', skewX: '-20deg' }}
                    />
                  </div>

                  <button
                    onClick={() => setIsPlaying(true)}
                    className="group relative"
                    aria-label="Play video"
                  >
                    {/* Outer Glow */}
                    <div className="absolute inset-0 rounded-full bg-[#00a4e4]/20 blur-2xl scale-150 group-hover:bg-[#00a4e4]/30 transition-all duration-500"></div>
                    
                    {/* Play Button */}
                    <div className="relative z-10 w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center transition-all duration-500 group-hover:bg-white/20 group-hover:border-[#00a4e4]/50 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,164,228,0.3)]">
                      <Play className="w-12 h-12 text-white ml-2 group-hover:text-[#00a4e4] transition-colors duration-300" fill="white" />
                    </div>
                    
                    {/* Pulse Animation */}
                    <div className="absolute inset-0 rounded-full bg-[#00a4e4]/20 animate-ping"></div>
                  </button>
                </div>

                {/* Decorative corner accents with glow */}
                <motion.div 
                  className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[#00a4e4]/30 rounded-tl-3xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <div className="absolute top-0 left-0 w-8 h-8 bg-[#00a4e4]/20 blur-xl rounded-full"></div>
                </motion.div>
                <motion.div 
                  className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#3b5bdb]/30 rounded-br-3xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#3b5bdb]/20 blur-xl rounded-full"></div>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="w-[90%] max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  controls
                >
                  <source src={videoFile} type="video/mp4" />
                  您的浏览器不支持视频播放�?                </video>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Scroll Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00a4e4] to-[#3b5bdb] origin-left z-50 shadow-[0_0_10px_rgba(0,164,228,0.5)]"
        style={{ scaleX: scrollYProgress }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />

      {/* Company Introduction Section with City Background */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: useTransform(scrollYProgress, [0.3, 0.8], [-50, 100]) }}
        >
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMGludmVzdG1lbnR8ZW58MXx8fHwxNzYwNDUzNTcyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="City skyline"
            className="w-full h-full object-cover scale-110"
          />
          {/* Dark Overlay with gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#051429]/92 via-[#0a2540]/88 to-black/92"></div>
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </motion.div>

        {/* Content - Left Aligned */}
        <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Company Name - Large Title with enhanced effects */}
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-light text-white mb-8 tracking-tight leading-tight relative group">
                S&L
                {/* Subtle underline accent */}
                <motion.div
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-[#00a4e4] to-transparent rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: '30%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </h2>

              {/* Description with stagger animation */}
              <motion.p
                className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                SUNLUNER&LEX INC. (S&L) commited to strenth the competitiveness of client company during the business develpoment.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
