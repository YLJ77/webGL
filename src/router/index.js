import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: () => import('@/views/arm/index')
    },
    {
        path: '/three',
        component: () => import('@/views/threejs/routerView'),
        children: [
            {
                path: 'first3d',
                component: () => import('@/views/threejs/first3d'),
            }
        ]
    },
    {
        path: '/point',
        component: () => import('@/views/point/index')
    },
    {
        path: '/multiPoints',
        component: () => import('@/views/multiPoints/index')
    },
    {
        path: '/textured',
        component: () => import('@/views/textured/index')
    },
    {
        path: '/lookAtTriangles',
        component: () => import('@/views/lookAtTriangles/index')
    },
    {
        path: '/perspectiveView',
        component: () => import('@/views/perspectiveView/index')
    },
    {
        path: '/cube',
        component: () => import('@/views/cube/index')
    },
    {
        path: '/cube_per_fragment',
        component: () => import('@/views/cube_per_fragment/index')
    },
    {
        path: '/arm',
        component: () => import('@/views/arm/index')
    }
];

const router = new VueRouter({
    routes
});

export default router
