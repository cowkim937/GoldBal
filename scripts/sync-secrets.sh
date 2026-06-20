#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APIS_FILE="$PROJECT_DIR/../apis.txt"

if [ ! -f "$APIS_FILE" ]; then
  echo "오류: $APIS_FILE 파일을 찾을 수 없습니다."
  exit 1
fi

# 1. 먼저 apis.txt에서 CLOUDFLARE_API_TOKEN 읽어서 환경변수로 설정
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  TOKEN_LINE=$(grep '^CLOUDFLARE_API_TOKEN=' "$APIS_FILE" | head -1)
  TOKEN_VALUE="${TOKEN_LINE#CLOUDFLARE_API_TOKEN=}"
  if [ -n "$TOKEN_VALUE" ]; then
    export CLOUDFLARE_API_TOKEN="$TOKEN_VALUE"
    echo "CLOUDFLARE_API_TOKEN을 apis.txt에서 로드했습니다."
  else
    echo "오류: CLOUDFLARE_API_TOKEN이 설정되지 않았습니다."
    echo ""
    echo "해결 방법:"
    echo "  1. https://dash.cloudflare.com/profile/api-tokens 에서 API 토큰 생성"
    echo "  2. 권한: Account → Workers Scripts → Edit"
    echo "  3. 발급된 토큰을 ../apis.txt의 CLOUDFLARE_API_TOKEN= 뒤에 붙여넣기"
    exit 1
  fi
fi

echo "Cloudflare에 시크릿 등록 중..."

SKIP_KEYS="CLOUDFLARE_API_TOKEN"

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)

  # 인증 토큰은 시크릿으로 등록하지 않음
  [[ "$SKIP_KEYS" =~ $key ]] && continue

  echo "  → $key 등록 중..."
  echo "$value" | pnpm exec wrangler secret put "$key"
done < "$APIS_FILE"

echo ""
echo "모든 시크릿 등록 완료."
echo "pnpm deploy 로 배포하세요."
