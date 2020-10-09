!function(){"use strict";try{self["workbox:core:5.1.4"]&&_()}catch(e){}const e=(e,...t)=>{let s=e;return t.length>0&&(s+=" :: "+JSON.stringify(t)),s};class t extends Error{constructor(t,s){super(e(t,s)),this.name=t,this.details=s}}try{self["workbox:routing:5.1.4"]&&_()}catch(e){}const s=e=>e&&"object"==typeof e?e:{handle:e};class n{constructor(e,t,n="GET"){this.handler=s(t),this.match=e,this.method=n}}class r extends n{constructor(e,t,s){super(({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)},t,s)}}class a{constructor(){this._routes=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data,s=Promise.all(t.urlsToCache.map(e=>{"string"==typeof e&&(e=[e]);const t=new Request(...e);return this.handleRequest({request:t})}));e.waitUntil(s),e.ports&&e.ports[0]&&s.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const{params:n,route:r}=this.findMatchingRoute({url:s,request:e,event:t});let a,i=r&&r.handler;if(!i&&this._defaultHandler&&(i=this._defaultHandler),i){try{a=i.handle({url:s,request:e,event:t,params:n})}catch(e){a=Promise.reject(e)}return a instanceof Promise&&this._catchHandler&&(a=a.catch(n=>this._catchHandler.handle({url:s,request:e,event:t}))),a}}findMatchingRoute({url:e,request:t,event:s}){const n=this._routes.get(t.method)||[];for(const r of n){let n;const a=r.match({url:e,request:t,event:s});if(a)return n=a,(Array.isArray(a)&&0===a.length||a.constructor===Object&&0===Object.keys(a).length||"boolean"==typeof a)&&(n=void 0),{route:r,params:n}}return{}}setDefaultHandler(e){this._defaultHandler=s(e)}setCatchHandler(e){this._catchHandler=s(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new t("unregister-route-but-not-found-with-method",{method:e.method});const s=this._routes.get(e.method).indexOf(e);if(!(s>-1))throw new t("unregister-route-route-not-registered");this._routes.get(e.method).splice(s,1)}}let i;const c=()=>(i||(i=new a,i.addFetchListener(),i.addCacheListener()),i);function o(e,s,a){let i;if("string"==typeof e){const t=new URL(e,location.href);i=new n(({url:e})=>e.href===t.href,s,a)}else if(e instanceof RegExp)i=new r(e,s,a);else if("function"==typeof e)i=new n(e,s,a);else{if(!(e instanceof n))throw new t("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});i=e}return c().registerRoute(i),i}const h={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},u=e=>[h.prefix,e,h.suffix].filter(e=>e&&e.length>0).join("-"),l=e=>e||u(h.precache),d=e=>e||u(h.runtime),p=new Set;const f=(e,t)=>e.filter(e=>t in e),m=async({request:e,mode:t,plugins:s=[]})=>{const n=f(s,"cacheKeyWillBeUsed");let r=e;for(const e of n)r=await e.cacheKeyWillBeUsed.call(e,{mode:t,request:r}),"string"==typeof r&&(r=new Request(r));return r},g=async({cacheName:e,request:t,event:s,matchOptions:n,plugins:r=[]})=>{const a=await self.caches.open(e),i=await m({plugins:r,request:t,mode:"read"});let c=await a.match(i,n);for(const t of r)if("cachedResponseWillBeUsed"in t){const r=t.cachedResponseWillBeUsed;c=await r.call(t,{cacheName:e,event:s,matchOptions:n,cachedResponse:c,request:i})}return c},w=async({cacheName:e,request:s,response:n,event:r,plugins:a=[],matchOptions:i})=>{const c=await m({plugins:a,request:s,mode:"write"});if(!n)throw new t("cache-put-with-no-response",{url:(o=c.url,new URL(String(o),location.href).href.replace(new RegExp("^"+location.origin),""))});var o;const h=await(async({request:e,response:t,event:s,plugins:n=[]})=>{let r=t,a=!1;for(const t of n)if("cacheWillUpdate"in t){a=!0;const n=t.cacheWillUpdate;if(r=await n.call(t,{request:e,response:r,event:s}),!r)break}return a||(r=r&&200===r.status?r:void 0),r||null})({event:r,plugins:a,response:n,request:c});if(!h)return;const u=await self.caches.open(e),l=f(a,"cacheDidUpdate"),d=l.length>0?await g({cacheName:e,matchOptions:i,request:c}):null;try{await u.put(c,h)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of p)await e()}(),e}for(const t of l)await t.cacheDidUpdate.call(t,{cacheName:e,event:r,oldResponse:d,newResponse:h,request:c})},y=g,v=async({request:e,fetchOptions:s,event:n,plugins:r=[]})=>{if("string"==typeof e&&(e=new Request(e)),n instanceof FetchEvent&&n.preloadResponse){const e=await n.preloadResponse;if(e)return e}const a=f(r,"fetchDidFail"),i=a.length>0?e.clone():null;try{for(const t of r)if("requestWillFetch"in t){const s=t.requestWillFetch,r=e.clone();e=await s.call(t,{request:r,event:n})}}catch(e){throw new t("plugin-error-request-will-fetch",{thrownError:e})}const c=e.clone();try{let t;t="navigate"===e.mode?await fetch(e):await fetch(e,s);for(const e of r)"fetchDidSucceed"in e&&(t=await e.fetchDidSucceed.call(e,{event:n,request:c,response:t}));return t}catch(e){for(const t of a)await t.fetchDidFail.call(t,{error:e,event:n,originalRequest:i.clone(),request:c.clone()});throw e}};try{self["workbox:strategies:5.1.4"]&&_()}catch(e){}class R{constructor(e={}){this._cacheName=d(e.cacheName),this._plugins=e.plugins||[],this._fetchOptions=e.fetchOptions,this._matchOptions=e.matchOptions}async handle({event:e,request:s}){"string"==typeof s&&(s=new Request(s));let n,r=await y({cacheName:this._cacheName,request:s,event:e,matchOptions:this._matchOptions,plugins:this._plugins});if(!r)try{r=await this._getFromNetwork(s,e)}catch(e){n=e}if(!r)throw new t("no-response",{url:s.url,error:n});return r}async _getFromNetwork(e,t){const s=await v({request:e,event:t,fetchOptions:this._fetchOptions,plugins:this._plugins}),n=s.clone(),r=w({cacheName:this._cacheName,request:e,response:n,event:t,plugins:this._plugins});if(t)try{t.waitUntil(r)}catch(e){}return s}}const q={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null};let x;function U(e){e.then(()=>{})}class N{constructor(e,t,{onupgradeneeded:s,onversionchange:n}={}){this._db=null,this._name=e,this._version=t,this._onupgradeneeded=s,this._onversionchange=n||(()=>this.close())}get db(){return this._db}async open(){if(!this._db)return this._db=await new Promise((e,t)=>{let s=!1;setTimeout(()=>{s=!0,t(new Error("The open request was blocked and timed out"))},this.OPEN_TIMEOUT);const n=indexedDB.open(this._name,this._version);n.onerror=()=>t(n.error),n.onupgradeneeded=e=>{s?(n.transaction.abort(),n.result.close()):"function"==typeof this._onupgradeneeded&&this._onupgradeneeded(e)},n.onsuccess=()=>{const t=n.result;s?t.close():(t.onversionchange=this._onversionchange.bind(this),e(t))}}),this}async getKey(e,t){return(await this.getAllKeys(e,t,1))[0]}async getAll(e,t,s){return await this.getAllMatching(e,{query:t,count:s})}async getAllKeys(e,t,s){return(await this.getAllMatching(e,{query:t,count:s,includeKeys:!0})).map(e=>e.key)}async getAllMatching(e,{index:t,query:s=null,direction:n="next",count:r,includeKeys:a=!1}={}){return await this.transaction([e],"readonly",(i,c)=>{const o=i.objectStore(e),h=t?o.index(t):o,u=[],l=h.openCursor(s,n);l.onsuccess=()=>{const e=l.result;e?(u.push(a?e:e.value),r&&u.length>=r?c(u):e.continue()):c(u)}})}async transaction(e,t,s){return await this.open(),await new Promise((n,r)=>{const a=this._db.transaction(e,t);a.onabort=()=>r(a.error),a.oncomplete=()=>n(),s(a,e=>n(e))})}async _call(e,t,s,...n){return await this.transaction([t],s,(s,r)=>{const a=s.objectStore(t),i=a[e].apply(a,n);i.onsuccess=()=>r(i.result)})}close(){this._db&&(this._db.close(),this._db=null)}}N.prototype.OPEN_TIMEOUT=2e3;const T={readonly:["get","count","getKey","getAll","getAllKeys"],readwrite:["add","put","clear","delete"]};for(const[e,t]of Object.entries(T))for(const s of t)s in IDBObjectStore.prototype&&(N.prototype[s]=async function(t,...n){return await this._call(s,t,e,...n)});async function b(e,t){const s=e.clone(),n={headers:new Headers(s.headers),status:s.status,statusText:s.statusText},r=t?t(n):n,a=function(){if(void 0===x){const e=new Response("");if("body"in e)try{new Response(e.body),x=!0}catch(e){x=!1}x=!1}return x}()?s.body:await s.blob();return new Response(a,r)}try{self["workbox:precaching:5.1.4"]&&_()}catch(e){}const L=[],E={get:()=>L,add(e){L.push(...e)}};function O(e){if(!e)throw new t("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:s,url:n}=e;if(!n)throw new t("add-to-cache-list-unexpected-type",{entry:e});if(!s){const e=new URL(n,location.href);return{cacheKey:e.href,url:e.href}}const r=new URL(n,location.href),a=new URL(n,location.href);return r.searchParams.set("__WB_REVISION__",s),{cacheKey:r.href,url:a.href}}class C{constructor(e){this._cacheName=l(e),this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map}addToCacheList(e){const s=[];for(const n of e){"string"==typeof n?s.push(n):n&&void 0===n.revision&&s.push(n.url);const{cacheKey:e,url:r}=O(n),a="string"!=typeof n&&n.revision?"reload":"default";if(this._urlsToCacheKeys.has(r)&&this._urlsToCacheKeys.get(r)!==e)throw new t("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(r),secondEntry:e});if("string"!=typeof n&&n.integrity){if(this._cacheKeysToIntegrities.has(e)&&this._cacheKeysToIntegrities.get(e)!==n.integrity)throw new t("add-to-cache-list-conflicting-integrities",{url:r});this._cacheKeysToIntegrities.set(e,n.integrity)}if(this._urlsToCacheKeys.set(r,e),this._urlsToCacheModes.set(r,a),s.length>0){const e=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}async install({event:e,plugins:t}={}){const s=[],n=[],r=await self.caches.open(this._cacheName),a=await r.keys(),i=new Set(a.map(e=>e.url));for(const[e,t]of this._urlsToCacheKeys)i.has(t)?n.push(e):s.push({cacheKey:t,url:e});const c=s.map(({cacheKey:s,url:n})=>{const r=this._cacheKeysToIntegrities.get(s),a=this._urlsToCacheModes.get(n);return this._addURLToCache({cacheKey:s,cacheMode:a,event:e,integrity:r,plugins:t,url:n})});await Promise.all(c);return{updatedURLs:s.map(e=>e.url),notUpdatedURLs:n}}async activate(){const e=await self.caches.open(this._cacheName),t=await e.keys(),s=new Set(this._urlsToCacheKeys.values()),n=[];for(const r of t)s.has(r.url)||(await e.delete(r),n.push(r.url));return{deletedURLs:n}}async _addURLToCache({cacheKey:e,url:s,cacheMode:n,event:r,plugins:a,integrity:i}){const c=new Request(s,{integrity:i,cache:n,credentials:"same-origin"});let o,h=await v({event:r,plugins:a,request:c});for(const e of a||[])"cacheWillUpdate"in e&&(o=e);if(!(o?await o.cacheWillUpdate({event:r,request:c,response:h}):h.status<400))throw new t("bad-precaching-response",{url:s,status:h.status});h.redirected&&(h=await b(h)),await w({event:r,plugins:a,response:h,request:e===s?c:new Request(e),cacheName:this._cacheName,matchOptions:{ignoreSearch:!0}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this._urlsToCacheKeys.get(t.href)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this._cacheName)).match(s)}}createHandler(e=!0){return async({request:s})=>{try{const e=await this.matchPrecache(s);if(e)return e;throw new t("missing-precache-entry",{cacheName:this._cacheName,url:s instanceof Request?s.url:s})}catch(t){if(e)return fetch(s);throw t}}}createHandlerBoundToURL(e,s=!0){if(!this.getCacheKeyForURL(e))throw new t("non-precached-url",{url:e});const n=this.createHandler(s),r=new Request(e);return()=>n({request:r})}}let K;const S=()=>(K||(K=new C),K);const M=(e,t)=>{const s=S().getURLsToCacheKeys();for(const n of function*(e,{ignoreURLParametersMatching:t,directoryIndex:s,cleanURLs:n,urlManipulation:r}={}){const a=new URL(e,location.href);a.hash="",yield a.href;const i=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some(e=>e.test(s))&&e.searchParams.delete(s);return e}(a,t);if(yield i.href,s&&i.pathname.endsWith("/")){const e=new URL(i.href);e.pathname+=s,yield e.href}if(n){const e=new URL(i.href);e.pathname+=".html",yield e.href}if(r){const e=r({url:a});for(const t of e)yield t.href}}(e,t)){const e=s.get(n);if(e)return e}};let D=!1;function k(e){D||((({ignoreURLParametersMatching:e=[/^utm_/],directoryIndex:t="index.html",cleanURLs:s=!0,urlManipulation:n}={})=>{const r=l();self.addEventListener("fetch",a=>{const i=M(a.request.url,{cleanURLs:s,directoryIndex:t,ignoreURLParametersMatching:e,urlManipulation:n});if(!i)return;let c=self.caches.open(r).then(e=>e.match(i)).then(e=>e||fetch(i));a.respondWith(c)})})(e),D=!0)}function A(e){return S().matchPrecache(e)}const P=e=>{const t=S(),s=E.get();e.waitUntil(t.install({event:e,plugins:s}).catch(e=>{throw e}))},W=e=>{const t=S();e.waitUntil(t.activate())};try{self["workbox:expiration:5.1.4"]&&_()}catch(e){}const I=e=>{const t=new URL(e,location.href);return t.hash="",t.href};class F{constructor(e){this._cacheName=e,this._db=new N("workbox-expiration",1,{onupgradeneeded:e=>this._handleUpgrade(e)})}_handleUpgrade(e){const t=e.target.result.createObjectStore("cache-entries",{keyPath:"id"});t.createIndex("cacheName","cacheName",{unique:!1}),t.createIndex("timestamp","timestamp",{unique:!1}),(async e=>{await new Promise((t,s)=>{const n=indexedDB.deleteDatabase(e);n.onerror=()=>{s(n.error)},n.onblocked=()=>{s(new Error("Delete blocked"))},n.onsuccess=()=>{t()}})})(this._cacheName)}async setTimestamp(e,t){const s={url:e=I(e),timestamp:t,cacheName:this._cacheName,id:this._getId(e)};await this._db.put("cache-entries",s)}async getTimestamp(e){return(await this._db.get("cache-entries",this._getId(e))).timestamp}async expireEntries(e,t){const s=await this._db.transaction("cache-entries","readwrite",(s,n)=>{const r=s.objectStore("cache-entries").index("timestamp").openCursor(null,"prev"),a=[];let i=0;r.onsuccess=()=>{const s=r.result;if(s){const n=s.value;n.cacheName===this._cacheName&&(e&&n.timestamp<e||t&&i>=t?a.push(s.value):i++),s.continue()}else n(a)}}),n=[];for(const e of s)await this._db.delete("cache-entries",e.id),n.push(e.url);return n}_getId(e){return this._cacheName+"|"+I(e)}}class H{constructor(e,t={}){this._isRunning=!1,this._rerunRequested=!1,this._maxEntries=t.maxEntries,this._maxAgeSeconds=t.maxAgeSeconds,this._cacheName=e,this._timestampModel=new F(e)}async expireEntries(){if(this._isRunning)return void(this._rerunRequested=!0);this._isRunning=!0;const e=this._maxAgeSeconds?Date.now()-1e3*this._maxAgeSeconds:0,t=await this._timestampModel.expireEntries(e,this._maxEntries),s=await self.caches.open(this._cacheName);for(const e of t)await s.delete(e);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,U(this.expireEntries()))}async updateTimestamp(e){await this._timestampModel.setTimestamp(e,Date.now())}async isURLExpired(e){if(this._maxAgeSeconds){return await this._timestampModel.getTimestamp(e)<Date.now()-1e3*this._maxAgeSeconds}return!1}async delete(){this._rerunRequested=!1,await this._timestampModel.expireEntries(1/0)}}class j{constructor(e={}){var t;this.cachedResponseWillBeUsed=async({event:e,request:t,cacheName:s,cachedResponse:n})=>{if(!n)return null;const r=this._isResponseDateFresh(n),a=this._getCacheExpiration(s);U(a.expireEntries());const i=a.updateTimestamp(t.url);if(e)try{e.waitUntil(i)}catch(e){}return r?n:null},this.cacheDidUpdate=async({cacheName:e,request:t})=>{const s=this._getCacheExpiration(e);await s.updateTimestamp(t.url),await s.expireEntries()},this._config=e,this._maxAgeSeconds=e.maxAgeSeconds,this._cacheExpirations=new Map,e.purgeOnQuotaError&&(t=()=>this.deleteCacheAndMetadata(),p.add(t))}_getCacheExpiration(e){if(e===d())throw new t("expire-custom-caches-only");let s=this._cacheExpirations.get(e);return s||(s=new H(e,this._config),this._cacheExpirations.set(e,s)),s}_isResponseDateFresh(e){if(!this._maxAgeSeconds)return!0;const t=this._getDateHeaderTimestamp(e);if(null===t)return!0;return t>=Date.now()-1e3*this._maxAgeSeconds}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;const t=e.headers.get("date"),s=new Date(t).getTime();return isNaN(s)?null:s}async deleteCacheAndMetadata(){for(const[e,t]of this._cacheExpirations)await self.caches.delete(e),await t.delete();this._cacheExpirations=new Map}}const B={map:new Map,set(e,t){return this.map.set(V(e),t)},get(e){const t=this.map.get(V(e));return t&&(t.validLeft=(new Date(t.validUntil)-new Date)/1e3),t}},J=function(e){return{cachedResponseWillBeUsed({cacheName:e,request:t,matchOptions:s,cachedResponse:n,event:r}){if(!0!==G(t).writeHeaders)return n;const a=new Headers(n.headers),i=B.get(t)||{};for(const[e,t]of Object.entries(i))a.set("x-routify-"+e.replace(/[A-Z]/g,e=>"-"+e.toLowerCase()),t);return a.set("x-routify-use-cache","true"),n.arrayBuffer().then(e=>new Response(e,{...n,headers:a}))},cacheDidUpdate:async({cacheName:t,request:s,oldResponse:n,newResponse:r,event:a})=>{const i=function({referrer:e}){const t=(e.match(/\?(.+)/)||[null,""])[1],s=[...new URLSearchParams(t)].filter(([e])=>e.startsWith("__routify_")),n={};for(const[e,t]of s)n[e.replace(/^__routify_/,"")]=t;return n}(a.request),c=G(a.request),o={...e,...i,...c},h=Date.now();B.set(a.request,{...o,validUntil:new Date(h+1e3*o.validFor).toISOString(),cachedAt:new Date(h).toISOString()})}}};function Q(e){return B.map.forEach((e,t)=>{new Date(e.validUntil)<new Date&&B.map.delete(t)}),B.get(e.request)}function G({headers:e}){const t=[...e.entries()].filter(([e])=>e.startsWith("x-routify-")),s={};for(const[e,n]of t){s[e.replace("x-routify-","").replace(/-./g,e=>e.toUpperCase()[1])]=Z(n)}return s}function V({url:e,headers:t,method:s}){return JSON.stringify({url:e,method:s,headers:[...t.entries()]})}function Z(e){try{return JSON.parse(e)}catch(e){}}const $=[{"revision":"0201b9b9b18ce90fabc5a04e8999e6c3","url":"404.svg"},{"revision":"7957e8f575372c47b3237742b3a8c93c","url":"build/_example_transitions_tabs-ff3a1124.js"},{"revision":"b3de920bad76b0c38d0ccf5bdc5e3424","url":"build/_fallback-39492924.js"},{"revision":"b7b048980a29c4199182d4e66fe5ead6","url":"build/_fallback-6ec5d7ff.js"},{"revision":"eb301078cb35c328c418df13de72d2a3","url":"build/_fallback-a1cdf58f.js"},{"revision":"90b866fa576ec95299f1c32d4dc89d3e","url":"build/_fallback-a8f6b8f5.js"},{"revision":"e99eedf6819ec593468cc59db79ac1ea","url":"build/_fallback-cdfb778b.js"},{"revision":"4b83e33ad54bad05220c41c9356af232","url":"build/_fallback-ffb5833b.js"},{"revision":"4f68a51b85136ee4b6cbc961e1fe1f9f","url":"build/_layout-237722a2.js"},{"revision":"ad11a084ac46e16178e8e1eac3407805","url":"build/_layout-3aebb0ca.js"},{"revision":"dd9fc05101642515e7d9f731b739eed5","url":"build/_layout-57f79a9f.js"},{"revision":"14dd7f65d1f79d576685bdc09e682f26","url":"build/_layout-8e291e14.js"},{"revision":"dfe2b62f8677244559af68261b4df655","url":"build/_layout-8e906dcb.js"},{"revision":"04e36dfe2872730821f9188ad5dc58b2","url":"build/_layout-9ef5e179.js"},{"revision":"528578f42f9e757607c618d7e0d04a68","url":"build/_layout-a32701c8.js"},{"revision":"7613f198b3ea7cad96593fdc205fd28c","url":"build/_layout-a362c4f1.js"},{"revision":"9269929f0a673c85fd036f0c75259bca","url":"build/_layout-a9adca77.js"},{"revision":"3d89fbb9e8b79979c094d51cf559ec60","url":"build/_layout-d8adb1b1.js"},{"revision":"bc6f3ea9c9bc10e84678c0f40e2ec67a","url":"build/_layout-e0cf90b1.js"},{"revision":"6010befb757fea23ee96d0724efbfbf6","url":"build/_reset-1bb38dca.js"},{"revision":"d53bab4281b856ff634e14276c3713b8","url":"build/_reset-657c47e7.js"},{"revision":"2dfd5cc82d6c3d1a778f009647230a5e","url":"build/_reset-ab82190a.js"},{"revision":"05b57e8295ab75db39292768c13283d3","url":"build/_reset-b2c1fa18.js"},{"revision":"6d006b8d5da6f59ddcf9c7af1750f3a8","url":"build/_store-a9d49695.js"},{"revision":"8090e709742610a2d8baa9ffd915c2d4","url":"build/[key]-5c3126df.js"},{"revision":"6c7929bd143f6f1dad852509712ef968","url":"build/[key]-d3929560.js"},{"revision":"a68a69fe78a27890f297e1891de354f1","url":"build/[showId]-0afca395.js"},{"revision":"3bed25cbe75322f5de7bf6531a14d227","url":"build/bundle.css"},{"revision":"314974e19e92b4c6421c50210a4d808f","url":"build/bundle.js"},{"revision":"141536fe58f6e8ee426ae583b1ffc5c7","url":"build/feature1-c58247fe.js"},{"revision":"b7c5afbc97d73de278a6837b767d367a","url":"build/feature2-55730719.js"},{"revision":"288ed5ebdd052d3bb97c600ee2814be9","url":"build/feature2-f3b7db76.js"},{"revision":"17fee3c38a199ab0bc4f8fe9c322d1bc","url":"build/feature3-40820fb6.js"},{"revision":"ec9b8814e04137ffb7c0328cad975763","url":"build/index-07e076ee.js"},{"revision":"1f92abf12892986287301a09582713a8","url":"build/index-09dd2b3a.js"},{"revision":"1b8bfe39fc84ea548c1abaa2da446e40","url":"build/index-10538cb3.js"},{"revision":"c52a08eb74a020051528f43c8971ba26","url":"build/index-2cd446d6.js"},{"revision":"ae6ecd481af2363c2d073db45ed1d536","url":"build/index-31bd1a2b.js"},{"revision":"d15f885c9e73edd4c5707fb9782e74ff","url":"build/index-31f48180.js"},{"revision":"1b14a12a8e334d80561e2ea8775b6978","url":"build/index-34e66acc.js"},{"revision":"4b4606b680920ab588ab3566524c2957","url":"build/index-48fc0d6c.js"},{"revision":"64a657d85948414e86c7a7a8dd4786d7","url":"build/index-58391fe0.js"},{"revision":"dc914b638536915c983de9c7b43d9b21","url":"build/index-712691ee.js"},{"revision":"0f632b124400ae388a5fd23b1ea8f91d","url":"build/index-7c1e1b7d.js"},{"revision":"ff47d59b26aacb2c24f766a8a3aafc59","url":"build/index-96c86842.js"},{"revision":"8c72f636b3d2c1287d1af10f26a05cf8","url":"build/index-d5dc8dc9.js"},{"revision":"7c27eacb46247dbdf169561ec6728b37","url":"build/index-dc01f227.js"},{"revision":"a337da6c044b73e89198e0cc060fcea2","url":"build/index-ead7e17d.js"},{"revision":"b4661e243a4a96a67ed9628d5e2530cf","url":"build/index-eca5359a.js"},{"revision":"e5e624515a85af03f4eb12eafcd12c4c","url":"build/main.js"},{"revision":"652ab9d621cdd63e576f1f9418cbe096","url":"build/Splash-ed7786dd.js"},{"revision":"e79f7a24e68b9543b951912763fe0a38","url":"global.css"},{"revision":"342a320695d22ecb94ec175ce8d9d186","url":"__app.html"}],z=()=>({cacheName:"external",plugins:[J({validFor:60}),new j({maxEntries:50,purgeOnQuotaError:!0})]});var X,Y;(function(e){S().addToCacheList(e),e.length>0&&(self.addEventListener("install",P),self.addEventListener("activate",W))})($),k(X),self.addEventListener("install",()=>self.skipWaiting()),self.addEventListener("activate",()=>self.clients.claim()),o((function({url:e,request:t}){return e.host===self.location.host&&"document"===t.destination}),A("__app.html")),o((function({url:e,request:t}){return e.host===self.location.host&&"document"!=t.destination}),new R),o((function(e){return!!Q(e)}),new R(z())),Y=new class{constructor(e={}){if(this._cacheName=d(e.cacheName),e.plugins){const t=e.plugins.some(e=>!!e.cacheWillUpdate);this._plugins=t?e.plugins:[q,...e.plugins]}else this._plugins=[q];this._networkTimeoutSeconds=e.networkTimeoutSeconds||0,this._fetchOptions=e.fetchOptions,this._matchOptions=e.matchOptions}async handle({event:e,request:s}){const n=[];"string"==typeof s&&(s=new Request(s));const r=[];let a;if(this._networkTimeoutSeconds){const{id:t,promise:i}=this._getTimeoutPromise({request:s,event:e,logs:n});a=t,r.push(i)}const i=this._getNetworkPromise({timeoutId:a,request:s,event:e,logs:n});r.push(i);let c=await Promise.race(r);if(c||(c=await i),!c)throw new t("no-response",{url:s.url});return c}_getTimeoutPromise({request:e,logs:t,event:s}){let n;return{promise:new Promise(t=>{n=setTimeout(async()=>{t(await this._respondFromCache({request:e,event:s}))},1e3*this._networkTimeoutSeconds)}),id:n}}async _getNetworkPromise({timeoutId:e,request:t,logs:s,event:n}){let r,a;try{a=await v({request:t,event:n,fetchOptions:this._fetchOptions,plugins:this._plugins})}catch(e){r=e}if(e&&clearTimeout(e),r||!a)a=await this._respondFromCache({request:t,event:n});else{const e=a.clone(),s=w({cacheName:this._cacheName,request:t,response:e,event:n,plugins:this._plugins});if(n)try{n.waitUntil(s)}catch(e){}}return a}_respondFromCache({event:e,request:t}){return y({cacheName:this._cacheName,request:t,event:e,matchOptions:this._matchOptions,plugins:this._plugins})}}(z()),c().setDefaultHandler(Y),function(e){c().setCatchHandler(e)}(async({event:e})=>{switch(e.request.destination){case"document":return await A("__app.html");case"image":return await A("404.svg");default:return Response.error()}})}();
//# sourceMappingURL=sw.js.map
