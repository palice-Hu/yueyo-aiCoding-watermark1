<template>
  <div class="watermark-preview">
    <h3>预览</h3>
    <div 
      class="preview-container"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
    >
      <canvas 
        ref="previewCanvas" 
        class="preview-canvas"
        v-show="!!imageSrc"
        @mousedown="startDrag"
      ></canvas>
      <div v-if="!imageSrc" class="no-preview">
        <p>请选择一张图片进行预览</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, reactive } from 'vue'

const props = defineProps<{
  imageSrc: string | null
  watermarkSettings: any
}>()

const emit = defineEmits<{
  (e: 'update:watermarkPosition', position: { x: number; y: number }): void
}>()

// 定义水印设置接口
interface WatermarkSettings {
  watermarkType: 'text' | 'image'
  text: {
    content: string
    fontSize: number
    color: string
    opacity: number
  }
  position: string
  rotation: number
  repeat: boolean
  image?: {
    file: File | null
    opacity: number
  }
}

const previewCanvas = ref<HTMLCanvasElement | null>(null)
const imageElement = new Image()
const dragState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  startWatermarkX: 0,
  startWatermarkY: 0,
  watermarkX: 0,
  watermarkY: 0,
  watermarkWidth: 0,
  watermarkHeight: 0
})

// 监听图片源和水印设置的变化
watch([() => props.imageSrc, () => props.watermarkSettings], () => {
  if (props.imageSrc) {
    loadImageAndApplyWatermark()
  }
}, { deep: true })

// 处理拖拽悬停
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

// 处理拖拽放置
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
}

// 开始拖拽
const startDrag = (event: MouseEvent) => {
  if (!previewCanvas.value) return
  
  const canvas = previewCanvas.value
  const rect = canvas.getBoundingClientRect()
  
  // 计算点击位置相对于canvas的坐标
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 检查是否点击在水印上
  if (isClickOnWatermark(x, y)) {
    dragState.isDragging = true
    dragState.startX = event.clientX
    dragState.startY = event.clientY
    dragState.startWatermarkX = dragState.watermarkX
    dragState.startWatermarkY = dragState.watermarkY
    
    // 添加事件监听器
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', stopDrag)
    
    event.preventDefault()
  }
}

// 处理拖拽过程
const handleDrag = (event: MouseEvent) => {
  if (!dragState.isDragging) return
  
  const deltaX = event.clientX - dragState.startX
  const deltaY = event.clientY - dragState.startY
  
  dragState.watermarkX = dragState.startWatermarkX + deltaX
  dragState.watermarkY = dragState.startWatermarkY + deltaY
  
  // 重新绘制画布以显示拖拽效果
  if (imageElement.complete && previewCanvas.value) {
    const canvas = previewCanvas.value
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 重新绘制图片和水印
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imageElement, 0, 0)
      drawDraggedWatermark(ctx)
    }
  }
}

// 停止拖拽
const stopDrag = () => {
  dragState.isDragging = false
  
  // 移除事件监听器
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 发出位置更新事件
  emit('update:watermarkPosition', {
    x: dragState.watermarkX,
    y: dragState.watermarkY
  })
}

// 检查点击是否在水印上
const isClickOnWatermark = (x: number, y: number): boolean => {
  return (
    x >= dragState.watermarkX &&
    x <= dragState.watermarkX + dragState.watermarkWidth &&
    y >= dragState.watermarkY &&
    y <= dragState.watermarkY + dragState.watermarkHeight
  )
}

// 绘制拖拽中的水印
const drawDraggedWatermark = (ctx: CanvasRenderingContext2D) => {
  const { text, rotation } = props.watermarkSettings
  const { content, fontSize, color, opacity } = text
  
  if (!content) return
  
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
  
  // 应用旋转
  if (rotation !== 0) {
    const centerX = dragState.watermarkX + dragState.watermarkWidth / 2
    const centerY = dragState.watermarkY + dragState.watermarkHeight / 2
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation * Math.PI / 180)
    ctx.translate(-centerX, -centerY)
  }
  
  // 绘制文本
  ctx.fillText(content, dragState.watermarkX, dragState.watermarkY)
  
  // 恢复上下文
  ctx.restore()
}

// 加载图片并应用水印
const loadImageAndApplyWatermark = () => {
  if (!props.imageSrc) return
  
  imageElement.onload = () => {
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
  
  // 设置画布尺寸
  canvas.width = imageElement.width
  canvas.height = imageElement.height
  
  // 绘制原图
  ctx.drawImage(imageElement, 0, 0)
  
  // 应用水印
  applyWatermark(ctx)
}

// 应用水印
const applyWatermark = (ctx: CanvasRenderingContext2D) => {
  const { watermarkType, text, position, rotation } = props.watermarkSettings
  
  if (watermarkType === 'text' && text.content) {
    applyTextWatermark(ctx)
  } else if (watermarkType === 'image' && props.watermarkSettings.image.file) {
    // 图片水印需要异步加载，简化处理
    applyTextWatermark(ctx) // 暂时用文本水印代替
  }
}

// 应用文本水印
const applyTextWatermark = (ctx: CanvasRenderingContext2D) => {
  const { text, position, rotation, repeat } = props.watermarkSettings
  const { content, fontSize, color, opacity } = text
  
  if (!content) return
  
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
  
  // 保存水印尺寸信息用于拖拽检测
  dragState.watermarkWidth = textWidth
  dragState.watermarkHeight = textHeight
  
  if (repeat) {
    // 平铺水印
    const margin = 20
    for (let y = margin; y < previewCanvas.value!.height - textHeight; y += textHeight + 40) {
      for (let x = margin; x < previewCanvas.value!.width - textWidth; x += textWidth + 40) {
        drawSingleWatermark(ctx, content, x, y, textWidth, textHeight, rotation)
      }
    }
  } else {
    // 单个水印
    const { x, y } = calculateWatermarkPosition(
      previewCanvas.value!.width,
      previewCanvas.value!.height,
      textWidth,
      textHeight,
      position
    )
    
    // 保存水印位置信息用于拖拽
    dragState.watermarkX = x
    dragState.watermarkY = y
    
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
      return { x: margin, y: canvasHeight - textHeight - margin }
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
  object-fit: contain;
  display: block;
  cursor: default;
}

.no-preview {
  text-align: center;
  color: #999;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>