<template>
  <div class="shell">
    <header class="card flex gap-12 pop" style="align-items:center; justify-content:space-between;">
      <div>
        <div class="title">Times Table Trainer</div>
        <div class="subtitle muted">Learn • Quiz • Extend • Games</div>
      </div>
      <div class="flex gap-12" style="align-items:center;">
        <div v-if="active" class="pill">👤 {{ active.name }} <span class="badge">(Highscores: Q {{active.progress.quizHighScore}} • G {{active.progress.snakeHighScore}})</span></div>
        <button class="btn secondary" @click="goProfiles">Profiles</button>
      </div>
    </header>

    <nav class="row" style="margin:14px 0 10px;">
      <RouterLink class="btn" to="/learn">Learn</RouterLink>
      <RouterLink class="btn" to="/quiz">Quiz</RouterLink>
      <RouterLink class="btn" to="/extend">Extend</RouterLink>
      <RouterLink class="btn" to="/games">Games</RouterLink>
    </nav>

    <main class="card pop" style="min-height: 60vh;">
      <RouterView />
    </main>

    <footer class="muted" style="text-align:center; padding:12px;">Made for 8–12 year olds • Progress saved locally</footer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from './stores/user';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const user = useUserStore();
const { activeProfile: active } = storeToRefs(user);
const router = useRouter();

function goProfiles(){ router.push('/profiles'); }
</script>

<style scoped>
a.btn{ text-decoration:none; display:inline-block; }
</style>
