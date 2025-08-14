import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import LearnView from './views/LearnView.vue';
import QuizView from './views/QuizView.vue';
import ExtendView from './views/ExtendView.vue';
import GamesView from './views/games/GamesView.vue';
import SnakeGame from './views/games/SnakeGame.vue';
import InvadersGame from './views/games/InvadersGame.vue';
import ProfilesView from './views/ProfilesView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/learn' },
  { path: '/profiles', component: ProfilesView },
  { path: '/learn', component: LearnView },
  { path: '/quiz', component: QuizView },
  { path: '/extend', component: ExtendView },
  { path: '/games', component: GamesView },
  { path: '/games/snake', component: SnakeGame },
  { path: '/games/invaders', component: InvadersGame },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
