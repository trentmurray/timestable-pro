<template>
  <div class="grid">
    <div class="card pop">
      <h2>Create Profile</h2>
      <form @submit.prevent="create">
        <div class="row">
          <input class="input" type="text" v-model="name" placeholder="Name" />
          <input class="input" v-model.number="age" type="number" placeholder="Age (optional)" />
          <button class="btn">Add</button>
        </div>
      </form>
    </div>

    <div class="card pop" v-for="p in user.profiles" :key="p.id">
      <div class="flex" style="justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:800">{{ p.name }}</div>
          <div class="muted">Highscores: Quiz {{p.progress.quizHighScore}} • Game {{p.progress.snakeHighScore}}</div>
        </div>
        <div class="flex gap-12">
          <button class="btn secondary" @click="select(p.id)">Use</button>
          <button class="btn" style="background:linear-gradient(90deg, var(--bad), #c2410c); color:white" @click="remove(p.id)">Delete</button>
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
const age = ref<number | undefined>();

function create(){
  if(!name.value.trim()) return;
  user.addProfile(name.value.trim(), age.value);
  name.value=''; age.value=undefined;
  router.push('/learn');
}

function select(id:string){ user.setActiveProfile(id); router.push('/learn'); }
function remove(id:string){ if(confirm('Delete profile?')) user.removeProfile(id); }
</script>
