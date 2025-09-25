<template>
  <div class="export-settings">
    <h3>导出设置</h3>
    
    <div class="setting-group">
      <label class="setting-label">输出格式:</label>
      <select v-model="settings.outputFormat" class="format-select">
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
      </select>
    </div>
    
    <div class="setting-group">
      <label class="setting-label">输出文件夹:</label>
      <input 
        v-model="settings.outputFolder" 
        type="text" 
        placeholder="输入输出文件夹路径"
        class="folder-input"
      />
      <button @click="selectOutputFolder" class="folder-button">选择文件夹</button>
    </div>
    
    <div class="setting-group">
      <label class="setting-label">文件命名规则:</label>
      <div class="naming-options">
        <label class="naming-option">
          <input 
            type="radio" 
            v-model="settings.namingRule" 
            value="original"
          />
          保留原文件名
        </label>
        <label class="naming-option">
          <input 
            type="radio" 
            v-model="settings.namingRule" 
            value="prefix"
          />
          添加前缀
        </label>
        <label class="naming-option">
          <input 
            type="radio" 
            v-model="settings.namingRule" 
            value="suffix"
          />
          添加后缀
        </label>
      </div>
      
      <div v-if="settings.namingRule === 'prefix'" class="naming-input">
        <input 
          v-model="settings.prefix" 
          type="text" 
          placeholder="前缀"
          class="text-input"
        />
      </div>
      
      <div v-else-if="settings.namingRule === 'suffix'" class="naming-input">
        <input 
          v-model="settings.suffix" 
          type="text" 
          placeholder="后缀"
          class="text-input"
        />
      </div>
    </div>
    
    <div v-if="settings.outputFormat === 'jpeg'" class="setting-group">
      <label class="setting-label">JPEG质量: {{ settings.jpegQuality }}%</label>
      <input 
        type="range" 
        min="0" 
        max="100" 
        v-model.number="settings.jpegQuality"
        class="slider"
      />
    </div>
    
    <div class="setting-group">
      <label class="setting-label">图片尺寸调整:</label>
      <div class="resize-options">
        <label class="resize-option">
          <input 
            type="radio" 
            v-model="settings.resizeMode" 
            value="none"
          />
          不调整
        </label>
        <label class="resize-option">
          <input 
            type="radio" 
            v-model="settings.resizeMode" 
            value="width"
          />
          按宽度
        </label>
        <label class="resize-option">
          <input 
            type="radio" 
            v-model="settings.resizeMode" 
            value="height"
          />
          按高度
        </label>
        <label class="resize-option">
          <input 
            type="radio" 
            v-model="settings.resizeMode" 
            value="percentage"
          />
          按百分比
        </label>
      </div>
      
      <div v-if="settings.resizeMode === 'width'" class="resize-input">
        <input 
          v-model.number="settings.resizeWidth" 
          type="number" 
          placeholder="宽度(像素)"
          class="number-input"
        />
      </div>
      
      <div v-else-if="settings.resizeMode === 'height'" class="resize-input">
        <input 
          v-model.number="settings.resizeHeight" 
          type="number" 
          placeholder="高度(像素)"
          class="number-input"
        />
      </div>
      
      <div v-else-if="settings.resizeMode === 'percentage'" class="resize-input">
        <input 
          v-model.number="settings.resizePercentage" 
          type="number" 
          placeholder="百分比"
          class="number-input"
        />
        <span>%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

// 导出类型定义
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

const settings = defineModel<ExportSettings>({
  default: () => ({
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
})

// 选择输出文件夹（在实际应用中需要与文件系统交互）
const selectOutputFolder = () => {
  // 在浏览器环境中，我们无法直接选择文件夹
  // 这里只是模拟功能
  alert('在完整应用中，这里会打开文件夹选择对话框')
}
</script>

<style scoped>
.export-settings {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.export-settings h3 {
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

.format-select,
.folder-input,
.text-input,
.number-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.folder-button {
  margin-top: 5px;
  padding: 8px 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.folder-button:hover {
  background-color: #337ecc;
}

.naming-options,
.resize-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.naming-option,
.resize-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.naming-input,
.resize-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.slider {
  width: 100%;
}
</style>