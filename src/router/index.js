import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

// createRouter 創建路由實例
// 配置 history 模式
// 1. history模式: createWebHistory 地址欄不帶#
// 2. hash模式: createWebHashHistory 地址欄帶#
// 初始化 vue-router4.x(Vue3)

// vite 中的環境變量 import.meta.env.BASE_URL 就是 vite.config.js 中的 base 配置項
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 前墜
  routes: [
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') }, // 登入頁
    {
      path: '/',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/article/manage',
      children: [
        {
          path: '/article/manage',
          component: () => import('@/views/article/ArticleManage.vue')
        },
        {
          path: '/article/channel',
          component: () => import('@/views/article/ArticleChannel.vue')
        },
        {
          path: '/user/profile',
          component: () => import('@/views/user/UserProfile.vue')
        },
        {
          path: '/user/avatar',
          component: () => import('@/views/user/UserAvatar.vue')
        },
        {
          path: '/user/password',
          component: () => import('@/views/user/UserPassword.vue')
        }
      ]
    }
  ]
})

// 登入訪問攔截 => 默認是直接放行
// 根據返回值決定，是放行還是攔截
// 返回值:
// 1. undefined / true 直接放行
// 2. false 攔回 from 的地址頁面
// 3. 具體路徑 或 路徑對象 攔截到對應的地址
//    '/login' { name: 'login' }
router.beforeEach((to) => {
  // 如果沒有token，且訪問的是非登入頁，攔截到登入，其他情況正常放行
  const useStore = useUserStore()
  if (!useStore.token && to.path !== '/login') return '/login'

  return true
})

export default router
