<template>
  <div>
    <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:8px;">
      <div style="font-weight:800; font-size:20px;">Extend Mode (Multiply ↔ Divide)</div>
      <div class="row">
        <label class="pill">Max table
          <select v-model.number="maxTable" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <button class="btn" @click="start">Start</button>
      </div>
    </div>

    <div v-if="started" class="card pop">
      <div class="muted">Fill the missing piece:</div>
      <div style="font-size:22px; font-weight:900; margin:8px 0;">{{ prompt.left }} = {{ prompt.right }}</div>
      <div class="row">
        <input type="number" v-model.number="ans" @keydown.enter="submit" />
        <button class="btn" @click="submit">Check</button>
      </div>
      <div v-if="flash==='right'" class="pill" style="margin-top:8px; background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.5); color:var(--good)">Correct!</div>
      <div v-else-if="flash==='wrong'" class="pill shake" style="margin-top:8px; background:rgba(239,68,68,.12); border-color: rgba(239,68,68,.5); color:var(--bad)">Not quite ({{prompt.solution}})</div>
    </div>

    <div v-else class="muted">Build fluency by linking multiplication and division facts.</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { makeExtend } from '@/utils/multiplication';

const maxTable = ref(12);
const started = ref(false);
const prompt = ref(makeExtend(maxTable.value));
const ans = ref<number | null>(null);
const flash = ref<'right'|'wrong'|null>(null);

function start(){ started.value=true; next(); }
function next(){ prompt.value = makeExtend(maxTable.value); ans.value=null; flash.value=null; }
function submit(){
  const ok = ans.value === prompt.value.solution;
  flash.value = ok ? 'right' : 'wrong';
  setTimeout(next, 700);
}
</script>
