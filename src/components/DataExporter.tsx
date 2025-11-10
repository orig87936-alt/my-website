import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';

export function DataExporter() {
  const [copied, setCopied] = useState(false);

  const exportData = () => {
    const data = {
      featuredArticles: localStorage.getItem('featuredArticles'),
      focusPointNews: localStorage.getItem('focusPointNews'),
      liveNewsList: localStorage.getItem('liveNewsList'),
    };

    return JSON.stringify(data, null, 2);
  };

  const handleCopy = () => {
    const data = exportData();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'news-data-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a2540] pt-32 px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-white mb-8">数据导出工具</h1>
        
        <div className="glass rounded-2xl p-8 mb-6">
          <h2 className="text-2xl text-white mb-4">LocalStorage 数据</h2>
          <pre className="bg-black/30 p-4 rounded-lg text-gray-300 text-sm overflow-auto max-h-96 mb-4">
            {exportData()}
          </pre>
          
          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? '已复制!' : '复制到剪贴板'}
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-[#3b5bdb] hover:bg-[#2f4bc7] text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              下载为文件
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl text-white mb-4">使用说明</h2>
          <div className="text-gray-300 space-y-3">
            <p>1. 点击"复制到剪贴板"按钮复制数据</p>
            <p>2. 将数据发送给开发人员</p>
            <p>3. 开发人员会将数据更新到代码文件中</p>
            <p>4. 更新后，所有用户都能看到最新内容</p>
          </div>
        </div>
      </div>
    </div>
  );
}

