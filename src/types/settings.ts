// 水印设置类型定义
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

// 导出设置类型定义
export interface ExportSettings {
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