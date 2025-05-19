<template>
  <div class="container">
    <canvas ref="canvas"
            class="orbit"
            :width="width"
            :height="height" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import logoSrc from '@/assets/vue.svg';
import { draw as capsuleDraw } from '@/utils/capsule.js';   // ① 引入工具函数

/* 画布尺寸（决定胶囊宽高） */
const width  = ref(680);
const height = ref(400);

/* DOM 引用 & 动画句柄 */
const canvas = ref(null);
let rafId = 0;

onMounted(() => {
  const ctx = canvas.value.getContext('2d');
  const img = new Image();
  img.src = logoSrc;

  /* 开始循环绘制 */
  function loop(time) {
    capsuleDraw(ctx, img, width.value, height.value, time); // ② 调用工具
    rafId = requestAnimationFrame(loop);
  }

  img.onload = () => { rafId = requestAnimationFrame(loop); };
});

onBeforeUnmount(() => cancelAnimationFrame(rafId));
</script>

<style scoped>
.container {
  width: 680px;
  height: 400px;
  margin: 10vh auto;
  border-radius: 45%;
  position: relative;
}
.orbit {
  position: absolute;
  inset: 0;
}
</style>