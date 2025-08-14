<template>
  <div>
    <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="font-weight:800; font-size:20px;">Quiz Mode</div>
      <div class="row">
        <label class="pill">Max table
          <select v-model.number="maxTable" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <label class="pill">Questions
          <select v-model.number="total" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="30">30</option>
          </select>
        </label>
        <button class="btn" @click="start">Start</button>
      </div>
    </div>

    <div v-if="started" class="card pop">
      <div class="flex gap-12" style="align-items:center; justify-content:space-between;">
        <div>Q {{ index+1 }} / {{ total }}</div>
        <div class="pill">Score: {{ score }}</div>
        <div class="pill" :style="{color: timeLeft<4 ? 'var(--bad)' : 'inherit'}">Time: {{ timeLeft }}s</div>
      </div>

      <div style="font-size:24px; font-weight:900; margin:12px 0;">{{ q.text }}</div>
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));">
        <button
          v-for="c in choices"
          :key="c"
          class="btn secondary"
          @click="submitChoice(c)"
          style="width:100%; aspect-ratio:1/1; padding:0; display:flex; align-items:center; justify-content:center; font-size:clamp(18px, 3.4vw, 26px);"
        >{{ c }}</button>
      </div>
      <div v-if="flash==='right'" class="pill" style="margin-top:8px; background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.5); color:var(--good)">Nice!</div>
      <div v-else-if="flash==='wrong'" class="pill shake" style="margin-top:8px; background:rgba(239,68,68,.12); border-color: rgba(239,68,68,.5); color:var(--bad)">Not quite ({{q.answer}})</div>
    </div>

    <div v-else class="muted">Press Start to begin a timed challenge.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { makeQuestion } from '@/utils/multiplication';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const maxTable = ref(12);
const total = ref(10);

const started = ref(false);
const score = ref(0);
const index = ref(0);
const q = ref(makeQuestion(maxTable.value));
const choices = ref<number[]>([]);
const flash = ref<'right'|'wrong'|null>(null);
const timeLeft = ref(12);
let timer: number | null = null;

function tick(){ timeLeft.value--; if(timeLeft.value<=0) timesUp(); }

function start(){
  started.value = true; score.value=0; index.value=0; nextQ();
}

function nextQ(){
  q.value = makeQuestion(maxTable.value);
  flash.value=null; timeLeft.value=12;
  buildChoices();
  if(timer) clearInterval(timer);
  timer = setInterval(tick, 1000) as unknown as number;
}

function submitChoice(val:number){
  if(!started.value) return;
  if(timer){ clearInterval(timer); timer=null; }
  const correct = val === q.value.answer;
  if(correct){ score.value += 10; flash.value='right'; }
  else { flash.value='wrong'; }
  index.value++;
  if(index.value>=total.value){
    started.value=false;
    alert(`Finished! Score ${score.value}`);
    user.submitQuizScore(score.value);
  } else {
    setTimeout(nextQ, 600);
  }
}

watch(maxTable, ()=>{ if(started.value) nextQ(); });

onBeforeUnmount(()=>{ if(timer) clearInterval(timer); });

function buildChoices(){
  const correct = q.value.answer;
  const a = q.value.a; const b = q.value.b;
  const pool = new Set<number>();
  pool.add(correct);
  // plausible distractors: multiples of either multiplicand up to maxTable
  for(let k=1;k<=maxTable.value && pool.size<6;k++){ pool.add(a*k); pool.add(b*k); }
  // add near multiples around the correct answer that are divisible by a or b
  let delta = 1;
  while(pool.size<6 && delta<50){
    const up = correct + delta;
    const down = Math.max(1, correct - delta);
    if(up % a === 0 || up % b === 0) pool.add(up);
    if(pool.size<6 && (down % a === 0 || down % b === 0)) pool.add(down);
    delta++;
  }
  let arr = Array.from(pool);
  // Ensure the correct answer is always present and we only trim distractors
  if(arr.length>6){
    const distractors = arr.filter(v=>v!==correct);
    while(distractors.length > 5){ distractors.splice(Math.floor(Math.random()*distractors.length),1); }
    arr = [correct, ...distractors];
  }
  // If still short, add unique plausible distractors (avoid the correct value)
  const seen = new Set(arr);
  while(arr.length<6){
    const candidate = (Math.random()<0.5 ? a : b) * (Math.floor(Math.random()*maxTable.value)+1);
    if(candidate!==correct && !seen.has(candidate)){ arr.push(candidate); seen.add(candidate); }
  }
  // Shuffle for display
  choices.value = arr.sort(()=>Math.random()-0.5);
}

function timesUp(){
  if(!started.value) return;
  if(timer){ clearInterval(timer); timer=null; }
  flash.value = 'wrong';
  index.value++;
  if(index.value>=total.value){
    started.value=false;
    alert(`Finished! Score ${score.value}`);
    user.submitQuizScore(score.value);
  } else {
    setTimeout(nextQ, 600);
  }
}
</script>
