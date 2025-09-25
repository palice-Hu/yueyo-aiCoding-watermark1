<template>
  <div class="watermark-settings">
    <h3>水印设置</h3>
    
    <!-- 水印类型选择 -->
    <div class="setting-group">
      <label class="setting-label">水印类型:</label>
      <div class="type-options">
        <label class="type-option">
          <input 
            type="radio" 
            v-model="settings.watermarkType" 
            value="text"
          />
          文本水印
        </label>
        <label class="type-option">
          <input 
            type="radio" 
            v-model="settings.watermarkType" 
            value="image"
          />
          图片水印
        </label>
      </div>
    </div>
    
    <!-- 文本水印设置 -->
    <div v-if="settings.watermarkType === 'text'" class="text-watermark-settings">
      <div class="setting-group">
        <label class="setting-label">水印文本:</label>
        <input 
          v-model="settings.text.content" 
          type="text" 
          placeholder="输入水印文本"
          class="text-input"
        />
      </div>
      
      <div class="setting-group">
        <label class="setting-label">字体大小: {{ settings.text.fontSize }}px</label>
        <input 
          type="range" 
          min="10" 
          max="100" 
          v-model.number="settings.text.fontSize"
          class="slider"
        />
      </div>
      
      <div class="setting-group">
        <label class="setting-label">字体颜色:</label>
        <input 
          type="color" 
          v-model="settings.text.color"
          class="color-picker"
        />
      </div>
      
      <div class="setting-group">
        <label class="setting-label">透明度: {{ settings.text.opacity }}%</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          v-model.number="settings.text.opacity"
          class="slider"
        />
      </div>
    </div>
    
    <!-- 图片水印设置 -->
    <div v-else class="image-watermark-settings">
      <div class="setting-group">
        <label class="setting-label">选择水印图片:</label>
        <button @click="triggerImageSelect">选择图片</button>
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          @change="handleImageSelect"
          style="display: none"
        />
        <div v-if="settings.image.file" class="selected-image-preview">
          <img 
            :src="settings.image.previewUrl" 
            :alt="settings.image.file.name" 
          />
          <span>{{ settings.image.file.name }}</span>
        </div>
      </div>
      
      <div class="setting-group">
        <label class="setting-label">缩放: {{ settings.image.scale }}%</label>
        <input 
          type="range" 
          min="10" 
          max="200" 
          v-model.number="settings.image.scale"
          class="slider"
        />
      </div>
      
      <div class="setting-group">
        <label class="setting-label">透明度: {{ settings.image.opacity }}%</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          v-model.number="settings.image.opacity"
          class="slider"
        />
      </div>
    </div>
    
    <!-- 位置设置 -->
    <div class="setting-group">
      <label class="setting-label">位置:</label>
      <div class="position-grid">
        <div 
          v-for="position in positions" 
          :key="position.value"
          class="position-item"
          :class="{ 'selected': settings.position === position.value }"
          @click="settings.position = position.value"
        >
          {{ position.label }}
        </div>
      </div>
      <div class="position-actions">
        <button @click="enableDragPosition">拖拽定位</button>
      </div>
    </div>
    
    <!-- 旋转设置 -->
    <div class="setting-group">
      <label class="setting-label">旋转: {{ settings.rotation }}°</label>
      <input 
        type="range" 
        min="0" 
        max="360" 
        v-model.number="settings.rotation"
        class="slider"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 导出类型定义
export interface TextWatermarkSettings {
  content: string
  fontSize: number
  color: string
  opacity: number
}

export interface ImageWatermarkSettings {
  file: File | null
  previewUrl: string
  scale: number
  opacity: number
}

export type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 
                        'center-left' | 'center' | 'center-right' | 
                        'bottom-left' | 'bottom-center' | 'bottom-right'

export interface WatermarkSettings {
  watermarkType: 'text' | 'image'
  text: TextWatermarkSettings
  image: ImageWatermarkSettings
  position: WatermarkPosition
  rotation: number
}

const settings = defineModel<WatermarkSettings>({ 
  default: () => ({
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
})

const imageInput = ref<HTMLInputElement | null>(null)

// 位置选项
const positions = [
  { label: '↖', value: 'top-left' },
  { label: '↑', value: 'top-center' },
  { label: '↗', value: 'top-right' },
  { label: '←', value: 'center-left' },
  { label: '○', value: 'center' },
  { label: '→', value: 'center-right' },
  { label: '↙', value: 'bottom-left' },
  { label: '↓', value: 'bottom-center' },
  { label: '↘', value: 'bottom-right' },
]

// 触发图片选择
const triggerImageSelect = () => {
  imageInput.value?.click()
}

// 处理图片选择
const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    if (file.type.startsWith('image/')) {
      // 清理之前的预览URL
      if (settings.value.image.previewUrl) {
        URL.revokeObjectURL(settings.value.image.previewUrl)
      }
      
      settings.value.image.file = file
      settings.value.image.previewUrl = URL.createObjectURL(file)
    }
  }
}

// 启用拖拽定位
const enableDragPosition = () => {
  // 发送事件通知父组件启用拖拽模式
  const event = new CustomEvent('enableDragPosition')
  window.dispatchEvent(event)
}
</script>

<style scoped>
.watermark-settings {
  padding: 10px 0;
}

.watermark-settings h3 {
  margin-top: 0;
  color: #333;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.type-options {
  display: flex;
  gap: 15px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.text-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.slider {
  width: 100%;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 4px;
}

.selected-image-preview {
  margin-top: 10px;
}

.selected-image-preview img {
  max-width: 100px;
  max-height: 100px;
  display: block;
  margin-bottom: 5px;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.position-item {
  padding: 10px;
  text-align: center;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.position-item:hover {
  background-color: #ecf5ff;
}

.position-item.selected {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.position-actions {
  text-align: center;
}

.position-actions button {
  padding: 6px 12px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.position-actions button:hover {
  background-color: #5daf34;
}
</style>