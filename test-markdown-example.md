# 测试 Markdown 功能

这是一个测试文档，用于验证 Phase 4 的 Markdown 解析功能。

## 二级标题示例

这是二级标题下的段落内容。

### 三级标题示例

这是三级标题下的内容。

#### 四级标题示例

这是四级标题下的内容。

## 引用功能测试

> 这是一个引用块
> 引用可以包含多行内容

## 列表功能测试

### 无序列表

- 第一项
- 第二项
- 第三项

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 代码块测试

```python
def hello_world():
    print("Hello, World!")
    return True
```

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}
```

## 图片测试

![示例图片](https://via.placeholder.com/600x400)

![另一个图片](https://via.placeholder.com/800x600)

## 混合内容测试

这是一个包含多种元素的段落。

> 引用：重要的提示信息

然后是一些代码：

```bash
npm install
npm run dev
```

最后是一个列表：

- 功能 A
- 功能 B
- 功能 C

## 总结

这个文档测试了以下 Markdown 功能：

1. 多级标题（# 到 ####）
2. 引用块（>）
3. 代码块（```）
4. 图片（![alt](url)）
5. 列表（有序和无序）
6. 普通段落

所有这些功能都应该被正确解析为 ContentBlock 数组。

