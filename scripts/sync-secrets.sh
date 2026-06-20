#!/bin/bash
# 황밸게임 Cloudflare 시크릿 일괄 등록
# ../apis.txt 파일에서 KEY=VALUE 형식으로 읽어서 wrangler secret put 실행
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APIS_FILE="$PROJECT_DIR/../apis.txt"

if [ ! -f "$APIS_FILE" ]; then
  echo "오류: $APIS_FILE 파일을 찾을 수 없습니다."
  exit 1
fi

echo "apis.txt에서 시크릿을 읽어 Cloudflare에 등록합니다..."

while IFS='=' read -r key value; do
  # 빈 줄/주석 무시
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  # 앞뒤 공백 제거
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  
  echo "  → $key 등록 중..."
  echo "$value" | npx wrangler secret put "$key" --env production 2>/dev/null || \
  echo "$value" | npx wrangler secret put "$key"
done < "$APIS_FILE"

echo ""
echo "✅ 모든 시크릿 등록 완료"
echo "이제 pnpm deploy 로 배포하세요."
