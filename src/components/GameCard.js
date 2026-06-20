import { navigateTo } from '../utils/router.js';

export function createGameCard(game) {
  const card = document.createElement('div');
  card.className = 'col';
  card.innerHTML = `
    <div class="card game-card h-100 border-0 shadow-sm" data-game-id="${game.id}">
      <div class="card-img-wrapper position-relative" style="padding-top:56.25%;overflow:hidden;background:#f0f0f0;">
        <img
          src="${game.thumbnailUrl || '/placeholder-game.svg'}"
          class="card-img-top position-absolute top-0 start-0 w-100 h-100"
          style="object-fit:cover;"
          alt="${game.title || '게임 이미지'}"
          loading="lazy"
          onerror="this.src='/placeholder-game.svg'"
        >
        <span class="position-absolute top-0 end-0 badge bg-primary m-2">
          ${game.budgetValue || 0}${game.budgetUnit || ''}
        </span>
      </div>
      <div class="card-body p-3">
        <h6 class="card-title fw-bold text-truncate mb-1">${game.title || '제목 없음'}</h6>
        <p class="card-text small text-muted text-truncate mb-2">${game.description || ''}</p>
        <div class="d-flex justify-content-between align-items-center small text-muted">
          <span>${game.topic || '기타'}</span>
          <div class="d-flex gap-2">
            <span>👁 ${game.viewCount || 0}</span>
            <span>❤ ${game.likeCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    navigateTo(`/game/${game.id}`);
  });

  return card;
}
