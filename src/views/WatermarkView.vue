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
          @update:watermarkPosition="updateWatermarkPosition"
        />
        <!-- 拖拽提示 -->
        <div v-if="dragMode" class="drag-hint">
          请在水印上按下鼠标左键并拖拽到目标位置
        </div>
      </div>
      
      <!-- 右侧：设置面板 -->
      <div class="right-panel">
        <div class="settings-panel">
          <!-- 顶部导航按钮 -->
          <div class="panel-tabs">
            <button 
              :class="{ active: activePanel === 'watermark' }"
              @click="activePanel = 'watermark'"
            >
              水印设置
            </button>
            <button 
              :class="{ active: activePanel === 'export' }"
              @click="activePanel = 'export'"
            >
              导出设置
            </button>
            <button 
              :class="{ active: activePanel === 'template' }"
              @click="activePanel = 'template'"
            >
              模板管理
            </button>
          </div>

          <!-- 水印设置面板 -->
          <div v-show="activePanel === 'watermark'" class="panel-content">
            <WatermarkSettings 
              v-model="watermarkSettings" 
              @enable-drag-position="enableDragMode"
            />
          </div>

          <!-- 导出设置面板 -->
          <div v-show="activePanel === 'export'" class="panel-content">
            <ExportSettings v-model="exportSettings" />
          </div>

          <!-- 模板管理面板 -->
          <div v-show="activePanel === 'template'" class="panel-content">
            <TemplateManager />
          </div>
          
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
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
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
                        'bottom-left' | 'bottom-center' | 'bottom-right' |
                        'custom'

interface WatermarkSettings {
  watermarkType: 'text' | 'image'
  text: TextWatermarkSettings
  image: ImageWatermarkSettings
  position: WatermarkPosition
  rotation: number
  customPosition?: { x: number; y: number }
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
const activePanel = ref<'watermark' | 'export' | 'template'>('watermark')
const dragMode = ref(false)

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

// 更新水印位置
const updateWatermarkPosition = (position: { x: number; y: number }) => {
  // 设置自定义位置
  watermarkSettings.position = 'custom'
  watermarkSettings.customPosition = position
  // 退出拖拽模式
  dragMode.value = false
}

// 启用拖拽模式
const enableDragMode = () => {
  if (selectedImage.value.previewUrl) {
    dragMode.value = true
    // 添加说明文字，指导用户如何操作
    console.log('进入拖拽模式，请在水印上按下鼠标左键并拖拽到目标位置')
  } else {
    alert('请先选择一张图片')
  }
}

// 禁用拖拽模式
const disableDragMode = () => {
  dragMode.value = false
}

// 组件挂载时添加事件监听器
onMounted(() => {
  // 添加键盘事件监听，按ESC键退出拖拽模式
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      disableDragMode()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  // 清理事件监听器
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<style scoped>
.watermark-view {
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

.watermark-view h1 {
  text-align: center;
  color: #333;
  margin: 0 0 20px 0;
}

.main-container {
  display: flex;
  gap: 20px;
  height: calc(100% - 60px);
}

.left-panel {
  flex: 1;
  min-width: 300px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.center-panel {
  flex: 2;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.right-panel {
  flex: 1;
  min-width: 300px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.panel-tabs button {
  flex: 1;
  padding: 12px;
  border: none;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.panel-tabs button.active {
  background-color: #409eff;
  color: white;
}

.panel-tabs button:not(.active):hover {
  background-color: #e0e0e0;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
}

.process-actions {
  padding: 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
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

.drag-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 100;
}
</style>