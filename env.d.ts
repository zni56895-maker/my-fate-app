/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'lunar-javascript' {
  export const Solar: any
  export const Lunar: any
  export const EightChar: any
  export const Yun: any
}
