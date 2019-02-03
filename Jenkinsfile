pipeline {
    agent any
    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    parameters {
        string(
          name: 'CONF_PREFIX', defaultValue: 'production-',
          description: 'Will be appended with the language'
        )
        string(
          name: 'LANGUAGES', defaultValue: 'en fr',
          description: 'Space-separated list of locales to build'
        )
        booleanParam(name: 'SKIP_TESTS', defaultValue: true, description: 'Skip tests')
        booleanParam(name: 'FORCE_DEPLOY', defaultValue: false, description: 'Force deploy on feature branches')
   }
    stages {
        stage ('Build') {
            steps {
              nodejs(nodeJSInstallationName: 'node 10', configId: 'npmrc-@charlyghislain') {  catchError {
                ansiColor('xterm') {
                  sh '''
                    rm -rfv dist*
                    npm install  --no-shrinkwrap #FIXME: Ignore package lock for time being: API may have been overwritten in the repo
                   for LANG in $LANGUAGES ; do
                      CONF_NAME="${CONF_PREFIX}${LANG}"

                      ./node_modules/.bin/ng build \
                         -c "$CONF_NAME"
                   done
                  '''
                }
              }}
            }
        }
        stage ('Publish') {

            when { allOf {
              anyOf {
                 environment name: 'BRANCH_NAME', value: 'master'
                 environment name: 'BRANCH_NAME', value: 'rc'
                 expression { return params.FORCE_DEPLOY == true }
              }
              expression { return currentBuild.result != 'FAILURE' }
             }}
            steps {
                withCredentials([string(credentialsId: 'github-cghislai-token', variable: 'SECRET')]) {
                  ansiColor('xterm') {
                     nodejs(nodeJSInstallationName: 'node 10', configId: 'npmrc-@charlyghislain') {
                         sh '''
                            VERSION="$(./node_modules/.bin/json -f package.json version)"
                            COMMIT="$(git rev-parse --short HEAD)"
                            FULLVERSION=$VERSION
                            PRERELEASE=false
                            echo "$VERSION" | grep "alpha|beta" && PRERELEASE=true
                            if [ "PRERELEASE" = "true" ] ; then
                              FULLVERSION="${VERSION}-${COMMIT}"
                            fi

                            RELEASE_ASSETS_URL="$(curl -v -q \
                              -u cghislai:$SECRET \
                              https://api.github.com/repos/cghislai/plancul-front/releases/tags/$VERSION \
                              | jq -r .assets_url)"
                            if [ "$?" != "0" ] ; then
                              # create release if needed
                              RELEASE_ASSETS_URL="$(curl -v -H 'Content-Type: application/json' \
                                -u cghislai:$SECRET \
                                -d '{\"tag_name\": \"$VERSION\", \
                                     \"target_commitish\": \"$BRANCH_NAME\",\
                                     \"name\": \"$VERSION\",\
                                     \"body\": \"Release $VERSION\",\
                                     \"draft\": false, \
                                     \"prerelease\": $PRERELEASE}' \
                                https://api.github.com/repos/cghislai/plancul-front/releases \
                                | jq -r .assets_url)"
                            fi


                            for LANG in $LANGUAGES ; do
                              ARCHIVE="plancul-front-${LANG}-${FULLVERSION}.tgz"
  
                              ## FIXME: Workaround https://github.com/angular/angular-cli/issues/8515
                              sed -i 's#/ngsw-worker.js#./ngsw-worker.js#' dist/plancul-front/${LANG}/main.*.js
  
                              # Compress
                              cd dist/plancul-front/${LANG}/
                              tar  -cvzf ../${ARCHIVE} ./
                              cd ../../..
  
                              # Upload archive as github release asset
                              ARCHIVE_URL="$(curl -v -H 'Content-Type: application/json' \
                                  -u cghislai:$SECRET \
                                  --upload-file dist/plancul-front/${ARCHIVE} \
                                  "${RELEASE_ASSETS_URL}?name=${ARCHIVE}" \
                                  | jq -r .browser_download_url)"

                            done
                        '''
                     }
                  }
                }
            }
        }
    }
}
