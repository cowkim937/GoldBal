import { getCurrentUser, onUserChange } from '../services/auth-service.js';
import { purchaseCredits, calculatePrice, formatPrice } from '../services/payment-service.js';
import { CREDITS } from '../utils/constants.js';
import { updateAuthUI } from './Header.js';

export function renderCreditShopModal(container) {
  const modalHtml = document.createElement('div');
  modalHtml.innerHTML = `
    <div class="modal fade" id="credit-shop-modal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">💰 크레딧 충전</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body py-4">
            <div class="text-center mb-3">
              <div class="small text-muted mb-1">현재 보유 크레딧</div>
              <div class="h3 fw-bold text-warning" id="shop-current-credits">0</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">구매 수량</label>
              <input type="number" class="form-control form-control-lg text-center"
                     id="shop-credit-amount" min="${CREDITS.MIN_PURCHASE}" max="${CREDITS.MAX_PURCHASE}"
                     value="${CREDITS.MIN_PURCHASE}" step="100">
              <div class="small text-muted mt-1">${CREDITS.MIN_PURCHASE.toLocaleString()} ~ ${CREDITS.MAX_PURCHASE.toLocaleString()} 크레딧</div>
            </div>

            <div class="card bg-light border-0 mb-3">
              <div class="card-body text-center py-3">
                <div class="small text-muted mb-1">결제 금액 (VAT 포함)</div>
                <div class="h4 fw-bold text-primary mb-0" id="shop-price">${formatPrice(calculatePrice(CREDITS.MIN_PURCHASE))}</div>
                <div class="small text-muted" id="shop-price-detail">1크레딧 = ${CREDITS.PRICE_PER_CREDIT.toLocaleString()}원</div>
              </div>
            </div>

            <button class="btn btn-primary w-100 py-3 fw-bold" id="btn-purchase-credits">
              결제하기
            </button>
            <div class="text-center mt-2">
              <small class="text-muted">* 현재는 무료 지급 모드입니다</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(modalHtml.firstElementChild);

  const amountInput = document.getElementById('shop-credit-amount');
  const priceDisplay = document.getElementById('shop-price');
  const currentDisplay = document.getElementById('shop-current-credits');

  function updatePrice() {
    const amount = parseInt(amountInput.value) || 0;
    const clamped = Math.max(CREDITS.MIN_PURCHASE, Math.min(CREDITS.MAX_PURCHASE, amount));
    if (amount !== clamped) amountInput.value = clamped;
    const price = calculatePrice(clamped);
    priceDisplay.textContent = formatPrice(price);
  }

  function updateCurrentCredits() {
    const user = getCurrentUser();
    if (currentDisplay && user) {
      currentDisplay.textContent = (user.credits || 0).toLocaleString();
    }
  }

  amountInput.addEventListener('input', updatePrice);

  document.getElementById('credit-shop-modal')?.addEventListener('show.bs.modal', updateCurrentCredits);

  document.getElementById('btn-purchase-credits')?.addEventListener('click', async () => {
    const user = getCurrentUser();
    if (!user) {
      alert('로그인이 필요해요.');
      return;
    }

    const amount = parseInt(amountInput.value) || 0;
    const clamped = Math.max(CREDITS.MIN_PURCHASE, Math.min(CREDITS.MAX_PURCHASE, amount));

    if (clamped <= 0) {
      alert('구매 수량을 입력해주세요.');
      return;
    }

    const price = calculatePrice(clamped);
    if (!confirm(`${formatPrice(price)}으로 ${clamped.toLocaleString()} 크레딧을 충전할까요?`)) return;

    try {
      await purchaseCredits(user.uid, clamped);
      alert(`${clamped.toLocaleString()} 크레딧이 충전되었어요!`);
      updateCurrentCredits();
      updateAuthUI();
      const modal = bootstrap.Modal.getInstance(document.getElementById('credit-shop-modal'));
      modal?.hide();
    } catch (err) {
      alert('충전에 실패했어요: ' + (err.message || '알 수 없는 오류'));
    }
  });
}
