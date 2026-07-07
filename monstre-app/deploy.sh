#!/usr/bin/env bash
# Déploie MONSTRE sur Infomaniak (summer.lucarnepro.fr) via SFTP.
# Usage : ./deploy.sh          -> build + upload
#         ./deploy.sh --no-build  -> upload le dist/ existant
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ .env introuvable à $ENV_FILE" >&2; exit 1
fi
# Charge les variables INFOMANIAK_* depuis .env
set -a; source "$ENV_FILE"; set +a

: "${INFOMANIAK_HOST:?manquant dans .env}"
: "${INFOMANIAK_USER:?manquant dans .env}"
: "${INFOMANIAK_PASSWORD:?manquant dans .env}"
: "${INFOMANIAK_REMOTE_DIR:?manquant dans .env}"
PORT="${INFOMANIAK_SSH_PORT:-22}"
DIST="$SCRIPT_DIR/dist"

if [[ "${1:-}" != "--no-build" ]]; then
  echo "🏗️  Build…"
  ( cd "$SCRIPT_DIR" && npm run build )
fi

[[ -d "$DIST" ]] || { echo "❌ dist/ absent — lance un build d'abord." >&2; exit 1; }

echo "🚀 Déploiement vers ${INFOMANIAK_SITE:-Infomaniak} (${INFOMANIAK_REMOTE_DIR})…"
lftp -u "$INFOMANIAK_USER,$INFOMANIAK_PASSWORD" "sftp://$INFOMANIAK_HOST:$PORT" <<LFTP
set sftp:auto-confirm yes
set net:max-retries 2
set net:timeout 20
mirror -R --delete --parallel=4 \
  --exclude-glob .htaccess \
  --exclude-glob .user.ini \
  --exclude-glob .infomaniak-maintenance.html \
  "$DIST/" "$INFOMANIAK_REMOTE_DIR/"
bye
LFTP

echo "✅ En ligne : https://${INFOMANIAK_SITE:-summer.lucarnepro.fr}"
