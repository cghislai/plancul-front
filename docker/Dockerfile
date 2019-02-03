FROM httpd:2.4-alpine

RUN apk update && apk add bash curl

ADD https://github.com/cghislai/authenticator-admin-front/releases/download/1.0.2-rc.1/authenticator-admin-front-1.0.2-rc.1.tgz \
    /opt/deployment/authenticator-admin-front.tgz
ADD entrypoint.sh /opt/entrypoint.sh
ADD httpd.conf /usr/local/apache2/conf/httpd.conf



ENTRYPOINT ["/opt/entrypoint.sh"]
CMD ["httpd-foreground"]
