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
      <div class="row">
        <input type="number" v-model.number="ans" @keydown.enter="submit"/>
        <button class="btn" @click="submit">Submit</button>
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
const ans = ref<number | null>(null);
const flash = ref<'right'|'wrong'|null>(null);
const timeLeft = ref(12);
let timer: number | null = null;

function tick(){ timeLeft.value--; if(timeLeft.value<=0) submit(); }

function start(){
  started.value = true; score.value=0; index.value=0; nextQ();
}

function nextQ(){
  q.value = makeQuestion(maxTable.value);
  ans.value = null; flash.value=null; timeLeft.value=12;
  if(timer) clearInterval(timer);
  timer = setInterval(tick, 1000) as unknown as number;
}

function submit(){
  if(!started.value) return;
  if(timer){ clearInterval(timer); timer=null; }
  const correct = ans.value === q.value.answer;
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
</script>
