import '@babel/polyfill';
import Vue from 'vue';
import VueResize from 'vue-resize';
import App from './App.vue';
import router from './router';
import store from './store';

import clickOutside from './directives/clickOutside';

import 'vue-resize/dist/vue-resize.css';

import './styles/main.scss';

Vue.use(VueResize);

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.config.performance = process.env.NODE_ENV !== 'production';

// Directive to detect clicks outside of an element
Vue.directive('click-outside', clickOutside);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
