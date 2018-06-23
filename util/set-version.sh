#!/bin/bash
VERSION=$1
[ -z "$VERSION" ] && exit 1
./node_modules/.bin/json -I -f package.json -e "this.version=\"${VERSION}\""
./node_modules/.bin/json -I -f src/plancul-info.json -e "this.version=\"${VERSION}\""


