<template>

  <div class="page">
    <div
      class="table-btn"
      @click="isTable = !isTable"
    >详情列表
    </div>
    <div class="container" ref="container">
      <canvas ref="canvas"
            class="orbit"
            :width="width"
            :height="height" />
    </div>
    
    <TableModal v-model:isTable="isTable"></TableModal>
    <TxtModal v-model:isTxt="isTxt" :companyData="companyData"></TxtModal>
  </div>
</template>

<script setup>
import TableModal from './components/TableModal.vue';
import TxtModal from './components/TxtModal.vue';
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import logoSrc from '@/assets/vue.svg';
import { draw as capsuleDraw , initInteraction, selected} from '@/utils/capsule.js';
import dataBase from "@/assets/data.js"

const isTable = ref(false);
const isTxt = ref(false);
const companyData = ref(null);

// const selectedRef = ref(selected)


watchEffect(()=>{
  if(selected.value.side){
    if(selected.value.side === 'left'){
      companyData.value = dataBase['data'][0]['subsidiariesList'][selected.value.layer][selected.value.index]
    }
    if(selected.value.side === 'right'){
      companyData.value = dataBase['data'][1]['subsidiariesList'][selected.value.layer][selected.value.index]
    }
    isTxt.value = true

  }


})

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
.page{
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.table-btn{
  background: red;
  margin-top: 10px;
  padding: 8px 18px;
  cursor: pointer;
}
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