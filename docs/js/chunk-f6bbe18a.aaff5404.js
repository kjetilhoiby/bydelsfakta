(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-f6bbe18a"],{"0370":function(t,n,i){"use strict";i.r(n);var s=function(){var t=this,n=t.$createElement,i=t._self._c||n;return i("div",{staticClass:"main-container"},[i("div",{staticClass:"main-container__cards"},t._l(t.settings.eierform,function(t,n){return i("graph-card",{key:"eierform-"+n,attrs:{settings:t}})}),1),t._m(0)])},a=[function(){var t=this,n=t.$createElement,i=t._self._c||n;return i("div",{staticClass:"main-container__map"},[i("h3",[t._v("Kart")])])}],e=i("bbce"),c={name:"Eierform",components:{GraphCard:e["a"]},props:{settings:{type:Object,required:!0}}},o=c,r=(i("4f32"),i("2877")),l=Object(r["a"])(o,s,a,!1,null,"65197e12",null);l.options.__file="Eierform.vue";n["default"]=l.exports},"0546":function(t,n,i){"use strict";var s=i("81cb"),a=i.n(s);a.a},"1d58":function(t,n,i){},"4f32":function(t,n,i){"use strict";var s=i("1d58"),a=i.n(s);a.a},"81cb":function(t,n,i){},bbce:function(t,n,i){"use strict";var s=function(){var t=this,n=t.$createElement,i=t._self._c||n;return i("div",{staticClass:"main-container__item main-container__item--graph"},[i("div",{staticClass:"card-container",style:"large"===t.settings.size?"width: 100%":"width: 50%"},[i("div",{staticClass:"graph__cards-container"},[i("div",{staticClass:"tabs"},[i("div",t._l(t.settings.tabs,function(n,s){return i("a",{key:s,class:t.active===s?"active":"",on:{click:function(n){t.activeTab(s)}}},[t._v("\n            "+t._s(n.label)+"\n          ")])}),0),i("div",{staticClass:"tabs--right",staticStyle:{display:"flex"}},[i("div",{staticStyle:{position:"relative"}},[i("button",{staticClass:"button__menu",on:{click:function(n){t.showDropdown=!t.showDropdown}}},[t.showDropdown?i("v-icon",{staticClass:"button__icon"},[t._v("close")]):t._e(),t.showDropdown?t._e():i("v-icon",{staticClass:"button__icon"},[t._v("menu")])],1),t.showDropdown?i("div",{staticStyle:{width:"200px","background-color":"rgb(178, 210, 216)","z-index":"100",position:"absolute",right:"0"}},[i("span",[t._v("Coming soon")])]):t._e()])])]),void 0!==t.settings.tabs[t.active]?i("div",{staticClass:"graph"},[i("graph",{attrs:{settings:t.settings.tabs[t.active]}})],1):t._e()])])])},a=[],e=i("f972"),c={name:"GraphCard",components:{Graph:e["a"]},data:function(){return{active:0,showDropdown:!1}},props:{settings:{type:Object,required:!0}},methods:{activeTab:function(t){this.active=t}}},o=c,r=(i("0546"),i("2877")),l=i("6544"),u=i.n(l),d=i("132d"),_=Object(r["a"])(o,s,a,!1,null,"d174e3b6",null);_.options.__file="GraphCard.vue";n["a"]=_.exports;u()(_,{VIcon:d["a"]})}}]);
//# sourceMappingURL=chunk-f6bbe18a.aaff5404.js.map