<template>
  <div
  class="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modalTxt"
  v-show="isTxt && companyData.name"
  @click="handleIsTxtClick"
>
  <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">

    <div>
      <p class="text-pretty text-gray-700">
        {{ props.companyData?.name }}
        {{ props.companyData?.description }}
      </p>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { watchEffect } from "vue"
import { resetHoverPause } from '@/utils/capsule.js';

const props = defineProps({
  isTxt: Boolean,
  companyData: Object
})

// console.log("]]]]]]", props.data);

watchEffect(() => {
  if (props.companyData) {
    console.log("Company data:", props.companyData.name, props.isTxt);
  }
})


const emit = defineEmits(['update:isTxt'])
const handleIsTxtClick = () => {
    emit('update:isTxt', !props.isTxt)
    resetHoverPause(performance.now())
};
</script>

<style lang="" scoped></style>
