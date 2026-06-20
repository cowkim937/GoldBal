import { addCredits } from './credit-service.js';

export async function purchaseCredits(uid, amount) {
  if (!uid || amount <= 0) {
    throw new Error('유효하지 않은 구매 요청이에요.');
  }
  await addCredits(uid, amount);
}

export function calculatePrice(credits) {
  return credits * 10;
}

export function formatPrice(won) {
  if (won >= 10000) {
    const man = Math.floor(won / 10000);
    const rest = won % 10000;
    if (rest === 0) return `${man.toLocaleString()}만원`;
    return `${man.toLocaleString()}만 ${rest.toLocaleString()}원`;
  }
  return `${won.toLocaleString()}원`;
}
