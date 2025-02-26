<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="app">
      <el-container>
        <el-header>
          <div class="header-content">
            <h1 class="app-title">日报助手</h1>
            <el-menu
              mode="horizontal"
              :router="true"
              :default-active="$route.path"
            >
              <el-menu-item index="/">首页</el-menu-item>
              <el-menu-item index="/new">写日报</el-menu-item>
              <el-menu-item index="/logs">日志列表</el-menu-item>
              <el-menu-item index="/summary">总结</el-menu-item>
            </el-menu>
          </div>
        </el-header>
        
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </div>
  </el-config-provider>
</template>

<style>
.app {
  min-height: 100vh;
}

.el-container {
  min-height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 100%;
}

.app-title {
  margin: 0;
  margin-right: 40px;
  font-size: 20px;
  color: #409EFF;
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
