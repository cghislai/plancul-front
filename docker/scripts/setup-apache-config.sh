#!/usr/bin/env bash

[ "$SKIP_SETUP_APACHE_CONFIG" = "true" ] && exit 0

BASE_DIR=${BASE_DIR:-en}

cat << EOF >> /usr/local/apache2/conf/httpd.conf

<Directory "/var/www">
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted

    RewriteEngine on
    # If an existing asset or directory is requested go to it as it is
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
    RewriteRule ^ - [L]

    # If the requested resource doesn't exist, use index.html
    RewriteRule ^ ${BASE_DIR}/index.html

</Directory>
EOF


