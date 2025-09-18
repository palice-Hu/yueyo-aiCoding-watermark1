# 照片水印添加工具

一个基于Vue3 + TypeScript的Web应用程序，用于为照片自动添加基于拍摄时间的水印。

## 功能特点

- 选择文件夹中的所有图片文件
- 自动读取照片的EXIF信息，提取拍摄时间
- 自定义水印的文字大小、颜色和位置
- 批量处理照片并将结果保存到指定目录
- 简洁直观的用户界面

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite (构建工具)
- EXIF解析库
- HTML5 Canvas (图片处理)

## 安装与运行

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装步骤

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd photo-watermark-tool

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建项目

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 使用说明

1. 打开应用程序页面
2. 点击"选择文件夹"按钮，选择包含照片的文件夹
3. 设置水印参数：
   - 调整字体大小
   - 选择字体颜色
   - 选择水印位置（左上角、居中、右下角等）
4. 点击"开始处理"按钮
5. 等待处理完成，处理后的照片将保存在原目录下的`[原目录名]_watermark`文件夹中

## 项目结构

```
src/
├── components/        # Vue组件
├── composables/       # Vue组合式函数
├── utils/             # 工具函数
├── App.vue            # 根组件
└── main.ts            # 入口文件
```

## 开发计划

- [ ] 实现文件夹选择功能
- [ ] 集成EXIF读取功能
- [ ] 开发水印设置界面
- [ ] 实现图片处理和保存功能
- [ ] 添加进度提示和错误处理
- [ ] 美化界面和用户体验优化

## 许可证

MIT