<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<style>
@import './styles/variables.css';

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

/* 输入框样式修复 */
.el-input__wrapper {
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
  transition: all 0.3s ease !important;
}

.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--primary-color) inset !important;
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--primary-color) inset !important;
}

.el-input__inner {
  color: var(--text-primary) !important;
}

.el-input.is-disabled .el-input__wrapper {
  box-shadow: 0 0 0 1px #e4e7ed inset !important;
  background-color: #f5f7fa !important;
}
</style>
