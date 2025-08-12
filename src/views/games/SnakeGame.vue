<template>
  <div>
    <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="font-weight:800; font-size:20px;">Games: Snake Math</div>
      <div class="row">
        <label class="pill">Max table
          <select v-model.number="maxTable" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <button class="btn" @click="start">Play</button>
      </div>
    </div>

    <div class="card pop" style="display:flex; gap:20px; align-items:flex-start;">
      <canvas ref="canvas" width="520" height="520" style="border-radius:16px; border:1px solid rgba(255,255,255,.1); background:#0b0f20"></canvas>
      <div class="grow">
        <div class="pill">Question: <strong>{{ question.text }}</strong></div>
        <div style="margin-top:8px;" class="muted">Eat the correct answer. Hitting walls, yourself, or wrong food ends the game.</div>
        <div class="row" style="margin-top:10px;">
          <div class="pill">Score: {{ score }}</div>
          <div class="pill">Best: {{ best }}</div>
          <div class="pill">Speed: {{ speedMs }}ms</div>
        </div>
        <div class="muted" style="margin-top:10px">Controls: <span class="kbd">W</span>/<span class="kbd">↑</span> <span class="kbd">A</span>/<span class="kbd">←</span> <span class="kbd">S</span>/<span class="kbd">↓</span> <span class="kbd">D</span>/<span class="kbd">→</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { makeQuestion, randInt } from '@/utils/multiplication';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const best = computed(()=> user.activeProfile?.progress.snakeHighScore ?? 0);

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const grid = 20;
const maxCells = 520 / grid;

const snake = ref<{ x:number; y:number; cells:{x:number;y:number}[]; max:number }>({ x:10, y:10, cells:[], max:3 });
const dir = ref<{x:number;y:number}>({x:1,y:0});
const speedMs = ref(140);
let loop: number | null = null;

const question = ref(makeQuestion());
const foods = ref<{x:number;y:number; value:number; correct:boolean}[]>([]);
const score = ref(0);
const maxTable = ref(12);

function placeFood(){
  foods.value = [];
  const correctVal = question.value.answer;
  const wrong1 = correctVal + randInt(1,5);
  const wrong2 = Math.max(1, correctVal - randInt(1,5));
  const vals = [correctVal, wrong1, wrong2].sort(()=>Math.random()-0.5);
  for(const v of vals){
    foods.value.push({ x: randInt(0, maxCells-1), y: randInt(0, maxCells-1), value: v, correct: v===correctVal });
  }
}

function start(){
  score.value=0; speedMs.value=160; snake.value={x:10,y:10,cells:[],max:3}; dir.value={x:1,y:0};
  question.value = makeQuestion(maxTable.value);
  placeFood();
  if(loop) cancelAnimationFrame(loop);
  last = 0; accumulator = 0;
  gameOver=false;
  loop = requestAnimationFrame(frame);
}

let last = 0; let accumulator = 0; let gameOver=false;
function frame(ts:number){
  if(!ctx.value) return;
  if(gameOver) return;
  if(!last) last = ts;
  const delta = ts - last; last = ts; accumulator += delta;
  if(accumulator >= speedMs.value){
    update();
    accumulator = 0;
  }
  draw();
  loop = requestAnimationFrame(frame);
}

function update(){
  snake.value.x += dir.value.x;
  snake.value.y += dir.value.y;

  if(snake.value.x < 0 || snake.value.x >= maxCells || snake.value.y < 0 || snake.value.y >= maxCells){
    return end();
  }

  snake.value.cells.unshift({x: snake.value.x, y: snake.value.y});
  if(snake.value.cells.length > snake.value.max){ snake.value.cells.pop(); }

  for(let i=1;i<snake.value.cells.length;i++){
    const c = snake.value.cells[i];
    if(c.x===snake.value.x && c.y===snake.value.y) return end();
  }

  for(const f of foods.value){
    if(f.x===snake.value.x && f.y===snake.value.y){
      if(f.correct){
        snake.value.max++;
        score.value += 5;
        speedMs.value = Math.max(80, speedMs.value - 2);
        question.value = makeQuestion(maxTable.value);
        placeFood();
      } else {
        return end();
      }
    }
  }
}

function draw(){
  const c = ctx.value!; c.clearRect(0,0,520,520);
  c.fillStyle = 'rgba(125,211,252,0.05)';
  for(let x=0;x<maxCells;x++) for(let y=0;y<maxCells;y++) c.fillRect(x*grid+8, y*grid+8, 2, 2);

  for(const f of foods.value){
    c.fillStyle = f.correct ? '#22c55e' : '#ef4444';
    roundRect(c, f.x*grid+2, f.y*grid+2, grid-4, grid-4, 6, true, false);
    c.fillStyle = '#0b0e1a';
    c.font = 'bold 12px system-ui';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(String(f.value), f.x*grid+grid/2, f.y*grid+grid/2);
  }

  c.fillStyle = '#7dd3fc';
  snake.value.cells.forEach((cell, i)=>{
    const size = grid - 4;
    const x = cell.x*grid+2, y = cell.y*grid+2;
    roundRect(c, x, y, size, size, 6, true, false);
    if(i===0){
      c.fillStyle = '#0b0e1a';
      c.beginPath(); c.arc(x+6, y+6, 2, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(x+size-6, y+6, 2, 0, Math.PI*2); c.fill();
      c.fillStyle = '#7dd3fc';
    }
  });
}

function end(){
  gameOver=true;
  alert(`Game over! Score ${score.value}`);
  user.submitSnakeScore(score.value);
}

function onKey(e: KeyboardEvent){
  if(e.key==='ArrowUp' || e.key.toLowerCase()==='w') dir.value = {x:0, y:-1};
  else if(e.key==='ArrowDown' || e.key.toLowerCase()==='s') dir.value = {x:0, y:1};
  else if(e.key==='ArrowLeft' || e.key.toLowerCase()==='a') dir.value = {x:-1, y:0};
  else if(e.key==='ArrowRight' || e.key.toLowerCase()==='d') dir.value = {x:1, y:0};
}

function roundRect(ctx:CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number,fill:boolean,stroke:boolean){
  if (w < 2 * r) r = w / 2; if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

onMounted(()=>{
  if(!canvas.value) return; ctx.value = canvas.value.getContext('2d');
  window.addEventListener('keydown', onKey);
});

onBeforeUnmount(()=>{
  window.removeEventListener('keydown', onKey);
  if(loop) cancelAnimationFrame(loop);
});
</script>
