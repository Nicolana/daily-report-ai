import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NewLogView from '../views/NewLogView.vue'
import EditLogView from '../views/EditLogView.vue'
import LogsView from '../views/LogsView.vue'
import SummaryView from '../views/SummaryView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/new',
      name: 'new-log',
      component: NewLogView
    },
    {
      path: '/edit/:id',
      name: 'edit-log',
      component: EditLogView
    },
    {
      path: '/logs',
      name: 'logs',
      component: LogsView
    },
    {
      path: '/summary',
      name: 'summary',
      component: SummaryView
    }
  ]
})

export default router 