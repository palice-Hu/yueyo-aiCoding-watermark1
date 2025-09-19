<template>
  <div class="app">
    <h1>照片水印添加工具</h1>
    
    <div class="container">
      <!-- 文件夹选择区域 -->
      <div class="section">
        <h2>选择照片文件夹</h2>
        <input 
          type="file" 
          id="folder-input"
          webkitdirectory
          directory
          multiple
          @change="handleFolderSelect"
          accept="image/*"
        />
        <label for="folder-input" class="folder-label">
          点击选择包含照片的文件夹
        </label>
        <div v-if="selectedFolderName" class="file-info">
          已选择文件夹: {{ selectedFolderName }}
        </div>
        <div v-if="selectedFiles.length > 0" class="file-info">
          包含 {{ selectedFiles.length }} 个图片文件
        </div>
      </div>

      <!-- 水印设置区域 -->
      <div class="section" v-if="selectedFiles.length > 0">
        <h2>水印设置</h2>
        
        <!-- 字体大小 -->
        <div class="setting-item">
          <label>字体大小: {{ watermarkSettings.fontSize }}px</label>
          <input 
            type="range" 
            min="10" 
            max="100" 
            v-model="watermarkSettings.fontSize"
            class="slider"
          />
        </div>

        <!-- 字体颜色 -->
        <div class="setting-item">
          <label>字体颜色:</label>
          <input 
            type="color" 
            v-model="watermarkSettings.color"
            class="color-picker"
          />
        </div>

        <!-- 水印位置 -->
        <div class="setting-item">
          <label>水印位置:</label>
          <select v-model="watermarkSettings.position" class="position-select">
            <option value="top-left">左上角</option>
            <option value="top-center">顶部居中</option>
            <option value="top-right">右上角</option>
            <option value="center">居中</option>
            <option value="bottom-left">左下角</option>
            <option value="bottom-center">底部居中</option>
            <option value="bottom-right">右下角</option>
          </select>
        </div>

        <!-- 处理按钮 -->
        <button 
          @click="processImages" 
          :disabled="isProcessing"
          class="process-button"
        >
          {{ isProcessing ? '处理中...' : '开始处理' }}
        </button>

        <!-- 进度条 -->
        <div v-if="isProcessing" class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div v-if="isProcessing" class="progress-text">
          处理进度: {{ progress }}% ({{ processedCount }}/{{ selectedFiles.length }})
        </div>
      </div>

      <!-- 处理结果 -->
      <div v-if="processedFiles.length > 0 && !isProcessing" class="section">
        <h2>处理完成</h2>
        <p>成功处理 {{ processedFiles.length }} 个文件</p>
        <p>输出路径: {{ outputFolder }}</p>
        <div class="result-actions">
          <button @click="downloadAll" class="download-button">
            批量下载处理后的图片
          </button>
          <p class="note">
            注意：由于浏览器安全限制，图片无法直接保存到文件系统。
            点击上方按钮可将处理后的图片打包下载。
            在完整应用中，图片将保存到: {{ outputFolder }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getPhotoTakenTime, getFileNameWithoutExtension } from './utils/exifUtils'
import { addWatermarkToImage, type WatermarkSettings } from './composables/useWatermark'

// 定义类型
interface ProcessedFile {
  name: string
  path: string
  dataUrl: string
  file: File
}

// 响应式数据
const selectedFiles = ref<File[]>([])
const selectedFolderName = ref('')
const isProcessing = ref(false)
const progress = ref(0)
const processedCount = ref(0)
const processedFiles = ref<ProcessedFile[]>([])

const watermarkSettings = reactive<WatermarkSettings>({
  fontSize: 24,
  color: '#ffffff',
  position: 'bottom-right'
})

const outputFolder = ref('')

// 处理文件夹选择
const handleFolderSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    // 获取文件夹名称（从第一个文件的路径中提取）
    const firstFilePath = input.files[0].webkitRelativePath
    const folderName = firstFilePath.split('/')[0]
    selectedFolderName.value = folderName
    
    // 过滤出图片文件
    const imageFiles = Array.from(input.files).filter(file => 
      file.type.startsWith('image/')
    )
    selectedFiles.value = imageFiles
    processedFiles.value = []
    outputFolder.value = ''
  }
}

// 下载单个文件
const downloadFile = (dataUrl: string, filename: string) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 批量下载所有处理后的文件
const downloadAll = () => {
  // 由于浏览器限制，我们逐个下载文件
  processedFiles.value.forEach((file, index) => {
    setTimeout(() => {
      downloadFile(file.dataUrl, file.name)
    }, index * 1000) // 间隔1秒下载，避免浏览器阻止
  })
}

// 处理图片
const processImages = async () => {
  if (selectedFiles.value.length === 0 || !selectedFolderName.value) return
  
  isProcessing.value = true
  progress.value = 0
  processedCount.value = 0
  processedFiles.value = []
  
  // 根据PRD要求设置输出文件夹路径：原目录名+"_watermark"
  outputFolder.value = selectedFolderName.value + '_watermark'
  
  // 处理每个文件
  const totalFiles = selectedFiles.value.length
  
  for (let i = 0; i < totalFiles; i++) {
    const file = selectedFiles.value[i]
    
    try {
      // 读取图片拍摄时间
      const takenTime = await getPhotoTakenTime(file)
      const watermarkText = takenTime || '未知时间'
      
      // 创建图片对象
      const imageUrl = URL.createObjectURL(file)
      const img = new Image()
      
      const processImage = () => {
        try {
          // 添加水印
          const watermarkedImage = addWatermarkToImage(img, watermarkText, watermarkSettings)
          
          // 更新进度
          processedCount.value++
          progress.value = Math.round((processedCount.value / totalFiles) * 100)
          
          // 释放图片URL
          URL.revokeObjectURL(imageUrl)
          
          // 添加到已处理列表
          processedFiles.value.push({
            name: file.name,
            path: `${outputFolder.value}/${file.name}`,
            dataUrl: watermarkedImage,
            file: file
          })
        } catch (error) {
          console.error(`处理文件 ${file.name} 时出错:`, error)
          // 即使出错也继续处理下一个文件
          processedCount.value++
          progress.value = Math.round((processedCount.value / totalFiles) * 100)
        }
      }
      
      img.onload = processImage
      
      img.onerror = () => {
        console.error(`加载图片 ${file.name} 失败`)
        // 即使出错也继续处理下一个文件
        processedCount.value++
        progress.value = Math.round((processedCount.value / totalFiles) * 100)
      }
      
      img.src = imageUrl
      
      // 添加小延迟以避免阻塞UI
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`处理文件 ${file.name} 时出错:`, error)
      processedCount.value++
      progress.value = Math.round((processedCount.value / totalFiles) * 100)
    }
  }
  
  // 等待所有文件处理完成
  const checkCompletion = setInterval(() => {
    if (processedCount.value >= totalFiles) {
      clearInterval(checkCompletion)
      isProcessing.value = false
    }
  }, 100)
}
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

h2 {
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.folder-label {
  display: block;
  padding: 15px;
  background: #409eff;
  color: white;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.folder-label:hover {
  background: #337ecc;
}

.file-info {
  margin-top: 10px;
  color: #666;
  font-style: italic;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.slider {
  width: 100%;
}

.color-picker {
  width: 60px;
  height: 40px;
}

.position-select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.process-button {
  width: 100%;
  padding: 15px;
  background: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.process-button:hover:not(:disabled) {
  background: #5daf34;
}

.process-button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.download-button {
  width: 100%;
  padding: 15px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 15px;
}

.download-button:hover {
  background: #337ecc;
}

.result-actions {
  margin-top: 20px;
}

.note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  color: #856404;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  margin: 20px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  color: #666;
  font-weight: bold;
}
</style>