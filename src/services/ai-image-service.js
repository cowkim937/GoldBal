import { getCredits, deductCredit } from './credit-service.js';
import { getCurrentUser, onUserChange, updateUserCredits } from './auth-service.js';
import { AI_IMAGE } from '../utils/constants.js';

const API_BASE = '/api/generate-image';

async function callGenerateImage(prompt, size, quality) {
  let res;
  try {
    res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, size, quality }),
    });
  } catch (err) {
    console.error('AI 이미지 API 호출 실패 (네트워크):', err.message);
    throw new Error('서버에 연결할 수 없어요. /api/health 를 확인해주세요.');
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error('AI 이미지 API 응답 파싱 실패:', err.message);
    throw new Error('서버 응답을 처리할 수 없어요. 잠시 후 다시 시도해주세요.');
  }

  if (!res.ok) {
    console.error('AI 이미지 API 오류:', res.status, data);
    throw new Error(data.error || `이미지 생성에 실패했어요. (${res.status})`);
  }

  return data;
}

function base64ToBlob(base64, mimeType = 'image/png') {
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
  return new Blob(byteArrays, { type: mimeType });
}

async function checkAndDeduct(uid, required, label) {
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

  const remaining = await checkAndDeduct(user.uid, CREDITS, '세트 이미지');

  let prompt = `밸런스 게임 아이템 이미지. "${name}" 항목.`;
  if (description) prompt += ` 설명: ${description}.`;
  prompt += ' 상품 카탈로그 스타일의 깔끔한 일러스트. 배경은 심플하게.';

  const data = await callGenerateImage(prompt, SIZE, QUALITY);
  const blob = base64ToBlob(data.base64);

  return { blob, remaining };
}

export async function generateThumbnailImage(title, description, budgetValue, budgetUnit) {
  const user = getCurrentUser();
  if (!user) throw new Error('로그인이 필요해요.');

  const { SIZE, QUALITY, CREDITS } = AI_IMAGE.THUMBNAIL;

  const remaining = await checkAndDeduct(user.uid, CREDITS, '썸네일');

  let prompt = `밸런스 게임 '${title}'의 썸네일 배너 이미지.`;
  if (description) prompt += ` 게임 설명: ${description}.`;
  prompt += ` 예산: ${budgetValue}${budgetUnit}.`;
  prompt += ' 게임의 분위기를 담은 화려한 배너 스타일. 한국어 텍스트 없이 이미지만 생성.';

  const data = await callGenerateImage(prompt, SIZE, QUALITY);
  const blob = base64ToBlob(data.base64);

  return { blob, remaining };
}

export async function getCurrentCredits() {
  const user = getCurrentUser();
  if (!user) return 0;
  return getCredits(user.uid);
}
