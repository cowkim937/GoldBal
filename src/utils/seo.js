export function setMetaTags({ title, description, image, url } = {}) {
  const siteName = '황밸게임';

  document.title = title ? `${title} - ${siteName}` : siteName;

  setMeta('description', description || '예산으로 뽑는 나만의 밸런스 게임! 직접 만들고 공유해보세요.');
  setMeta('og:title', title || siteName);
  setMeta('og:description', description || '예산으로 뽑는 나만의 밸런스 게임! 직접 만들고 공유해보세요.');
  setMeta('og:image', image || '/og-image.png');
  setMeta('og:url', url || window.location.href);
  setMeta('og:type', 'website');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title || siteName);
  setMeta('twitter:description', description || '나만의 밸런스 게임을 만들고 친구들과 공유해보세요!');
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (name.startsWith('og:')) {
      el.setAttribute('property', name);
    } else {
      el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
