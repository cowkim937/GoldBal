import { navigateTo } from '../utils/router.js';

export function renderFooter(container) {
  const footer = document.createElement('footer');
  footer.className = 'bg-dark text-light pt-5 pb-3 mt-5';
  footer.innerHTML = `
    <div class="container">
      <div class="row g-4">
        <div class="col-md-4">
          <h5 class="fw-bold mb-3">황벨뽑기</h5>
          <p class="text-secondary small">
            예산으로 뽑는 나만의 밸런스 게임! 직접 만들고 친구들과 공유하세요.
          </p>
        </div>
        <div class="col-md-2">
          <h6 class="fw-bold mb-3">바로가기</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="/" class="text-secondary text-decoration-none" data-link>홈</a></li>
            <li class="mb-2"><a href="/search" class="text-secondary text-decoration-none" data-link>탐색</a></li>
            <li class="mb-2"><a href="/create" class="text-secondary text-decoration-none" data-link>게임 만들기</a></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold mb-3">정책</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="/privacy" class="text-secondary text-decoration-none" data-link>개인정보처리방침</a></li>
            <li class="mb-2"><a href="/terms" class="text-secondary text-decoration-none" data-link>이용약관</a></li>
            <li class="mb-2"><a href="/content-policy" class="text-secondary text-decoration-none" data-link>콘텐츠 정책</a></li>
            <li class="mb-2"><a href="/copyright" class="text-secondary text-decoration-none" data-link>저작권 정책</a></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold mb-3">고객지원</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="/about" class="text-secondary text-decoration-none" data-link>소개</a></li>
            <li class="mb-2"><a href="/contact" class="text-secondary text-decoration-none" data-link>문의하기</a></li>
            <li class="mb-2"><a href="/report" class="text-secondary text-decoration-none" data-link>신고하기</a></li>
          </ul>
        </div>
      </div>
      <hr class="border-secondary my-4">
      <div class="row">
        <div class="col-12 text-center text-secondary small">
          <p class="mb-1">모든 게임은 사용자가 직접 만든 콘텐츠예요.</p>
          <p class="mb-1">업로드된 이미지와 콘텐츠의 권리는 원 저작자 또는 업로드한 사용자에게 있어요.</p>
          <p class="mb-0">&copy; ${new Date().getFullYear()} 황벨뽑기. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  container.appendChild(footer);

  footer.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute('href'));
    });
  });
}
