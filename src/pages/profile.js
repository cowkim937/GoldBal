import { getUserGames, getGame } from '../services/game-service.js';
import { getUserLikes } from '../services/like-service.js';
import { getCurrentUser } from '../services/auth-service.js';
import { createGameCard } from '../components/GameCard.js';
import { setMetaTags } from '../utils/seo.js';

export async function profilePage(container, params) {
  const profileUid = params.uid;
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser && currentUser.uid === profileUid;

  container.innerHTML = `
    <div class="container py-4">
      <div class="text-center py-5" id="loading-profile">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">프로필을 불러오는 중...</p>
      </div>
      <div id="profile-content" style="display:none;"></div>
    </div>
  `;

  try {
    const [myGames, likedGameIds] = await Promise.all([
      getUserGames(profileUid),
      isOwnProfile ? getUserLikes(profileUid) : Promise.resolve([]),
    ]);

    document.getElementById('loading-profile').style.display = 'none';
    const content = document.getElementById('profile-content');
    content.style.display = '';

    setMetaTags({ title: '프로필' });

    content.innerHTML = `
      <div class="card shadow-sm mb-4">
        <div class="card-body p-4 text-center">
          <div class="mb-3">
            <div class="avatar-circle mx-auto bg-primary text-white d-flex align-items-center justify-content-center"
                 style="width:80px;height:80px;border-radius:50%;font-size:32px;font-weight:bold;">
              ${isOwnProfile ? (currentUser.nickname?.[0] || '?') : '?'}
            </div>
          </div>
          <h4 class="fw-bold mb-1">${isOwnProfile ? (currentUser.nickname || '사용자') : '사용자'}</h4>
          ${isOwnProfile ? '<p class="text-muted small">내 프로필</p>' : ''}
        </div>
      </div>

      <ul class="nav nav-tabs mb-4" id="profile-tabs">
        <li class="nav-item">
          <button class="nav-link active" data-tab="my-games">내 게임 (${myGames.length})</button>
        </li>
        ${isOwnProfile ? `<li class="nav-item">
          <button class="nav-link" data-tab="liked-games">좋아요 (${likedGameIds.length})</button>
        </li>` : ''}
      </ul>

      <div id="tab-content">
        <div class="row g-3" id="my-games-list">
          ${myGames.length > 0 ? '' : '<div class="col-12 text-center text-muted py-5">아직 만든 게임이 없습니다.</div>'}
        </div>
        ${isOwnProfile ? `<div class="row g-3" id="liked-games-list" style="display:none;"></div>` : ''}
      </div>
    `;

    if (myGames.length > 0) {
      const list = document.getElementById('my-games-list');
      myGames.forEach((game) => list.appendChild(createGameCard(game)));
    }

    if (isOwnProfile && likedGameIds.length > 0) {
      const likedGames = await Promise.all(
        likedGameIds.map(async (id) => {
          return getGame(id);
        })
      );
      const likedList = document.getElementById('liked-games-list');
      likedGames.filter(Boolean).forEach((game) => likedList.appendChild(createGameCard(game)));
    }

    document.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-tab]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('my-games-list').style.display = btn.dataset.tab === 'my-games' ? '' : 'none';
        const likedList = document.getElementById('liked-games-list');
        if (likedList) likedList.style.display = btn.dataset.tab === 'liked-games' ? '' : 'none';
      });
    });
  } catch (err) {
    console.error('Failed to load profile:', err);
    container.innerHTML = `
      <div class="container py-5 text-center">
        <div class="card shadow-sm p-5">
          <h3 class="mb-3 text-danger">오류가 발생했어요</h3>
          <p class="text-muted">프로필을 불러오지 못했어요.</p>
          <a href="/" class="btn btn-primary" data-link>홈으로</a>
        </div>
      </div>
    `;
  }

  return () => {};
}
