import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/point',
        component: () => import('@/views/point/index')
    },
    {
        path: '/multiPoints',
        component: () => import('@/views/multiPoints/index')
    }
];

const router = new VueRouter({
    routes
});

export default router
