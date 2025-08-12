<template>
  <div>
    <div class="row" style="align-items:center; justify-content:space-between; margin-bottom:12px;">
      <div style="font-weight:800; font-size:20px;">Learn Mode</div>
      <div class="flex gap-12">
        <label class="pill">Max table: 
          <select v-model.number="maxTable" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <label class="pill">Slow-mo:
          <select v-model.number="slowMs" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option :value="800">Normal</option>
            <option :value="1200">2× slower</option>
            <option :value="1600">3× slower</option>
          </select>
        </label>
      </div>
    </div>

    <div class="grid">
      <MethodCard v-for="m in methods" :key="m.id" :title="m.title" :body="m.body" :pulse="demo?.id===m.id" @try-demo="runDemo(m.id)">
        <div v-if="demo && demo.id===m.id" class="card" style="background:rgba(125,211,252,.1); border-color:rgba(125,211,252,.4);">
          <div v-for="(s,i) in demo.steps" :key="i" :class="['pop', {'muted': i<demo.index}]" style="margin:6px 0">{{ s }}</div>
          <div class="muted" style="font-size:12px;">(Click another card to explore more)</div>
        </div>
      </MethodCard>
    </div>

    <div class="card pop" style="margin-top:16px;">
      <h3>Practice a Table</h3>
      <div class="row">
        <label class="pill">Table
          <select v-model.number="table" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option v-for="n in maxTable" :key="n" :value="n">{{n}}</option>
          </select>
        </label>
        <button class="btn" @click="startPractice">Start</button>
        <div class="pill">Mastery: {{ mastery }}%</div>
      </div>

      <div v-if="practicing" class="pop" style="margin-top:10px;">
        <div style="font-weight:800">What is {{ table }} × {{ curIndex }} ?</div>
        <div class="row" style="align-items:center; margin-top:8px;">
          <input type="number" v-model.number="answer" @keydown.enter="submit" />
          <button class="btn" @click="submit">Check</button>
          <div v-if="feedback==='right'" class="pill" style="background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.5); color:var(--good)">Correct!</div>
          <div v-else-if="feedback==='wrong'" class="pill shake" style="background:rgba(239,68,68,.12); border-color: rgba(239,68,68,.5); color:var(--bad)">Oops, try again</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { METHODS } from '@/utils/multiplication';
import MethodCard from '@/components/MethodCard.vue';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const methods = METHODS;
const maxTable = ref(12);
const slowMs = ref(800);

const demo = ref<{id:string; steps:string[]; index:number} | null>(null);

function runDemo(id:string){
  const seed = Math.floor(Math.random()*10)+2;
  const steps: string[] = [];
  if(id==='commute'){
    steps.push(`${seed} × ${seed+1} is the same as ${seed+1} × ${seed}`);
    steps.push(`If ${seed}×${seed+1} is tough, flip it!`);
    steps.push(`Answer: ${(seed)*(seed+1)}`);
  } else if(id==='skip'){
    steps.push(`Skip count ${seed}s: ${Array.from({length:6},(_,i)=> (i+1)*seed).join(', ')}`);
    steps.push(`The 6th number is ${seed*6}.`);
    steps.push(`So ${seed} × 6 = ${seed*6}`);
  } else if(id==='area'){
    steps.push(`Draw ${seed} rows of 5.`);
    steps.push(`Count tiles: ${seed} + ${seed} + ${seed} + ${seed} + ${seed}`);
    steps.push(`That makes ${seed*5}.`);
  } else if(id==='double'){
    steps.push(`Halve & double: 12 × 5 = (12 × 10) ÷ 2`);
    steps.push(`12×10 = 120`);
    steps.push(`120 ÷ 2 = 60`);
  } else if(id==='nine'){
    steps.push(`Nines pattern: digits add to 9`);
    steps.push(`9 × 7 = 63 (6+3=9)`);
    steps.push(`Try another: 9 × 4 = 36 (3+6=9)`);
  } else if(id==='five'){
    steps.push(`Fives end with 0 or 5.`);
    steps.push(`7 × 5 = 7 × 10 ÷ 2`);
    steps.push(`= 70 ÷ 2 = 35`);
  } else if(id==='tens'){
    steps.push(`×10 adds a zero: 8×10=80`);
    steps.push(`×11 (1–9): double the digit`);
    steps.push(`6×11 = 66`);
  } else if(id==='break'){
    steps.push(`Break apart: 12×7 = 12×5 + 12×2`);
    steps.push(`= 60 + 24 = 84`);
  } else {
    steps.push(`Spot patterns: 4×even ends with 0,2,4,6,8`);
    steps.push(`n×1 = n; n×2 doubles`);
    steps.push(`Use patterns to estimate first!`);
  }
  demo.value = { id, steps, index: 0 };
  animateSteps();
}

function sleep(ms:number){ return new Promise(res=>setTimeout(res, ms)); }
async function animateSteps(){
  if(!demo.value) return;
  for(let i=0;i<demo.value.steps.length;i++){
    demo.value.index = i;
    await sleep(slowMs.value);
  }
}

const table = ref(2);
const practicing = ref(false);
const curIndex = ref(1);
const answer = ref<number | null>(null);
const feedback = ref<'right'|'wrong'|null>(null);

const mastery = computed(()=> user.activeProfile?.progress.tableMastery[`${table.value}x`] ?? 0);

function startPractice(){ practicing.value = true; curIndex.value = 1; feedback.value=null; answer.value=null; }
function submit(){
  if(answer.value===null) return;
  const correct = (table.value * curIndex.value) === answer.value;
  feedback.value = correct ? 'right' : 'wrong';
  if(correct){
    curIndex.value++;
    user.updateMastery(table.value, 4);
    if(curIndex.value>12){ practicing.value=false; alert('Great work! Table complete.'); }
  }
  answer.value = null;
}
</script>
