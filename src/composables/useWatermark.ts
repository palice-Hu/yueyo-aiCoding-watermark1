import { ref } from 'vue'

/**
 * 水印位置类型
 */
export type WatermarkPosition = 
  'top-left' | 'top-center' | 'top-right' | 
  'center' | 
  'bottom-left' | 'bottom-center' | 'bottom-right'

/**
 * 水印设置接口
 */
export interface WatermarkSettings {
  fontSize: number
  color: string
  position: WatermarkPosition
}

/**
 * 在图片上添加水印
 * @param image 原始图片
 * @param text 水印文本
 * @param settings 水印设置
 * @returns 添加水印后的图片数据URL
 */
export function addWatermarkToImage(
  image: HTMLImageElement,
  text: string,
  settings: WatermarkSettings
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('无法获取canvas上下文')
  }
  
  // 设置canvas尺寸与图片一致
  canvas.width = image.width
  canvas.height = image.height
  
  // 绘制原图
  ctx.drawImage(image, 0, 0)
  
  // 设置水印样式
  ctx.font = `bold ${settings.fontSize}px Arial`
  ctx.fillStyle = settings.color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  // 计算水印位置
  const textWidth = ctx.measureText(text).width
  const x = calculateX(canvas.width, textWidth, settings.position)
  const y = calculateY(canvas.height, settings.fontSize, settings.position)
  
  // 绘制水印（添加阴影效果以提高可读性）
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  ctx.fillText(text, x, y)
  
  // 返回处理后的图片数据
  return canvas.toDataURL('image/jpeg', 0.9)
}

/**
 * 计算水印X坐标
 * @param canvasWidth canvas宽度
 * @param textWidth 文本宽度
 * @param position 水印位置
 * @returns X坐标
 */
function calculateX(
  canvasWidth: number,
  textWidth: number,
  position: WatermarkPosition
): number {
  switch (position) {
    case 'top-left':
    case 'center':
    case 'bottom-left':
      return 20
    case 'top-center':
    case 'bottom-center':
      return (canvasWidth - textWidth) / 2
    case 'top-right':
    case 'bottom-right':
      return canvasWidth - textWidth - 20
    default:
      return 20
  }
}

/**
 * 计算水印Y坐标
 * @param canvasHeight canvas高度
 * @param textHeight 文本高度（近似为字体大小）
 * @param position 水印位置
 * @returns Y坐标
 */
function calculateY(
  canvasHeight: number,
  textHeight: number,
  position: WatermarkPosition
): number {
  switch (position) {
    case 'top-left':
    case 'top-center':
    case 'top-right':
      return 20
    case 'center':
      return (canvasHeight - textHeight) / 2
    case 'bottom-left':
    case 'bottom-center':
    case 'bottom-right':
      return canvasHeight - textHeight - 20
    default:
      return canvasHeight - textHeight - 20
  }
}