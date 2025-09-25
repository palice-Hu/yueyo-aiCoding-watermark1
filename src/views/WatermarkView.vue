<template>
  <div class="watermark-view">
    <h1>照片水印添加工具 V2</h1>
    
    <div class="main-container">
      <!-- 左侧：图片导入和列表 -->
      <div class="left-panel">
        <ImageImporter 
          v-model:images="images" 
          v-model:selectedImageIndex="selectedImageIndex"
        />
      </div>
      
      <!-- 中间：预览区域 -->
      <div class="center-panel">
        <WatermarkPreview 
          :image-src="selectedImage.previewUrl"
          :watermark-settings="watermarkSettings"
        />
      </div>
      
      <!-- 右侧：设置面板 -->
      <div class="right-panel">
        <div class="settings-panel">
          <WatermarkSettings v-model="watermarkSettings" />
          <ExportSettings v-model="exportSettings" />
          <TemplateManager />
          
          <div class="process-actions">
            <button 
              @click="processImages" 
              :disabled="processing"
              class="process-button"
            >
              {{ processing ? '处理中...' : '开始处理' }}
            </button>
            
            <div v-if="processing" class="progress-info">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                处理进度: {{ Math.round(progress) }}% ({{ processedCount }}/{{ totalCount }})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import ImageImporter from '../components/ImageImporter.vue'
import WatermarkSettings from '../components/WatermarkSettings.vue'
import ExportSettings from '../components/ExportSettings.vue'
import TemplateManager from '../components/TemplateManager.vue'
import WatermarkPreview from '../components/WatermarkPreview.vue'

// 类型定义
interface ImageItem {
  file: File
  previewUrl: string
}

interface TextWatermarkSettings {
  content: string
  fontSize: number
  color: string
  opacity: number
}

interface ImageWatermarkSettings {
  file: File | null
  previewUrl: string
  scale: number
  opacity: number
}

type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 
                        'center-left' | 'center' | 'center-right' | 
                        'bottom-left' | 'bottom-center' | 'bottom-right'

interface WatermarkSettings {
  watermarkType: 'text' | 'image'
  text: TextWatermarkSettings
  image: ImageWatermarkSettings
  position: WatermarkPosition
  rotation: number
}

interface ExportSettings {
  outputFormat: 'jpeg' | 'png'
  outputFolder: string
  namingRule: 'original' | 'prefix' | 'suffix'
  prefix: string
  suffix: string
  jpegQuality: number
  resizeMode: 'none' | 'width' | 'height' | 'percentage'
  resizeWidth: number
  resizeHeight: number
  resizePercentage: number
}

// 响应式数据
const images = ref<ImageItem[]>([])
const selectedImageIndex = ref(-1)
const processing = ref(false)
const progress = ref(0)
const processedCount = ref(0)
const totalCount = ref(0)

// 计算属性
const selectedImage = computed(() => {
  if (selectedImageIndex.value >= 0 && selectedImageIndex.value < images.value.length) {
    return images.value[selectedImageIndex.value]
  }
  return { file: null, previewUrl: '' }
})

// 水印设置
const watermarkSettings = reactive<WatermarkSettings>({
  watermarkType: 'text',
  text: {
    content: '水印文本',
    fontSize: 24,
    color: '#ffffff',
    opacity: 100
  },
  image: {
    file: null,
    previewUrl: '',
    scale: 100,
    opacity: 100
  },
  position: 'bottom-right',
  rotation: 0
})

// 导出设置
const exportSettings = reactive<ExportSettings>({
  outputFormat: 'jpeg',
  outputFolder: '',
  namingRule: 'original',
  prefix: 'wm_',
  suffix: '_watermarked',
  jpegQuality: 90,
  resizeMode: 'none',
  resizeWidth: 1920,
  resizeHeight: 1080,
  resizePercentage: 100
})

// 处理图片
const processImages = async () => {
  if (images.value.length === 0) {
    alert('请先导入图片')
    return
  }
  
  processing.value = true
  progress.value = 0
  processedCount.value = 0
  totalCount.value = images.value.length
  
  // 模拟处理过程
  for (let i = 0; i < images.value.length; i++) {
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 500))
    
    processedCount.value++
    progress.value = (processedCount.value / totalCount.value) * 100
  }
  
  processing.value = false
  alert('图片处理完成！')
}
</script>

<style scoped>
.watermark-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.watermark-view h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.main-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 150px);
}

.left-panel {
  flex: 1;
  min-width: 300px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.center-panel {
  flex: 2;
  min-width: 400px;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  min-width: 300px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.process-actions {
  margin-top: auto;
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

.progress-info {
  margin-top: 15px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
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