<template>
  <div class="image-importer">
    <div class="import-section">
      <h3>导入图片</h3>
      <div 
        class="drop-area"
        @dragover.prevent
        @dragenter.prevent
        @drop="handleDrop"
        :class="{ 'drag-over': isDragOver }"
      >
        <p>拖拽图片到此处或</p>
        <button @click="triggerFileSelect">选择文件</button>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        />
      </div>
      <div class="import-actions">
        <button @click="triggerFolderSelect">导入文件夹</button>
        <input
          ref="folderInput"
          type="file"
          webkitdirectory
          directory
          multiple
          @change="handleFolderSelect"
          style="display: none"
        />
      </div>
    </div>
    
    <div class="image-list" v-if="images.length > 0">
      <h3>已导入图片 ({{ images.length }})</h3>
      <div class="image-grid">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="image-item"
          :class="{ 'selected': selectedImageIndex === index }"
          @click="selectImage(index)"
        >
          <img :src="image.previewUrl" :alt="image.file.name" />
          <div class="image-info">
            <span class="image-name">{{ image.file.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface ImageItem {
  file: File
  previewUrl: string
}

const images = defineModel<ImageItem[]>('images', { default: () => [] })
const selectedImageIndex = defineModel<number>('selectedImageIndex')

const fileInput = ref<HTMLInputElement | null>(null)
const folderInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// 触发文件夹选择
const triggerFolderSelect = () => {
  folderInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    addFiles(Array.from(input.files))
  }
}

// 处理文件夹选择
const handleFolderSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    addFiles(Array.from(input.files))
  }
}

// 处理拖拽
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files)
    addFiles(files)
  }
}

// 添加文件
const addFiles = (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  const newImages = imageFiles.map(file => ({
    file,
    previewUrl: URL.createObjectURL(file)
  }))
  
  // 添加到现有图片列表
  images.value = [...images.value, ...newImages]
  
  // 如果还没有选中图片，则选中第一张
  if (selectedImageIndex.value === -1 && newImages.length > 0) {
    selectedImageIndex.value = images.value.length - newImages.length
  }
}

// 选择图片
const selectImage = (index: number) => {
  selectedImageIndex.value = index
}

// 清理预览URL以防止内存泄漏
const cleanupPreviewUrls = () => {
  images.value.forEach(image => {
    URL.revokeObjectURL(image.previewUrl)
  })
}

// 组件卸载时清理
onUnmounted(() => {
  cleanupPreviewUrls()
})

// 监听拖拽事件
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // 检查是否真的离开了drop区域
  if (event.relatedTarget === null) {
    isDragOver.value = false
  }
}
</script>

<style scoped>
.image-importer {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.import-section h3 {
  margin-top: 0;
  color: #333;
}

.drop-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s;
  background-color: #fff;
}

.drop-area.drag-over {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.drop-area p {
  margin: 0 0 15px 0;
  color: #666;
}

.drop-area button {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.drop-area button:hover {
  background-color: #337ecc;
}

.import-actions {
  text-align: center;
}

.import-actions button {
  padding: 8px 16px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.import-actions button:hover {
  background-color: #5daf34;
}

.image-list h3 {
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-item {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
}

.image-item.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px #409eff;
}

.image-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 5px;
}

.image-name {
  font-size: 12px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>