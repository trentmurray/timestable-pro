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
      <div class="muted">Find the missing value:</div>
      <div style="display:grid; grid-template-columns: 1fr auto 1fr; gap:10px; align-items:center; margin:8px 0;">
        <div style="font-size:22px; font-weight:900; text-align:right;">{{ prompt.left }}</div>
        <div class="pill" style="font-weight:900;">⇆</div>
        <div style="font-size:22px; font-weight:900;">{{ prompt.right }}</div>
      </div>
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));">
        <button
          v-for="c in choices"
          :key="c"
          class="btn secondary"
          @click="submitChoice(c)"
          style="width:100%; aspect-ratio:1/1; padding:0; display:flex; align-items:center; justify-content:center; font-size:clamp(18px, 3.4vw, 26px);"
        >{{ c }}</button>
      </div>
      <div v-if="flash==='right'" class="pill" style="margin-top:8px; background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.5); color:var(--good)">Correct!</div>
      <div v-else-if="flash==='wrong'" class="pill shake" style="margin-top:8px; background:rgba(239,68,68,.12); border-color: rgba(239,68,68,.5); color:var(--bad)">Not quite (? = {{prompt.solution}})</div>
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
const choices = ref<number[]>([]);
const flash = ref<'right'|'wrong'|null>(null);

function start(){ started.value=true; next(); }
function next(){ prompt.value = makeExtend(maxTable.value); flash.value=null; buildChoices(); }
function buildChoices(){
  const correct = prompt.value.solution;
  const a = prompt.value.a; const b = prompt.value.b;
  const pool = new Set<number>([correct]);
  for(let k=1;k<=maxTable.value && pool.size<6;k++){ pool.add(a*k); pool.add(b*k); }
  let delta=1; while(pool.size<6 && delta<50){
    const up = correct + delta; const down = Math.max(1, correct - delta);
    if(up % a===0 || up % b===0) pool.add(up);
    if(pool.size<6 && (down % a===0 || down % b===0)) pool.add(down);
    delta++;
  }
  let arr = Array.from(pool);
  if(arr.length>6){ const d = arr.filter(v=>v!==correct); while(d.length>5) d.splice(Math.random()*d.length|0,1); arr=[correct,...d]; }
  const seen = new Set(arr);
  while(arr.length<6){
    const candidate = (Math.random()<0.5?a:b) * ((Math.random()*maxTable.value|0)+1);
    if(candidate!==correct && !seen.has(candidate)){ arr.push(candidate); seen.add(candidate); }
  }
  choices.value = arr.sort(()=>Math.random()-0.5);
}
function submitChoice(val:number){
  const ok = val === prompt.value.solution;
  flash.value = ok ? 'right' : 'wrong';
  setTimeout(next, 700);
}
</script>
