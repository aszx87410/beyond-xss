"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[915],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>d});var n=a(7294);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function r(e,t){if(null==e)return{};var a,n,o=function(e,t){if(null==e)return{};var a,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(o[a]=e[a]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(o[a]=e[a])}return o}var p=n.createContext({}),s=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},k="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,o=e.mdxType,i=e.originalType,p=e.parentName,m=r(e,["components","mdxType","originalType","parentName"]),k=s(a),u=o,d=k["".concat(p,".").concat(u)]||k[u]||c[u]||i;return a?n.createElement(d,l(l({ref:t},m),{},{components:a})):n.createElement(d,l({ref:t},m))}));function d(e,t){var a=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=a.length,l=new Array(i);l[0]=u;var r={};for(var p in t)hasOwnProperty.call(t,p)&&(r[p]=t[p]);r.originalType=e,r[k]="string"==typeof e?e:o,l[1]=r;for(var s=2;s<i;s++)l[s]=a[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},3190:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>r,toc:()=>s});var n=a(7462),o=(a(7294),a(3905));const i={sidebar_position:24},l="Same-site cookie\uff0cCSRF \u7684\u6551\u661f\uff1f",r={unversionedId:"ch4/same-site-cookie",id:"ch4/same-site-cookie",title:"Same-site cookie\uff0cCSRF \u7684\u6551\u661f\uff1f",description:"\u5728\u63d0\u5230 CSRF \u7684\u9632\u79a6\u65b9\u5f0f\u6642\uff0c\u7121\u8ad6\u662f\u54ea\u4e00\u7a2e\u65b9\u6cd5\uff0c\u90fd\u662f\u524d\u5f8c\u7aef\u8981\u81ea\u5df1\u5be6\u4f5c\u4e00\u6574\u5957\u7684\u6a5f\u5236\u53bb\u4fdd\u8b77\u3002\u4e4b\u524d\u8b1b XSS \u7684\u6642\u5019\uff0c\u6709\u63d0\u5230\u4e86 CSP\uff0c\u53ea\u8981\u52a0\u4e0a CSP\uff0c\u700f\u89bd\u5668\u5c31\u6703\u5e6b\u4f60\u628a\u4e0d\u7b26\u5408\u898f\u5247\u7684\u8cc7\u6e90\u64cb\u4e0b\u4f86\uff0c\u90a3\u5c0d\u65bc CSRF\uff0c\u700f\u89bd\u5668\u6709\u6c92\u6709\u63d0\u4f9b\u985e\u4f3c\u7684\u65b9\u5f0f\u5462\uff1f\u53ea\u8981\u52a0\u4e00\u500b\u4ec0\u9ebc\u6771\u897f\uff0c\u5c31\u53ef\u4ee5\u963b\u6b62 CSRF\uff1f",source:"@site/docs/ch4/24-same-site-cookie.md",sourceDirName:"ch4",slug:"/ch4/same-site-cookie",permalink:"/beyond-xss/ch4/same-site-cookie",draft:!1,tags:[],version:"current",sidebarPosition:24,frontMatter:{sidebar_position:24},sidebar:"tutorialSidebar",previous:{title:"\u8de8\u7ad9\u8acb\u6c42\u507d\u9020 CSRF \u4e00\u9ede\u5c31\u901a",permalink:"/beyond-xss/ch4/csrf"},next:{title:"\u5f9e same-site \u7db2\u7ad9\u6253\u9032\u4f60\u5bb6",permalink:"/beyond-xss/ch4/subdomain"}},p={},s=[{value:"\u521d\u63a2 same-site cookie",id:"\u521d\u63a2-same-site-cookie",level:2},{value:"Same-site cookie \u7684\u6b77\u53f2",id:"same-site-cookie-\u7684\u6b77\u53f2",level:2},{value:"\u4e2d\u5834\u4f11\u606f\u52a0\u601d\u8003\u6642\u9593",id:"\u4e2d\u5834\u4f11\u606f\u52a0\u601d\u8003\u6642\u9593",level:2},{value:"GET \u578b\u614b\u7684 CSRF",id:"get-\u578b\u614b\u7684-csrf",level:2},{value:"Same-site cookie \u7684\u96b1\u85cf\u898f\u5247",id:"same-site-cookie-\u7684\u96b1\u85cf\u898f\u5247",level:2},{value:"\u9632\u6b62 CSRF\uff0c\u771f\u7684\u53ea\u8981 same-site cookie \u5c31\u5920\u4e86\u55ce\uff1f",id:"\u9632\u6b62-csrf\u771f\u7684\u53ea\u8981-same-site-cookie-\u5c31\u5920\u4e86\u55ce",level:2},{value:"\u5be6\u969b\u6848\u4f8b",id:"\u5be6\u969b\u6848\u4f8b",level:2},{value:"\u5c0f\u7d50",id:"\u5c0f\u7d50",level:2}],m={toc:s},k="wrapper";function c(e){let{components:t,...a}=e;return(0,o.kt)(k,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"same-site-cookiecsrf-\u7684\u6551\u661f"},"Same-site cookie\uff0cCSRF \u7684\u6551\u661f\uff1f"),(0,o.kt)("p",null,"\u5728\u63d0\u5230 CSRF \u7684\u9632\u79a6\u65b9\u5f0f\u6642\uff0c\u7121\u8ad6\u662f\u54ea\u4e00\u7a2e\u65b9\u6cd5\uff0c\u90fd\u662f\u524d\u5f8c\u7aef\u8981\u81ea\u5df1\u5be6\u4f5c\u4e00\u6574\u5957\u7684\u6a5f\u5236\u53bb\u4fdd\u8b77\u3002\u4e4b\u524d\u8b1b XSS \u7684\u6642\u5019\uff0c\u6709\u63d0\u5230\u4e86 CSP\uff0c\u53ea\u8981\u52a0\u4e0a CSP\uff0c\u700f\u89bd\u5668\u5c31\u6703\u5e6b\u4f60\u628a\u4e0d\u7b26\u5408\u898f\u5247\u7684\u8cc7\u6e90\u64cb\u4e0b\u4f86\uff0c\u90a3\u5c0d\u65bc CSRF\uff0c\u700f\u89bd\u5668\u6709\u6c92\u6709\u63d0\u4f9b\u985e\u4f3c\u7684\u65b9\u5f0f\u5462\uff1f\u53ea\u8981\u52a0\u4e00\u500b\u4ec0\u9ebc\u6771\u897f\uff0c\u5c31\u53ef\u4ee5\u963b\u6b62 CSRF\uff1f"),(0,o.kt)("p",null,"\u6709\uff0c\u9019\u500b\u6771\u897f\u53eb\u505a same-site cookie\uff0c\u9019\u7bc7\u6211\u5011\u5c31\u4e00\u8d77\u4f86\u770b\u770b\u5b83\u662f\u4ec0\u9ebc\uff0c\u4ee5\u53ca\u662f\u5426\u7528\u4e86\u5b83\u4ee5\u5f8c\uff0c\u6211\u5011\u5c31\u80fd\u5f9e\u6b64\u9ad8\u6795\u7121\u6182\u3002"),(0,o.kt)("h2",{id:"\u521d\u63a2-same-site-cookie"},"\u521d\u63a2 same-site cookie"),(0,o.kt)("p",null,"Same-site cookie\uff0c\u9867\u540d\u601d\u7fa9\u5c31\u662f\u300c\u53ea\u6709\u5728 same-site \u7684\u72c0\u6cc1\u4e0b\u624d\u6703\u9001\u51fa\u7684 cookie\u300d\uff0c\u4f7f\u7528\u65b9\u5f0f\u662f\u8a2d\u5b9a\u4e00\u500b\u53eb\u505a ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite")," \u7684\u5c6c\u6027\uff0c\u6709\u4e09\u500b\u503c\uff1a"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"None"),(0,o.kt)("li",{parentName:"ol"},"Lax"),(0,o.kt)("li",{parentName:"ol"},"Strict")),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"None")," \u662f\u6700\u5bec\u9b06\u7684\uff0c\u5c31\u662f\u300c\u6211\u4e0d\u8981\u6709 SameSite \u5c6c\u6027\u300d\u7684\u610f\u601d\u3002"),(0,o.kt)("p",null,"\u800c ",(0,o.kt)("inlineCode",{parentName:"p"},"Strict")," \u986f\u7136\u662f\u6700\u56b4\u683c\u7684\uff0c\u7576\u4f60\u52a0\u4e0a\u4e4b\u5f8c\uff0c\u5c31\u662f\u660e\u78ba\u8868\u793a\uff1a\u300c\u9019\u500b cookie \u53ea\u6709\u76ee\u6a19\u662f same-site \u7684\u6642\u5019\u624d\u80fd\u9001\u51fa\u300d\u3002"),(0,o.kt)("p",null,"\u8209\u4f8b\u4f86\u8aaa\uff0c\u5047\u8a2d\u6709\u4e00\u500b\u5728 ",(0,o.kt)("inlineCode",{parentName:"p"},"https://api.huli.tw")," \u7684 cookie \u8a2d\u5b9a\u4e86 ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite=Strict"),"\uff0c\u90a3\u5f9e ",(0,o.kt)("inlineCode",{parentName:"p"},"https://example.com")," \u767c\u9001\u7d66 ",(0,o.kt)("inlineCode",{parentName:"p"},"https://api.huli.tw")," \u7684\u8acb\u6c42\uff0c\u5c31\u5168\u90fd\u4e0d\u6703\u5e36\u4e0a\u9019\u500b cookie\uff0c\u56e0\u70ba\u9019\u5169\u500b\u7db2\u7ad9\u4e0d\u662f same-site\u3002"),(0,o.kt)("p",null,"\u53cd\u4e4b\uff0c\u5982\u679c\u662f ",(0,o.kt)("inlineCode",{parentName:"p"},"https://test.huli.tw")," \u5c31\u6703\u5e36\u4e0a cookie\uff0c\u56e0\u70ba\u662f same-site\u3002"),(0,o.kt)("p",null,"\u9019\u500b\u56b4\u683c\u5230\u4e86\u4ec0\u9ebc\u5730\u6b65\u5462\uff1f\u5230\u4e86\u300c\u9023\u9ede\u64ca\u9023\u7d50\u90fd\u7b97\u5728\u88e1\u9762\u300d\u7684\u5730\u6b65\u4e86\uff0c\u6211\u5728 ",(0,o.kt)("inlineCode",{parentName:"p"},"https://example.com")," \u9ede\u4e86\u4e00\u500b ",(0,o.kt)("inlineCode",{parentName:"p"},'<a href="https://api.huli.tw"></a>')," \u7684\u8d85\u9023\u7d50\uff0c\u5c31\u7b49\u540c\u65bc\u662f\u5f9e ",(0,o.kt)("inlineCode",{parentName:"p"},"https://example.com")," \u8981\u767c\u4e00\u500b\u8de8\u7ad9\u7684\u8acb\u6c42\u7d66 ",(0,o.kt)("inlineCode",{parentName:"p"},"https://api.huli.tw"),"\u3002"),(0,o.kt)("p",null,"\u56e0\u6b64\uff0c\u9019\u7a2e\u72c0\u6cc1\u4e5f\u4e0d\u6703\u5e36\u4e0a cookie\u3002"),(0,o.kt)("p",null,"\u53ef\u662f\u9019\u4e0d\u662f\u5f88\u4e0d\u65b9\u4fbf\u55ce\uff1f\u4ee5 Google \u70ba\u4f8b\u597d\u4e86\uff0c\u5047\u8a2d Google \u62ff\u4f86\u9a57\u8b49\u4f7f\u7528\u8005\u8eab\u4efd\u7684 token \u5b58\u5728 same-site cookie\uff0c\u7136\u5f8c\u5728\u6211\u7684\u6587\u7ae0\u4e0a\u6709\u4e00\u500b\u8d85\u9023\u7d50\uff0c\u9023\u53bb Google \u641c\u5c0b\u7684\u9801\u9762\uff0c\u7576\u4f7f\u7528\u8005\u9ede\u64ca\u9023\u7d50\u4e4b\u5f8c\uff0c\u958b\u555f\u7684 Google \u756b\u9762\u56e0\u70ba\u6c92\u6709 token\uff0c\u6240\u4ee5\u6703\u662f\u672a\u767b\u5165\u7684\u72c0\u614b\uff0c\u9019\u4f7f\u7528\u8005\u9ad4\u9a57\u6eff\u5dee\u7684\u3002"),(0,o.kt)("p",null,"\u9019\u72c0\u6cc1\u6709\u5169\u7a2e\u89e3\u6cd5\uff0c\u7b2c\u4e00\u7a2e\u662f\u8ddf Amazon \u4e00\u6a23\uff0c\u6e96\u5099\u5169\u7d44\u4e0d\u540c\u7684 cookie\uff0c\u7b2c\u4e00\u7d44\u662f\u8b93\u4f60\u7dad\u6301\u767b\u5165\u72c0\u614b\uff0c\u7b2c\u4e8c\u7d44\u5247\u662f\u505a\u4e00\u4e9b\u654f\u611f\u64cd\u4f5c\u7684\u6642\u5019\u6703\u9700\u8981\u7528\u5230\u7684\uff08\u4f8b\u5982\u8aaa\u8cfc\u8cb7\u7269\u54c1\u3001\u8a2d\u5b9a\u5e33\u6236\u7b49\u7b49\uff09\u3002\u7b2c\u4e00\u7d44\u4e0d\u8a2d\u5b9a ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite"),"\uff0c\u6240\u4ee5\u7121\u8ad6\u4f60\u5f9e\u54ea\u908a\u4f86\uff0c\u90fd\u6703\u662f\u767b\u5165\u72c0\u614b\u3002\u4f46\u653b\u64ca\u8005\u5c31\u7b97\u6709\u7b2c\u4e00\u7d44 cookie \u4e5f\u4e0d\u80fd\u5e79\u561b\uff0c\u56e0\u70ba\u4e0d\u80fd\u505a\u4efb\u4f55\u64cd\u4f5c\u3002\u7b2c\u4e8c\u7d44\u56e0\u70ba\u8a2d\u5b9a\u4e86 ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite")," \u7684\u7de3\u6545\uff0c\u6240\u4ee5\u5b8c\u5168\u907f\u514d\u6389 CSRF\u3002"),(0,o.kt)("p",null,"\u4f46\u9019\u6a23\u5b50\u9084\u662f\u6709\u9ede\u5c0f\u9ebb\u7169\uff0c\u6240\u4ee5\u4f60\u53ef\u4ee5\u8003\u616e\u7b2c\u4e8c\u7a2e\uff0c\u5c31\u662f\u8abf\u6574\u70ba ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite")," \u7684\u53e6\u4e00\u7a2e\u6a21\u5f0f\uff1a",(0,o.kt)("inlineCode",{parentName:"p"},"Lax"),"\u3002"),(0,o.kt)("p",null,"Lax \u6a21\u5f0f\u653e\u5bec\u4e86\u4e00\u4e9b\u9650\u5236\uff0c\u57fa\u672c\u4e0a\u53ea\u8981\u662f\u300ctop-level navigation\u300d\uff0c\u4f8b\u5982\u8aaa ",(0,o.kt)("inlineCode",{parentName:"p"},"<a href>")," \u6216\u662f ",(0,o.kt)("inlineCode",{parentName:"p"},'<form method="GET">'),"\uff0c\u9019\u4e9b\u90fd\u9084\u662f\u6703\u5e36\u4e0a cookie\u3002\u4f46\u5982\u679c\u662f POST \u65b9\u6cd5\u7684 form\uff0c\u5c31\u4e0d\u6703\u5e36\u4e0a cookie\u3002"),(0,o.kt)("p",null,"\u6240\u4ee5\u4e00\u65b9\u9762\u53ef\u4ee5\u4fdd\u6709\u5f48\u6027\uff0c\u8b93\u4f7f\u7528\u8005\u5f9e\u5176\u4ed6\u7db2\u7ad9\u9023\u9032\u4f60\u7684\u7db2\u7ad9\u6642\u9084\u80fd\u5920\u7dad\u6301\u767b\u5165\u72c0\u614b\uff0c\u4e00\u65b9\u9762\u4e5f\u53ef\u4ee5\u9632\u6b62\u6389 CSRF \u653b\u64ca\u3002"),(0,o.kt)("p",null,"\u5982\u679c cross-site \u7684\u8acb\u6c42\u4e0d\u6703\u5e36\u4e0a cookie\uff0c\u90a3\u653b\u64ca\u8005\u7136\u4e5f\u5c31\u7121\u6cd5\u57f7\u884c CSRF \u653b\u64ca\u3002"),(0,o.kt)("h2",{id:"same-site-cookie-\u7684\u6b77\u53f2"},"Same-site cookie \u7684\u6b77\u53f2"),(0,o.kt)("p",null,"Same-site cookie \u7684",(0,o.kt)("a",{parentName:"p",href:"https://datatracker.ietf.org/doc/html/draft-west-first-party-cookies-00"},"\u7b2c\u4e00\u500b\u898f\u683c\u8349\u6848"),"\u65bc 2014 \u5e74 10 \u6708\u767c\u4f48\uff0c\u7576\u6642\u53eb\u505a\u300cFirst-Party Cookie\u300d\u800c\u4e0d\u662f\u73fe\u5728\u7684\u300cSame-site cookie\u300d\uff0c\u662f\u4e00\u76f4\u5230 2016 \u5e74 1 \u6708\u6642\uff0c\u8349\u6848\u4e0a\u7684\u540d\u7a31\u624d\u6539\u540d\u53eb Same-site cookie\u3002"),(0,o.kt)("p",null,"\u800c Google \u5728 2016 \u5e74 5 \u6708\u767c\u5e03 Chrome 51 \u7248\u7684\u6642\u5019\u5c31\u5df2\u7d93\u6b63\u5f0f\u52a0\u5165\u4e86\u9019\u500b\u529f\u80fd\uff1a",(0,o.kt)("a",{parentName:"p",href:"https://www.chromestatus.com/feature/4672634709082112"},"SameSite cookie"),"\uff0cFirefox \u4e5f\u5728 2018 \u5e74 5 \u6708\u767c\u4f48\u7684 Firefox 60 \u8ddf\u4e0a\u652f\u63f4\uff0c\u9032\u5ea6\u6700\u6162\u7684 Safari \u5247\u662f\u5728 2021 \u5e74 9 \u6708\u767c\u4f48\u7684 Safari 15 \u624d\u6b63\u5f0f\u5168\u9762\u652f\u63f4\u9019\u500b\u529f\u80fd\u3002"),(0,o.kt)("p",null,"\u7531\u65bc\u9019\u500b SameSite \u5c6c\u6027\u80fd\u5920\u589e\u52a0\u7db2\u7ad9\u7684\u5b89\u5168\u6027\u4ee5\u53ca\u4fdd\u8b77\u96b1\u79c1\uff0c\u56e0\u6b64\u5728 2019 \u5e74 10 \u6708\u7684\u6642\u5019\uff0cChrome \u76f4\u63a5\u767c\u4f48\u4e86\u4e00\u7bc7\u540d\u70ba ",(0,o.kt)("a",{parentName:"p",href:"https://blog.chromium.org/2019/10/developers-get-ready-for-new.html"},"Developers: Get Ready for New SameSite=None; Secure Cookie Settings")," \u7684\u6587\u7ae0\uff0c\u5ba3\u5e03\u5f9e 2020 \u5e74 2 \u6708\u958b\u59cb\uff0c\u6c92\u6709\u8a2d\u5b9a SameSite \u5c6c\u6027\u7684 cookie\uff0c\u9810\u8a2d\u4e00\u5f8b\u6703\u662f Lax\u3002"),(0,o.kt)("p",null,"\u800c\u4e4b\u5f8c\u75ab\u60c5\u7206\u767c\uff0c\u96d6\u7136\u5728\u4e0a\u7dda\u524d\u5df2\u7d93\u6709\u6e2c\u8a66\u904e\u9019\u500b\u529f\u80fd\u4e00\u9663\u5b50\uff0c\u4f46 Chrome \u9084\u662f\u60f3\u78ba\u4fdd\u6240\u6709\u7db2\u7ad9\u90fd\u662f\u7a69\u5b9a\u7684\u4e0d\u6703\u58de\uff0c\u56e0\u6b64\u5728 2020 \u5e74 4 \u6708\u6642\u6c7a\u5b9a\u5148 rollback \u9019\u500b\u6539\u52d5\uff1a",(0,o.kt)("a",{parentName:"p",href:"https://blog.chromium.org/2020/04/temporarily-rolling-back-samesite.html"},"Temporarily rolling back SameSite Cookie Changes"),"\u3002"),(0,o.kt)("p",null,"\u4e0d\u904e\u5728 7 \u6708\u75ab\u60c5\u7a0d\u5fae\u7de9\u548c\u4e4b\u5f8c\uff0c\u53c8\u6f38\u6f38\u91cd\u65b0\u90e8\u7f72\u4e86\u9019\u500b\u6539\u52d5\uff0c\u4e00\u76f4\u5230 8 \u6708\u7684\u6642\u5019\u5b8c\u6210\u4e86 100% \u7684\u90e8\u7f72\u3002"),(0,o.kt)("p",null,"\u9664\u4e86 Chrome \u4ee5\u5916\uff0cFirefox \u4e5f\u5728 2020 \u5e74 8 \u6708\u5ba3\u5e03\u4e86\u8ddf\u9032\uff0c\u6c92\u6709\u8a2d\u5b9a SameSite \u7684 cookie \u9810\u8a2d\u5c31\u6703\u662f Lax\u3002\u7576\u6642\u7684\u6587\u7ae0\uff1a",(0,o.kt)("a",{parentName:"p",href:"https://hacks.mozilla.org/2020/08/changes-to-samesite-cookie-behavior/"},"Changes to SameSite Cookie Behavior \u2013 A Call to Action for Web Developers"),"\u3002"),(0,o.kt)("p",null,"\u81f3\u65bc Safari \u7684\u8a71\uff0c\u5728 2020 \u5e74 3 \u6708\u5c31\u5ba3\u4f48\u4e86",(0,o.kt)("a",{parentName:"p",href:"https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/"},"\u5168\u9762\u5c01\u9396\u7b2c\u4e09\u65b9 cookie"),"\uff0c\u53ea\u662f\u5be6\u969b\u7684\u884c\u70ba\u597d\u50cf\u662f\u500b\u9ed1\u76d2\u5b50\u3002"),(0,o.kt)("h2",{id:"\u4e2d\u5834\u4f11\u606f\u52a0\u601d\u8003\u6642\u9593"},"\u4e2d\u5834\u4f11\u606f\u52a0\u601d\u8003\u6642\u9593"),(0,o.kt)("p",null,"\u5beb\u5230\u9019\u908a\uff0c\u5927\u5bb6\u61c9\u8a72\u5df2\u7d93\u7a0d\u5fae\u719f\u6089 CSRF \u7684\u539f\u7406\u4ee5\u53ca\u9632\u79a6\u65b9\u5f0f\uff0c\u800c\u9019\u7bc7\u6240\u4ecb\u7d39\u7684 same-site cookie \u770b\u8d77\u4f86\u53c8\u662f\u76f8\u7576\u53ef\u9760\uff0c\u800c\u4e14\u700f\u89bd\u5668\u9084\u81ea\u52d5\u628a\u9019\u500b\u8b8a\u6210\u662f\u9810\u8a2d\u7684\uff0c\u8b93\u4f60\u4e0d\u7528\u505a\u4efb\u4f55\u8abf\u6574\u4e5f\u80fd\u4eab\u53d7\u5230\u597d\u8655\u3002"),(0,o.kt)("p",null,"\u6709\u4e86\u9810\u8a2d\u7684 ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite=Lax")," \u4ee5\u5f8c\uff0cCSRF \u4f3c\u4e4e\u5f9e\u6b64\u5c31\u9000\u51fa\u4e86\u821e\u53f0\uff0c\u6b63\u5f0f\u5ba3\u544a\u6b7b\u4ea1\uff0c\u8b8a\u6210\u6642\u4ee3\u7684\u773c\u6dda\u4e86\uff0c\u5c31\u7b97\u4e0d\u7528\u52a0\u4e0a CSRF token \u4e5f\u6c92\u95dc\u4fc2\uff0c\u56e0\u70ba same-site cookie \u6703\u81ea\u52d5\u8655\u7406\u597d\u4e00\u5207\u3002"),(0,o.kt)("p",null,"\u7136\u800c\uff0c\u771f\u7684\u662f\u9019\u6a23\u55ce\uff1f"),(0,o.kt)("p",null,"\u9810\u8a2d\u7684 ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite=Lax")," \u771f\u7684\u6709\u9019\u9ebc\u53b2\u5bb3\u55ce\uff1f\u6709\u4e86\u5b83\u4e4b\u5f8c\uff0c\u6211\u5011\u662f\u5426\u9084\u9700\u8981\u52a0\u4e0a CSRF token \u5462\uff1f\u6c92\u52a0\u7684\u8a71\u6703\u4e0d\u6703\u6709\u554f\u984c\u5462\uff1f\u90a3\u662f\u4ec0\u9ebc\u72c0\u6cc1\u6703\u51fa\u554f\u984c\uff1f"),(0,o.kt)("p",null,"\u5927\u5bb6\u53ef\u4ee5\u5148\u60f3\u60f3\u770b\u9019\u4e9b\u554f\u984c\uff0c\u7136\u5f8c\u7e7c\u7e8c\u770b\u4e0b\u53bb\u3002"),(0,o.kt)("h2",{id:"get-\u578b\u614b\u7684-csrf"},"GET \u578b\u614b\u7684 CSRF"),(0,o.kt)("p",null,"\u5728\u4ee5\u524d\u7684\u7bc4\u4f8b\u4e2d\uff0c\u6211\u5728\u4ecb\u7d39 CSRF \u6642\u90fd\u662f\u4f7f\u7528 POST\uff0c\u539f\u56e0\u5f88\u7c21\u55ae\uff0cCSRF \u7684\u91cd\u9ede\u662f\u57f7\u884c\u64cd\u4f5c\uff0c\u800c\u4e00\u822c\u4f86\u8aaa GET \u4e26\u4e0d\u6703\u7528\u65bc\u57f7\u884c\u64cd\u4f5c\uff0c\u56e0\u70ba\u9019\u4e0d\u7b26\u5408 GET \u65b9\u6cd5\u7684\u8a9e\u7fa9\uff08\u6216\u4e5f\u53ef\u4ee5\u7528\u66f4\u5c08\u696d\u7684\u8aaa\u6cd5\uff0cGET \u53ea\u9069\u5408 idempotent \u7684\u64cd\u4f5c\uff09\u3002"),(0,o.kt)("p",null,"\u4e0d\u904e\u300c\u4e0d\u9069\u5408\u9019\u6a23\u505a\u300d\uff0c\u4e0d\u4ee3\u8868\u300c\u4e0d\u80fd\u9019\u6a23\u505a\u300d\u3002"),(0,o.kt)("p",null,"\u5982\u540c\u6211\u5728\u8b1b CSRF \u6642\u7b2c\u4e00\u500b\u8209\u7684\u7bc4\u4f8b\uff0c\u6709\u4e9b\u4eba\u6216\u8a31\u6703\u5077\u61f6\uff0c\u7528\u4e86 GET \u4f86\u5be6\u4f5c\u522a\u9664\u6216\u5176\u4ed6\u529f\u80fd\uff0c\u50cf\u9019\u6a23\uff1a",(0,o.kt)("inlineCode",{parentName:"p"},"/delete?id=3"),"\u3002"),(0,o.kt)("p",null,"\u5728\u9019\u7a2e\u60c5\u6cc1\u4e0b\uff0cSameSite lax \u5c31\u6c92\u8fa6\u6cd5\u4fdd\u8b77\u4e86\uff0c\u56e0\u70ba lax \u5141\u8a31\u5e95\u4e0b\u7684\u884c\u70ba\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"location = 'https://api.huli.tw/delete?id=3'\n")),(0,o.kt)("p",null,"\u50cf\u662f\u9019\u7a2e\u9801\u9762\u7684\u91cd\u65b0\u5c0e\u5411\uff0c\u5c31\u662f\u5141\u8a31\u7684\u884c\u70ba\u4e4b\u4e00\uff0c\u6240\u4ee5\u5c31\u7b97\u6709\u4e86\u9810\u8a2d\u7684 same-site cookie\uff0c\u4f9d\u7136\u4fdd\u8b77\u4e0d\u4e86\u3002"),(0,o.kt)("p",null,"\u4ee5\u5f8c\u770b\u5230\u6709\u4eba\u5beb\u51fa\u9019\u7a2e\u300c\u7528 GET \u57f7\u884c\u64cd\u4f5c\u300d\u6642\uff0c\u9664\u4e86\u544a\u8a34\u4ed6\u9019\u6a23\u662f\u500b bad practice \u4ee5\u5916\uff0c\u73fe\u5728\u53c8\u591a\u4e86\u4e00\u500b\u7406\u7531\u4e86\uff1a\u300c\u9019\u6a23\u505a\u6703\u6709\u5b89\u5168\u6027\u554f\u984c\u300d\u3002"),(0,o.kt)("p",null,"\u4f46\u662f\uff0c\u6703\u9019\u6a23\u5beb\u7684\u4eba\u61c9\u8a72\u662f\u5c11\u6578\u5427\uff1f\u6240\u4ee5\u554f\u984c\u61c9\u8a72\u4e0d\u5927\uff1f"),(0,o.kt)("p",null,"\u4ee5\u9019\u6a23\u7684\u5beb\u6cd5\u4f86\u8aaa\uff0c\u78ba\u5be6\u662f\u5c11\u6578\uff0c\u4f46\u5012\u662f\u6709\u53e6\u4e00\u500b\u5f88\u5e38\u898b\u7684\u6a5f\u5236\u6211\u5011\u53ef\u4ee5\u5229\u7528\uff1amethod override\u3002"),(0,o.kt)("p",null,"HTML \u8868\u55ae\u88e1\u7684 ",(0,o.kt)("inlineCode",{parentName:"p"},"method")," \u5c6c\u6027\u4ee3\u8868\u8457\u6700\u5f8c request \u9001\u51fa\u6642\u7684 HTTP \u65b9\u6cd5\uff0c\u5b83\u7684\u503c\u53ea\u652f\u63f4\u5169\u7a2e\uff1aGET \u8ddf POST\u3002"),(0,o.kt)("p",null,"\u90a3\u5982\u679c\u8981\u4f7f\u7528 PUT\u3001PATCH \u6216\u662f DELETE \u8a72\u600e\u9ebc\u8fa6\uff1f\u505a\u4e0d\u5230\uff0c\u8981\u561b\u5c31\u53ea\u80fd\u6539\u7528 ",(0,o.kt)("inlineCode",{parentName:"p"},"fetch()")," \u4f86\u767c\u51fa\u8acb\u6c42\uff0c\u8981\u561b\u5c31\u53ea\u80fd\u5728\u5f8c\u7aef\u5be6\u4f5c\u4e00\u500b workaround\uff0c\u800c\u6709\u4e0d\u5c11\u7684 framework \u90fd\u652f\u63f4\u5f8c\u8005\u3002"),(0,o.kt)("p",null,"\u5c0d\u6709\u4e9b\u7db2\u9801\u6846\u67b6\u4f86\u8aaa\uff0c\u5982\u679c\u4e00\u500b request \u6709 ",(0,o.kt)("inlineCode",{parentName:"p"},"X-HTTP-Method-Override")," \u7684 header \u6216\u662f query string \u4e0a\u6709 ",(0,o.kt)("inlineCode",{parentName:"p"},"_method")," \u7684\u53c3\u6578\uff0c\u5c31\u6703\u4f7f\u7528\u88e1\u9762\u7684\u503c\u4f5c\u70ba\u8acb\u6c42\u7684\u65b9\u6cd5\uff0c\u800c\u4e0d\u662f\u5229\u7528\u539f\u5148 HTTP \u5167\u7684\u3002"),(0,o.kt)("p",null,"\u9019\u500b\u539f\u672c\u662f\u7528\u5728\u525b\u525b\u63d0\u5230\u7684 form \u9019\u7a2e\u5834\u5408\uff0c\u4f60\u60f3\u66f4\u65b0\u8cc7\u6599\u4f46\u53c8\u53ea\u80fd\u7528 POST \u6642\uff0c\u5c31\u53ef\u4ee5\u653e\u4e00\u500b ",(0,o.kt)("inlineCode",{parentName:"p"},"_method")," \u7684\u53c3\u6578\u8b93\u4f3a\u670d\u5668\u77e5\u9053\u9019\u5176\u5be6\u662f\u8981 PATCH\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<form action="/api/update/1" method="POST">\n  <input type=hidden name=_method value=PATCH>\n  <input name=title value=new_title>\n</form>\n')),(0,o.kt)("p",null,"\u4f46\u4ed6\u540c\u6642\u4e5f\u53ef\u4ee5\u7528\u5728\u6211\u5011\u7684 CSRF \u653b\u64ca\u4e0a\u9762\uff0c\u8209\u4f8b\u4f86\u8aaa\uff0c",(0,o.kt)("inlineCode",{parentName:"p"},"GET /api/deleteMyAccount?_method=POST")," \u5c31\u6703\u88ab\u4f3a\u670d\u5668\u8996\u70ba\u662f POST\uff0c\u800c\u975e GET\u3002"),(0,o.kt)("p",null,"\u900f\u904e\u9019\u7a2e\u65b9\u5f0f\uff0c\u53ef\u4ee5\u7e5e\u904e lax \u7684\u4fdd\u8b77\uff0c\u653b\u64ca\u6709\u652f\u63f4\u9019\u7a2e method \u8986\u84cb\u7684\u4f3a\u670d\u5668\u3002\u81f3\u65bc\u54ea\u4e9b\u7db2\u9801\u6846\u67b6\u9810\u8a2d\u6709\u9019\u500b\u6a5f\u5236\uff0c\u53ef\u4ee5\u53c3\u8003\uff1a",(0,o.kt)("a",{parentName:"p",href:"https://hazanasec.github.io/2023-07-30-Samesite-bypass-method-override.md/"},"Bypassing Samesite Cookie Restrictions with Method Override")),(0,o.kt)("h2",{id:"same-site-cookie-\u7684\u96b1\u85cf\u898f\u5247"},"Same-site cookie \u7684\u96b1\u85cf\u898f\u5247"),(0,o.kt)("p",null,"\u90a3\u5982\u679c\u6c92\u6709\u652f\u63f4 method \u8986\u84cb\uff0c\u4e5f\u6c92\u6709\u4f7f\u7528 GET \u4f86\u505a\u4efb\u4f55\u4e0d\u9069\u7576\u7684\u64cd\u4f5c\uff0c\u662f\u4e0d\u662f\u5c31\u6c92\u4e8b\u4e86\u5462\uff1f\u7576\u7136\u6c92\u9019\u9ebc\u7c21\u55ae\u3002"),(0,o.kt)("p",null,"\u9810\u8a2d\u7684 same-site cookie \u5176\u5be6\u6709\u4e00\u500b\u96b1\u85cf\u898f\u5247\uff0c\u4e5f\u4e0d\u7b97\u96b1\u85cf\u5566\uff0c\u5c31\u662f\u6bd4\u8f03\u5c11\u4eba\u77e5\u9053\uff0c\u5728\u524d\u9762 Firefox \u7684\u516c\u544a\u88e1\u5c31\u6709\u5beb\u5230\u4e86\uff1a"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"For any flows involving POST requests, you should test with and without a long delay. This is because both Firefox and Chrome implement a two-minute threshold that permits newly created cookies without the SameSite attribute to be sent on top-level, cross-site POST requests (a common login flow).")),(0,o.kt)("p",null,"\u610f\u601d\u5c31\u662f\u5c0d\u65bc\u4e00\u500b\u6c92\u6709 SameSite \u5c6c\u6027\u7684 cookie \u4f86\u8aaa\uff0c\u5728\u65b0\u5beb\u5165\u7684\u5169\u5206\u9418\u5167\u53ef\u4ee5\u7a81\u7834\u90e8\u5206\u7684 lax \u9650\u5236\uff0c\u5141\u8a31\u300ctop-level \u7684 cross-site POST \u8acb\u6c42\u300d\uff0c\u767d\u8a71\u6587\u5c31\u662f ",(0,o.kt)("inlineCode",{parentName:"p"},"<form method=POST>")," \u5566\u3002"),(0,o.kt)("p",null,"\u56e0\u6b64\uff0c\u5047\u8a2d\u4f7f\u7528\u8005\u624d\u525b\u767b\u5165\u67d0\u500b\u7db2\u7ad9\uff0c\u62ff\u4f86\u9a57\u8b49\u8eab\u4efd\u7684 cookie \u525b\u525b\u624d\u5beb\u5165\uff0c\u6b64\u6642\u53c8\u958b\u555f\u4e86\u653b\u64ca\u8005\u7684\u7db2\u9801\uff0c\u7db2\u9801\u88e1\u9762\u7684\u5167\u5bb9\u662f CSRF \u7684 exploit\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<form id=f action="https://api.huli.tw/transfer" method="POST">\n    <input type=hidden name=target value=attacker_account>\n    <input type=hidden name=amount value=1000>\n</form>\n<script>\n  f.submit()\n<\/script>\n')),(0,o.kt)("p",null,"\u90a3\u6b64\u6642\u56e0\u70ba\u524d\u9762\u8b1b\u7684\u7279\u4f8b\u7684\u95dc\u4fc2\uff0cCSRF \u653b\u64ca\u5c31\u6703\u6210\u529f\u3002"),(0,o.kt)("p",null,"\u9019\u500b\u7279\u4f8b\u539f\u672c\u662f\u70ba\u4e86\u4e0d\u8981\u8b93\u4e00\u4e9b\u7db2\u7ad9\u58de\u6389\uff0c\u6240\u4ee5\u624d\u52a0\u4e0a\u7684\uff0c\u4f46\u540c\u6642\u5c0d\u65bc\u653b\u64ca\u8005\u4f86\u8aaa\u4e5f\u662f\u958b\u4e86\u4e00\u500b\u5f8c\u9580\uff0c\u53ea\u8981\u80fd\u6eff\u8db3\u4e00\u5b9a\u7684\u689d\u4ef6\uff0c\u5c31\u80fd\u7121\u8996\u300c\u9810\u8a2d lax\u300d\u7684\u9650\u5236\u3002"),(0,o.kt)("p",null,"\u82e5\u662f\u7db2\u7ad9\u81ea\u5df1\u660e\u78ba\u6307\u5b9a ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite=Lax")," \u7684\u8a71\uff0c\u5c31\u4e0d\u6703\u6709\u9019\u500b\u554f\u984c\uff0c\u90a3\u9019\u6a23\u7684\u8a71\uff0c\u662f\u4e0d\u662f\u5c31\u771f\u7684\u5b89\u5168\u4e86\uff1f"),(0,o.kt)("p",null,"\u6211\u731c\u4f60\u77e5\u9053\u6211\u60f3\u8aaa\u4ec0\u9ebc\u3002"),(0,o.kt)("h2",{id:"\u9632\u6b62-csrf\u771f\u7684\u53ea\u8981-same-site-cookie-\u5c31\u5920\u4e86\u55ce"},"\u9632\u6b62 CSRF\uff0c\u771f\u7684\u53ea\u8981 same-site cookie \u5c31\u5920\u4e86\u55ce\uff1f"),(0,o.kt)("p",null,"\u96d6\u7136\u8aaa CSRF \u7684 CS \u4ee3\u8868\u8457\u7684\u662f cross-site\uff0c\u4f46\u66f4\u591a\u6642\u5019\u5b83\u5176\u5be6\u6bd4\u8f03\u50cf\u662f cross-origin\u3002\u63db\u53e5\u8a71\u8aaa\uff0c\u5982\u679c\u653b\u64ca\u8005\u53ef\u4ee5\u5f9e ",(0,o.kt)("inlineCode",{parentName:"p"},"assets.huli.tw")," \u5c0d ",(0,o.kt)("inlineCode",{parentName:"p"},"huli.tw")," \u767c\u8d77\u653b\u64ca\uff0c\u6211\u5011\u4e00\u822c\u4e5f\u6703\u7a31\u9019\u500b\u662f CSRF\uff0c\u5118\u7ba1\u9019\u5169\u500b\u7db2\u7ad9\u4e26\u4e0d\u662f cross-site\u3002"),(0,o.kt)("p",null,"Same-site cookie \u5c31\u53ea\u662f\u78ba\u4fdd\u5728 cross-site \u7684\u72c0\u6cc1\u4e0b\uff0ccookie \u4e0d\u6703\u88ab\u9001\u51fa\u53bb\u3002\u4f46\u5982\u679c\u5169\u500b\u7db2\u7ad9\u662f same-site \u7684\u8a71\uff0c\u5b83\u5c31\u4e0d\u7ba1\u4e86\u3002"),(0,o.kt)("p",null,"\u63a5\u7e8c\u525b\u525b\u7684\u4f8b\u5b50\uff0cFacebook \u7684\u4e3b\u7db2\u7ad9\u662f ",(0,o.kt)("inlineCode",{parentName:"p"},"www.facebook.com"),"\uff0c\u5047\u8a2d\u5b83\u6709\u4e00\u500b\u8b93\u958b\u767c\u8005\u6e2c\u8a66\u7684\u74b0\u5883\u53eb\u505a ",(0,o.kt)("inlineCode",{parentName:"p"},"sandbox.facebook.com"),"\uff0c\u5728\u9019\u4e0a\u9762\u88ab\u627e\u5230\u4e86\u4e00\u500b XSS \u6f0f\u6d1e\u3002"),(0,o.kt)("p",null,"\u5982\u679c\u7db2\u7ad9\u53ea\u7528\u4e86 same-site cookie \u4f86\u9632\u6b62 CSRF\uff0c\u90a3\u5728\u9019\u500b\u72c0\u6cc1\u5e95\u4e0b\u662f\u5b8c\u5168\u6c92\u6709\u4efb\u4f55\u7528\u8655\u7684\uff0c\u56e0\u70ba ",(0,o.kt)("inlineCode",{parentName:"p"},"www.facebook.com")," \u8ddf ",(0,o.kt)("inlineCode",{parentName:"p"},"sandbox.facebook.com")," \u5f88\u660e\u986f\u662f same-site\uff0c\u56e0\u6b64\u6211\u5011\u53ef\u4ee5\u5229\u7528 sandbox \u4e0a\u627e\u5230\u7684 XSS\uff0c\u8f15\u9b06\u5730\u5c0d\u4e3b\u7db2\u7ad9\u767c\u8d77 CSRF \u653b\u64ca\u3002"),(0,o.kt)("p",null,"\u4f46\u9019\u5f88\u660e\u986f\u5c31\u662f\u4e00\u500b\u8a72\u9632\u79a6\u7684\u6f0f\u6d1e\uff0c\u56e0\u70ba\u6211\u5011\u4e0d\u6703\u5e0c\u671b\u5b50\u7db2\u57df\u53ef\u4ee5\u653b\u64ca\u5230\u5176\u4ed6\u7db2\u57df\u3002"),(0,o.kt)("p",null,"\u56e0\u6b64\uff0c\u5b8c\u5168\u4f9d\u9760 same-site cookie \u4f86\u9632\u79a6 CSRF \u662f\u4e0d\u5b89\u5168\u7684\u9078\u64c7\uff0c\u5728 ",(0,o.kt)("a",{parentName:"p",href:"https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-12#name-samesite-cookies"},"Cookie \u7684 RFC")," \u4e2d\u4e5f\u8aaa\u4e86\uff1a"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},'Developers are strongly encouraged to deploy the usual server-side defenses (CSRF tokens, ensuring that "safe" HTTP methods are idempotent, etc) to mitigate the risk more fully.')),(0,o.kt)("p",null,"\u5f37\u70c8\u5efa\u8b70\u958b\u767c\u8005\u9664\u4e86 same-site cookie \u4ee5\u5916\uff0c\u4e5f\u4e00\u4f75\u5be6\u4f5c\u4ee5\u524d\u90a3\u4e9b\u5e38\u898b\u7684\u9632\u79a6\u65b9\u5f0f\uff0c\u4f8b\u5982\u8aaa CSRF token \u7b49\u7b49\u3002"),(0,o.kt)("p",null,"\u6240\u4ee5\u5462\uff0c\u5c31\u7b97\u6709\u4e86 same-site cookie\uff0c\u4e26\u4e0d\u4ee3\u8868\u4ee5\u524d\u7684\u9632\u79a6\u63aa\u65bd\u5c31\u90fd\u53ef\u4ee5\u62ff\u6389\u3002\u6211\u5011\u9084\u662f\u9700\u8981 CSRF token\uff0c\u518d\u642d\u914d\u4e0a same-site cookie\uff0c\u5c31\u53ef\u4ee5\u7bc9\u8d77\u66f4\u7a69\u56fa\u7684\u57ce\u7246\uff0c\u9632\u6b62\u66f4\u591a\u653b\u64ca\u7684\u60c5\u5883\u3002"),(0,o.kt)("h2",{id:"\u5be6\u969b\u6848\u4f8b"},"\u5be6\u969b\u6848\u4f8b"),(0,o.kt)("p",null,"2022 \u5e74\u7684\u6642\u5019\uff0cjub0bs \u8ddf abrahack \u627e\u5230\u4e86\u4e00\u500b\u958b\u6e90\u76e3\u63a7\u7cfb\u7d71 Grafana \u7684 CSRF \u6f0f\u6d1e\uff0c\u7de8\u865f\u70ba ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/grafana/grafana/security/advisories/GHSA-cmf4-h3xc-jw8w"},"CVE-2022-21703"),"\u3002"),(0,o.kt)("p",null,"\u6839\u672c\u539f\u56e0\u662f Grafana \u53ea\u4f7f\u7528\u4e86 ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite=Lax")," \u4f5c\u70ba CSRF \u7684\u9632\u8b77\uff0c\u56e0\u6b64\u53ea\u8981\u662f same-site \u7684\u8acb\u6c42\uff0c\u5c31\u4e00\u5f8b\u53ef\u4ee5\u57f7\u884c CSRF \u653b\u64ca\u3002\u6709\u8da3\u7684\u662f\u5728 2019 \u5e74\u6642 Grafana \u539f\u672c\u6709\u8981\u52a0\u4e0a CSRF token\uff0c\u4f46\u6539\u4e00\u6539\u4e4b\u5f8c\u89ba\u5f97\u300c\u4f3c\u4e4e\u6709 same-site cookie \u5c31\u5920\u4e86\u300d\uff0c\u65bc\u662f\u5c31\u505c\u6b62\u958b\u767c\u4e86\uff0c\u7d30\u7bc0\u53ef\u4ee5\u770b\u9019\u500b PR\uff1a",(0,o.kt)("a",{parentName:"p",href:"https://github.com/grafana/grafana/pull/20070"},"WIP: security: csrf protection #20070"),"\u3002"),(0,o.kt)("p",null,"\u4e0d\u904e Grafana \u4e4b\u6240\u4ee5\u6703\u9019\u6a23\u8a8d\u70ba\u5176\u5be6\u4e5f\u662f\u6709\u539f\u56e0\u7684\uff0c\u56e0\u70ba Grafana API \u53ea\u63a5\u53d7 ",(0,o.kt)("inlineCode",{parentName:"p"},"application/json")," \u7684\u8acb\u6c42\uff0c\u800c\u9019\u500b content-type \u7684\u8acb\u6c42\u662f\u6c92\u8fa6\u6cd5\u7531 form \u767c\u51fa\u7684\uff0c\u4f60\u53ea\u80fd\u4f7f\u7528 ",(0,o.kt)("inlineCode",{parentName:"p"},"fetch"),"\uff0c\u800c\u4e14\u9019\u500b content-type \u5c6c\u65bc\u975e\u7c21\u55ae\u8acb\u6c42\uff0c\u56e0\u6b64\u9700\u8981\u901a\u904e preflight\u3002"),(0,o.kt)("p",null,"\u65e2\u7136\u6709\u5728 preflight \u5c31\u628a\u5176\u4ed6 origin \u7684\u8acb\u6c42\u64cb\u6389\uff0c\u90a3\u7167\u7406\u4f86\u8aaa\u78ba\u5be6\u61c9\u8a72\u6c92\u4e8b\u624d\u5c0d\u3002"),(0,o.kt)("p",null,"\u4f46\u662f\u4ed4\u7d30\u95b1\u8b80 CORS \u7684\u898f\u683c\u5916\u52a0\u4f3a\u670d\u5668\u7684\u4e00\u500b\u5c0f bug\uff0c\u6210\u529f\u7e5e\u904e\u4e86\u9019\u500b\u9650\u5236\u3002"),(0,o.kt)("p",null,"\u4e00\u500b MIME type \u5176\u5be6\u662f\u7531 type\u3001subtype \u8ddf parameters \u9019\u4e09\u500b\u90e8\u5206\u6240\u7d44\u6210\uff0c\u6211\u5011\u5e38\u770b\u5230\u7684 ",(0,o.kt)("inlineCode",{parentName:"p"},"application/json"),"\uff0ctype \u662f application\uff0csubtype \u662f json\uff0c\u6c92\u6709 parameters\u3002"),(0,o.kt)("p",null,"\u800c ",(0,o.kt)("inlineCode",{parentName:"p"},"text/plain; charset=utf-8"),"\uff0ctype \u662f text\uff0csubtype \u662f plain\uff0cparameters \u662f ",(0,o.kt)("inlineCode",{parentName:"p"},"charset=utf-8"),"\u3002"),(0,o.kt)("p",null,"CORS \u7684\u898f\u683c\u53ea\u8981\u6c42 type \u52a0\u4e0a subtype \u662f\u4ee5\u4e0b\u4e09\u7a2e\uff1a"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"application/x-www-form-urlencoded"),(0,o.kt)("li",{parentName:"ol"},"multipart/form-data"),(0,o.kt)("li",{parentName:"ol"},"text/plain")),(0,o.kt)("p",null,"\u4f46\u662f\u4e26\u6c92\u6709\u9650\u5236 parameters \u7684\u5167\u5bb9\u3002"),(0,o.kt)("p",null,"\u65bc\u662f\uff0c\u9019\u500b content-type \u6703\u662f\u4e00\u500b\u7c21\u55ae\u8acb\u6c42\uff1a",(0,o.kt)("inlineCode",{parentName:"p"},"text/plain; application/json"),"\uff0c\u56e0\u70ba ",(0,o.kt)("inlineCode",{parentName:"p"},"application/json")," \u662f parameters\uff0c",(0,o.kt)("inlineCode",{parentName:"p"},"text/plain")," \u662f type + subtype\uff0c\u9019\u5b8c\u5168\u7b26\u5408\u898f\u683c\u3002"),(0,o.kt)("p",null,"\u800c API \u90a3\u908a\u7684\u8655\u7406\u908f\u8f2f\u5982\u4e0b\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-go"},'func bind(ctx *macaron.Context, obj interface{}, ifacePtr ...interface{}) {\n  contentType := ctx.Req.Header.Get("Content-Type")\n  if ctx.Req.Method == "POST" || ctx.Req.Method == "PUT" || len(contentType) > 0 {\n    switch {\n    case strings.Contains(contentType, "form-urlencoded"):\n      ctx.Invoke(Form(obj, ifacePtr...))\n    case strings.Contains(contentType, "multipart/form-data"):\n      ctx.Invoke(MultipartForm(obj, ifacePtr...))\n    case strings.Contains(contentType, "json"):\n      ctx.Invoke(Json(obj, ifacePtr...))\n    // ...\n  } else {\n    ctx.Invoke(Form(obj, ifacePtr...))\n  }\n}\n')),(0,o.kt)("p",null,"\u9019\u908a\u76f4\u63a5\u5c0d\u6574\u500b content-type \u7684\u5167\u5bb9\u7528\u4e86 ",(0,o.kt)("inlineCode",{parentName:"p"},"strings.contains"),"\uff0c\u56e0\u6b64\u6211\u5011\u50b3\u9032\u53bb\u7684 content-type \u96d6\u7136\u672c\u8cea\u4e0a\u662f ",(0,o.kt)("inlineCode",{parentName:"p"},"text/plain"),"\uff0c\u4f46\u56e0\u70ba parameters \u7684\u95dc\u4fc2\u88ab\u4f3a\u670d\u5668\u7576\u4f5c\u662f\u5408\u6cd5\u7684 JSON\u3002"),(0,o.kt)("p",null,"\u7e5e\u904e\u4e86\u9650\u5236\u4e4b\u5f8c\uff0c\u5c31\u53ef\u4ee5\u7528 fetch \u5f9e\u4e00\u500b same-site \u7684\u7db2\u7ad9\u767c\u8d77 CSRF\u3002"),(0,o.kt)("p",null,"\u5047\u8a2d Grafana \u653e\u5728 ",(0,o.kt)("inlineCode",{parentName:"p"},"https://grafana.huli.tw"),"\uff0c\u90a3\u6211\u5011\u5c31\u5fc5\u9808\u81f3\u5c11\u627e\u5230\u4e00\u500b ",(0,o.kt)("inlineCode",{parentName:"p"},"*.huli.tw")," \u7684 XSS \u6216\u662f\u638c\u63a7\u6574\u500b\u7db2\u57df\uff0c\u624d\u6709\u8fa6\u6cd5\u9032\u884c\u653b\u64ca\u3002\u96d6\u7136\u8aaa\u6709\u9ede\u96e3\u5ea6\uff0c\u4f46\u4e0d\u662f\u4e0d\u53ef\u80fd\u3002"),(0,o.kt)("p",null,"\u5c31\u5982\u540c\u6211\u524d\u9762\u8b1b\u7684\uff0c\u9019\u662f same-site \u767c\u8d77\u7684\u653b\u64ca\uff0c\u6240\u4ee5 same-site cookie \u7576\u7136\u9632\u4e0d\u4e86\u3002\u82e5\u662f\u56b4\u683c\u5f9e\u5b57\u9762\u4e0a\u4f86\u770b\uff0c\u4e26\u4e0d\u80fd\u53eb\u505a CSRF\uff0c\u56e0\u70ba\u9019\u4e0d\u662f cross-site\uff0c\u4e0d\u904e\u7279\u5225\u7d66\u4e00\u500b\u65b0\u540d\u5b57\u4f3c\u4e4e\u4e5f\u602a\u602a\u7684\u3002"),(0,o.kt)("p",null,"\u539f\u672c\u7684 writeup \u53ef\u4ee5\u53c3\u8003\u9019\u908a\uff1a",(0,o.kt)("a",{parentName:"p",href:"https://jub0bs.com/posts/2022-02-08-cve-2022-21703-writeup/"},"CVE-2022-21703: cross-origin request forgery against Grafana")),(0,o.kt)("h2",{id:"\u5c0f\u7d50"},"\u5c0f\u7d50"),(0,o.kt)("p",null,"\u5728\u9019\u7bc7\u88e1\u9762\u6211\u5011\u4ecb\u7d39\u4e86\u8fd1\u5e7e\u5e74\u5404\u5927\u700f\u89bd\u5668\u624d\u63a8\u52d5\u7684\u5168\u65b0\u63aa\u65bd\uff0c\u4e5f\u5c31\u662f\u9810\u8a2d\u5c31\u628a cookie \u8a2d\u5b9a\u6210 ",(0,o.kt)("inlineCode",{parentName:"p"},"SameSite=Lax"),"\uff0c\u96d6\u7136\u9019\u6a23\u7684\u78ba\u6709\u589e\u52a0\u4e86\u4e00\u4e9b\u5b89\u5168\u6027\uff0c\u4f46\u53ef\u5343\u842c\u4e0d\u8981\u8a8d\u70ba\u53ea\u7528\u9019\u62db\u5c31\u80fd\u5b8c\u5168\u5c01\u4f4f CSRF\u3002"),(0,o.kt)("p",null,"\u5c31\u8ddf XSS \u7684\u9632\u79a6\u4e00\u6a23\uff0cCSRF \u7684\u9632\u79a6\u4e5f\u9700\u8981\u8a2d\u7f6e\u591a\u9053\u9632\u7dda\uff0c\u78ba\u4fdd\u4e00\u9053\u9632\u7dda\u88ab\u653b\u7834\u6642\uff0c\u9084\u6709\u5176\u4ed6\u9632\u7dda\u53ef\u4ee5\u6490\u4f4f\u3002\u8209\u4f8b\u4f86\u8aaa\uff0c\u5982\u679c\u53ea\u7528\u4e86 same-site cookie\uff0c\u5c31\u8868\u793a\u7576\u6709\u53e6\u5916\u4e00\u500b same-site \u7684\u7db2\u7ad9\u88ab\u62ff\u4e0b\u4f86\u6642\uff0c\u5c31\u5ba3\u544a\u6295\u964d\u4e86\u3002\u4f46\u8207\u5176\u9019\u6a23\uff0c\u4e0d\u5982\u591a\u5be6\u4f5c\u4e00\u500b CSRF token \u7684\u4fdd\u8b77\u63aa\u65bd\uff0c\u81f3\u5c11\u5728 same-site \u88ab\u653b\u7834\u6642\u80fd\u5920\u6e1b\u8f15\u5f71\u97ff\u3002"),(0,o.kt)("p",null,"\u8a71\u53c8\u8aaa\u56de\u4f86\u4e86\uff0c\u62ff\u5230\u5176\u4ed6 same-site \u7684\u63a7\u5236\u6b0a\uff0c\u662f\u4e00\u4ef6\u5bb9\u6613\u7684\u4e8b\u60c5\u55ce\uff1f\u62ff\u5230\u4e4b\u5f8c\u53c8\u53ef\u4ee5\u505a\u4e00\u4e9b\u4ec0\u9ebc\u4e8b\u5462\uff1f\u5927\u5bb6\u53ef\u4ee5\u60f3\u4e00\u4e0b\u9019\u500b\u554f\u984c\uff0c\u6211\u5011\u4e0b\u4e00\u7bc7\u5c31\u4f86\u8ac7\u8ac7\u9019\u500b\u3002"),(0,o.kt)("p",null,"\u53c3\u8003\u8cc7\u6599\uff1a"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"https://www.sjoerdlangkemper.nl/2016/04/14/preventing-csrf-with-samesite-cookie-attribute/"},"Preventing CSRF with the same-site cookie attribute")),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"http://bobao.360.cn/learning/detail/2844.html"},"\u518d\u89c1\uff0cCSRF\uff1a\u8bb2\u89e3set-cookie\u4e2d\u7684SameSite\u5c5e\u6027")),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"http://www.cnblogs.com/ziyunfei/p/5637945.html"},"SameSite Cookie\uff0c\u9632\u6b62 CSRF \u653b\u51fb")),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"https://rlilyyy.github.io/2016/07/10/SameSite-Cookie%E2%80%94%E2%80%94%E9%98%B2%E5%BE%A1-CSRF-XSSI/"},"SameSite\u2014\u2014\u9632\u5fa1 CSRF & XSSI \u65b0\u673a\u5236")),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"https://scotthelme.co.uk/csrf-is-dead/"},"Cross-Site Request Forgery is dead!"))))}c.isMDXComponent=!0}}]);