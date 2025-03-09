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
  <div class="app">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <div class="logo-content">
            <span class="logo-text">BayTu</span>
            <span class="logo-subtitle">智能日报助手</span>
          </div>
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
          <el-button type="primary" @click="$router.push('/new')" :icon="Plus">
            写日报
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
</template>

<style>
@import '../styles/variables.css';

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
  height: 64px;
}

.logo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.nav-menu {
  flex: 1;
  border: none;
  padding: var(--spacing-md) 0;
}

:deep(.el-menu-item) {
  height: 48px;
  margin: 4px var(--spacing-md);
  border-radius: var(--border-radius-md);
  color: var(--text-light);
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-menu-item.is-active) {
  background-image: linear-gradient(135deg, rgba(96, 199, 183, 0.2) 0%, rgba(205, 245, 163, 0.2) 100%) !important;
  color: var(--primary-color) !important;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-image: var(--primary-gradient);
  border-radius: 0 2px 2px 0;
}

:deep(.el-menu-item:hover:not(.is-active)) {
  background-color: rgba(96, 199, 183, 0.08) !important;
  color: var(--primary-color) !important;
}

:deep(.el-menu-item .el-icon) {
  color: inherit;
  font-size: 18px;
  margin-right: var(--spacing-md);
}

:deep(.el-menu-item:not(.is-active)) {
  opacity: 0.75;
}

:deep(.el-menu-item:not(.is-active):hover) {
  opacity: 1;
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
  box-shadow: var(--shadow-sm);
}
</style>
