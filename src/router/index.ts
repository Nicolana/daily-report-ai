import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NewLogView from '../views/NewLogView.vue'
import EditLogView from '../views/EditLogView.vue'
import LogsView from '../views/LogsView.vue'
import SummaryView from '../views/SummaryView.vue'
import GenerateSummaryView from '../views/GenerateSummaryView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import ForgetView from '../views/ForgetView.vue'

import defaultLayout from '../layouts/default.vue'
import BlankLayout from '../layouts/BlankLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: defaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: { title: '工作台', requiresAuth: true }
        },
        {
          path: 'new',
          name: 'new-log',
          component: NewLogView,
          meta: { title: '写日报', requiresAuth: true }
        },
        {
          path: 'edit/:id',
          name: 'edit-log',
          component: EditLogView,
          meta: { title: '编辑日报', requiresAuth: true }
        },
        {
          path: 'logs',
          name: 'logs',
          component: LogsView,
          meta: { title: '日志列表', requiresAuth: true }
        },
        {
          path: 'summary',
          name: 'summary',
          component: SummaryView,
          meta: { title: '工作总结', requiresAuth: true }
        },
        {
          path: 'summary/generate/:type',
          name: 'generate-summary',
          component: GenerateSummaryView,
          meta: { title: '生成总结', requiresAuth: true }
        }
      ]
    },
    {
      path: '/',
      component: BlankLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView,
          meta: { title: '登录' }
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
          meta: { title: '注册' }
        },
        {
          path: 'forget',
          name: 'forget',
          component: ForgetView,
          meta: { title: '找回密码' }
        }
      ]
    }
  ]
})

// 路由守卫，检查用户是否已登录
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = localStorage.getItem('token') // 或者使用你的用户存储检查登录状态

  if (requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
