<template>
  <div>
    <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="font-weight:800; font-size:20px;">Games: Space Invaders Math</div>
      <div class="row">
        <label class="pill">Max table
          <select v-model.number="maxTable" class="pill" style="margin-left:6px; background:transparent; color:var(--text); border:none;">
            <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <button class="btn" @click="start">Play</button>
      </div>
    </div>

    <div class="card pop" style="display:flex; flex-direction:column; gap:16px;">
      <div style="font-size:28px; font-weight:900; text-align:center;">{{ question.text }}</div>
      <div class="row" style="gap:20px; align-items:flex-start; flex-wrap:wrap; justify-content:center;">
        <div ref="canvasBox" style="flex:1 1 320px; max-width:520px; width:100%;">
          <canvas ref="canvas" width="520" height="520" style="display:block; border-radius:16px; border:1px solid rgba(0,0,0,.08); background:#0b0f20; touch-action:none;"></canvas>
        </div>
        <div class="grow" style="flex:0 0 auto; max-width:520px;">
          <div class="muted">Shoot all the wrong answers. Let the correct answer slip past the bottom!</div>
          <div class="row" style="margin-top:10px;">
            <div class="pill">Score: {{ score }}</div>
            <div class="pill">Best: {{ best }}</div>
            <div class="pill">Speed: {{ fallSpeed.toFixed(1) }}</div>
            <div class="pill">Level: {{ level }}</div>
          </div>
          <div class="muted" style="margin-top:10px">Controls: <span class="kbd">A</span>/<span class="kbd">←</span> <span class="kbd">D</span>/<span class="kbd">→</span> <span class="kbd">Space</span> to shoot</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { makeQuestion, randInt } from '@/utils/multiplication';
import { useUserStore } from '@/stores/user';

type Enemy = { x:number; y:number; w:number; h:number; value:number; correct:boolean; vy:number };
type Bullet = { x:number; y:number; vy:number };

const user = useUserStore();
const best = computed(()=> user.activeProfile?.progress.invadersHighScore ?? 0);

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasBox = ref<HTMLDivElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const question = ref(makeQuestion());
const maxTable = ref(12);
const score = ref(0);
const level = ref(1);
const fallSpeed = ref(1.2);
const wrongCount = ref(3);

const player = ref({ x: 260, y: 490, w: 56, h: 10, speed: 10 });
const keys = ref({ left: false, right: false });
const enemies = ref<Enemy[]>([]);
const bullets = ref<Bullet[]>([]);

let loop: number | null = null;
let gameOver = false;

function start(){
  score.value = 0; level.value = 1; fallSpeed.value = 1.2; wrongCount.value = 3; bullets.value = []; enemies.value = [];
  keys.value.left = false; keys.value.right = false;
  question.value = makeQuestion(maxTable.value);
  spawnWave();
  if(loop) cancelAnimationFrame(loop);
  gameOver=false; last=0; accumulator=0;
  loop = requestAnimationFrame(frame);
}

function spawnWave(){
  enemies.value = [];
  const correctVal = question.value.answer;
  const required = 1 + wrongCount.value;
  // Build a robust candidate pool so we always have enough values
  const candidates = new Set<number>();
  for(let k=1;k<=maxTable.value*2;k++){ candidates.add(question.value.a * k); candidates.add(question.value.b * k); }
  // add near multiples around correct
  for(let d=1; d<=maxTable.value*2; d++){
    const up = correctVal + d, down = Math.max(1, correctVal - d);
    if(up % question.value.a === 0 || up % question.value.b === 0) candidates.add(up);
    if(down % question.value.a === 0 || down % question.value.b === 0) candidates.add(down);
  }
  candidates.delete(correctVal);
  let pool = Array.from(candidates);
  if(pool.length < required-1){
    // fallback: fill with random table multiples
    for(let t=1; t<=maxTable.value && pool.length < (required-1)*2; t++){
      for(let k=1;k<=maxTable.value;k++){ const v = t*k; if(v!==correctVal) pool.push(v); }
    }
  }
  // pick required-1 wrongs at random
  pool = pool.sort(()=>Math.random()-0.5).slice(0, Math.max(0, required-1));
  const arr = [correctVal, ...pool].sort(()=>Math.random()-0.5);

  // Lay out evenly across the top to avoid overlap, sizing based on count
  const n = arr.length;
  const margin = 20; // side margin
  const available = 520 - margin*2;
  const slot = Math.floor(available / n);
  const w = Math.max(40, Math.min(90, slot - 12));
  const h = Math.max(22, Math.floor(w * 0.5));
  const baseY = 24 + randInt(0, 10);

  for(let i=0;i<n;i++){
    const v = arr[i];
    const correct = v===correctVal;
    const xCenter = margin + i*slot + slot/2;
    const x = Math.floor(xCenter - w/2);
    enemies.value.push({ x, y: baseY, w, h, value: v, correct, vy: fallSpeed.value + Math.random()*0.4 });
  }
}

let last = 0; let accumulator = 0; const stepMs = 16;
function frame(ts:number){
  if(!ctx.value || gameOver) return;
  if(!last) last = ts;
  let delta = ts - last; last = ts;
  // clamp large deltas (tab switches, hiccups) to avoid massive catch-up loops
  if(delta > 100) delta = 100;
  accumulator += delta;
  let steps = 0;
  while(accumulator >= stepMs && steps < 5){
    update();
    accumulator -= stepMs;
    steps++;
  }
  // drop any excess to stay responsive
  if(steps >= 5) accumulator = 0;
  draw();
  loop = requestAnimationFrame(frame);
}

function update(){
  // continuous player movement
  if(keys.value.left)  player.value.x = Math.max(8, player.value.x - player.value.speed);
  if(keys.value.right) player.value.x = Math.min(520 - player.value.w - 8, player.value.x + player.value.speed);

  // move bullets (mutate in place and compact array to reduce churn)
  for(let i=0;i<bullets.value.length;i++) bullets.value[i].y += bullets.value[i].vy;
  if(bullets.value.length>0){
    let w=0; for(let i=0;i<bullets.value.length;i++){ const b=bullets.value[i]; if(b.y>-10){ bullets.value[w++] = b; } }
    bullets.value.length = w;
  }

  // move enemies
  for(let i=0;i<enemies.value.length;i++) enemies.value[i].y += enemies.value[i].vy;

  // check bullet collisions
  outer: for(let i=bullets.value.length-1;i>=0;i--){
    const b = bullets.value[i];
    for(let j=enemies.value.length-1;j>=0;j--){
      const e = enemies.value[j];
      if(b.x >= e.x && b.x <= e.x + e.w && b.y >= e.y && b.y <= e.y + e.h){
        bullets.value.splice(i,1);
        if(e.correct){ end(); break outer; }
        else { enemies.value.splice(j,1); score.value += 2; }
        break;
      }
    }
  }

  // check bottom conditions
  for(let idx=0; idx<enemies.value.length; idx++){
    const e = enemies.value[idx];
    if(e.y + e.h >= 520){
      if(e.correct){
        // round complete
        score.value += 10;
        // progress difficulty randomly
        if(Math.random() < 0.5) wrongCount.value = Math.min(wrongCount.value + 1, 7); else fallSpeed.value = Math.min(fallSpeed.value + 0.25, 4);
        level.value++;
        question.value = makeQuestion(maxTable.value);
        enemies.value.length = 0;
        bullets.value.length = 0;
        spawnWave();
        return; // exit update after round reset to avoid iterating stale arrays
      } else {
        return end();
      }
    }
  }
}

function draw(){
  const c = ctx.value!; c.clearRect(0,0,520,520);
  // stars background
  c.fillStyle = 'rgba(255,255,255,0.08)';
  for(let i=0;i<40;i++){ c.fillRect((i*37)%520, (i*91)%520, 2, 2); }

  // player
  c.fillStyle = '#93c5fd';
  roundRect(c, player.value.x, player.value.y, player.value.w, player.value.h, 6, true, false);

  // enemies
  enemies.value.forEach(e=>{
    c.fillStyle = '#fda4af';
    roundRect(c, e.x, e.y, e.w, e.h, 8, true, false);
    c.fillStyle = '#0b0e1a';
    const fontSize = Math.max(12, Math.floor(e.h * 0.6));
    c.font = `bold ${fontSize}px system-ui`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(String(e.value), e.x + e.w/2, e.y + e.h/2);
  });

  // bullets
  c.fillStyle = '#fbbf24';
  bullets.value.forEach(b=>{ c.fillRect(b.x-2, b.y-10, 4, 10); });
}

function end(){
  if(gameOver) return;
  gameOver = true;
  if(loop){ cancelAnimationFrame(loop); loop=null; }
  try{ user.submitInvadersScore(score.value); } catch {}
  setTimeout(()=>{ alert(`Game over! Score ${score.value}`); }, 0);
}

function onKeyDown(e: KeyboardEvent){
  const k = e.key.toLowerCase();
  if((e.key.startsWith('Arrow') || k===' ') && loop && !gameOver) e.preventDefault();
  if(k==='a' || e.key==='ArrowLeft') keys.value.left = true;
  else if(k==='d' || e.key==='ArrowRight') keys.value.right = true;
  else if(k===' ') shoot();
}

function onKeyUp(e: KeyboardEvent){
  const k = e.key.toLowerCase();
  if(k==='a' || e.key==='ArrowLeft') keys.value.left = false;
  else if(k==='d' || e.key==='ArrowRight') keys.value.right = false;
}

function shoot(){ bullets.value.push({ x: player.value.x + player.value.w/2, y: player.value.y, vy: -8 }); }

function onTouchStart(e: TouchEvent){ if(!loop || gameOver) return; e.preventDefault(); const t=e.touches[0]; handleTouch(t.clientX, t.clientY); shoot(); }
function onTouchMove(e: TouchEvent){ if(!loop || gameOver) return; e.preventDefault(); const t=e.touches[0]; handleTouch(t.clientX, t.clientY); }
function onTouchEnd(e: TouchEvent){ if(!loop || gameOver) return; e.preventDefault(); }

function handleTouch(x:number, _y:number){
  const rect = canvas.value!.getBoundingClientRect();
  const cx = x - rect.left;
  player.value.x = Math.max(8, Math.min(520 - player.value.w - 8, cx - player.value.w/2));
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
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.value!.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.value!.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.value!.addEventListener('touchend', onTouchEnd, { passive: false });
});

onBeforeUnmount(()=>{
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  canvas.value?.removeEventListener('touchstart', onTouchStart as EventListener);
  canvas.value?.removeEventListener('touchmove', onTouchMove as EventListener);
  canvas.value?.removeEventListener('touchend', onTouchEnd as EventListener);
  if(loop){ cancelAnimationFrame(loop); loop=null; }
  // aggressively clear arrays to help GC
  enemies.value = [];
  bullets.value = [];
});
</script>


