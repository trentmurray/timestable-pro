<template>
  <div class="card pop" :class="{pulse}" @click="emit('try-demo')">
    <h3 style="margin:6px 0">{{ title }}</h3>
    <p class="muted" style="margin:0 0 6px">{{ body }}</p>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{ title:string; body:string; pulse?:boolean }>();
const emit = defineEmits<{ 'try-demo': [] }>();
</script>
