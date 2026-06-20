import { getCurrentUser, handleLogout } from '../services/auth-service.js';
import { navigateTo } from '../utils/router.js';
import { ROUTES } from '../utils/constants.js';

export function renderHeader(container) {
  const header = document.createElement('header');
  header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold text-primary" href="/" data-link>
          황밸게임
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarMain">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" href="/" data-link>홈</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/search" data-link>탐색</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/create" data-link>만들기</a>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-2" id="auth-section">
            <span class="d-flex align-items-center gap-1 rounded-pill px-3" id="credit-badge"
                  style="display:none; background:#dcedc8; height:38px; cursor:pointer; font-size:0.875rem; font-weight:500;">
              💰 <span id="credit-amount">0</span>
            </span>
            <div class="dropdown" id="user-menu" style="display:none;">
              <button class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                <span id="user-name">사용자</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" id="menu-profile">내 프로필</a></li>
                <li><a class="dropdown-item" href="#" id="menu-my-games">내 게임</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="menu-logout">로그아웃</a></li>
              </ul>
            </div>
            <div id="login-buttons">
              <button class="btn btn-primary btn-sm" id="btn-login">로그인</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;

  container.prepend(header);
  setupHeaderEvents();
  updateAuthUI();
}

function setupHeaderEvents() {
  document.getElementById('btn-login')?.addEventListener('click', () => {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      const modal = new bootstrap.Modal(loginModal);
      modal.show();
    }
  });

  document.getElementById('credit-badge')?.addEventListener('click', () => {
    const shopModal = document.getElementById('credit-shop-modal');
    if (shopModal) {
      const modal = new bootstrap.Modal(shopModal);
      modal.show();
    }
  });

  document.getElementById('menu-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleLogout();
    navigateTo('/');
  });

  document.getElementById('menu-profile')?.addEventListener('click', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (user) navigateTo(`/profile/${user.uid}`);
  });

  document.getElementById('menu-my-games')?.addEventListener('click', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (user) navigateTo(`/profile/${user.uid}`);
  });

  document.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('href');
      navigateTo(path);
    });
  });
}

export function updateAuthUI() {
  const user = getCurrentUser();
  const userMenu = document.getElementById('user-menu');
  const loginButtons = document.getElementById('login-buttons');
  const userName = document.getElementById('user-name');
  const creditBadge = document.getElementById('credit-badge');
  const creditAmount = document.getElementById('credit-amount');

  if (user) {
    userMenu.style.display = '';
    loginButtons.style.display = 'none';
    if (userName) userName.textContent = user.nickname || '사용자';
    if (creditBadge) creditBadge.style.display = '';
    if (creditAmount) creditAmount.textContent = user.credits || 0;
  } else {
    userMenu.style.display = 'none';
    loginButtons.style.display = '';
    if (creditBadge) creditBadge.style.display = 'none';
  }
}
