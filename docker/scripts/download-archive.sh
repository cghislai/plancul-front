#!/bin/bash
set -e
[ "$DEBUG" = "1" ] && set -x

SKIP_DOWNLOAD_ARCHIVE=${SKIP_DOWNLOAD_ARCHIVE:-false}
[[ "$SKIP_DOWNLOAD_ARCHIVE" = "true" ]] && exit 0

DOWNLOAD_RELEASE=${DOwNLOAD_RELEASE:-latest}
DOWNLOAD_TAG=${DOwNLOAD_TAG:-en}

RELEASE_URL="https://api.github.com/repos/cghislai/plancul-front/releases/${DOWNLOAD_RELEASE}"
RELEASE_JSON=$(curl $RELEASE_URL)

ASSETS_COUNT=$(echo "$RELEASE_JSON" | jq '.assets | length')
for i in $(seq 0 $ASSETS_COUNT) ; do
  LABEL_MATCH=$(echo "$RELEASE_JSON" | jq ".assets[$i].label | test(\"$DOWNLOAD_TAG\")")
  if [[ "$LABEL_MATCH" = "false" ]] ; then continue; fi
  DOWNLOAD_URL=$(echo "$RELEASE_JSON" | jq -r .assets[${i}].browser_download_url)
  break
done

[[ -z "$DOWNLOAD_URL" ]] && echo "No download url found" && exit 1

echo "Downloading archive from $DOWNLOAD_URL"
curl -L -o /opt/plancul-front.downloaded.tgz ${DOWNLOAD_URL}
