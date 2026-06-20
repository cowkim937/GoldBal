import { searchGames } from '../services/game-service.js';
import { createGameCard } from '../components/GameCard.js';
import { setMetaTags } from '../utils/seo.js';
import { CATEGORIES, SORT_OPTIONS, SORT_LABELS } from '../utils/constants.js';

export async function searchPage(container) {
  container.innerHTML = `
    <div class="container py-4">
      <h2 class="fw-bold mb-4">🔍 게임 탐색</h2>

      <div class="card shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="row g-3">
            <div class="col-md-5">
              <input type="text" class="form-control" id="search-input" placeholder="게임 검색..." autocomplete="off">
            </div>
            <div class="col-md-4">
              <select class="form-select" id="category-filter">
                <option value="all">전체 카테고리</option>
                ${CATEGORIES.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" id="sort-filter">
                <option value="latest">${SORT_LABELS[SORT_OPTIONS.LATEST]}</option>
                <option value="popular">${SORT_LABELS[SORT_OPTIONS.POPULAR]}</option>
                <option value="views">${SORT_LABELS[SORT_OPTIONS.VIEWS]}</option>
                <option value="likes">${SORT_LABELS[SORT_OPTIONS.LIKES]}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div id="search-results">
        <div class="row g-3" id="games-grid"></div>
        <div class="text-center py-4" id="search-loading" style="display:none;">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div class="text-center py-4 text-muted" id="search-empty" style="display:none;">
          검색 결과가 없습니다.
        </div>
      </div>
    </div>
  `;

  setMetaTags({ title: '게임 탐색', description: '다양한 밸런스 게임을 탐색해보세요!' });

  let debounceTimer;

  const performSearch = async () => {
    const term = document.getElementById('search-input').value.trim();
    const category = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-filter').value;

    document.getElementById('search-loading').style.display = '';
    document.getElementById('search-empty').style.display = 'none';
    document.getElementById('games-grid').innerHTML = '';

    try {
      const results = await searchGames(term, category, sortBy);

      document.getElementById('search-loading').style.display = 'none';

      if (results.length > 0) {
        const grid = document.getElementById('games-grid');
        const publicGames = results.filter((g) => !g.isPrivate);
        if (publicGames.length > 0) {
          publicGames.forEach((game) => grid.appendChild(createGameCard(game)));
        } else {
          document.getElementById('search-empty').style.display = '';
        }
      } else {
        document.getElementById('search-empty').style.display = '';
      }
    } catch (err) {
      console.error('Search failed:', err);
      document.getElementById('search-loading').style.display = 'none';
      document.getElementById('games-grid').innerHTML =
        '<div class="col-12 text-center text-danger py-5">검색 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.</div>';
    }
  };

  document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 300);
  });

  document.getElementById('category-filter').addEventListener('change', performSearch);
  document.getElementById('sort-filter').addEventListener('change', performSearch);

  performSearch();

  return () => {};
}
