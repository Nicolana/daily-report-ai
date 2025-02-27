<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {
  HomeFilled,
  EditPen,
  Document,
  DataAnalysis,
  Plus,
  Bell,
  Setting
} from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const pageTitle = computed(() => {
  return route.meta.title || '工作台'
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="app">
      <el-container>
        <el-aside width="240px" class="sidebar">
          <div class="logo">
            <!-- <img src="@/assets/logo.png" alt="Logo" /> -->
            <h1>日报助手</h1>
          </div>
          
          <el-menu
            :default-active="$route.path"
            class="nav-menu"
            :router="true"
            :collapse="false"
          >
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>工作台</span>
            </el-menu-item>
            
            <el-menu-item index="/new">
              <el-icon><EditPen /></el-icon>
              <span>写日报</span>
            </el-menu-item>
            
            <el-menu-item index="/logs">
              <el-icon><Document /></el-icon>
              <span>日志列表</span>
            </el-menu-item>
            
            <el-menu-item index="/summary">
              <el-icon><DataAnalysis /></el-icon>
              <span>工作总结</span>
            </el-menu-item>
          </el-menu>
          
          <div class="sidebar-footer">
            <el-button type="success" @click="$router.push('/new')">
              <el-icon><Plus /></el-icon>写日报
            </el-button>
          </div>
        </el-aside>
        
        <el-container class="main-container">
          <el-header class="header">
            <div class="header-left">
              <h2 class="page-title">{{ pageTitle }}</h2>
            </div>
            <div class="header-right">
              <el-button link>
                <el-icon><Bell /></el-icon>
              </el-button>
              <el-button link>
                <el-icon><Setting /></el-icon>
              </el-button>
            </div>
          </el-header>
          
          <el-main>
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </el-config-provider>
</template>

<style>
@import './styles/variables.css';

.app {
  min-height: 100vh;
  background-color: #ffffff;
}

.sidebar {
  background-color: #ffffff;
  border-right: 1px solid var(--border-color);
  height: 100vh;
  position: fixed;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.03);
}

.logo {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo h1 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 600;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  flex: 1;
  border: none;
  padding: var(--spacing-md) 0;
}

:deep(.el-menu-item) {
  height: 48px;
  margin: 4px 12px;
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
}

:deep(.el-menu-item.is-active) {
  background-image: var(--primary-gradient) !important;
  color: white !important;
}

:deep(.el-menu-item:hover:not(.is-active)) {
  background-color: rgba(96, 199, 183, 0.1) !important;
  color: var(--primary-color) !important;
}

.sidebar-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.sidebar-footer .el-button {
  width: 100%;
  background-image: var(--primary-gradient);
  border: none;
  transition: all 0.3s ease;
}

.sidebar-footer .el-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.main-container {
  margin-left: 240px;
  min-height: 100vh;
  background-color: #fafafa;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.page-title {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: var(--spacing-md);
}

.header-right .el-button {
  color: var(--text-secondary);
}

.header-right .el-button:hover {
  color: var(--primary-color);
}

.el-main {
  padding: var(--spacing-lg);
  background-color: #fafafa;
}

/* 全局按钮样式优化 */
:root {
  /* 按钮相关的颜色变量 */
  --button-primary-bg: var(--primary-gradient);
  --button-primary-hover: linear-gradient(135deg, #7ddfd0 0%, #e0f9c1 100%);
  --button-primary-active: linear-gradient(135deg, #4ea69a 0%, #b4e585 100%);
  
  --button-text-hover: var(--primary-color);
  --button-text-active: var(--primary-dark);
  
  --button-danger-bg: #f56c6c;
  --button-danger-hover: #f78989;
  --button-danger-active: #e64242;
  
  --button-success-bg: var(--secondary-color);
  --button-success-hover: var(--secondary-light);
  --button-success-active: var(--secondary-dark);
}

/* 主要按钮样式 */
.el-button--primary {
  background-image: var(--button-primary-bg) !important;
  border: none !important;
  color: white !important;
  transition: all 0.3s ease !important;
}

.el-button--primary:hover {
  transform: translateY(-1px);
  background-image: var(--button-primary-hover) !important;
  box-shadow: var(--shadow-sm) !important;
}

.el-button--primary:active {
  transform: translateY(0);
  background-image: var(--button-primary-active) !important;
}

/* 文本按钮样式 */
.el-button.is-text {
  color: var(--text-secondary) !important;
}

.el-button.is-text:hover {
  color: var(--button-text-hover) !important;
  background-color: rgba(96, 199, 183, 0.1) !important;
}

.el-button.is-text:active {
  color: var(--button-text-active) !important;
}

/* 链接按钮样式 */
.el-button.is-link {
  color: var(--text-secondary) !important;
}

.el-button.is-link:hover {
  color: var(--button-text-hover) !important;
}

.el-button.is-link:active {
  color: var(--button-text-active) !important;
}

/* 朴素按钮样式 */
.el-button.is-plain {
  background: transparent !important;
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
}

.el-button.is-plain:hover {
  background: rgba(96, 199, 183, 0.1) !important;
  transform: translateY(-1px);
}

.el-button.is-plain:active {
  background: rgba(96, 199, 183, 0.2) !important;
  transform: translateY(0);
}

/* 危险按钮样式 */
.el-button--danger {
  background-color: var(--button-danger-bg) !important;
  border: none !important;
}

.el-button--danger:hover {
  background-color: var(--button-danger-hover) !important;
  transform: translateY(-1px);
}

.el-button--danger:active {
  background-color: var(--button-danger-active) !important;
  transform: translateY(0);
}

.el-button--danger.is-plain {
  background: transparent !important;
  border-color: var(--button-danger-bg) !important;
  color: var(--button-danger-bg) !important;
}

.el-button--danger.is-plain:hover {
  background: rgba(245, 108, 108, 0.1) !important;
  color: var(--button-danger-hover) !important;
  border-color: var(--button-danger-hover) !important;
}

/* 成功按钮样式 */
.el-button--success {
  background-color: var(--button-success-bg) !important;
  border: none !important;
  color: var(--text-primary) !important;
}

.el-button--success:hover {
  background-color: var(--button-success-hover) !important;
  transform: translateY(-1px);
}

.el-button--success:active {
  background-color: var(--button-success-active) !important;
  transform: translateY(0);
}

/* 按钮组样式 */
.el-button-group .el-button--primary:not(:first-child) {
  border-left: 1px solid rgba(255, 255, 255, 0.2) !important;
}

/* 禁用状态样式 */
.el-button.is-disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* 带图标的按钮样式 */
.el-button [class*=el-icon] + span {
  margin-left: 6px !important;
}

/* 圆形按钮样式 */
.el-button.is-circle {
  padding: 8px !important;
}

/* 加载状态样式 */
.el-button.is-loading {
  opacity: 0.8 !important;
  cursor: wait !important;
}

/* 按钮尺寸相关样式 */
.el-button--small {
  padding: 8px 16px !important;
  font-size: 13px !important;
}

.el-button--large {
  padding: 12px 24px !important;
  font-size: 16px !important;
}
</style>
