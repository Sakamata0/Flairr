
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-L7APEKXK.js",
      "chunk-WN2EWLBB.js",
      "chunk-6I5IAJCO.js",
      "chunk-AAHQF4QH.js",
      "chunk-HQVADYAF.js",
      "chunk-4KW24FL7.js",
      "chunk-VGSRVN2B.js",
      "chunk-PTTF3TEP.js"
    ],
    "route": "/profile"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-L7APEKXK.js",
      "chunk-WN2EWLBB.js",
      "chunk-6I5IAJCO.js",
      "chunk-AAHQF4QH.js",
      "chunk-HQVADYAF.js",
      "chunk-4KW24FL7.js",
      "chunk-VGSRVN2B.js",
      "chunk-PTTF3TEP.js"
    ],
    "route": "/profile/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-N5CKWRQR.js",
      "chunk-2F2F547D.js",
      "chunk-VGSRVN2B.js",
      "chunk-PTTF3TEP.js"
    ],
    "route": "/friends"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-2AMHNI53.js",
      "chunk-HQVADYAF.js",
      "chunk-4KW24FL7.js"
    ],
    "route": "/spaces"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-YIEXE7NK.js",
      "chunk-6I5IAJCO.js",
      "chunk-AAHQF4QH.js",
      "chunk-HQVADYAF.js",
      "chunk-4KW24FL7.js",
      "chunk-VGSRVN2B.js",
      "chunk-PTTF3TEP.js"
    ],
    "route": "/spaces/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-SNBLLXON.js",
      "chunk-2F2F547D.js",
      "chunk-PTTF3TEP.js"
    ],
    "route": "/explore"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-72JD5YSO.js",
      "chunk-VGSRVN2B.js",
      "chunk-PTTF3TEP.js"
    ],
    "route": "/messages"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-F46YNIRO.js"
    ],
    "route": "/notifications"
  },
  {
    "renderMode": 0,
    "route": "/flurr/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-KF4Z3MQ2.js",
      "chunk-4KW24FL7.js"
    ],
    "route": "/signin"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-6GJ6G3VW.js"
    ],
    "route": "/signup"
  },
  {
    "renderMode": 0,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 20577, hash: 'ccd193373ef28510390b901e1d54db98c193ca8575d79c93644ba3cd30130a07', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 20243, hash: 'b16537b079fe9e70bc196ae639fc89b12bc19a2552be3feafee6a87962f42a3b', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-5KS7G7WR.css': {size: 16177, hash: '+FukWPkL7xQ', text: () => import('./assets-chunks/styles-5KS7G7WR_css.mjs').then(m => m.default)}
  },
};
