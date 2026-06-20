import { handleGoogleLogin } from '../services/auth-service.js';

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
          <div class="modal-body text-center py-4">
            <p class="text-muted mb-4">Google 계정으로 간편하게 시작하세요!</p>
            <div class="d-grid">
              <button class="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-3" id="btn-google-login">
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google로 시작하기
              </button>
            </div>
            <p class="text-muted small mt-4 mb-0">
              계정이 없으면 자동으로 회원가입됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(modalHtml.firstElementChild);

  document.getElementById('btn-google-login')?.addEventListener('click', async () => {
    try {
      await handleGoogleLogin();
      const modal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
      modal?.hide();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('로그인에 실패했어요. 다시 시도해주세요.');
      }
    }
  });
}
