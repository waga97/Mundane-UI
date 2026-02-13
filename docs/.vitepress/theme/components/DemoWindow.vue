<template>
  <div class="demo-window">
    <div class="demo-window__titlebar">
      <div class="demo-window__dots">
        <span class="demo-window__dot demo-window__dot--red"></span>
        <span class="demo-window__dot demo-window__dot--yellow"></span>
        <span class="demo-window__dot demo-window__dot--green"></span>
      </div>
      <div class="demo-window__tabs">
        <button
          class="demo-window__tab"
          :class="{ 'demo-window__tab--active': activeTab === 'preview' }"
          @click="activeTab = 'preview'"
        >
          Preview
        </button>
        <button
          class="demo-window__tab"
          :class="{ 'demo-window__tab--active': activeTab === 'code' }"
          @click="activeTab = 'code'"
        >
          Code
        </button>
      </div>
      <div class="demo-window__spacer"></div>
    </div>
    <div v-show="activeTab === 'preview'" class="demo-window__preview">
      <slot></slot>
    </div>
    <div v-show="activeTab === 'code'" class="demo-window__code">
      <slot name="code"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('preview')
</script>
