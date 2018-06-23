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
          name: 'LANGUAGES', defaultValue: 'en',
          description: 'Space-separated list of locales to build'
        )
        booleanParam(name: 'SKIP_TESTS', defaultValue: true, description: 'Skip tests')
        string(
          name: 'PUBLISH_URL', defaultValue: 'https://nexus.valuya.be/nexus/repository',
          description: 'Deployment repository url'
        )
        string(
          name: 'PUBLISH_REPO', defaultValue: 'web-snapshots',
          description: 'Deployment repository'
        )
   }
    stages {
        stage ('Install') {
            steps {
                nodejs(nodeJSInstallationName: 'node 10', configId: 'npm-global-config') {
                    ansiColor('xterm') {
                    sh '''
                        rm -rfv dist*
                        npm install
                       '''
                    }
                }
            }
        }
        stage ('Build') {
            steps {
              withCredentials([usernameColonPassword(credentialsId: 'nexus-basic-auth', variable: 'NEXUS_BASIC_AUTH')]) {
              nodejs(nodeJSInstallationName: 'node 10', configId: 'npm-global-config') {  catchError {
                ansiColor('xterm') {
                  sh '''
                   for LANG in $LANGUAGES ; do
                      CONF_NAME="${CONF_PREFIX}${LANG}"

                      ./node_modules/.bin/ng build \
                         -c "$CONF_NAME"
                   done
                  '''
                }
              }}}
            }
            post {
                failure {
                  mail(
                    to: 'charlyghislain@gmail.com'
                    subject: "Build of plancul-front failed: $BRANCH_NAME ${BUILD_NUMBER}",
                    body: "See job at ${BUILD_URL}"
                  )
                }
            }
        }
        stage ('Publish') {
            steps {
                withCredentials([usernameColonPassword(credentialsId: 'nexus-basic-auth', variable: 'NEXUS_BASIC_AUTH')]) {
                  ansiColor('xterm') {
                     nodejs(nodeJSInstallationName: 'node 10', configId: 'npm-global-config') {
                         sh '''
                           for LANG in $LANGUAGES ; do
                              # Read version
                              export VERSION="$(./node_modules/.bin/json -f package.json version)"
                              export COMMIT="$(git rev-parse --short HEAD)"
                              echo "$VERSION" | grep "alpha|beta" && export VERSION="${VERSION}-${COMMIT}"
  
                              export ARCHIVE="plancul-front-${LANG}-${VERSION}.tgz"
  
                              ## FIXME: Workaround https://github.com/angular/angular-cli/issues/8515
                              sed -i 's#/ngsw-worker.js#./ngsw-worker.js#' dist/plancul-front/${LANG}/main.*.js
  
                              # Compress
                              cd dist/plancul-front/${LANG}/
                              tar  -cvzf ../${ARCHIVE} ./
                              cd ../../..
  
                              # Upload archives
                              curl -v --user $NEXUS_BASIC_AUTH --upload-file dist/plancul-front/${ARCHIVE} \
                              ${PUBLISH_URL}/$D{PUBLISH_REPO}/com/charlyghislin/plancul-front/${ARCHIVE}
  
                              # Create .latest 'links' (branch heads) if required
                              if [ "${BRANCH_NAME}" = "master" ] ; then
                                export ARCHIVE_LINK="master.latest"
                                echo "$ARCHIVE" > ./${ARCHIVE_LINK}
                                curl -v --user $NEXUS_BASIC_AUTH --upload-file ./${ARCHIVE_LINK} \
                                  ${DEPLOY_URL}/${DEPLOY_REPO}/com/charlyghislain/plancul-front/${ARCHIVE_LINK}
  
                              elif [ "${BRANCH_NAME}" = "dev" ] ; then
                                export ARCHIVE_LINK="dev.latest"
                                echo "$ARCHIVE" > ./${ARCHIVE_LINK}
                                curl -v --user $NEXUS_BASIC_AUTH --upload-file ./${ARCHIVE_LINK} \
                                  ${DEPLOY_URL}/${DEPLOY_REPO}/com/charlyghislain/plancul-front/${ARCHIVE_LINK}
                              fi
                           done
                        '''
                     }
                  }
                }
            }
        }
    }
}
