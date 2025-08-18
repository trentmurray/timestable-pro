<template>
  <div>
    <header class="row" style="align-items:center; justify-content:space-between; margin-bottom:12px;">
      <h2 style="font-weight:800; font-size:20px; margin:0;">Learn Mode</h2>
      <div class="flex gap-12">
        <label class="pill">Max table: 
          <select v-model.number="maxTable" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;" aria-label="Select maximum table number">
            <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <label class="pill">Speed:
          <select v-model.number="slowMs" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;" aria-label="Select animation speed">
            <option :value="800">Normal</option>
            <option :value="1200">2× slower</option>
            <option :value="1600">3× slower</option>
          </select>
        </label>
      </div>
    </header>

    <div class="grid">
      <MethodCard v-for="m in methods" :key="m.id" :title="m.title" :body="m.body" :pulse="demo?.id===m.id" @try-demo="runDemo(m.id)">
        <div v-if="demo && demo.id===m.id" class="inner-card" style="background:rgba(125,211,252,.1); border-color:rgba(125,211,252,.4);">
          <div v-for="(s,i) in demo.steps" :key="i" :class="['pop', {'muted': i<demo.index}]" style="margin:6px 0">{{ s }}</div>
          <div class="muted" style="font-size:12px;">(Click another card to explore more)</div>
        </div>
      </MethodCard>
    </div>

    <section class="inner-card pop" style="margin-top:16px;">
      <h3>Practice a Table</h3>
      <div class="row">
        <label class="pill">Table
          <select v-model.number="table" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;" aria-label="Select table to practice">
            <option v-for="n in maxTable" :key="n" :value="n">{{n}}</option>
          </select>
        </label>
        <button class="btn" @click="startPractice" aria-label="Start practicing the selected table">Start</button>
        <div class="pill" role="status" aria-live="polite">Mastery: {{ mastery }}%</div>
      </div>

      <div v-if="practicing" class="pop" style="margin-top:10px;" role="region" aria-label="Practice question">
        <h4 style="font-weight:800; margin:0 0 8px 0;">What is {{ table }} × {{ curIndex }} ?</h4>
        <div class="row" style="align-items:center; margin-top:8px;">
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); width:100%;" role="group" aria-label="Answer choices">
            <button
              v-for="c in choices"
              :key="c"
              class="btn secondary"
              @click="submitChoice(c)"
              :aria-label="`Answer ${c}`"
              style="width:100%; aspect-ratio:1/1; padding:0; display:flex; align-items:center; justify-content:center; font-size:clamp(18px, 4vw, 28px);"
            >{{ c }}</button>
          </div>
        </div>
        <div v-if="feedback==='right'" class="pill" style="margin-top:8px; background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.5); color:var(--good)" role="status" aria-live="polite">Correct!</div>
        <div v-else-if="feedback==='wrong'" class="pill shake" style="margin-top:8px; background:rgba(239,68,68,.12); border-color: rgba(239,68,68,.5); color:var(--bad)" role="status" aria-live="polite">Oops, try again</div>
      </div>
    </section>

    <!-- Table Complete Overlay -->
    <div v-if="showComplete" class="results-overlay pop">
      <div class="results-card">
        <div style="font-size:28px; margin-bottom:8px;">🎉 Table Complete!</div>
        <div class="muted" style="margin-bottom:16px;">Great work practicing the {{ table }}× table!</div>
        <button class="btn" @click="showComplete = false">Continue</button>
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
const feedback = ref<'right'|'wrong'|null>(null);
const choices = ref<number[]>([]);
const showComplete = ref(false);

const mastery = computed(()=> user.activeProfile?.progress.tableMastery[`${table.value}x`] ?? 0);

function startPractice(){ practicing.value = true; curIndex.value = 1; feedback.value=null; buildChoices(); }

function buildChoices(){
  const correct = table.value * curIndex.value;
  const pool = new Set<number>([correct]);
  // plausible distractors: multiples of `table` within a typical range
  for(let k=1;k<=12 && pool.size<4;k++) pool.add(table.value * k);
  // If still short, add nearby numbers divisible by table
  let delta = 1;
  while(pool.size<4 && delta<20){
    const up = correct + delta;
    const down = Math.max(1, correct - delta);
    if(up % table.value === 0) pool.add(up);
    if(pool.size<4 && down % table.value === 0) pool.add(down);
    delta++;
  }
  let arr = Array.from(pool);
  // ensure exactly 4 (keep the correct answer)
  if(arr.length>4){
    const filtered = arr.filter(v=>v!==correct);
    while(1 + filtered.length > 4){ filtered.splice(Math.floor(Math.random()*filtered.length),1); }
    arr = [correct, ...filtered];
  }
  while(arr.length<4){ arr.push(table.value * (Math.floor(Math.random()*12)+1)); }
  // shuffle
  choices.value = arr.sort(()=>Math.random()-0.5);
}

function submitChoice(val:number){
  const correct = (table.value * curIndex.value) === val;
  feedback.value = correct ? 'right' : 'wrong';
  if(correct){
    curIndex.value++;
    user.updateMastery(table.value, 4);
    if(curIndex.value>12){ practicing.value=false; showComplete.value=true; }
    else buildChoices();
  }
}
</script>
