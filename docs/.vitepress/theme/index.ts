import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import 'mundane-ui/css/plain.css'
import './style.css'

import DemoWindow from './components/DemoWindow.vue'
import FrontendDemo from './components/FrontendDemo.vue'
import BackendDemo from './components/BackendDemo.vue'
import ColumnTypesDemo from './components/ColumnTypesDemo.vue'
import StylingDemo from './components/StylingDemo.vue'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoWindow', DemoWindow)
    app.component('FrontendDemo', FrontendDemo)
    app.component('BackendDemo', BackendDemo)
    app.component('ColumnTypesDemo', ColumnTypesDemo)
    app.component('StylingDemo', StylingDemo)
  },
}

export default theme
