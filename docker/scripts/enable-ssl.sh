#!/usr/bin/env bash

ENABLE_SSL=${ENABLE_SSL:-false}
if [ "$ENABLE_SSL" != "true" ] ; then
    exit 0
fi
echo "Enabling ssl"

sed -i \
		-e 's/^#\(Listen 443\)/\1/' \
		-e 's/^#\(Include .*httpd-ssl.conf\)/\1/' \
		-e 's/^#\(LoadModule .*mod_ssl.so\)/\1/' \
		-e 's/^#\(LoadModule .*mod_socache_shmcb.so\)/\1/' \
		conf/httpd.conf
