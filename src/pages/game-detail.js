import { getGame, incrementViewCount, incrementPlayCount, deleteGame } from '../services/game-service.js';
import { toggleLike, checkLike } from '../services/like-service.js';
import { savePlayResult } from '../services/play-service.js';
import { getCurrentUser } from '../services/auth-service.js';
import { setMetaTags } from '../utils/seo.js';
import { navigateTo } from '../utils/router.js';

let selectedCells = {};
let currentGame = null;
let totalSpent = 0;

export async function gameDetailPage(container, params) {
  const gameId = params.id;
  if (!gameId) return navigateTo('/');

  container.innerHTML = `
    <div class="container py-4">
      <div class="text-center py-5" id="loading-game">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">게임을 불러오는 중...</p>
      </div>
      <div id="game-content" style="display:none;"></div>
    </div>
  `;

  try {
    currentGame = await getGame(gameId);
    if (!currentGame) {
      container.innerHTML = `<div class="container py-5 text-center"><div class="card shadow-sm p-5"><h3 class="mb-3">게임을 찾을 수 없어요</h3><p class="text-muted mb-4">존재하지 않거나 삭제된 게임이에요.</p><a href="/" class="btn btn-primary" data-link>홈으로</a></div></div>`;
      return () => {};
    }

    incrementViewCount(gameId);
    selectedCells = {};
    totalSpent = 0;
    renderGame(container, currentGame);
  } catch (err) {
    console.error('Failed to load game:', err);
    container.innerHTML = `<div class="container py-5 text-center"><div class="card shadow-sm p-5"><h3 class="mb-3 text-danger">오류가 발생했어요</h3><p class="text-muted">게임을 불러오지 못했어요.</p><a href="/" class="btn btn-primary" data-link>홈으로</a></div></div>`;
  }

  return () => { currentGame = null; selectedCells = {}; totalSpent = 0; };
}

function renderGame(container, game) {
  const contentEl = document.getElementById('game-content');
  document.getElementById('loading-game').style.display = 'none';
  contentEl.style.display = '';

  const hasPrices = game.priceRow && game.priceRow.some(p => p > 0);
  const budgetDisplay = `${game.budgetValue}${game.budgetUnit}`;

  setMetaTags({
    title: game.title,
    description: game.description || `${budgetDisplay}로 최고의 조합을 뽑아보세요!`,
    image: game.thumbnailUrl || '/og-image.png',
    url: window.location.href,
  });

  contentEl.innerHTML = `
    <div class="row">
      <div class="col-lg-8">
        <div class="card shadow-sm mb-4">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 class="fw-bold mb-1">${game.title || '제목 없음'}</h2>
                <p class="text-muted mb-0">${game.description || ''}</p>
              </div>
              <div class="d-flex gap-2 align-items-start">
                ${isGameOwner(game) ? `
                  <a href="/game/${game.id}/edit" class="btn btn-outline-secondary btn-sm" data-link>✏️ 수정</a>
                  <button class="btn btn-outline-danger btn-sm" id="btn-delete-game">🗑 삭제</button>
                ` : ''}
                <button class="btn btn-outline-danger btn-sm like-btn" id="btn-like">
                  ❤ <span id="like-count">${game.likeCount || 0}</span>
                </button>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-4">
              <span class="badge bg-primary fs-6">${budgetDisplay}</span>
              <span class="badge bg-secondary fs-6">${game.topic || '기타'}</span>
              ${game.randomMode ? '<span class="badge bg-warning text-dark fs-6">🎲 랜덤</span>' : ''}
              ${hasPrices ? '<span class="badge bg-info fs-6">💰 가격제</span>' : ''}
            </div>

            <div class="game-table" id="game-table">
              ${renderGameTable(game)}
            </div>

            <div class="text-center mt-4" id="result-area">
              <p class="text-muted" id="selection-counter">각 행에서 하나씩 선택해주세요 (0/${game.yCount})</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">💰 예산</h5>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">총 예산</span>
              <span class="fw-bold">${budgetDisplay}</span>
            </div>
            ${hasPrices ? `
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">사용 금액</span>
              <span class="fw-bold text-danger" id="spent-amount">0${game.budgetUnit}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">남은 예산</span>
              <span class="fw-bold text-success" id="remaining-amount">${budgetDisplay}</span>
            </div>
            <div class="progress mt-2" style="height:8px">
              <div class="progress-bar bg-success" id="budget-bar" style="width:0%"></div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="card shadow-sm mb-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">📊 통계</h5>
            <div class="d-flex justify-content-between mb-2"><span class="text-muted">조회수</span><span class="fw-bold">${game.viewCount || 0}</span></div>
            <div class="d-flex justify-content-between mb-2"><span class="text-muted">플레이</span><span class="fw-bold">${game.playCount || 0}</span></div>
            <div class="d-flex justify-content-between"><span class="text-muted">좋아요</span><span class="fw-bold">${game.likeCount || 0}</span></div>
          </div>
        </div>

        <div class="card shadow-sm mb-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">✅ 선택한 항목</h5>
            <div id="selected-summary">
              <p class="text-muted small mb-0">항목을 선택하면 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setupGameEvents(game);
}

function renderGameTable(game) {
  const isRandom = game.randomMode;
  let html = '';

  for (let y = 0; y < game.yCount; y++) {
    const yLabel = game.yLabels?.[y] || `항목 ${y + 1}`;
    html += `<div class="mb-4"><h6 class="fw-bold mb-2">${yLabel}</h6><div class="row g-2">`;

    for (let x = 0; x < game.xCount; x++) {
      const cell = game.cells?.find((c) => c.row === y && c.col === x);
      if (!cell) continue;

      const xLabel = game.xLabels?.[x] || `단계 ${x + 1}`;
      const isSelected = selectedCells[y] === x;
      const price = game.priceRow?.[x] || 0;
      const priceText = price > 0 ? `${price.toLocaleString()}${game.budgetUnit || ''}` : '';

      html += `
        <div class="col-md-3 col-6">
          <div class="card game-cell ${isSelected ? 'border-primary bg-light' : ''}" 
               data-row="${y}" data-col="${x}" data-price="${price}"
               style="cursor:pointer;${isSelected ? 'border-width:2px;' : ''}">
            <div class="card-body p-2 text-center">
              <div class="cell-image mb-1" style="height:70px;overflow:hidden;border-radius:8px;background:#f0f0f4;">
                ${isRandom 
                  ? `<div class="d-flex align-items-center justify-content-center h-100"><span class="text-muted fw-bold" style="font-size:28px">???</span></div>`
                  : (cell.images?.[0] ? `<img src="${cell.images[0]}" class="w-100 h-100" style="object-fit:cover;" alt="">` : `<div class="d-flex align-items-center justify-content-center h-100"><span class="text-muted small">이미지 없음</span></div>`)
                }
              </div>
              <div class="fw-bold small">${xLabel}</div>
              ${isRandom
                ? `<div class="small text-muted">???</div>`
                : `<div class="small text-muted">${cell.name || ''}</div>`
              }
              ${priceText ? `<div class="small text-primary fw-bold">${priceText}</div>` : ''}
            </div>
          </div>
        </div>`;
    }

    html += '</div></div>';
  }

  return html;
}

function isGameOwner(game) {
  const user = getCurrentUser();
  if (!user) return false;
  return user.uid === game.createdBy || user.role === 'admin';
}

function setupGameEvents(game) {
  document.querySelectorAll('.game-cell').forEach((card) => {
    card.addEventListener('click', () => {
      const row = parseInt(card.dataset.row);
      const col = parseInt(card.dataset.col);
      const prevCol = selectedCells[row];
      const prevPrice = prevCol !== undefined ? (game.priceRow?.[prevCol] || 0) : 0;
      const newPrice = game.priceRow?.[col] || 0;

      if (prevCol !== undefined) {
        totalSpent -= prevPrice;
      }
      totalSpent += newPrice;
      selectedCells[row] = col;

      document.querySelectorAll(`.game-cell[data-row="${row}"]`).forEach((c) => {
        c.classList.remove('border-primary', 'bg-light');
      });
      card.classList.add('border-primary', 'bg-light');

      updateBudgetDisplay(game);
      updateSelectedSummary(game);
      checkAllSelected(game);
    });
  });

  const likeBtn = document.getElementById('btn-like');
  if (likeBtn) {
    loadLikeStatus(game.id);
    likeBtn.addEventListener('click', () => handleLike(game.id));
  }

  const deleteBtn = document.getElementById('btn-delete-game');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => handleDeleteGame(game));
  }
}

function updateBudgetDisplay(game) {
  const spentEl = document.getElementById('spent-amount');
  const remainingEl = document.getElementById('remaining-amount');
  const barEl = document.getElementById('budget-bar');
  if (!spentEl || !remainingEl) return;

  const budget = game.budgetValue || 0;
  const remaining = Math.max(0, budget - totalSpent);
  const unit = game.budgetUnit || '';

  spentEl.textContent = `${totalSpent.toLocaleString()}${unit}`;
  remainingEl.textContent = `${remaining.toLocaleString()}${unit}`;

  if (totalSpent > budget) {
    spentEl.className = 'fw-bold text-danger';
    remainingEl.className = 'fw-bold text-danger';
    barEl.style.width = '100%';
    barEl.className = 'progress-bar bg-danger';
  } else {
    spentEl.className = 'fw-bold text-danger';
    remainingEl.className = 'fw-bold text-success';
    barEl.style.width = budget > 0 ? `${Math.min(100, (totalSpent / budget) * 100)}%` : '0%';
    barEl.className = totalSpent >= budget ? 'progress-bar bg-warning' : 'progress-bar bg-success';
  }
}

function updateSelectedSummary(game) {
  const summary = document.getElementById('selected-summary');
  const selectedRows = Object.keys(selectedCells);

  if (selectedRows.length === 0) {
    summary.innerHTML = '<p class="text-muted small mb-0">항목을 선택하면 여기에 표시됩니다.</p>';
    return;
  }

  let html = '<ul class="list-unstyled mb-0">';
  for (const row of selectedRows) {
    const col = selectedCells[row];
    const yLabel = game.yLabels?.[row] || `항목 ${parseInt(row) + 1}`;
    const cell = game.cells?.find((c) => c.row === parseInt(row) && c.col === col);
    const xLabel = game.xLabels?.[col] || `단계 ${parseInt(col) + 1}`;
    const price = game.priceRow?.[col] || 0;

    if (game.randomMode) {
      html += `<li class="mb-1 small"><strong>${yLabel}</strong>: <span class="text-primary">???</span>${price ? ` <span class="text-muted">-${price.toLocaleString()}${game.budgetUnit || ''}</span>` : ''}</li>`;
    } else {
      html += `<li class="mb-1 small"><strong>${yLabel}</strong>: ${cell?.name || xLabel}${price ? ` <span class="text-muted">-${price.toLocaleString()}${game.budgetUnit || ''}</span>` : ''}</li>`;
    }
  }
  html += '</ul>';
  summary.innerHTML = html;
}

function checkAllSelected(game) {
  const allSelected = Object.keys(selectedCells).length === game.yCount;
  const resultArea = document.getElementById('result-area');

  if (allSelected) {
    resultArea.innerHTML = `<button class="btn btn-success btn-lg px-5" id="btn-show-result">결과 보기</button>`;
    document.getElementById('btn-show-result')?.addEventListener('click', () => handleShowResult(game));
  } else {
    resultArea.innerHTML = `<p class="text-muted" id="selection-counter">각 행에서 하나씩 선택해주세요 (${Object.keys(selectedCells).length}/${game.yCount})</p>`;
  }
}

async function handleShowResult(game) {
  const budget = game.budgetValue || 0;
  const remaining = budget - totalSpent;

  if (totalSpent > budget) {
    showBudgetExceededModal(game);
    return;
  }

  if (remaining > 0 && !game.allowRemainingBudget) {
    showBudgetRemainingModal(game, remaining);
    return;
  }

  const user = getCurrentUser();
  const result = { selections: [] };

  for (let y = 0; y < game.yCount; y++) {
    const col = selectedCells[y];
    if (col === undefined) continue;

    const cell = game.cells?.find((c) => c.row === y && c.col === col);
    let selectedName, selectedDesc, selectedImage;

    if (game.randomMode && cell?.sets?.length) {
      const randomSet = cell.sets[Math.floor(Math.random() * cell.sets.length)];
      selectedName = randomSet.name || '';
      selectedDesc = randomSet.description || '';
      selectedImage = randomSet.image || null;
    } else {
      selectedName = cell?.name || '';
      selectedDesc = cell?.description || '';
      selectedImage = game.randomMode && cell?.images?.length
        ? cell.images[Math.floor(Math.random() * cell.images.length)]
        : (cell?.images?.[0] || null);
    }

    result.selections.push({
      row: y, col,
      yLabel: game.yLabels?.[y] || `항목 ${y + 1}`,
      xLabel: game.xLabels?.[col] || `단계 ${col + 1}`,
      name: selectedName,
      description: selectedDesc,
      image: selectedImage,
      price: game.priceRow?.[col] || 0,
    });
  }

  try {
    await incrementPlayCount(game.id);
    await savePlayResult(game.id, user?.uid || 'anonymous', result.selections);
  } catch (err) {
    console.error('Failed to save play result:', err);
  }

  showResultModal(game, result.selections);
}

function showBudgetExceededModal(game) {
  const budget = game.budgetValue || 0;
  const over = totalSpent - budget;
  showSimpleModal({
    title: '⚠️ 예산 초과',
    body: `<p class="text-center mb-0">예산이 <strong class="text-danger">${over.toLocaleString()}${game.budgetUnit || ''}</strong> 초과되었어요.</p><p class="text-center small text-muted mt-2">선택을 다시 조정해주세요.</p>`,
    type: 'danger',
  });
}

function showBudgetRemainingModal(game, remaining) {
  showSimpleModal({
    title: '⚠️ 예산 남음',
    body: `<p class="text-center mb-0">예산이 <strong class="text-warning">${remaining.toLocaleString()}${game.budgetUnit || ''}</strong> 남았어요.</p><p class="text-center small text-muted mt-2">이 게임은 예산을 전부 사용해야 해요.</p>`,
    type: 'warning',
  });
}

function showSimpleModal({ title, body, type }) {
  const id = 'budget-modal-' + Date.now();
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="modal fade" id="${id}" tabindex="-1">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 bg-${type} bg-opacity-10">
            <h6 class="modal-title fw-bold">${title}</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center py-4">${body}</div>
          <div class="modal-footer border-0 justify-content-center">
            <button class="btn btn-${type} btn-sm px-4" data-bs-dismiss="modal">확인</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  const modal = new bootstrap.Modal(document.getElementById(id));
  modal.show();
  document.getElementById(id).addEventListener('hidden.bs.modal', () => container.remove());
}

function showResultModal(game, selections) {
  const existing = document.getElementById('result-modal-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'result-modal-container';

  const shareText = selections
    .map((s) => `${s.yLabel}: ${s.name || s.xLabel}`)
    .join('\n');

  container.innerHTML = `
    <div class="modal fade" id="result-modal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">🎉 내 결과</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <h4 class="text-center fw-bold mb-4">${game.title}</h4>
            <div class="row g-3 mb-4">
              ${selections.map((s) => `
                <div class="col-md-6">
                  <div class="card h-100 border-primary">
                    <div class="card-body text-center p-3">
                      ${s.image ? `<div class="mb-2" style="height:100px;overflow:hidden;border-radius:8px;background:#f5f5f5;"><img src="${s.image}" style="width:100%;height:100%;object-fit:cover;" alt="${s.name}"></div>` : ''}
                      <div class="badge bg-primary mb-1">${s.yLabel}</div>
                      <div class="fw-bold">${s.name || s.xLabel}</div>
                      <div class="small text-muted">${s.description || ''}</div>
                      ${s.price ? `<div class="small text-primary fw-bold mt-1">${s.price.toLocaleString()}${game.budgetUnit || ''}</div>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="bg-light rounded p-3 mb-3">
              <div class="small text-muted mb-2">결과 공유하기</div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm flex-fill" id="btn-copy-result">📋 복사하기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const modal = new bootstrap.Modal(document.getElementById('result-modal'));
  modal.show();

  document.getElementById('btn-copy-result').addEventListener('click', async () => {
    try {
      const text = `${game.title}\n\n${shareText}\n\n${window.location.href}`;
      await navigator.clipboard.writeText(text);
      alert('결과가 클립보드에 복사되었어요!');
    } catch {
      alert('복사에 실패했어요.');
    }
  });

  document.getElementById('result-modal').addEventListener('hidden.bs.modal', () => {
    container.remove();
  });
}

async function loadLikeStatus(gameId) {
  const user = getCurrentUser();
  if (!user) return;
  try {
    const liked = await checkLike(gameId, user.uid);
    const btn = document.getElementById('btn-like');
    if (liked && btn) {
      btn.classList.add('btn-danger');
      btn.classList.remove('btn-outline-danger');
    }
  } catch (err) {
    console.error('Failed to check like status:', err);
  }
}

async function handleLike(gameId) {
  const user = getCurrentUser();
  if (!user) {
    const modal = document.getElementById('login-modal');
    if (modal) new bootstrap.Modal(modal).show();
    return;
  }
  try {
    const isLiked = await toggleLike(gameId, user.uid);
    const btn = document.getElementById('btn-like');
    const countEl = document.getElementById('like-count');
    if (isLiked) {
      btn.classList.add('btn-danger');
      btn.classList.remove('btn-outline-danger');
      countEl.textContent = parseInt(countEl.textContent) + 1;
    } else {
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-outline-danger');
      countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
    }
  } catch (err) {
    console.error('Failed to toggle like:', err);
  }
}

async function handleDeleteGame(game) {
  if (!confirm('정말 이 게임을 삭제할까요? 되돌릴 수 없어요.')) return;

  try {
    await deleteGame(game.id);
    navigateTo('/');
  } catch (err) {
    console.error('Failed to delete game:', err);
    alert('삭제에 실패했어요.');
  }
}
