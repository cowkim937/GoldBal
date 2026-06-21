import { getCredits, deductCredit } from './credit-service.js';
import { getCurrentUser, updateUserCredits } from './auth-service.js';
import { AI_IMAGE } from '../utils/constants.js';
import { processImageFile } from '../utils/image-utils.js';

let openaiConfig = null;

const IMAGE_STYLES = [
  '드라마풍', '애니풍', '고전애니풍', '디즈니풍', '픽사풍', '수채화풍',
  '카툰풍', '게임그래픽풍', '일러스트풍', '팝아트풍', '미니멀풍', '레트로풍',
  '3D렌더링풍', '스케치풍', '동양화풍', '서양화풍', '픽셀아트풍', '인상파풍',
  '고흐풍', '모네풍', '마블코믹스풍', '컨셉아트풍', '판타지풍', 'SF풍',
];

function randomStyle() {
  return IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
}

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

export async function generateSetImage(gameTitle, gameDesc, name, description) {
  const user = getCurrentUser();
  if (!user) throw new Error('로그인이 필요해요.');
  const { SIZE, QUALITY, CREDITS } = AI_IMAGE.SET;
  const remaining = await checkAndDeduct(user.uid, CREDITS);
  const style = randomStyle();
  const prompt = `[제목: ${gameTitle || '게임'}][설명: ${gameDesc || ''}][아이템: ${name}][설명: ${description || ''}][${style}] 위 정보를 바탕으로 아이템 이미지를 생성해줘.`;
  const data = await callGenerateImage(prompt, SIZE, QUALITY);
  const rawBlob = base64ToBlob(data.data[0].b64_json);
  const blob = await processImageFile(rawBlob);
  return { blob, remaining, style };
}

export async function generateThumbnailImage(title, description, budgetValue, budgetUnit) {
  const user = getCurrentUser();
  if (!user) throw new Error('로그인이 필요해요.');
  const { SIZE, QUALITY, CREDITS } = AI_IMAGE.THUMBNAIL;
  const remaining = await checkAndDeduct(user.uid, CREDITS);
  const style = randomStyle();
  const prompt = `[제목: ${title}][설명: ${description || ''}][예산: ${budgetValue}${budgetUnit}][${style}] 위 정보를 바탕으로 썸네일 배너 이미지를 생성해줘. 한국어 텍스트 없이 이미지만 생성.`;
  const data = await callGenerateImage(prompt, SIZE, QUALITY);
  const rawBlob = base64ToBlob(data.data[0].b64_json);
  const blob = await processImageFile(rawBlob);
  return { blob, remaining, style };
}

export async function getCurrentCredits() {
  const user = getCurrentUser();
  if (!user) return 0;
  return getCredits(user.uid);
}
