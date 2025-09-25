<template>
  <div class="template-manager">
    <h3>模板管理</h3>
    
    <div class="template-actions">
      <input 
        v-model="newTemplateName" 
        type="text" 
        placeholder="模板名称"
        class="template-name-input"
      />
      <button @click="saveTemplate" class="save-button">保存模板</button>
    </div>
    
    <div class="template-list" v-if="templates.length > 0">
      <h4>已保存的模板:</h4>
      <div 
        v-for="(template, index) in templates" 
        :key="index"
        class="template-item"
      >
        <span class="template-name">{{ template.name }}</span>
        <div class="template-actions">
          <button @click="loadTemplate(index)" class="load-button">加载</button>
          <button @click="deleteTemplate(index)" class="delete-button">删除</button>
        </div>
      </div>
    </div>
    
    <div v-else class="no-templates">
      <p>暂无保存的模板</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface WatermarkTemplate {
  name: string
  settings: any // 这里应该是具体的水印设置类型
  timestamp: number
}

const templates = ref<WatermarkTemplate[]>([])
const newTemplateName = ref('')

// 从localStorage加载模板
onMounted(() => {
  loadTemplatesFromStorage()
})

const loadTemplatesFromStorage = () => {
  const savedTemplates = localStorage.getItem('watermarkTemplates')
  if (savedTemplates) {
    templates.value = JSON.parse(savedTemplates)
  }
}

const saveTemplatesToStorage = () => {
  localStorage.setItem('watermarkTemplates', JSON.stringify(templates.value))
}

// 保存当前设置为模板
const saveTemplate = () => {
  if (!newTemplateName.value.trim()) {
    alert('请输入模板名称')
    return
  }
  
  // 获取当前设置（在实际应用中，应该从父组件传递）
  const currentSettings = {}
  
  const newTemplate: WatermarkTemplate = {
    name: newTemplateName.value,
    settings: currentSettings,
    timestamp: Date.now()
  }
  
  templates.value.push(newTemplate)
  saveTemplatesToStorage()
  newTemplateName.value = ''
}

// 加载模板
const loadTemplate = (index: number) => {
  const template = templates.value[index]
  // 在实际应用中，应该将模板设置传递给父组件
  console.log('加载模板:', template)
  alert(`加载模板: ${template.name}`)
}

// 删除模板
const deleteTemplate = (index: number) => {
  if (confirm('确定要删除此模板吗？')) {
    templates.value.splice(index, 1)
    saveTemplatesToStorage()
  }
}
</script>

<style scoped>
.template-manager {
  padding: 10px 0;
}

.template-manager h3 {
  margin-top: 0;
  color: #333;
}

.template-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.template-name-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.save-button {
  padding: 8px 16px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.save-button:hover {
  background-color: #5daf34;
}

.template-list h4 {
  margin: 0 0 10px 0;
  color: #555;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
}

.template-name {
  font-weight: bold;
}

.template-actions button {
  margin-left: 5px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.load-button {
  background-color: #409eff;
  color: white;
}

.load-button:hover {
  background-color: #337ecc;
}

.delete-button {
  background-color: #f56c6c;
  color: white;
}

.delete-button:hover {
  background-color: #d44d4d;
}

.no-templates {
  text-align: center;
  color: #999;
  padding: 20px 0;
}
</style>