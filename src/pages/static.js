import { setMetaTags } from '../utils/seo.js';

const pages = {
  privacy: {
    title: '개인정보처리방침',
    content: `
      <h3>1. 수집하는 개인정보</h3>
      <p>황밸게임는 서비스 제공을 위해 아래 정보를 수집합니다.</p>
      <ul>
        <li>필수: 이메일 주소, 닉네임, 프로필 이미지</li>
        <li>자동 수집: 서비스 이용 기록, 접속 로그, 쿠키</li>
      </ul>

      <h3>2. 수집 목적</h3>
      <p>수집된 정보는 서비스 제공, 사용자 식별, 부정 이용 방지, 서비스 개선을 위해 사용됩니다.</p>

      <h3>3. 보유 기간</h3>
      <p>회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우에는 해당 기간 동안 보관합니다.</p>

      <h3>4. 제3자 제공</h3>
      <p>황밸게임는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>

      <h3>5. 사용자 권리</h3>
      <p>언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며 회원 탈퇴를 요청할 수 있습니다.</p>

      <h3>6. 문의</h3>
      <p>개인정보 관련 문의는 contact@hwangbal.pages.dev 로 보내주세요.</p>
    `,
  },
  terms: {
    title: '이용약관',
    content: `
      <h3>제1조 (목적)</h3>
      <p>이 약관은 황밸게임(이하 "서비스")가 제공하는 게임 제작 및 플레이 서비스의 이용 조건을 정합니다.</p>

      <h3>제2조 (서비스 내용)</h3>
      <p>서비스는 다음 기능을 제공합니다.</p>
      <ul>
        <li>밸런스 게임 만들기 및 공유</li>
        <li>게임 플레이 및 결과 확인</li>
        <li>좋아요, 조회수 등 커뮤니티 기능</li>
      </ul>

      <h3>제3조 (이용자 의무)</h3>
      <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
      <ul>
        <li>타인의 권리나 명예를 침해하는 행위</li>
        <li>불법적인 내용의 게시</li>
        <li>서비스의 정상적인 운영을 방해하는 행위</li>
        <li>타인의 계정을 도용하는 행위</li>
      </ul>

      <h3>제4조 (콘텐츠 책임)</h3>
      <p>모든 게임 콘텐츠는 이용자가 직접 만든 것입니다. 콘텐츠에 대한 책임은 해당 이용자에게 있으며, 서비스는 이에 대한 법적 책임을 지지 않습니다.</p>

      <h3>제5조 (서비스 중단)</h3>
      <p>서비스는 시스템 점검, 장애 등 부득이한 사유가 있는 경우 일시적으로 중단될 수 있습니다.</p>
    `,
  },
  contact: {
    title: '문의하기',
    content: `
      <div class="text-center mb-4">
        <p class="lead">궁금한 점이나 개선 제안이 있다면 언제든 연락 주세요.</p>
      </div>
      <div class="card shadow-sm mb-3">
        <div class="card-body p-4">
          <h5>📧 이메일</h5>
          <p class="mb-0">contact@hwangbal.pages.dev</p>
        </div>
      </div>
      <div class="card shadow-sm mb-3">
        <div class="card-body p-4">
          <h5>🐛 버그 신고</h5>
          <p class="mb-0">GitHub Issues로 제보해 주시면 빠르게 확인하겠습니다.</p>
        </div>
      </div>
      <p class="text-muted small">보통 2~3일 내에 답변 드려요.</p>
    `,
  },
  about: {
    title: '서비스 소개',
    content: `
      <div class="text-center mb-4">
        <h3 class="fw-bold">황밸게임</h3>
        <p class="lead text-muted">예산 안에서 최고의 조합을 뽑아보세요!</p>
      </div>
      <p>
        황밸게임는 누구나 쉽게 <strong>밸런스 게임</strong>을 만들고 공유할 수 있는 서비스예요.
        가로축은 예산 단계, 세로축은 선택 카테고리로 구성된 표에서 각 행마다 하나씩 골라 나만의 결과를 완성하는 방식이에요.
      </p>
      <p>
        "1만원으로 포켓몬 조합 짜기", "5만원으로 축구팀 만들기", "1억으로 드림카 뽑기" 같은
        재미있는 게임을 직접 만들어 친구들과 공유해보세요.
      </p>
      <p class="text-muted small mt-3">
        '황밸게임'은 '황금 밸런스 게임'의 줄임말이에요. 예산이라는 제약 안에서 최고의 선택을 뽑는 재미를 담았습니다.
      </p>
    `,
  },
  report: {
    title: '신고하기',
    content: `
      <div class="alert alert-warning">
        부적절한 콘텐츠나 사용자를 발견했다면 아래 내용을 포함해서 알려주세요.
      </div>
      <ul>
        <li>신고하려는 게임 URL 또는 사용자 정보</li>
        <li>신고 사유 (저작권 침해, 부적절한 내용, 스팸 등)</li>
        <li>구체적인 설명</li>
      </ul>
      <p>contact@hwangbal.pages.dev 로 보내주시면 빠르게 검토할게요.</p>
      <p class="text-muted small">접수 후 24시간 이내에 확인하고 조치하겠습니다.</p>
    `,
  },
  'content-policy': {
    title: '콘텐츠 정책',
    content: `
      <h3>금지 콘텐츠</h3>
      <p>다음에 해당하는 콘텐츠는 게시할 수 없습니다.</p>
      <ul>
        <li>성인 콘텐츠, 음란물</li>
        <li>폭력적이거나 혐오를 조장하는 내용</li>
        <li>타인의 저작권을 침해하는 이미지나 텍스트</li>
        <li>개인정보가 포함된 콘텐츠</li>
        <li>도배성, 광고성 게시물</li>
      </ul>

      <h3>제재</h3>
      <p>정책을 위반한 게임은 사전 통보 없이 삭제될 수 있으며, 반복 위반 시 계정 이용이 제한될 수 있습니다.</p>
    `,
  },
  copyright: {
    title: '저작권 정책',
    content: `
      <h3>사용자 제작 콘텐츠</h3>
      <p>황밸게임의 모든 게임은 사용자가 직접 만든 콘텐츠(UGC)입니다.</p>
      <p>게임에 사용된 이미지와 내용의 권리는 원 저작자 또는 업로드한 사용자에게 있어요.</p>

      <h3>저작권 침해 신고</h3>
      <p>자신의 저작권을 침해하는 콘텐츠를 발견하셨다면 아래 정보를 포함해 신고해 주세요.</p>
      <ul>
        <li>권리자 본인 확인 정보</li>
        <li>침해된 원본 저작물 정보</li>
        <li>침해 콘텐츠가 있는 페이지 주소(URL)</li>
        <li>연락처</li>
      </ul>
      <p>contact@hwangbal.pages.dev 로 보내주세요.</p>

      <h3>DMCA 준수</h3>
      <p>황밸게임는 DMCA(Digital Millennium Copyright Act)에 따라 적법한 저작권 침해 신고가 접수되면 해당 콘텐츠를 신속히 삭제합니다.</p>
    `,
  },
};

export async function staticPage(container, params) {
  const pageKey = params.page || 'privacy';
  const page = pages[pageKey];

  if (!page) {
    container.innerHTML = `
      <div class="container py-5 text-center">
        <h3>페이지를 찾을 수 없어요</h3>
        <a href="/" class="btn btn-primary mt-3" data-link>홈으로</a>
      </div>
    `;
    return () => {};
  }

  container.innerHTML = `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h2 class="fw-bold mb-4">${page.title}</h2>
          <div class="card shadow-sm">
            <div class="card-body p-4">
              ${page.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setMetaTags({ title: page.title });

  return () => {};
}
