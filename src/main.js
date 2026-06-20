import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

import './style.css';

import { initFirebase } from './firebase/config.js';
import { registerRoute, navigateTo } from './utils/router.js';
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderLoginModal } from './components/LoginModal.js';
import { renderCreditShopModal } from './components/CreditShopModal.js';
import { initAuth, onUserChange } from './services/auth-service.js';
import { updateAuthUI } from './components/Header.js';
import { homePage } from './pages/home.js';
import { createPage } from './pages/create.js';
import { gameDetailPage } from './pages/game-detail.js';
import { gameResultsPage } from './pages/game-results.js';
import { profilePage } from './pages/profile.js';
import { searchPage } from './pages/search.js';
import { staticPage } from './pages/static.js';
import { ROUTES } from './utils/constants.js';

const app = document.getElementById('app');

function renderShell() {
  app.innerHTML = '';

  const headerContainer = document.createElement('div');
  headerContainer.id = 'header-container';
  app.appendChild(headerContainer);

  const mainContainer = document.createElement('div');
  mainContainer.id = 'main-container';
  app.appendChild(mainContainer);

  const footerContainer = document.createElement('div');
  footerContainer.id = 'footer-container';
  app.appendChild(footerContainer);

  const modalContainer = document.createElement('div');
  modalContainer.id = 'modal-container';
  app.appendChild(modalContainer);
}

async function initApp() {
  await initFirebase();

  renderShell();

  renderHeader(document.getElementById('header-container'));
  renderFooter(document.getElementById('footer-container'));
  renderLoginModal(document.getElementById('modal-container'));
  renderCreditShopModal(document.getElementById('modal-container'));

  registerRoute(ROUTES.HOME, homePage);
  registerRoute(ROUTES.CREATE, createPage);
  registerRoute('/game/:id/edit', createPage);
  registerRoute('/game/:id/results', gameResultsPage);
  registerRoute('/game/:id', gameDetailPage);
  registerRoute('/profile/:uid', profilePage);
  registerRoute(ROUTES.SEARCH, searchPage);
  registerRoute('/:page', staticPage);

  onUserChange(() => {
    updateAuthUI();
  });

  try {
    initAuth();
  } catch (err) {
    console.warn('Firebase Auth 초기화 실패:', err.message);
  }

  navigateTo(window.location.pathname || '/');
}

initApp();
