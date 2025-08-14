<template>
  <div class="grid">
    <div class="card pop">
      <h2 style="margin:0 0 10px;">Create Profile</h2>
      <form @submit.prevent="create">
        <div class="row" style="align-items:flex-end; gap:10px;">
          <div style="flex:1 1 240px;">
            <label class="muted" style="font-size:12px; display:block; margin:0 0 6px;">Name</label>
            <input class="input" type="text" v-model="name" placeholder="e.g. Alex" />
          </div>
          <div>
            <button class="btn" type="submit">Add</button>
          </div>
        </div>
      </form>
    </div>

    <div class="card pop" v-for="p in user.profiles" :key="p.id">
      <div class="flex" style="flex-direction:column; gap:10px; min-height:140px;">
        <div>
          <div style="font-weight:900; font-size:18px;">{{ p.name }}</div>
          <div class="muted" style="margin-top:4px; font-size:13px;">
            Highscores: Quiz {{p.progress.quizHighScore}} • Snake {{p.progress.snakeHighScore}}
            <span v-if="p.progress.invadersHighScore !== undefined"> • Invaders {{p.progress.invadersHighScore}}</span>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:auto;">
          <button class="btn secondary" style="width:100%; padding:10px 12px;" @click="select(p.id)">Use</button>
          <button class="btn" style="width:100%; background:#fecaca; color:#7f1d1d; padding:10px 12px;" @click="remove(p.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const user = useUserStore();
const router = useRouter();

const name = ref('');

function create(){
  if(!name.value.trim()) return;
  user.addProfile(name.value.trim());
  name.value='';
  router.push('/learn');
}

function select(id:string){ user.setActiveProfile(id); router.push('/learn'); }
function remove(id:string){ if(confirm('Delete profile?')) user.removeProfile(id); }
</script>
