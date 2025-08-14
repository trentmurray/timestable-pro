import { defineStore } from 'pinia';

export type Progress = {
  tableMastery: Record<string, number>;
  quizHighScore: number;
  snakeHighScore: number;
  invadersHighScore: number;
};

export type Profile = {
  id: string;
  name: string;
  progress: Progress;
};

export type RootState = {
  profiles: Profile[];
  activeProfileId: string | null;
};

const STORAGE_KEY = 'ttt_state_v1';

function load(): RootState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function save(state: RootState){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useUserStore = defineStore('user', {
  state: (): RootState => load() ?? ({
    profiles: [],
    activeProfileId: null,
  }),
  getters: {
    activeProfile(state): Profile | null {
      return state.profiles.find(p => p.id === state.activeProfileId) ?? null;
    },
  },
  actions: {
    setActiveProfile(id: string){ this.activeProfileId = id; save(this.$state); },
    addProfile(name: string){
      const id = Math.random().toString(36).slice(2,9);
      const profile: Profile = { id, name, progress: { tableMastery: {}, quizHighScore: 0, snakeHighScore: 0, invadersHighScore: 0 } };
      this.profiles.push(profile);
      this.activeProfileId = id;
      save(this.$state);
    },
    removeProfile(id: string){
      this.profiles = this.profiles.filter(p => p.id !== id);
      if(this.activeProfileId === id) this.activeProfileId = this.profiles[0]?.id ?? null;
      save(this.$state);
    },
    updateMastery(table: number, delta: number){
      const ap = this.activeProfile; if(!ap) return;
      const key = `${table}x`;
      const current = ap.progress.tableMastery[key] ?? 0;
      ap.progress.tableMastery[key] = Math.min(100, Math.max(0, current + delta));
      save(this.$state);
    },
    submitQuizScore(score: number){
      const ap = this.activeProfile; if(!ap) return;
      ap.progress.quizHighScore = Math.max(ap.progress.quizHighScore, score);
      save(this.$state);
    },
    submitSnakeScore(score: number){
      const ap = this.activeProfile; if(!ap) return;
      ap.progress.snakeHighScore = Math.max(ap.progress.snakeHighScore, score);
      save(this.$state);
    },
    submitInvadersScore(score: number){
      const ap = this.activeProfile; if(!ap) return;
      // backward compatibility: ensure field exists
      if(typeof ap.progress.invadersHighScore !== 'number'){ ap.progress.invadersHighScore = 0; }
      ap.progress.invadersHighScore = Math.max(ap.progress.invadersHighScore, score);
      save(this.$state);
    }
  }
});
