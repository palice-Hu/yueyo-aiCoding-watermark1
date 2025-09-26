<template>
  <div class="watermark-preview">
    <h3>预览</h3>
    <div class="preview-container">
      <canvas 
        ref="previewCanvas" 
        class="preview-canvas"
        v-show="!!imageSrc"
      ></canvas>
      <div v-if="!imageSrc" class="no-preview">
        <p>请选择一张图片进行预览</p>
      </div>
      <div 
        v-if="isDragMode && imageSrc" 
        class="drag-overlay"
        @mousedown="handleDragStart"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, nextTick, defineEmits } from 'vue'

const props = defineProps<{
  imageSrc: string | null
  watermarkSettings: any
  isDragMode?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:watermarkSettings', value: any): void
  (e: 'watermark-position-updated'): void
}>()

const previewCanvas = ref<HTMLCanvasElement | null>(null)
const imageElement = new Image()
let isDragging = false
let dragStart = { x: 0, y: 0 }
let watermarkInfo = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

// 监听图片源和水印设置的变化
watch([() => props.imageSrc, () => props.watermarkSettings], () => {
  if (props.imageSrc) {
    loadImageAndApplyWatermark()
  }
}, { deep: true })

// 处理拖拽开始
const handleDragStart = (event: MouseEvent) => {
  if (!props.isDragMode || !previewCanvas.value) return
  
  const canvas = previewCanvas.value
  const rect = canvas.getBoundingClientRect()
  
  // 获取相对于画布的点击位置
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 计算实际画布中的坐标（考虑缩放比例）
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const canvasX = x * scaleX
  const canvasY = y * scaleY
  
  console.log('鼠标点击位置:', x, y)
  console.log('画布显示尺寸:', rect.width, rect.height)
  console.log('画布实际尺寸:', canvas.width, canvas.height)
  console.log('缩放比例:', scaleX, scaleY)
  console.log('画布内实际坐标:', canvasX, canvasY)
  console.log('水印信息:', watermarkInfo)
  
  // 检查点击是否在水印上
  if (isPointInWatermark(canvasX, canvasY)) {
    console.log('点击在水印上，开始拖拽')
    isDragging = true
    dragStart = { x: canvasX, y: canvasY }
    
    // 添加全局事件监听器
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    
    event.preventDefault()
    event.stopPropagation()
  } else {
    console.log('点击不在水印上')
    console.log('水印区域: (', watermarkInfo.x, ',', watermarkInfo.y, ') - (', 
      watermarkInfo.x + watermarkInfo.width, ',', watermarkInfo.y + watermarkInfo.height, ')')
  }
}

// 处理拖拽移动
const handleDragMove = (event: MouseEvent) => {
  if (!isDragging || !previewCanvas.value) return
  
  const canvas = previewCanvas.value
  const rect = canvas.getBoundingClientRect()
  
  // 获取相对于画布的点击位置
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 计算实际画布中的坐标（考虑缩放比例）
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const canvasX = x * scaleX
  const canvasY = y * scaleY
  
  // 计算移动距离
  const deltaX = canvasX - dragStart.x
  const deltaY = canvasY - dragStart.y
  
  // 更新水印位置（带边界检查）
  const newX = Math.max(0, Math.min(watermarkInfo.x + deltaX, canvas.width - watermarkInfo.width))
  const newY = Math.max(0, Math.min(watermarkInfo.y + deltaY, canvas.height - watermarkInfo.height))
  
  console.log('拖动到新位置:', newX, newY)
  
  // 更新拖拽起始点
  dragStart = { x: canvasX, y: canvasY }
  
  // 更新水印信息
  watermarkInfo.x = newX
  watermarkInfo.y = newY
  
  // 更新水印设置
  updateWatermarkPosition(newX, newY)
  
  // 重新绘制
  drawWatermarkedImage()
  
  event.preventDefault()
}

// 处理拖拽结束
const handleDragEnd = () => {
  if (isDragging) {
    console.log('结束拖拽')
    isDragging = false
    
    // 移除全局事件监听器
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    
    // 发送位置更新事件
    emits('watermark-position-updated')
  }
}

// 检查点是否在水印区域内
const isPointInWatermark = (x: number, y: number): boolean => {
  const inWatermark = (
    x >= watermarkInfo.x &&
    x <= watermarkInfo.x + watermarkInfo.width &&
    y >= watermarkInfo.y &&
    y <= watermarkInfo.y + watermarkInfo.height
  )
  
  console.log('检查点是否在水印内:', inWatermark)
  console.log('点击坐标: (', x, ',', y, ')')
  console.log('水印区域: (', watermarkInfo.x, ',', watermarkInfo.y, ') - (', 
    watermarkInfo.x + watermarkInfo.width, ',', watermarkInfo.y + watermarkInfo.height, ')')
    
  return inWatermark
}

// 更新水印位置
const updateWatermarkPosition = (x: number, y: number) => {
  if (!previewCanvas.value) return
  
  const canvas = previewCanvas.value
  // 计算相对位置百分比
  const relativeX = (x / canvas.width) * 100
  const relativeY = (y / canvas.height) * 100
  
  console.log('更新水印位置 - 绝对坐标:(', x, ',', y, ') 相对坐标:(', relativeX, ',', relativeY, ')')
  
  // 创建新的设置对象
  const newSettings = JSON.parse(JSON.stringify(props.watermarkSettings))
  newSettings.position = 'custom'
  newSettings.customPosition = { 
    x: relativeX, 
    y: relativeY 
  }
  
  emits('update:watermarkSettings', newSettings)
}

// 加载图片并应用水印
const loadImageAndApplyWatermark = () => {
  if (!props.imageSrc) return
  
  imageElement.onload = () => {
    console.log('图片加载完成，开始绘制')
    drawWatermarkedImage()
  }
  
  imageElement.src = props.imageSrc
}

// 绘制带水印的图片
const drawWatermarkedImage = async () => {
  await nextTick()
  
  if (!previewCanvas.value) return
  
  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return
  
  // 设置画布尺寸以匹配图片尺寸
  canvas.width = imageElement.width
  canvas.height = imageElement.height
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制原图
  ctx.drawImage(imageElement, 0, 0)
  
  // 应用水印
  applyWatermark(ctx)
}

// 应用水印
const applyWatermark = (ctx: CanvasRenderingContext2D) => {
  const { watermarkType, text, position, rotation, customPosition } = props.watermarkSettings
  
  if (watermarkType === 'text' && text.content) {
    applyTextWatermark(ctx)
  } else if (watermarkType === 'image' && props.watermarkSettings.image.file) {
    // 图片水印需要异步加载，简化处理
    applyTextWatermark(ctx) // 暂时用文本水印代替
  }
}

// 应用文本水印
const applyTextWatermark = (ctx: CanvasRenderingContext2D) => {
  const { text, position, rotation, repeat, customPosition } = props.watermarkSettings
  const { content, fontSize, color, opacity } = text
  
  if (!content) {
    console.log('没有水印内容')
    return
  }
  
  console.log('应用文本水印 - 位置:', position, '自定义位置:', customPosition)
  
  // 保存当前上下文
  ctx.save()
  
  // 设置文本样式
  ctx.font = `bold ${fontSize}px Arial`
  ctx.fillStyle = color
  ctx.globalAlpha = opacity / 100
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  // 添加阴影效果以提高可读性
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  
  // 计算文本尺寸
  const textMetrics = ctx.measureText(content)
  const textWidth = textMetrics.width
  const textHeight = fontSize // 近似高度
  
  console.log('文本尺寸 - 宽度:', textWidth, '高度:', textHeight)
  
  // 更新水印尺寸信息
  watermarkInfo.width = textWidth
  watermarkInfo.height = textHeight
  
  let x, y
  if (repeat) {
    // 平铺水印
    const margin = 20
    for (let y = margin; y < previewCanvas.value!.height - textHeight; y += textHeight + 40) {
      for (let x = margin; x < previewCanvas.value!.width - textWidth; x += textWidth + 40) {
        drawSingleWatermark(ctx, content, x, y, textWidth, textHeight, rotation)
      }
    }
    console.log('绘制平铺水印')
  } else {
    // 如果是自定义位置
    if (position === 'custom' && customPosition) {
      x = (customPosition.x / 100) * previewCanvas.value!.width
      y = (customPosition.y / 100) * previewCanvas.value!.height
      console.log('使用自定义位置 - x:', x, 'y:', y)
    } else {
      // 使用预设位置
      const pos = calculateWatermarkPosition(
        previewCanvas.value!.width,
        previewCanvas.value!.height,
        textWidth,
        textHeight,
        position
      )
      x = pos.x
      y = pos.y
      console.log('使用预设位置 - x:', x, 'y:', y, '位置类型:', position)
    }
    
    // 更新水印位置信息
    watermarkInfo.x = x
    watermarkInfo.y = y
    
    console.log('保存水印位置信息 - x:', x, 'y:', y)
    
    // 绘制水印
    drawSingleWatermark(ctx, content, x, y, textWidth, textHeight, rotation)
  }
  
  // 恢复上下文
  ctx.restore()
}

// 绘制单个水印
const drawSingleWatermark = (
  ctx: CanvasRenderingContext2D,
  content: string,
  x: number,
  y: number,
  textWidth: number,
  textHeight: number,
  rotation: number
) => {
  // 保存上下文状态
  ctx.save()
  
  // 应用旋转
  if (rotation !== 0) {
    const centerX = x + textWidth / 2
    const centerY = y + textHeight / 2
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation * Math.PI / 180)
    ctx.translate(-centerX, -centerY)
  }
  
  // 绘制文本
  ctx.fillText(content, x, y)
  
  // 恢复上下文状态
  ctx.restore()
}

// 计算水印位置
const calculateWatermarkPosition = (
  canvasWidth: number,
  canvasHeight: number,
  textWidth: number,
  textHeight: number,
  position: string
) => {
  const margin = 20
  
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin }
    case 'top-center':
      return { x: (canvasWidth - textWidth) / 2, y: margin }
    case 'top-right':
      return { x: canvasWidth - textWidth - margin, y: margin }
    case 'center-left':
      return { x: margin, y: (canvasHeight - textHeight) / 2 }
    case 'center':
      return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight - textHeight) / 2 }
    case 'center-right':
      return { x: canvasWidth - textWidth - margin, y: (canvasHeight - textHeight) / 2 }
    case 'bottom-left':
      return { x: margin, y: canvasHeight - textHeight - margin }
    case 'bottom-center':
      return { x: (canvasWidth - textWidth) / 2, y: canvasHeight - textHeight - margin }
    case 'bottom-right':
      return { x: canvasWidth - textWidth - margin, y: canvasHeight - textHeight - margin }
    default:
      // 默认位置为右下角
      return { x: canvasWidth - textWidth - margin, y: canvasHeight - textHeight - margin }
  }
}
</script>

<style scoped>
.watermark-preview {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.watermark-preview h3 {
  margin-top: 0;
  color: #333;
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.preview-canvas {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.no-preview {
  text-align: center;
  color: #999;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: move;
  z-index: 10;
}
</style>