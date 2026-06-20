import { getCurrentUser } from '../services/auth-service.js';
import { createGame, uploadGameThumbnail, updateGame, uploadCellImage, getGame } from '../services/game-service.js';
import { processImageFile } from '../utils/image-utils.js';
import { setMetaTags } from '../utils/seo.js';
import { navigateTo } from '../utils/router.js';
import { CATEGORIES, BUDGET_UNITS, X_COUNT, Y_COUNT, AI_IMAGE } from '../utils/constants.js';
import { generateSetImage, generateThumbnailImage } from '../services/ai-image-service.js';

let xCount = 4;
let yCount = 3;
let isRandomMode = false;
let cellData = {};
let gameId = null;
let thumbnailBlob = null;
let editMode = false;
const imageBlobs = new Map();
const existingImages = new Map(); // cellKey → [urls to keep]

export async function createPage(container, params = {}) {
  editMode = !!params?.id;
  gameId = params?.id || null;

  if (editMode && gameId) {
    try {
      const existing = await getGame(gameId);
      if (existing) {
        prefillFromGame(existing);
        renderForm(container, true);
        setupCreatePage();
        return () => {};
      }
    } catch (e) {
      console.error('게임 불러오기 실패:', e.message);
    }
    container.innerHTML = `<div class="container py-5 text-center"><div class="card shadow-sm p-5"><h3 class="mb-3">게임을 불러올 수 없어요</h3><p class="text-muted mb-4">존재하지 않거나 삭제된 게임이에요.</p><a href="/" class="btn btn-primary" data-link>홈으로</a></div></div>`;
    return () => {};
  }

  resetState();
  const user = getCurrentUser();
  if (!user) {
    container.innerHTML = `
      <div class="container py-5 text-center">
        <div class="card shadow-sm p-5">
          <h3 class="mb-3">로그인이 필요해요</h3>
          <p class="text-muted mb-4">게임을 만들려면 로그인이 필요해요.</p>
          <button class="btn btn-primary" id="btn-create-login">로그인하기</button>
        </div>
      </div>
    `;
    setMetaTags({ title: '게임 만들기', description: '예산과 선택지를 설정해 나만의 밸런스 게임을 만들어보세요!' });
    document.getElementById('btn-create-login')?.addEventListener('click', () => {
      const loginModal = document.getElementById('login-modal');
      if (loginModal) { const modal = new bootstrap.Modal(loginModal); modal.show(); }
    });
    return () => {};
  }

  renderForm(container, false);
  setupCreatePage();
  setMetaTags({ title: '게임 만들기', description: '나만의 밸런스 게임을 만들어보세요!' });
  return () => {};
}

function resetState() {
  xCount = 4;
  yCount = 3;
  isRandomMode = false;
  cellData = {};
  gameId = null;
  thumbnailBlob = null;
  editMode = false;
  imageBlobs.clear();
  existingImages.clear();
}

function prefillFromGame(game) {
  xCount = game.xCount || 4;
  yCount = game.yCount || 3;
  isRandomMode = game.randomMode || false;
  cellData = {};

  cellData['_title'] = game.title || '';
  cellData['_topic'] = game.topic || '';
  cellData['_description'] = game.description || '';
  cellData['_budgetValue'] = game.budgetValue || 1;
  cellData['_budgetUnit'] = game.budgetUnit || '만원';
  cellData['_allowRemaining'] = game.allowRemainingBudget !== false;
  cellData['_thumbnailUrl'] = game.thumbnailUrl || '';

  for (let i = 0; i < xCount; i++) {
    cellData[`label_x_${i}`] = game.xLabels?.[i] || '';
    cellData[`price_x_${i}`] = game.priceRow?.[i] || 0;
  }
  for (let i = 0; i < yCount; i++) {
    cellData[`label_y_${i}`] = game.yLabels?.[i] || '';
  }

  for (const cell of (game.cells || [])) {
    const key = `cell_${cell.row}_${cell.col}`;
    if (isRandomMode && cell.sets) {
      cellData[key] = {
        name: '',
        description: '',
        images: [],
        sets: cell.sets.map((s, i) => ({
          image: s.image || '',
          name: s.name || '',
          description: s.description || '',
        })),
      };
    } else {
      cellData[key] = {
        name: cell.name || '',
        description: cell.description || '',
        images: (cell.images || []).map((url, i) => {
          existingImages.set(key + '_' + i, url);
          return url;
        }),
        sets: [],
      };
    }
  }
}

function renderForm(container, isEdit) {
  const headingText = isEdit ? '✏️ 게임 수정' : '🎮 새 게임 만들기';
  const buttonText = isEdit ? '수정 완료' : '게임 올리기';

  container.innerHTML = `
    <div class="container py-4">
      <h2 class="fw-bold mb-4">${headingText}</h2>

      <form id="game-form" novalidate>
        <div class="row g-4">
          <div class="col-md-8">
            <div class="card shadow-sm mb-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">기본 정보</h5>
                <div class="mb-3">
                  <label class="form-label fw-medium">제목 <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="game-title" placeholder="예: 1만원으로 포켓몬 만들기" required maxlength="50" value="${cellData['_title'] || ''}">
                </div>
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-medium">주제</label>
                    <select class="form-select" id="game-topic">
                      <option value="">주제를 선택하세요</option>
                      ${CATEGORIES.map((cat) => `<option value="${cat}" ${cellData['_topic'] === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">설명</label>
                    <textarea class="form-control" id="game-description" rows="2" placeholder="게임에 대한 설명을 입력하세요" maxlength="200">${cellData['_description'] || ''}</textarea>
                  </div>
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">예산 설정</h5>
                <div class="row g-3 align-items-end">
                  <div class="col-md-4">
                    <label class="form-label fw-medium">예산 숫자 <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="budget-value" value="${cellData['_budgetValue'] || 1}" min="1" max="999999">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">단위</label>
                    <select class="form-select" id="budget-unit">
                      ${BUDGET_UNITS.map((unit) => `<option value="${unit}" ${(cellData['_budgetUnit'] || '만원') === unit ? 'selected' : ''}>${unit}</option>`).join('')}
                    </select>
                  </div>
                  <div class="col-md-4">
                    <div class="form-check mb-2">
                      <input class="form-check-input" type="checkbox" id="random-mode" ${isRandomMode ? 'checked' : ''}>
                      <label class="form-check-label fw-medium" for="random-mode">랜덤 모드</label>
                      <div class="small text-muted">셀당 여러 이미지 중 랜덤 선택</div>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="allow-remaining" ${cellData['_allowRemaining'] !== false ? 'checked' : ''}>
                      <label class="form-check-label fw-medium" for="allow-remaining">예산 남기기 가능</label>
                      <div class="small text-muted">체크 해제 시 예산을 전부 소진해야 함</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">테이블 크기</h5>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-medium">X축 (가격 단계) <span class="text-danger">*</span></label>
                    <input type="range" class="form-range" id="x-count" min="${X_COUNT.MIN}" max="${X_COUNT.MAX}" value="${xCount}">
                    <div class="d-flex justify-content-between small text-muted">
                      <span>${X_COUNT.MIN}개</span>
                      <span id="x-count-label">${xCount}개</span>
                      <span>${X_COUNT.MAX}개</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Y축 (선택 카테고리) <span class="text-danger">*</span></label>
                    <input type="range" class="form-range" id="y-count" min="${Y_COUNT.MIN}" max="${Y_COUNT.MAX}" value="${yCount}">
                    <div class="d-flex justify-content-between small text-muted">
                      <span>${Y_COUNT.MIN}개</span>
                      <span id="y-count-label">${yCount}개</span>
                      <span>${Y_COUNT.MAX}개</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">테이블 편집</h5>
                <div class="mb-3">
                  <div class="row g-2 mb-3" id="x-labels"></div>
                  <div class="row g-2 mb-3" id="y-labels"></div>
                </div>
                <div class="table-responsive" id="table-builder"></div>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">썸네일</h5>
                <div class="mb-3">
                  <div class="d-flex gap-2 align-items-end">
                    <div class="flex-grow-1">
                      <input type="file" class="form-control" id="thumbnail-input" accept="image/*">
                      <div class="small text-muted mt-1">권장: 1200x630px, 최대 2MB, WEBP 변환</div>
                    </div>
                    <button type="button" class="btn btn-outline-success btn-sm flex-shrink-0" id="btn-ai-thumbnail">
                      🤖 AI 생성
                    </button>
                  </div>
                  <div class="small text-muted mt-1" id="thumbnail-ai-cost">AI 생성 시 ${AI_IMAGE.THUMBNAIL.CREDITS} 크레딧 소모 (1024×1024 고품질)</div>
                </div>
                <div id="thumbnail-preview" class="${cellData['_thumbnailUrl'] ? '' : 'd-none'}">
                  <img class="img-fluid rounded shadow-sm" style="max-height:200px;" id="thumbnail-img" src="${cellData['_thumbnailUrl'] || ''}">
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100 mb-4" id="btn-submit-game">
              ${buttonText}
            </button>
          </div>

          <div class="col-md-4">
            <div class="card shadow-sm mb-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">미리보기</h5>
                <div id="preview-budget" class="fw-bold text-primary h4 mb-3">${cellData['_budgetValue'] || 1}${cellData['_budgetUnit'] || '만원'}</div>
                <div id="preview-table" class="small"></div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `;
}

function setupCreatePage() {
  const xSlider = document.getElementById('x-count');
  const ySlider = document.getElementById('y-count');
  const randomModeCheck = document.getElementById('random-mode');

  xSlider.addEventListener('input', () => {
    xCount = parseInt(xSlider.value);
    document.getElementById('x-count-label').textContent = `${xCount}개`;
    rebuildTable();
    updatePreview();
  });

  ySlider.addEventListener('input', () => {
    yCount = parseInt(ySlider.value);
    document.getElementById('y-count-label').textContent = `${yCount}개`;
    rebuildTable();
    updatePreview();
  });

  randomModeCheck.addEventListener('change', () => {
    isRandomMode = randomModeCheck.checked;
    rebuildTable();
  });

  document.getElementById('budget-value').addEventListener('input', updatePreview);
  document.getElementById('budget-unit').addEventListener('change', updatePreview);

  document.getElementById('thumbnail-input').addEventListener('change', handleThumbnailPreview);

  document.getElementById('btn-ai-thumbnail')?.addEventListener('click', handleAIThumbnail);

  document.getElementById('game-form').addEventListener('submit', handleSubmit);

  rebuildTable();
  updatePreview();
}

function updatePreview() {
  const budgetValue = document.getElementById('budget-value').value || '0';
  const budgetUnit = document.getElementById('budget-unit').value;
  document.getElementById('preview-budget').textContent = `${budgetValue} ${budgetUnit}`;
}

function showSetModal(cellKey) {
  // Force close any existing modals and clean backdrops
  document.querySelectorAll('.modal.show').forEach(el => {
    const inst = bootstrap.Modal.getInstance(el);
    if (inst) inst.hide();
  });
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  
  ensureCellSets(cellKey);
  const sets = cellData[cellKey].sets || [];
  if (sets.length === 0) {
    sets.push({ image: '', name: '', description: '' });
  }
  const modalId = 'set-modal-' + cellKey.replace(/[^a-z0-9]/g, '_');

  const existing = document.getElementById(modalId);
  if (existing) existing.remove();

  let modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary bg-opacity-10 border-0">
            <h5 class="modal-title fw-bold">📦 세트 설정 (${sets.length}개)</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body py-3">
            <div class="set-modal-list">`;

  sets.forEach((set, idx) => {
    modalHtml += `
              <div class="card shadow-sm mb-3 set-modal-item" data-setidx="${idx}">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge bg-secondary">세트 ${idx + 1}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger modal-remove-set-btn" data-setidx="${idx}" style="padding:2px 8px;font-size:12px;">✕</button>
                  </div>
                  <div class="row g-3">
                    <div class="col-md-3">
                      <div class="modal-set-preview mb-2 text-center" style="height:100px;overflow:hidden;border-radius:8px;background:#f0f0f4;">
                        ${set.image ? `<img src="${set.image}" style="width:100%;height:100%;object-fit:cover;">` : `<div class="d-flex align-items-center justify-content-center h-100 text-muted small">이미지 없음</div>`}
                      </div>
                       <input type="file" class="form-control form-control-sm modal-set-image" accept="image/*" data-setidx="${idx}">
                       <div class="small text-muted mt-1">최대 2MB, WEBP 변환</div>
                       <button type="button" class="btn btn-outline-success btn-sm w-100 mt-1 modal-ai-set-btn" data-setidx="${idx}">
                         🤖 AI 생성
                       </button>
                       <div class="small text-muted mt-1 text-center modal-ai-set-cost" data-setidx="${idx}">${AI_IMAGE.SET.CREDITS} 크레딧 소모</div>
                     </div>
                    <div class="col-md-9">
                      <input type="text" class="form-control form-control-sm mb-2 modal-set-name" placeholder="이름" data-setidx="${idx}" value="${set.name || ''}">
                      <textarea class="form-control form-control-sm modal-set-desc" placeholder="설명" data-setidx="${idx}" rows="2">${set.description || ''}</textarea>
                    </div>
                  </div>
                </div>
              </div>`;
  });

  modalHtml += `
            </div>
            <button type="button" class="btn btn-outline-primary btn-sm w-100 modal-add-set-btn">
              + 세트 추가
            </button>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">완료</button>
          </div>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.getElementById(modalId);
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  modalEl.querySelectorAll('.modal-set-name').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.setidx);
      if (cellData[cellKey].sets[idx]) cellData[cellKey].sets[idx].name = e.target.value;
    });
  });

  modalEl.querySelectorAll('.modal-set-desc').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.setidx);
      if (cellData[cellKey].sets[idx]) cellData[cellKey].sets[idx].description = e.target.value;
    });
  });

  modalEl.querySelectorAll('.modal-set-image').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.dataset.setidx);
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { alert('파일 크기가 2MB를 초과해요.'); return; }
      try {
        const processed = await processImageFile(file);
        const url = URL.createObjectURL(processed);
        if (cellData[cellKey].sets[idx]?.image) {
          imageBlobs.delete(cellData[cellKey].sets[idx].image);
          URL.revokeObjectURL(cellData[cellKey].sets[idx].image);
        }
        cellData[cellKey].sets[idx].image = url;
        imageBlobs.set(url, processed);
        const preview = e.target.closest('.set-modal-item').querySelector('.modal-set-preview');
        preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`;
      } catch (err) { alert(err.message); }
    });
  });

  modalEl.querySelectorAll('.modal-ai-set-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.setidx);
      const item = btn.closest('.set-modal-item');
      const nameInput = item.querySelector('.modal-set-name');
      const descInput = item.querySelector('.modal-set-desc');
      const name = nameInput?.value?.trim() || '';
      const description = descInput?.value?.trim() || '';

      if (!name) {
        alert('AI 이미지를 생성하려면 이름을 입력해주세요.');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>생성 중...';

      try {
        const { blob, remaining } = await generateSetImage(name, description);
        const url = URL.createObjectURL(blob);
        ensureSetAtIndex(cellKey, idx);
        if (cellData[cellKey].sets[idx].image) {
          imageBlobs.delete(cellData[cellKey].sets[idx].image);
          URL.revokeObjectURL(cellData[cellKey].sets[idx].image);
        }
        cellData[cellKey].sets[idx].image = url;
        imageBlobs.set(url, blob);
        const preview = item.querySelector('.modal-set-preview');
        preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`;
        alert(`이미지가 생성되었어요! (잔여 크레딧: ${remaining})`);
      } catch (err) {
        alert(err.message || '이미지 생성에 실패했어요.');
      } finally {
        btn.disabled = false;
        btn.textContent = '🤖 AI 생성';
      }
    });
  });

  modalEl.querySelectorAll('.modal-remove-set-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.setidx);
      const set = cellData[cellKey].sets[idx];
      if (set?.image) { imageBlobs.delete(set.image); URL.revokeObjectURL(set.image); }
      cellData[cellKey].sets.splice(idx, 1);
      modal.hide();
      modalEl.addEventListener('hidden.bs.modal', () => { showSetModal(cellKey); }, { once: true });
    });
  });

  modalEl.querySelector('.modal-add-set-btn').addEventListener('click', () => {
    cellData[cellKey].sets.push({ image: '', name: '', description: '' });
    modal.hide();
    modalEl.addEventListener('hidden.bs.modal', () => { showSetModal(cellKey); }, { once: true });
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    modalEl.remove();
    updateSetButtonText(cellKey);
  });
}

function updateSetButtonText(cellKey) {
  const btn = document.querySelector(`.open-set-modal-btn[data-cellkey="${cellKey}"]`);
  if (btn) {
    const count = (cellData[cellKey]?.sets || []).length;
    btn.innerHTML = `📦 세트설정 (${count}개)`;
  }
}

function rebuildTable() {
  const container = document.getElementById('table-builder');
  const xLabelsContainer = document.getElementById('x-labels');
  const yLabelsContainer = document.getElementById('y-labels');

  xLabelsContainer.innerHTML = `<div class="col-12"><label class="form-label fw-medium small">X축 레이블 (가격 단계명)</label></div>`;
  for (let i = 0; i < xCount; i++) {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="단계 ${i + 1}" data-x-label="${i}" value="${cellData[`label_x_${i}`] || ''}">`;
    xLabelsContainer.appendChild(col);
  }

  const priceRow = document.createElement('div');
  priceRow.className = 'col-12 mt-2';
  priceRow.innerHTML = '<label class="form-label fw-medium small">💰 가격 (숫자만)</label>';
  const priceInputs = document.createElement('div');
  priceInputs.className = 'row g-2';
  for (let i = 0; i < xCount; i++) {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `<input type="number" class="form-control form-control-sm" placeholder="0" data-x-price="${i}" value="${cellData[`price_x_${i}`] || ''}" min="0">`;
    priceInputs.appendChild(col);
  }
  priceRow.appendChild(priceInputs);
  xLabelsContainer.appendChild(priceRow);

  yLabelsContainer.innerHTML = `<div class="col-12"><label class="form-label fw-medium small">Y축 레이블 (선택 카테고리)</label></div>`;
  for (let i = 0; i < yCount; i++) {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="항목 ${i + 1}" data-y-label="${i}" value="${cellData[`label_y_${i}`] || ''}">`;
    yLabelsContainer.appendChild(col);
  }

  let tableHtml = '<table class="table table-bordered align-middle"><thead><tr><th style="min-width:80px;"></th>';
  for (let x = 0; x < xCount; x++) {
    const price = cellData[`price_x_${x}`] || 0;
    const label = cellData[`label_x_${x}`] || `단계 ${x + 1}`;
    tableHtml += `<th class="text-center bg-light"><div class="small fw-bold" id="x-header-${x}">${label}</div><div class="small text-primary">${price ? price.toLocaleString() : '0'}</div></th>`;
  }
  tableHtml += '</tr></thead><tbody>';

  for (let y = 0; y < yCount; y++) {
    const yLabel = cellData[`label_y_${y}`] || `항목 ${y + 1}`;
    tableHtml += `<tr><th class="bg-light align-middle text-nowrap"><span class="small" id="y-header-${y}">${yLabel}</span></th>`;
    for (let x = 0; x < xCount; x++) {
      const cellKey = `cell_${y}_${x}`;
      const cell = cellData[cellKey] || { name: '', description: '', images: [], sets: [] };

      if (isRandomMode) {
        const setCount = (cell.sets || []).length;
        tableHtml += `
          <td>
            <div class="text-center">
              <button type="button" class="btn btn-outline-primary btn-sm w-100 open-set-modal-btn" data-cellkey="${cellKey}">
                📦 세트설정 (${setCount}개)
              </button>
            </div>
          </td>`;
      } else {
        // Normal mode: single name, description, image
        tableHtml += `
          <td>
            <div class="cell-editor">
              <input type="text" class="form-control form-control-sm mb-1" placeholder="이름" data-cell="${cellKey}" data-field="name" value="${cell.name || ''}">
              <input type="text" class="form-control form-control-sm mb-1" placeholder="설명" data-cell="${cellKey}" data-field="description" value="${cell.description || ''}">
              <input type="file" class="form-control form-control-sm" accept="image/*" data-cell="${cellKey}" data-field="images">
              <div class="image-preview-container mt-1 d-flex flex-wrap gap-1" data-cell="${cellKey}">
                ${(cell.images || []).map((img, idx) => `<div class="position-relative" style="width:50px;height:50px;"><img src="${img}" class="rounded" style="width:100%;height:100%;object-fit:cover;"><button type="button" class="btn-close btn-close-white position-absolute top-0 end-0" style="font-size:10px;" data-cell="${cellKey}" data-img-index="${idx}"></button></div>`).join('')}
              </div>
            </div>
          </td>`;
      }
    }
    tableHtml += '</tr>';
  }

  tableHtml += '</tbody></table>';
  container.innerHTML = tableHtml;

  document.querySelectorAll('[data-x-label]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = e.target.dataset.xLabel;
      cellData[`label_x_${idx}`] = e.target.value;
      const header = document.getElementById(`x-header-${idx}`);
      if (header) header.textContent = e.target.value || `단계 ${parseInt(idx) + 1}`;
    });
  });

  document.querySelectorAll('[data-x-price]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = e.target.dataset.xPrice;
      cellData[`price_x_${idx}`] = parseInt(e.target.value) || 0;
    });
  });

  document.querySelectorAll('[data-y-label]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = e.target.dataset.yLabel;
      cellData[`label_y_${idx}`] = e.target.value;
      const header = document.getElementById(`y-header-${idx}`);
      if (header) header.textContent = e.target.value || `항목 ${parseInt(idx) + 1}`;
    });
  });

  document.querySelectorAll('[data-cell][data-field="name"]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const key = e.target.dataset.cell;
      if (!cellData[key]) cellData[key] = { name: '', description: '', images: [] };
      cellData[key].name = e.target.value;
    });
  });

  document.querySelectorAll('[data-cell][data-field="description"]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const key = e.target.dataset.cell;
      if (!cellData[key]) cellData[key] = { name: '', description: '', images: [] };
      cellData[key].description = e.target.value;
    });
  });

  document.querySelectorAll('[data-cell][data-field="images"]').forEach((input) => {
    input.addEventListener('change', (e) => handleCellImages(e));
  });

  document.querySelectorAll('[data-img-index]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const key = e.target.dataset.cell;
      const idx = parseInt(e.target.dataset.imgIndex);
      if (cellData[key] && cellData[key].images) {
        const url = cellData[key].images[idx];
        imageBlobs.delete(url);
        URL.revokeObjectURL(url);
        cellData[key].images.splice(idx, 1);
        rebuildTable();
      }
    });
  });

  document.querySelectorAll('.open-set-modal-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showSetModal(btn.dataset.cellkey);
    });
  });

  const previewContainer = document.getElementById('preview-table');
  let previewHtml = '<table class="table table-sm table-bordered mb-0"><tbody>';
  for (let y = 0; y < yCount; y++) {
    previewHtml += '<tr>';
    for (let x = 0; x < xCount; x++) {
      const cellKey = `cell_${y}_${x}`;
      const cell = cellData[cellKey] || {};
      previewHtml += `<td class="text-center small p-2">${cell.name || '?'}</td>`;
    }
    previewHtml += '</tr>';
  }
  previewHtml += '</tbody></table>';
  previewContainer.innerHTML = previewHtml;
}

function ensureCellSets(cellKey) {
  if (!cellData[cellKey]) cellData[cellKey] = { name: '', description: '', images: [], sets: [] };
  if (!cellData[cellKey].sets) cellData[cellKey].sets = [];
}

function ensureSetAtIndex(cellKey, setIdx) {
  ensureCellSets(cellKey);
  if (!cellData[cellKey].sets[setIdx]) {
    cellData[cellKey].sets[setIdx] = { image: '', name: '', description: '' };
  }
}

async function handleCellImages(e) {
  const files = e.target.files;
  const cellKey = e.target.dataset.cell;
  if (!files?.length) return;

  if (!cellData[cellKey]) {
    cellData[cellKey] = { name: '', description: '', images: [] };
  }

  if (!isRandomMode) {
    cellData[cellKey].images = [];
  }

  for (const file of files) {
    try {
      const processed = await processImageFile(file);
      const url = URL.createObjectURL(processed);
      cellData[cellKey].images.push(url);
      imageBlobs.set(url, processed);
    } catch (err) {
      alert(err.message);
    }
  }

  e.target.value = '';
  rebuildTable();
}

async function handleThumbnailPreview(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const processed = await processImageFile(file);
    const url = URL.createObjectURL(processed);
    thumbnailBlob = processed;
    const preview = document.getElementById('thumbnail-preview');
    preview.classList.remove('d-none');
    document.getElementById('thumbnail-img').src = url;
  } catch (err) {
    alert(err.message);
  }
}

async function handleAIThumbnail() {
  const title = document.getElementById('game-title')?.value?.trim();
  if (!title) {
    alert('먼저 제목을 입력해주세요.');
    return;
  }

  const description = document.getElementById('game-description')?.value?.trim() || '';
  const budgetValue = document.getElementById('budget-value')?.value || '0';
  const budgetUnit = document.getElementById('budget-unit')?.value || '만원';

  const btn = document.getElementById('btn-ai-thumbnail');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>생성 중...';

  try {
    const { blob, remaining } = await generateThumbnailImage(title, description, budgetValue, budgetUnit);
    thumbnailBlob = blob;
    const url = URL.createObjectURL(blob);
    const preview = document.getElementById('thumbnail-preview');
    preview.classList.remove('d-none');
    document.getElementById('thumbnail-img').src = url;
    alert(`썸네일이 생성되었어요! (잔여 크레딧: ${remaining})`);
  } catch (err) {
    alert(err.message || '썸네일 생성에 실패했어요.');
  } finally {
    btn.disabled = false;
    btn.textContent = '🤖 AI 생성';
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('game-title').value.trim();
  if (!title) {
    alert('제목을 입력해주세요.');
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    alert('로그인이 필요해요.');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-game');
  submitBtn.disabled = true;
  submitBtn.textContent = editMode ? '수정 중...' : '출시 중...';

  try {
    const xLabels = [];
    for (let i = 0; i < xCount; i++) {
      xLabels.push(cellData[`label_x_${i}`] || `단계 ${i + 1}`);
    }
    const yLabels = [];
    for (let i = 0; i < yCount; i++) {
      yLabels.push(cellData[`label_y_${i}`] || `항목 ${i + 1}`);
    }

    const cells = [];
    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        const key = `cell_${y}_${x}`;
        const cell = cellData[key] || { name: '', description: '', images: [], sets: [] };
        const cellObj = {
          row: y,
          col: x,
        };
        if (isRandomMode) {
          cellObj.sets = (cell.sets || []).map(s => ({
            image: s.image || '',
            name: s.name || '',
            description: s.description || '',
          }));
          cellObj.name = '';
          cellObj.description = '';
          cellObj.images = [];
        } else {
          cellObj.name = cell.name || '';
          cellObj.description = cell.description || '';
          cellObj.images = cell.images || [];
        }
        cells.push(cellObj);
      }
    }

    const priceRow = [];
    for (let i = 0; i < xCount; i++) {
      priceRow.push(cellData[`price_x_${i}`] || 0);
    }

    const gameData = {
      title,
      topic: document.getElementById('game-topic').value || '기타',
      description: document.getElementById('game-description').value.trim(),
      budgetValue: parseInt(document.getElementById('budget-value').value) || 1,
      budgetUnit: document.getElementById('budget-unit').value || '만원',
      randomMode: document.getElementById('random-mode').checked,
      allowRemainingBudget: document.getElementById('allow-remaining').checked,
      priceRow,
      xCount,
      yCount,
      xLabels,
      yLabels,
      cells,
      thumbnailUrl: editMode ? (cellData['_thumbnailUrl'] || '') : '',
    };
    if (!editMode) gameData.createdBy = user.uid;

    if (editMode) {
      await updateGame(gameId, gameData);
    } else {
      gameId = await createGame(gameData);
    }

    if (thumbnailBlob) {
      const thumbUrl = await uploadGameThumbnail(gameId, thumbnailBlob);
      await updateGame(gameId, { thumbnailUrl: thumbUrl });
    }

    // Upload new cell images (blobs) and preserve existing URLs
    const needsImageUpdate = [...imageBlobs.keys()].length > 0 || editMode;
    if (needsImageUpdate) {
      for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
          const key = `cell_${y}_${x}`;
          const cell = cellData[key];
          if (!cell) continue;

          if (isRandomMode) {
            for (let si = 0; si < (cell.sets || []).length; si++) {
              const set = cell.sets[si];
              if (set?.image) {
                const blob = imageBlobs.get(set.image);
                if (blob) {
                  const uploadedUrl = await uploadCellImage(gameId, `row${y}_col${x}`, blob, si);
                  set.image = uploadedUrl;
                }
              }
            }
          } else {
            const uploadedUrls = [];
            for (let i = 0; i < (cell.images || []).length; i++) {
              const url = cell.images[i];
              const blob = imageBlobs.get(url);
              if (blob) {
                const uploadedUrl = await uploadCellImage(gameId, `row${y}_col${x}`, blob, i);
                uploadedUrls.push(uploadedUrl);
              } else if (typeof url === 'string' && url.startsWith('http')) {
                uploadedUrls.push(url);
              }
            }
            cell.images = uploadedUrls;
          }
        }
      }

      const updatedCells = [];
      for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
          const key = `cell_${y}_${x}`;
          const cell = cellData[key] || { name: '', description: '', images: [], sets: [] };
          const cellObj = { row: y, col: x };
          if (isRandomMode) {
            cellObj.sets = cell.sets || [];
          } else {
            cellObj.name = cell.name || '';
            cellObj.description = cell.description || '';
            cellObj.images = cell.images || [];
          }
          updatedCells.push(cellObj);
        }
      }
      await updateGame(gameId, { cells: updatedCells });
    }

    navigateTo(`/game/${gameId}`);
  } catch (err) {
    console.error('Failed to save game:', err);
    alert(editMode ? '게임 수정에 실패했어요.' : '게임 올리기에 실패했어요. 다시 시도해 주세요.');
    submitBtn.disabled = false;
    submitBtn.textContent = editMode ? '수정 완료' : '게임 올리기';
  }
}
