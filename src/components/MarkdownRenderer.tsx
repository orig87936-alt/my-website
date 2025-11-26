import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'motion/react';

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'code' | 'quote' | 'markdown';
  text?: string;
  items?: string[];
  url?: string;
  caption?: string;
  language?: string;
  level?: number;
  width?: number;
  height?: number;
}

interface MarkdownRendererProps {
  content: ContentBlock[];
  showTOC?: boolean;
  className?: string;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function MarkdownRenderer({ content, showTOC = true, className = '' }: MarkdownRendererProps) {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});
  const contentRef = useRef<HTMLDivElement>(null);

  // Debug: Log content
  useEffect(() => {
    console.log('📝 MarkdownRenderer received content:', {
      type: typeof content,
      isArray: Array.isArray(content),
      length: Array.isArray(content) ? content.length : 'N/A',
      content: content
    });
  }, [content]);

  // Generate TOC from headings
  useEffect(() => {
    const headings: TOCItem[] = [];
    content.forEach((block, index) => {
      if (block.type === 'heading' && block.text) {
        const id = `heading-${index}`;
        headings.push({
          id,
          text: block.text,
          level: block.level || 2,
        });
      }
    });
    setToc(headings);
  }, [content]);

  // Intersection Observer for active TOC item
  useEffect(() => {
    if (!showTOC || toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
      }
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [toc, showTOC]);

  // Lazy load images
  const handleImageLoad = (index: number) => {
    setImageLoadStates((prev) => ({ ...prev, [index]: true }));
  };

  // Scroll to TOC item
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Render content block
  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="text-base text-gray-300 leading-relaxed tracking-wide mb-6"
            style={{ textAlign: 'justify' }}
          >
            {block.text}
          </motion.p>
        );

      case 'heading':
        const headingId = `heading-${index}`;
        const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-4xl font-light text-white mt-16 mb-8 pb-4 border-b-2 border-[#00a4e4]/50',
          2: 'text-3xl font-light text-white mt-12 mb-6 pb-3 border-b border-[#00a4e4]/30',
          3: 'text-2xl font-light text-white mt-10 mb-5',
          4: 'text-xl font-light text-white mt-8 mb-4',
          5: 'text-lg font-medium text-white mt-6 mb-3',
          6: 'text-base font-medium text-white mt-4 mb-2',
        };

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <HeadingTag id={headingId} className={headingClasses[block.level || 2]}>
              {block.text}
            </HeadingTag>
          </motion.div>
        );

      case 'list':
        return (
          <motion.ul
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-3 ml-6 mb-6"
          >
            {block.items?.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="text-base text-gray-300 leading-relaxed tracking-wide flex items-start gap-3"
              >
                <span className="text-[#00a4e4] mt-2 flex-shrink-0">•</span>
                <span style={{ textAlign: 'justify', flex: 1 }}>{item}</span>
              </li>
            ))}
          </motion.ul>
        );

      case 'image':
        // 计算图片样式
        const imageStyle: React.CSSProperties = {};
        if (block.width && block.height) {
          // 如果有自定义尺寸，使用自定义尺寸
          imageStyle.width = `${block.width}px`;
          imageStyle.height = `${block.height}px`;
        } else if (block.width) {
          // 只有宽度，高度自动
          imageStyle.width = `${block.width}px`;
          imageStyle.height = 'auto';
        } else if (block.height) {
          // 只有高度，宽度自动
          imageStyle.width = 'auto';
          imageStyle.height = `${block.height}px`;
        }
        // 如果没有自定义尺寸，使用默认的 w-full h-auto

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="my-8 flex justify-center"
          >
            <div className="relative rounded-xl shadow-2xl" style={block.width || block.height ? { display: 'inline-block' } : {}}>
              {/* Lazy loading placeholder */}
              {!imageLoadStates[index] && (
                <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />
              )}
              <img
                src={block.url}
                alt={block.caption || ''}
                loading="lazy"
                onLoad={() => handleImageLoad(index)}
                className={`${block.width || block.height ? '' : 'w-full h-auto'} object-contain transition-opacity duration-300 rounded-xl ${
                  imageLoadStates[index] ? 'opacity-100' : 'opacity-0'
                }`}
                style={imageStyle}
              />
            </div>
            {block.caption && (
              <p className="text-sm text-gray-400 mt-3 text-center italic">{block.caption}</p>
            )}
          </motion.div>
        );

      case 'code':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="my-6 rounded-xl overflow-hidden"
          >
            <SyntaxHighlighter
              language={block.language || 'javascript'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                borderRadius: '0.75rem',
              }}
              showLineNumbers
            >
              {block.text || ''}
            </SyntaxHighlighter>
          </motion.div>
        );

      case 'quote':
        return (
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-l-4 border-[#00a4e4] pl-6 py-4 my-6 bg-white/5 rounded-r-lg italic"
          >
            <p className="text-lg text-gray-300 leading-relaxed" style={{ textAlign: 'justify' }}>{block.text}</p>
          </motion.blockquote>
        );

      case 'markdown':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="markdown-content"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl font-light text-white mt-16 mb-8 pb-4 border-b-2 border-[#00a4e4]/50">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-3xl font-light text-white mt-12 mb-6 pb-3 border-b border-[#00a4e4]/30">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl font-light text-white mt-10 mb-5">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-base text-gray-300 leading-relaxed tracking-wide mb-6" style={{ textAlign: 'justify' }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => <ul className="space-y-3 ml-6 mb-6">{children}</ul>,
                ol: ({ children }) => <ol className="space-y-3 ml-6 mb-6 list-decimal">{children}</ol>,
                li: ({ children }) => (
                  <li className="text-base text-gray-300 leading-relaxed tracking-wide flex items-start gap-3">
                    <span className="text-[#00a4e4] mt-2 flex-shrink-0">•</span>
                    <span style={{ textAlign: 'justify', flex: 1 }}>{children}</span>
                  </li>
                ),
                img: ({ src, alt }: any) => (
                  <div className="my-8 flex justify-center">
                    <div className="relative rounded-xl shadow-2xl max-w-full">
                      <img
                        src={src}
                        alt={alt || ''}
                        loading="lazy"
                        className="w-full h-auto object-contain rounded-xl"
                      />
                      {alt && (
                        <p className="text-sm text-gray-400 mt-3 text-center italic">{alt}</p>
                      )}
                    </div>
                  </div>
                ),
                code: ({ inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: '1.5rem 0',
                        padding: '1.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        borderRadius: '0.75rem',
                      }}
                      showLineNumbers
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-white/10 text-[#00a4e4] px-2 py-1 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#00a4e4] pl-6 py-4 my-6 bg-white/5 rounded-r-lg italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {block.text || ''}
            </ReactMarkdown>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Table of Contents - Only show on very large screens and positioned far right */}
      {showTOC && toc.length > 0 && (
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden 2xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto z-10"
          style={{ marginRight: 'max(0px, calc((100vw - 1400px) / 2))' }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Table of Contents
            </h3>
            <nav className="space-y-2">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left text-sm transition-colors ${
                    activeId === item.id ? 'text-[#00a4e4] font-medium' : 'text-gray-400 hover:text-white'
                  } ${item.level === 3 ? 'pl-4' : ''}`}
                  style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </motion.aside>
      )}

      {/* Content */}
      <div ref={contentRef} className="space-y-4" style={{ textAlign: 'justify' }}>
        {content.map((block, index) => renderBlock(block, index))}
      </div>
    </div>
  );
}

