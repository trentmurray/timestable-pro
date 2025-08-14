<template>
  <div>
    <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="font-weight:800; font-size:20px;">Games</div>
    </div>

    <div class="grid">
      <RouterLink class="card" to="/games/snake" style="text-decoration:none; color:inherit;">
        <div style="font-weight:800; font-size:18px;">Snake Math</div>
        <div class="muted">Eat the correct answer. Avoid walls, self, and wrong food.</div>
      </RouterLink>
      <RouterLink class="card" to="/games/invaders" style="text-decoration:none; color:inherit;">
        <div style="font-weight:800; font-size:18px;">Space Invaders Math</div>
        <div class="muted">Shoot wrong answers; let the correct one slip through!</div>
      </RouterLink>
    </div>
  </div>
  
</template>

<script setup lang="ts">
</script>


