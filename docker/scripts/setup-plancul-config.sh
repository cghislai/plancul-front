#!/bin/bash
[ "$DEBUG" = "1" ] && set -x

CHECK_FILE=/var/www/template/.plancul-entrypoint
if [ -f "$CHECK_FILE" ] ; then
  echo "plancul config already generated:"
  cat  /var/www/template/client-config.json
  exit 0
fi

if [ -f "/var/www/template/client-config.json" ] ; then
  echo "plancul config already present:"
  cat  /var/www/template/client-config.json
  exit 0
fi

echo "plancul config not present. Persist $(dirname ${CHECK_FILE}) to bypass this step"

PLANCUL_WS_URL=${PLANCUL_WS_URL:-https://localhost:8444/ws}
PLANCUL_AUTHENTICATOR_API_URL=${PLANCUL_AUTHENTICATOR_API_URL:-https://localhost:8443/ws}
PLANCUL_ASTRONOMY_API_URL=${PLANCUL_ASTRONOMY_API_URL-https://localhost:8444/astronomy-ws}
PLANCUL_AUTHENTICATOR_APP_NAME=${PLANCUL_AUTHENTICATOR_APP_NAME:-plancul}
PLANCUL_PUBLIC_URL_BASE=${PLANCUL_PUBLIC_URL_BASE:-https://localhost:8002/}

[ -z "$PLANCUL_WS_URL" ] && echo "No plancul_WS_URL" && exit 1
[ -z "$PLANCUL_PUBLIC_URL_BASE" ] && echo "No PLANCUL_PUBLIC_URL_BASE" && exit 1
[ -z "$PLANCUL_AUTHENTICATOR_API_URL" ] && echo "No PLANCUL_AUTHENTICATOR_API_URL" && exit 1
[ -z "$PLANCUL_ASTRONOMY_API_URL" ] && echo "No PLANCUL_ASTRONOMY_API_URL" && exit 1
[ -z "$PLANCUL_AUTHENTICATOR_APP_NAME" ] && echo "No PLANCUL_AUTHENTICATOR_APP_NAME" && exit 1

mkdir -p /var/www/template/
cat << EOF > /var/www/template/client-config.json
{
    "apiUrl": "${PLANCUL_WS_URL}",
    "authenticatorApiUrl": "${PLANCUL_AUTHENTICATOR_API_URL}",
    "astronomyApiUrl": "${PLANCUL_ASTRONOMY_API_URL}",
    "authenticatorApplicationName": "${PLANCUL_AUTHENTICATOR_APP_NAME}",
    "applicationUrlsByLanguages": {
        "french": "${PLANCUL_PUBLIC_URL_BASE}/fr/",
        "english": "${PLANCUL_PUBLIC_URL_BASE}/en/"
    }
}
EOF
echo "plancul config:"
cat  /var/www/template/client-config.json
echo

touch ${CHECK_FILE}
[ "$DEBUG" = "1" ] && set +x || echo
