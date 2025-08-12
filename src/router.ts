import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import LearnView from './views/LearnView.vue';
import QuizView from './views/QuizView.vue';
import ExtendView from './views/ExtendView.vue';
import SnakeGame from './views/games/SnakeGame.vue';
import ProfilesView from './views/ProfilesView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/learn' },
  { path: '/profiles', component: ProfilesView },
  { path: '/learn', component: LearnView },
  { path: '/quiz', component: QuizView },
  { path: '/extend', component: ExtendView },
  { path: '/games', component: SnakeGame },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
