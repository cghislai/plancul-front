#!/bin/bash
[ "$DEBUG" = "1" ] && set -x

/opt/enable-ssl.sh || exit 1
/opt/download-archive.sh || exit 1

# Create config in /var/www/template
/opt/setup-plancul-config.sh || exit 1
/opt/setup-apache-config.sh || exit 1

/opt/extract-archives.sh || exit 1


exec "$@"
