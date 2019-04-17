export default [
    {
        path: '/',
        name: 'home',
        component: (resolve) => {
            require.ensure(['../views/home.vue'], (require) => {
                resolve(require('../views/home.vue'));
            }, 'home');
        },
        children: [
            //应付管理 - 全部订单
            {
                path: '',
                name: 'allBill',
                component: (resolve) => {
                    require.ensure(['../views/all-bill/main.vue'], (require) => {
                        resolve(require('../views/all-bill/main.vue'));
                    }, 'allBill');
                }
            },
            //应付管理 - 全部订单
            {
                path: '/actualPayManage/allBill',
                name: 'allBill',
                component: (resolve) => {
                    require.ensure(['../views/all-bill/main.vue'], (require) => {
                        resolve(require('../views/all-bill/main.vue'));
                    }, 'allBill');
                }
            },
            //应付管理 - 付款管理
            {
                path: '/actualPayManage/paymentManage',
                name: 'paymentManage',
                component: (resolve) => {
                    require.ensure(['../views/payment-manage/main.vue'], (require) => {
                        resolve(require('../views/payment-manage/main.vue'));
                    }, 'paymentManage');
                }
            },
            //权限管理 - 角色模板
            {
                path: '/permission/roleList',
                name: 'roleList',
                component: (resolve) => {
                    require.ensure(['../views/permission-role/main.vue'], (require) => {
                        resolve(require('../views/permission-role/main.vue'));
                    }, 'permission-role');
                }
            }
        ]
    },
    {
        path: '/img/preview',
        name: 'imgPreview',
        component: (resolve) => {
            require.ensure(['../views/img-preview/main.vue'], (require) => {
                resolve(require('../views/img-preview/main.vue'));
            }, 'img-preview');
        }
    }
];
