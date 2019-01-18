import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
//import Mock from './mock'  //方式一：使用mock
//Mock.bootstrap();
import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)



//NProgress.configure({ showSpinner: false });

//对axios进行统一配置
import axios from 'axios' //和引入vue一样
//var axios = require('axios')
//axios.defaults.baseURL = "https://www.easy-mock.com/mock/5c3957f10157fc56d707bc95/aigou/services"//配置前缀  方式二：easymock
axios.defaults.baseURL = "http://127.0.0.1:9527/services"//配置前缀
// 将API方法绑定到全局  /plat/login
Vue.prototype.$http = axios //给Vue这个类添加一个原型的属性,这个类的对象都能调用
Vue.config.productionTip = false
const router = new VueRouter({
    routes
});
Vue.prototype.$filePathImg = '';

router.beforeEach((to, from, next) => {
    //NProgress.start();
    if (to.path == '/login') {
        sessionStorage.removeItem('user');
    }
    let user = JSON.parse(sessionStorage.getItem('user'));
    if (!user && to.path != '/login') {
        next({path: '/login'})
    } else {
        next()
    }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
    //el: '#app',
    //template: '<App/>',
    router,
    store,
    //components: { App }
    render: h => h(App)
}).$mount('#app')

