import { getGameStats } from '../services/stats-service.js';
import { getGame } from '../services/game-service.js';
import { getCurrentUser } from '../services/auth-service.js';
import { setMetaTags } from '../utils/seo.js';
import { navigateTo } from '../utils/router.js';

export async function gameResultsPage(container, params) {
  const gameId = params.id;
  const user = getCurrentUser();

  container.innerHTML = `<div class="container py-4"><div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">통계를 불러오는 중...</p></div></div>`;

  try {
    const stats = await getGameStats(gameId);
    if (!stats) {
      container.innerHTML = `<div class="container py-5 text-center"><h4>게임을 찾을 수 없어요</h4><a href="/" class="btn btn-primary mt-3" data-link>홈으로</a></div>`;
      return () => {};
    }

    const { game, participantCount, playCount, allowDuplicatePlays, rowStats } = stats;
    const isOwner = user && user.uid === game.createdBy;

    setMetaTags({ title: `${game.title} - 통계` });

    let html = `<div class="container py-4">`;
    html += `<div class="d-flex justify-content-between align-items-center mb-4"><div><h2 class="fw-bold mb-1">${game.title}</h2><p class="text-muted mb-0">📊 응답 통계</p></div><a href="/game/${gameId}" class="btn btn-outline-primary" data-link>게임으로 돌아가기</a></div>`;

    html += `<div class="row g-3 mb-4"><div class="col-md-4"><div class="card shadow-sm text-center p-3"><div class="h2 fw-bold text-primary">${participantCount}</div><div class="text-muted small">참여자</div></div></div><div class="col-md-4"><div class="card shadow-sm text-center p-3"><div class="h2 fw-bold text-primary">${playCount}</div><div class="text-muted small">총 플레이</div></div></div><div class="col-md-4"><div class="card shadow-sm text-center p-3 d-flex align-items-center justify-content-center"><span class="badge ${allowDuplicatePlays ? 'bg-info' : 'bg-warning text-dark'} fs-6">${allowDuplicatePlays ? '🔄 중복 집계' : '☝️ 1인 1표'}</span></div></div></div>`;

    for (const row of rowStats) {
      const maxCount = Math.max(...row.cols.map((c) => c.count), 1);
      html += `<div class="card shadow-sm mb-4"><div class="card-body p-4"><h5 class="fw-bold mb-3">${row.yLabel}</h5>`;

      for (const col of row.cols) {
        const barWidth = Math.round((col.count / maxCount) * 100);
        const barColor = col.count === maxCount && col.count > 0 ? 'bg-primary' : 'bg-secondary bg-opacity-50';
        html += `<div class="d-flex align-items-center gap-2 mb-2">`;
        if (col.image) {
          html += `<img src="${col.image}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;" alt="">`;
        }
        html += `<div class="flex-grow-1"><div class="d-flex justify-content-between small mb-1"><span class="fw-medium">${col.name || col.xLabel}</span><span>${col.count}명 (${col.percentage}%)</span></div><div class="progress" style="height:8px"><div class="progress-bar ${barColor}" style="width:${barWidth}%"></div></div></div></div>`;
      }

      html += `<div class="text-muted small mt-2">총 ${row.total}명 응답</div></div></div>`;
    }

    if (!isOwner) {
      html += `<div class="alert alert-info text-center">제작자만 상세 통계를 볼 수 있어요. <a href="/game/${gameId}" data-link>게임하러 가기</a></div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
  } catch (err) {
    console.error('통계 로드 실패:', err);
    container.innerHTML = `<div class="container py-5 text-center"><h4>통계를 불러오지 못했어요</h4><a href="/" class="btn btn-primary mt-3" data-link>홈으로</a></div>`;
  }

  return () => {};
}
