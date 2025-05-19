<template>
  <div class="container" ref="container">
    <canvas ref="canvas"
            class="orbit"
            :width="width"
            :height="height" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import logoSrc from '@/assets/vue.svg';
import { draw as capsuleDraw , initInteraction} from '@/utils/capsule.js';

/* 画布容器 */
const container = ref(null);
// 获取宽
// let w = container.value.clientWidth;
// // 获取高
// let h = container.value.clientHeight;
// console.log(w, h);


/* 画布尺寸（决定胶囊宽高） */
const width  = ref(0);
const height = ref(0);

/* DOM 引用 & 动画句柄 */
const canvas = ref(null);
let rafId = 0;

onMounted(() => {

  if (container.value) {
    const w = container.value.clientWidth;
    const h = container.value.clientHeight;
    console.log("-----------------",w, h);
    // 设置画布宽高
    canvas.value.width = w;
    canvas.value.height = h;
    // 设置胶囊宽高
    width.value = w;
    height.value = h;
  }

  const ctx = canvas.value.getContext('2d');
  // 初始化交互（只需调用一次）
  initInteraction(canvas.value);

  const img = new Image();
  img.src = logoSrc;
  img.crossOrigin = 'anonymous'; // 解决跨域问题

  /* 开始循环绘制 */
  function loop(time) {
    capsuleDraw(ctx, img, width.value, height.value, time); 

    rafId = requestAnimationFrame(loop);
  }

  img.onload = () => { rafId = requestAnimationFrame(loop); };

});

onBeforeUnmount(() => cancelAnimationFrame(rafId));
</script>

<style scoped>
.container {
  width: 90%;
  height: 90vh;
  margin: 5vh auto;
  position: relative;
}
.orbit {
  position: absolute;
  inset: 0;
}
</style>