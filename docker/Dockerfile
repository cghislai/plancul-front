FROM httpd:2.4.35-alpine

RUN apk update && apk add bash curl jq

ADD https://github.com/cghislai/plancul-front/releases/download/v1.0.0-alpha.1/plancul-front-en-1.0.0-alpha.1.tgz \
    /opt/deployment/plancul-front.tgz
COPY scripts/* /opt/
COPY conf/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY conf/ssl.conf /usr/local/apache2/conf/extra/httpd-ssl.conf

ENTRYPOINT ["/opt/entrypoint.sh"]
CMD ["httpd-foreground"]
