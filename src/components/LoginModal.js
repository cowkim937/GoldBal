import { handleGoogleLogin, handleGithubLogin, handleAnonymousLogin, handleDevLogin } from '../services/auth-service.js';

const isDev = import.meta.env.DEV;

export function renderLoginModal(container) {
  const modalHtml = document.createElement('div');
  modalHtml.innerHTML = `
    <div class="modal fade" id="login-modal" tabindex="-1">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">로그인</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center py-4">
            ${isDev ? `
            <div class="alert alert-info small mb-3">
              <strong>개발 모드</strong><br>test / test1234
            </div>
            <div class="mb-3">
              <input type="text" class="form-control form-control-sm mb-2" id="dev-email" placeholder="아이디" value="test">
              <input type="password" class="form-control form-control-sm mb-2" id="dev-password" placeholder="비밀번호" value="test1234">
              <button class="btn btn-primary w-100 py-2" id="btn-dev-login">
                개발 로그인
              </button>
            </div>
            <div class="text-muted small my-2">─ 또는 ─</div>
            ` : ''}
            <p class="text-muted mb-4">간편하게 로그인하고 게임을 만들어보세요!</p>
            <div class="d-grid gap-3">
              <button class="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-2" id="btn-google-login">
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google로 계속하기
              </button>
              <button class="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-2" id="btn-github-login">
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#333" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub로 계속하기
              </button>
              <div class="text-muted small">또는</div>
              <button class="btn btn-secondary py-2" id="btn-anonymous-login">
                익명으로 시작하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(modalHtml.firstElementChild);

  function hideModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
    modal?.hide();
  }

  function handleError(err, label) {
    if (err.code !== 'auth/popup-closed-by-user') {
      alert(err.message || `${label} 실패`);
    }
  }

  const devLoginBtn = document.getElementById('btn-dev-login');
  if (devLoginBtn) {
    devLoginBtn.addEventListener('click', async () => {
      try {
        const email = document.getElementById('dev-email').value || 'test';
        const password = document.getElementById('dev-password').value || 'test1234';
        await handleDevLogin(email, password);
        hideModal();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  document.getElementById('btn-google-login')?.addEventListener('click', async () => {
    try {
      await handleGoogleLogin();
      hideModal();
    } catch (err) {
      handleError(err, 'Google');
    }
  });

  document.getElementById('btn-github-login')?.addEventListener('click', async () => {
    try {
      await handleGithubLogin();
      hideModal();
    } catch (err) {
      handleError(err, 'GitHub');
    }
  });

  document.getElementById('btn-anonymous-login')?.addEventListener('click', async () => {
    try {
      await handleAnonymousLogin();
      hideModal();
    } catch (err) {
      handleError(err, '익명');
    }
  });
}
