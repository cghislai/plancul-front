#!/bin/bash
[ "$DEBUG" = "1" ] && set -x

BASE_DIR=${BASE_DIR:-en}

mkdir -p /var/www

mkdir /var/www/${BASE_DIR}
pushd /var/www/${BASE_DIR}

if [[ -f "/opt/deployment/plancul-front.downloaded.tgz" ]] ; then
    tar -xzf /opt/deployment/plancul-front.downloaded.tgz

    cp -rfv /var/www/template/* ./

elif [[ -f "/opt/deployment/plancul-front.tgz" ]] ; then
    tar -xzf /opt/deployment/plancul-front.tgz

    cp -rfv /var/www/template/* ./
else
  echo "No archive found"
  exit 1
fi

chown -R daemon:daemon ./

popd
