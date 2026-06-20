import { getRecentGames, getPopularGames } from '../services/game-service.js';
import { setMetaTags } from '../utils/seo.js';
import { navigateTo } from '../utils/router.js';

const ROWS_PER_PAGE = 5;
const COLS_DESKTOP = 3;

export async function homePage(container) {
  container.innerHTML = `
    <div class="container py-4">
      <section class="text-center mb-5">
        <h1 class="display-5 fw-bold text-primary mb-3">예산으로 뽑는 밸런스 게임</h1>
        <p class="lead text-muted mb-4">가로축 예산, 세로축 선택지. 직접 게임을 만들고 친구들과 함께 뽑아보세요!</p>
        <a href="/create" class="btn btn-primary btn-lg px-5 shadow-sm" data-link>게임 만들기</a>
      </section>

      <ul class="nav nav-tabs mb-4" id="home-tabs">
        <li class="nav-item">
          <a class="nav-link active" data-tab="popular" href="#">🔥 인기</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-tab="recent" href="#">🆕 최신</a>
        </li>
      </ul>

      <div id="games-grid" class="row g-3 row-cols-1 row-cols-md-2 row-cols-lg-${COLS_DESKTOP}">
        <div class="col-12 text-center py-5" id="loading-games">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      </div>

      <div id="pagination-container" class="d-flex justify-content-center mt-4"></div>
    </div>
  `;

  setMetaTags({
    description: '예산으로 최고의 조합을 뽑는 밸런스 게임! 직접 만들고 공유하세요.',
  });

  let allGames = [];
  let currentTab = 'popular';
  let currentPage = 0;

  try {
    const [popularGames, recentGames] = await Promise.all([
      getPopularGames(),
      getRecentGames(),
    ]);
    allGames = { popular: popularGames, recent: recentGames };
  } catch (err) {
    allGames = { popular: [], recent: [] };
  }

  function renderPage() {
    const games = allGames[currentTab] || [];
    const totalPages = Math.max(1, Math.ceil(games.length / (ROWS_PER_PAGE * COLS_DESKTOP)));
    const start = currentPage * ROWS_PER_PAGE * COLS_DESKTOP;
    const pageGames = games.slice(start, start + ROWS_PER_PAGE * COLS_DESKTOP);

    const grid = document.getElementById('games-grid');
    document.getElementById('loading-games')?.remove();

    if (pageGames.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5">아직 게임이 없어요. 첫 번째 게임을 만들어보세요!</div>';
    } else {
      grid.innerHTML = pageGames.map((game) => renderGameTableCard(game)).join('');
    }

    grid.querySelectorAll('.game-table-card').forEach((card) => {
      card.addEventListener('click', () => {
        navigateTo(`/game/${card.dataset.gameId}`);
      });
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const container = document.getElementById('pagination-container');
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '<nav><ul class="pagination pagination-sm">';

    html += `<li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a></li>`;

    for (let i = 0; i < totalPages; i++) {
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`;
    }

    html += `<li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a></li>`;

    html += '</ul></nav>';
    container.innerHTML = html;

    container.querySelectorAll('[data-page]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = parseInt(link.dataset.page);
        renderPage();
        window.scrollTo({ top: 400, behavior: 'smooth' });
      });
    });
  }

  function renderGameTableCard(game) {
    const x = Math.min(game.xCount || 4, 4);
    const y = Math.min(game.yCount || 3, 3);

    let miniTable = '<table class="table table-sm table-borderless mb-0 small" style="font-size:0.65rem">';
    for (let row = 0; row < y; row++) {
      miniTable += '<tr>';
      for (let col = 0; col < x; col++) {
        const cell = game.cells?.find((c) => c.row === row && c.col === col);
        miniTable += `<td class="text-center p-1 border rounded ${cell?.name ? 'bg-light' : ''}" style="min-width:28px">${cell?.name?.[0] || '·'}</td>`;
      }
      miniTable += '</tr>';
    }
    miniTable += '</table>';

    return `
      <div class="col">
        <div class="card game-table-card h-100 border-0 shadow-sm" data-game-id="${game.id}" style="cursor:pointer">
          <div class="card-img-wrapper" style="height:120px;overflow:hidden;background:#f0f0f0;">
            <img src="${game.thumbnailUrl || '/placeholder-game.svg'}" class="w-100 h-100" style="object-fit:cover;" alt="${game.title || ''}" loading="lazy" onerror="this.src='/placeholder-game.svg'">
          </div>
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title fw-bold text-truncate mb-0" style="max-width:70%">${game.title || '제목 없음'}</h6>
              <span class="badge bg-primary">${game.budgetValue || 0}${game.budgetUnit || ''}</span>
            </div>
            <div class="mb-2">${miniTable}</div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-secondary bg-opacity-25 text-dark small">${game.topic || '기타'}</span>
              <div class="d-flex gap-2 small text-muted">
                <span>👁 ${game.viewCount || 0}</span>
                <span>❤ ${game.likeCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  document.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-tab]').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      currentPage = 0;
      renderPage();
    });
  });

  renderPage();
  return () => {};
}
