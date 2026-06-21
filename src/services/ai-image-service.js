import { getCredits, deductCredit } from './credit-service.js';
import { getCurrentUser, updateUserCredits } from './auth-service.js';
import { AI_IMAGE } from '../utils/constants.js';

let openaiConfig = null;

async function getOpenAIConfig() {
  if (openaiConfig) return openaiConfig;
  const res = await fetch('/api/openai-config');
  if (!res.ok) throw new Error('OpenAI 설정을 불러올 수 없어요.');
  openaiConfig = await res.json();
  return openaiConfig;
}

async function callGenerateImage(prompt, size, quality) {
  const config = await getOpenAIConfig();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };
  if (config.projectId) {
    headers['OpenAI-Project'] = config.projectId;
  }

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'gpt-image-1-mini',
      prompt: prompt.trim(),
      n: 1,
      size,
      quality,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || `이미지 생성에 실패했어요. (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function base64ToBlob(base64) {
  const byteChars = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteChars.length; offset += 512) {
    const slice = byteChars.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: 'image/png' });
}

async function checkAndDeduct(uid, required) {
  const current = await getCredits(uid);
  if (current < required) {
    throw new Error(`크레딧이 부족해요.\n(보유: ${current}, 필요: ${required})\n크레딧 충전이 필요합니다.`);
  }
  const remaining = await deductCredit(uid, required);
  updateUserCredits(remaining);
  return remaining;
}

export async function generateSetImage(name, description) {
  const user = getCurrentUser();
  if (!user) throw new Error('로그인이 필요해요.');

  const { SIZE, QUALITY, CREDITS } = AI_IMAGE.SET;
  const remaining = await checkAndDeduct(user.uid, CREDITS);

  let prompt = `밸런스 게임 아이템 이미지. "${name}" 항목.`;
  if (description) prompt += ` 설명: ${description}.`;
  prompt += ' 상품 카탈로그 스타일의 깔끔한 일러스트. 배경은 심플하게.';

  const data = await callGenerateImage(prompt, SIZE, QUALITY);
  const blob = base64ToBlob(data.data[0].b64_json);
  return { blob, remaining };
}

export async function generateThumbnailImage(title, description, budgetValue, budgetUnit) {
  const user = getCurrentUser();
  if (!user) throw new Error('로그인이 필요해요.');

  const { SIZE, QUALITY, CREDITS } = AI_IMAGE.THUMBNAIL;
  const remaining = await checkAndDeduct(user.uid, CREDITS);

  let prompt = `밸런스 게임 '${title}'의 썸네일 배너 이미지.`;
  if (description) prompt += ` 게임 설명: ${description}.`;
  prompt += ` 예산: ${budgetValue}${budgetUnit}.`;
  prompt += ' 게임의 분위기를 담은 화려한 배너 스타일. 한국어 텍스트 없이 이미지만 생성.';

  const data = await callGenerateImage(prompt, SIZE, QUALITY);
  const blob = base64ToBlob(data.data[0].b64_json);
  return { blob, remaining };
}

export async function getCurrentCredits() {
  const user = getCurrentUser();
  if (!user) return 0;
  return getCredits(user.uid);
}
