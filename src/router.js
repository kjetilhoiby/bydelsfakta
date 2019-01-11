import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Bydel from './views/Bydel.vue';
import Alder from './views/subviews/Alder.vue';
import Boligpriser from './views/subviews/Boligpriser.vue';
import Bygningstyper from './views/subviews/Bygningstyper.vue';
import Eierform from './views/subviews/Eierform.vue';
import Flytting from './views/subviews/Flytting.vue';
import Folkemengde from './views/subviews/Folkemengde.vue';
import Husholdninger from './views/subviews/Husholdninger.vue';
import Innvandrerbefolkningen from './views/subviews/Innvandrerbefolkningen.vue';
import Kommunaleboliger from './views/subviews/Kommunaleboliger.vue';
import Levekaar from './views/subviews/Levekaar.vue';
import Trangboddhet from './views/subviews/Trangboddhet.vue';

import Graph from './components/Graph.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/graphA',
      name: 'Graph1',
      props: { settings: { url: '/mockDataA.json', template: 'a' } },
      component: Graph,
    },
    {
      path: '/graphB',
      name: 'Graph2',
      props: { settings: { url: '/mockDataB.json', template: 'b' } },
      component: Graph,
    },
    {
      path: '/graphC',
      name: 'Graph3',
      props: { settings: { url: '/mockDataC.json', template: 'c' } },
      component: Graph,
    },
    {
      path: '/graphD',
      name: 'Graph4',
      props: { settings: { url: '/mockDataD.json', template: 'd' } },
      component: Graph,
    },
    {
      path: '/bydel/:bydel',
      name: 'Bydel',
      component: Bydel,
    },
    {
      path: '/bydel/:bydel/folkemengde',
      name: 'BydelFolkemengde',
      component: Folkemengde,
    },
    {
      path: '/bydel/:bydel/alder',
      name: 'BydelAlder',
      component: Alder,
    },
    {
      path: '/bydel/:bydel/innvandrerbefolkningen',
      name: 'BydelInnvandrerbefolkningen',
      component: Innvandrerbefolkningen,
    },
    {
      path: '/bydel/:bydel/husholdninger',
      name: 'BydelHusholdninger',
      component: Husholdninger,
    },
    {
      path: '/bydel/:bydel/trangboddhet',
      name: 'BydelTrandboddhet',
      component: Trangboddhet,
    },
    {
      path: '/bydel/:bydel/eierform',
      name: 'BydelEierform',
      component: Eierform,
    },
    {
      path: '/bydel/:bydel/kommunaleboliger',
      name: 'BydelKommunaleboliger',
      component: Kommunaleboliger,
    },
    {
      path: '/bydel/:bydel/flytting',
      name: 'BydelFlytting',
      component: Flytting,
    },
    {
      path: '/bydel/:bydel/bygningstyper',
      name: 'BydelBygningstyper',
      component: Bygningstyper,
    },
    {
      path: '/bydel/:bydel/boligpriser',
      name: 'BydelBoligpriser',
      component: Boligpriser,
    },
    {
      path: '/bydel/:bydel/levekaar',
      name: 'Bydellevekaar',
      component: Levekaar,
    },
    {
      path: '/sammenlign/:bydel',
      name: 'Sammenlign',
      component: Bydel,
    },
    {
      path: '/sammenlign/:bydel/folkemengde',
      name: 'Folkemengde',
      component: Folkemengde,
    },
    {
      path: '/sammenlign/:bydel/alder',
      name: 'Alder',
      component: Alder,
    },
    {
      path: '/sammenlign/:bydel/innvandrerbefolkningen',
      name: 'Innvandrerbefolkningen',
      component: Innvandrerbefolkningen,
    },
    {
      path: '/sammenlign/:bydel/husholdninger',
      name: 'Husholdninger',
      component: Husholdninger,
    },
    {
      path: '/sammenlign/:bydel/trangboddhet',
      name: 'Trandboddhet',
      component: Trangboddhet,
    },
    {
      path: '/sammenlign/:bydel/eierform',
      name: 'Eierform',
      component: Eierform,
    },
    {
      path: '/sammenlign/:bydel/kommunaleboliger',
      name: 'Kommunaleboliger',
      component: Kommunaleboliger,
    },
    {
      path: '/sammenlign/:bydel/flytting',
      name: 'Flytting',
      component: Flytting,
    },
    {
      path: '/sammenlign/:bydel/bygningstyper',
      name: 'Bygningstyper',
      component: Bygningstyper,
    },
    {
      path: '/sammenlign/:bydel/boligpriser',
      name: 'Boligpriser',
      component: Boligpriser,
    },
    {
      path: '/sammenlign/:bydel/levekaar',
      name: 'levekaar',
      component: Levekaar,
    },
  ],
});
