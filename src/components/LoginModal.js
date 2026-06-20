import { handleGoogleLogin, completeSignup, handleLogout } from '../services/auth-service.js';

export function renderLoginModal(container) {
  const modalHtml = document.createElement('div');
  modalHtml.innerHTML = `
    <div class="modal fade" id="login-modal" tabindex="-1">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">로그인 / 회원가입</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center py-4" id="login-step-1">
            <p class="text-muted mb-4">Google 계정으로 간편하게 시작하세요!</p>
            <div class="d-grid">
              <button class="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-3" id="btn-google-login">
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google로 시작하기
              </button>
            </div>
          </div>
          <div class="modal-body text-center py-4" id="login-step-2" style="display:none;">
            <div class="mb-3">
              <img id="signup-avatar" class="rounded-circle border" style="width:64px;height:64px;object-fit:cover;" src="" alt="">
            </div>
            <h6 class="fw-bold mb-1">Google 인증 완료!</h6>
            <p class="text-muted small mb-3" id="signup-email"></p>
            <input type="text" class="form-control form-control-sm text-center mb-3" id="signup-nickname" placeholder="닉네임을 입력하세요" maxlength="12">
            <button class="btn btn-primary w-100 py-2" id="btn-signup-complete">회원가입 완료</button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(modalHtml.firstElementChild);

  let pendingUser = null;
  const modal = () => bootstrap.Modal.getInstance(document.getElementById('login-modal'));

  function showStep2(user) {
    pendingUser = user;
    document.getElementById('login-step-1').style.display = 'none';
    document.getElementById('login-step-2').style.display = '';
    document.getElementById('signup-avatar').src = user.photoURL || '';
    document.getElementById('signup-email').textContent = user.email || '';
    document.getElementById('signup-nickname').value = user.displayName || '';
  }

  function resetToStep1() {
    pendingUser = null;
    document.getElementById('login-step-1').style.display = '';
    document.getElementById('login-step-2').style.display = 'none';
  }

  document.getElementById('btn-google-login')?.addEventListener('click', async () => {
    try {
      const user = await handleGoogleLogin();
      showStep2(user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return;
      if (err.code === 'auth/unauthorized-domain') {
        alert('현재 도메인이 Firebase에 등록되지 않았어요.\n\nFirebase Console → Authentication → Settings → 승인된 도메인에\n"goldbalance.cowkim937.workers.dev"를 추가해주세요.');
      } else if (err.code === 'auth/operation-not-allowed') {
        alert('Google 로그인이 활성화되지 않았어요.\n\nFirebase Console → Authentication → Sign-in method → Google 사용 설정');
      } else if (err.code === 'auth/configuration-not-ready') {
        alert(err.message || 'Firebase 설정이 완료되지 않았어요. .env와 Cloudflare 환경 변수를 확인해주세요.');
      } else if (err.code === 'auth/configuration-not-found') {
        alert('Firebase 인증 설정을 찾지 못했어요.\n\n지금은 앱 기본 프로젝트 설정(j-board-61433)으로 자동 복구하도록 반영했어요.\n브라우저를 새로고침한 뒤 다시 시도해주세요.');
      } else {
        alert('로그인 실패: ' + (err.message || err.code || '알 수 없는 오류'));
      }
    }
  });

  document.getElementById('btn-signup-complete')?.addEventListener('click', async () => {
    if (!pendingUser) return;
    const nickname = document.getElementById('signup-nickname').value.trim();
    if (!nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    try {
      await completeSignup(pendingUser.uid, nickname, pendingUser.photoURL || '');
      modal()?.hide();
    } catch (err) {
      alert('회원가입에 실패했어요. 다시 시도해주세요.');
    }
  });

  document.getElementById('login-modal')?.addEventListener('hidden.bs.modal', () => {
    if (pendingUser) {
      handleLogout();
    }
    resetToStep1();
  });
}
