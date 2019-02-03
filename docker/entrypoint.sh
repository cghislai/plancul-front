#!/bin/bash
set -e

CONFIG_JSON_FILE=/var/www/authenticator-admin-config.json
AUTHENTICATOR_URL="${AUTHENTICATOR_URL:-}"

if [[ -z "$AUTHENTICATOR_URL" ]]; then
  echo "No AUTHENTICATOR_URL provided"
  exit 1
fi

mkdir -p /var/www

cat << EOF > ${CONFIG_JSON_FILE}
{
  "authenticatorApiUrl": "${AUTHENTICATOR_URL}",
  "authenticatorAdminApiUrl": "${AUTHENTICATOR_URL}/admin"
}
EOF


cd /var/www
tar -xvzf /opt/deployment/*.tgz

chown -R daemon:daemon /var/www


exec "$@"
