
/**
 * @sveltech/routify 1.9.9
 * File generated Fri Oct 09 2020 20:10:41 GMT+0900 (Korean Standard Time)
 */

export const __version = "1.9.9"
export const __timestamp = "2020-10-09T11:10:41.297Z"

//buildRoutes
import { buildClientTree } from "@sveltech/routify/runtime/buildRoutes"

//imports


//options
export const options = {}

//tree
export const _tree = {
  "name": "root",
  "filepath": "/",
  "root": true,
  "ownMeta": {},
  "absolutePath": "src/pages",
  "children": [
    {
      "isFile": true,
      "isDir": false,
      "ext": "svelte",
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": true,
      "isPage": false,
      "ownMeta": {},
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/_fallback",
      "id": "__fallback",
      "component": () => import('../src/pages/_fallback.svelte').then(m => m.default)
    },
    {
      "isFile": true,
      "isDir": false,
      "ext": "svelte",
      "isLayout": true,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "isPage": false,
      "ownMeta": {},
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/",
      "id": "__layout",
      "component": () => import('../src/pages/_layout.svelte').then(m => m.default)
    },
    {
      "isFile": false,
      "isDir": true,
      "ext": "",
      "children": [
        {
          "isFile": true,
          "isDir": false,
          "ext": "svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": true,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/_fallback",
          "id": "_example__fallback",
          "component": () => import('../src/pages/example/_fallback.svelte').then(m => m.default)
        },
        {
          "isFile": true,
          "isDir": false,
          "ext": "svelte",
          "isLayout": true,
          "isReset": true,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example",
          "id": "_example__reset",
          "component": () => import('../src/pages/example/_reset.svelte').then(m => m.default)
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": true,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/aliasing",
              "id": "_example_aliasing__layout",
              "component": () => import('../src/pages/example/aliasing/_layout.svelte').then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/aliasing/index",
              "id": "_example_aliasing_index",
              "component": () => import('../src/pages/example/aliasing/index.svelte').then(m => m.default)
            },
            {
              "isFile": false,
              "isDir": true,
              "ext": "",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1",
                  "id": "_example_aliasing_v1__layout",
                  "component": () => import('../src/pages/example/aliasing/v1/_layout.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1/feature1",
                  "id": "_example_aliasing_v1_feature1",
                  "component": () => import('../src/pages/example/aliasing/v1/feature1.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1/feature2",
                  "id": "_example_aliasing_v1_feature2",
                  "component": () => import('../src/pages/example/aliasing/v1/feature2.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1/feature3",
                  "id": "_example_aliasing_v1_feature3",
                  "component": () => import('../src/pages/example/aliasing/v1/feature3.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1/index",
                  "id": "_example_aliasing_v1_index",
                  "component": () => import('../src/pages/example/aliasing/v1/index.svelte').then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/aliasing/v1"
            },
            {
              "isFile": false,
              "isDir": true,
              "ext": "",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": true,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1.1/_fallback",
                  "id": "_example_aliasing_v1_1__fallback",
                  "component": () => import('../src/pages/example/aliasing/v1.1/_fallback.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1.1",
                  "id": "_example_aliasing_v1_1__layout",
                  "component": () => import('../src/pages/example/aliasing/v1.1/_layout.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1.1/feature2",
                  "id": "_example_aliasing_v1_1_feature2",
                  "component": () => import('../src/pages/example/aliasing/v1.1/feature2.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1.1/index",
                  "id": "_example_aliasing_v1_1_index",
                  "component": () => import('../src/pages/example/aliasing/v1.1/index.svelte').then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/aliasing/v1.1"
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/aliasing"
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": true,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/api",
              "id": "_example_api__layout",
              "component": () => import('../src/pages/example/api/_layout.svelte').then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/api/:showId",
              "id": "_example_api__showId",
              "component": () => import('../src/pages/example/api/[showId].svelte').then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/api/index",
              "id": "_example_api_index",
              "component": () => import('../src/pages/example/api/index.svelte').then(m => m.default)
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/api"
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": true,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/app/_fallback",
              "id": "_example_app__fallback",
              "component": () => import('../src/pages/example/app/_fallback.svelte').then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": true,
              "isReset": true,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/app",
              "id": "_example_app__reset",
              "component": () => import('../src/pages/example/app/_reset.svelte').then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/app/index",
              "id": "_example_app_index",
              "component": () => import('../src/pages/example/app/index.svelte').then(m => m.default)
            },
            {
              "isFile": false,
              "isDir": true,
              "ext": "",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": true,
                  "isReset": true,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/app/login",
                  "id": "_example_app_login__reset",
                  "component": () => import('../src/pages/example/app/login/_reset.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/app/login/index",
                  "id": "_example_app_login_index",
                  "component": () => import('../src/pages/example/app/login/index.svelte').then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/app/login"
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/app"
        },
        {
          "isFile": true,
          "isDir": false,
          "ext": "svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/index",
          "id": "_example_index",
          "component": () => import('../src/pages/example/index.svelte').then(m => m.default)
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": true,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/layouts",
              "id": "_example_layouts__layout",
              "component": () => import('../src/pages/example/layouts/_layout.svelte').then(m => m.default)
            },
            {
              "isFile": false,
              "isDir": true,
              "ext": "",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/layouts/child",
                  "id": "_example_layouts_child__layout",
                  "component": () => import('../src/pages/example/layouts/child/_layout.svelte').then(m => m.default)
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "ext": "",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "ext": "svelte",
                      "isLayout": true,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/layouts/child/grandchild",
                      "id": "_example_layouts_child_grandchild__layout",
                      "component": () => import('../src/pages/example/layouts/child/grandchild/_layout.svelte').then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "ext": "svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/layouts/child/grandchild/index",
                      "id": "_example_layouts_child_grandchild_index",
                      "component": () => import('../src/pages/example/layouts/child/grandchild/index.svelte').then(m => m.default)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/layouts/child/grandchild"
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/layouts/child/index",
                  "id": "_example_layouts_child_index",
                  "component": () => import('../src/pages/example/layouts/child/index.svelte').then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/layouts/child"
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/layouts/index",
              "id": "_example_layouts_index",
              "component": () => import('../src/pages/example/layouts/index.svelte').then(m => m.default)
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/layouts"
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": true,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/modal",
              "id": "_example_modal__layout",
              "component": () => import('../src/pages/example/modal/_layout.svelte').then(m => m.default)
            },
            {
              "isFile": false,
              "isDir": true,
              "ext": "",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/animated",
                  "id": "_example_modal_animated__layout",
                  "component": () => import('../src/pages/example/modal/animated/_layout.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/animated/:key",
                  "id": "_example_modal_animated__key",
                  "component": () => import('../src/pages/example/modal/animated/[key].svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/animated/index",
                  "id": "_example_modal_animated_index",
                  "component": () => import('../src/pages/example/modal/animated/index.svelte').then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/modal/animated"
            },
            {
              "isFile": false,
              "isDir": true,
              "ext": "",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/basic",
                  "id": "_example_modal_basic__layout",
                  "component": () => import('../src/pages/example/modal/basic/_layout.svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/basic/:key",
                  "id": "_example_modal_basic__key",
                  "component": () => import('../src/pages/example/modal/basic/[key].svelte').then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/basic/index",
                  "id": "_example_modal_basic_index",
                  "component": () => import('../src/pages/example/modal/basic/index.svelte').then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/modal/basic"
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/modal/index",
              "id": "_example_modal_index",
              "component": () => import('../src/pages/example/modal/index.svelte').then(m => m.default)
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/modal"
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": true,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/reset/_fallback",
              "id": "_example_reset__fallback",
              "component": () => import('../src/pages/example/reset/_fallback.svelte').then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": true,
              "isReset": true,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/reset",
              "id": "_example_reset__reset",
              "component": () => import('../src/pages/example/reset/_reset.svelte').then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/reset/index",
              "id": "_example_reset_index",
              "component": () => import('../src/pages/example/reset/index.svelte').then(m => m.default)
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/reset"
        },
        {
          "isFile": true,
          "isDir": false,
          "ext": "svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/Splash",
          "id": "_example_Splash",
          "component": () => import('../src/pages/example/Splash.svelte').then(m => m.default)
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": false,
              "isDir": true,
              "ext": "",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": true,
                  "isReset": true,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true,
                    "$$bundleId": "_example_transitions_tabs.js"
                  },
                  "path": "/example/transitions/tabs",
                  "id": "_example_transitions_tabs__reset",
                  "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs__reset)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {
                    "index": 0
                  },
                  "meta": {
                    "index": 0,
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true,
                    "$$bundleId": "_example_transitions_tabs.js"
                  },
                  "path": "/example/transitions/tabs/home",
                  "id": "_example_transitions_tabs_home",
                  "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs_home)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true,
                    "$$bundleId": "_example_transitions_tabs.js"
                  },
                  "path": "/example/transitions/tabs/index",
                  "id": "_example_transitions_tabs_index",
                  "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs_index)
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "ext": "",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "ext": "svelte",
                      "isLayout": true,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/feed",
                      "id": "_example_transitions_tabs_feed__layout",
                      "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs_feed__layout)
                    },
                    {
                      "isFile": false,
                      "isDir": true,
                      "ext": "",
                      "children": [
                        {
                          "isFile": true,
                          "isDir": false,
                          "ext": "svelte",
                          "isLayout": false,
                          "isReset": false,
                          "isIndex": true,
                          "isFallback": false,
                          "isPage": true,
                          "ownMeta": {},
                          "meta": {
                            "preload": false,
                            "prerender": true,
                            "precache-order": false,
                            "precache-proximity": true,
                            "recursive": true,
                            "$$bundleId": "_example_transitions_tabs.js"
                          },
                          "path": "/example/transitions/tabs/feed/:id/index",
                          "id": "_example_transitions_tabs_feed__id_index",
                          "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs_feed__id_index)
                        }
                      ],
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/feed/:id"
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "ext": "svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/feed/index",
                      "id": "_example_transitions_tabs_feed_index",
                      "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs_feed_index)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {
                    "index": 1
                  },
                  "meta": {
                    "index": 1,
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true,
                    "$$bundleId": "_example_transitions_tabs.js"
                  },
                  "path": "/example/transitions/tabs/feed"
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {
                    "index": 2
                  },
                  "meta": {
                    "index": 2,
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true,
                    "$$bundleId": "_example_transitions_tabs.js"
                  },
                  "path": "/example/transitions/tabs/updates",
                  "id": "_example_transitions_tabs_updates",
                  "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs_updates)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "ext": "svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {
                    "index": 3
                  },
                  "meta": {
                    "index": 3,
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true,
                    "$$bundleId": "_example_transitions_tabs.js"
                  },
                  "path": "/example/transitions/tabs/settings",
                  "id": "_example_transitions_tabs_settings",
                  "component": () => import('./_example_transitions_tabs.js').then(m => m._example_transitions_tabs_settings)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {
                "bundle": true
              },
              "meta": {
                "bundle": true,
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true,
                "$$bundleId": "_example_transitions_tabs.js"
              },
              "path": "/example/transitions/tabs"
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/transitions"
        },
        {
          "isFile": false,
          "isDir": true,
          "ext": "",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "ext": "svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": true,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/widget/_fallback",
              "id": "_example_widget__fallback",
              "component": () => import('../src/pages/example/widget/_fallback.svelte').then(m => m.default)
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example/widget"
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "isPage": false,
      "ownMeta": {},
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/example"
    },
    {
      "isFile": true,
      "isDir": false,
      "ext": "svelte",
      "isLayout": false,
      "isReset": false,
      "isIndex": true,
      "isFallback": false,
      "isPage": true,
      "ownMeta": {},
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/index",
      "id": "_index",
      "component": () => import('../src/pages/index.svelte').then(m => m.default)
    }
  ],
  "isLayout": false,
  "isReset": false,
  "isIndex": false,
  "isFallback": false,
  "meta": {
    "preload": false,
    "prerender": true,
    "precache-order": false,
    "precache-proximity": true,
    "recursive": true
  },
  "path": "/"
}


export const {tree, routes} = buildClientTree(_tree)

