// 新闻数据检查和修复脚本
// 在浏览器控制台中运行此脚本

console.log('=== 新闻数据诊断工具 ===');
console.log('');

// 检查当前 localStorage 中的数据
console.log('1. 检查 localStorage 数据:');
const liveNews = localStorage.getItem('liveNewsList');
const focusPoint = localStorage.getItem('focusPointNews');
const featured = localStorage.getItem('featuredArticles');

console.log('实时新闻 (liveNewsList):', liveNews ? `存在 (${JSON.parse(liveNews).length} 条)` : '不存在');
console.log('焦点新闻 (focusPointNews):', focusPoint ? '存在' : '不存在');
console.log('特色文章 (featuredArticles):', featured ? `存在 (${JSON.parse(featured).length} 篇)` : '不存在');
console.log('');

// 如果数据为空数组，显示警告
if (liveNews) {
    const liveData = JSON.parse(liveNews);
    if (liveData.length === 0) {
        console.warn('⚠️ 警告: liveNewsList 是空数组！');
    }
}

if (featured) {
    const featuredData = JSON.parse(featured);
    if (featuredData.length === 0) {
        console.warn('⚠️ 警告: featuredArticles 是空数组！');
    }
}

console.log('');
console.log('2. 修复方案:');
console.log('如果要清除所有新闻数据并恢复默认值，请在控制台运行:');
console.log('');
console.log('localStorage.removeItem("liveNewsList");');
console.log('localStorage.removeItem("focusPointNews");');
console.log('localStorage.removeItem("featuredArticles");');
console.log('location.reload();');
console.log('');
console.log('或者直接运行: clearNewsData()');
console.log('');

// 提供一个快捷函数
window.clearNewsData = function() {
    console.log('清除新闻数据...');
    localStorage.removeItem('liveNewsList');
    localStorage.removeItem('focusPointNews');
    localStorage.removeItem('featuredArticles');
    console.log('✅ 已清除！正在刷新页面...');
    setTimeout(() => location.reload(), 1000);
};

window.showNewsData = function() {
    console.log('=== 当前新闻数据 ===');
    console.log('实时新闻:', JSON.parse(localStorage.getItem('liveNewsList') || 'null'));
    console.log('焦点新闻:', JSON.parse(localStorage.getItem('focusPointNews') || 'null'));
    console.log('特色文章:', JSON.parse(localStorage.getItem('featuredArticles') || 'null'));
};

console.log('可用命令:');
console.log('- clearNewsData() : 清除所有新闻数据并刷新');
console.log('- showNewsData() : 显示当前所有新闻数据');

