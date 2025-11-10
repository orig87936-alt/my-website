// 读取localStorage数据的脚本
const fs = require('fs');
const path = require('path');

// 这个脚本需要在浏览器环境中运行
// 请在浏览器控制台中运行以下代码：

const script = `
// 读取所有新闻数据
const newsData = {
  featuredArticles: localStorage.getItem('featuredArticles'),
  focusPointNews: localStorage.getItem('focusPointNews'),
  liveNewsList: localStorage.getItem('liveNewsList')
};

// 解析JSON
Object.keys(newsData).forEach(key => {
  if (newsData[key]) {
    try {
      newsData[key] = JSON.parse(newsData[key]);
    } catch (e) {
      console.error('Failed to parse ' + key, e);
    }
  }
});

// 输出到控制台
console.log('=== 新闻数据 ===');
console.log(JSON.stringify(newsData, null, 2));

// 也可以下载为文件
const blob = new Blob([JSON.stringify(newsData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'news-data.json';
a.click();
URL.revokeObjectURL(url);
`;

console.log('请在浏览器控制台（F12）中运行以下代码：');
console.log('='.repeat(80));
console.log(script);
console.log('='.repeat(80));

