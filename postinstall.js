const replace = require('replace-in-file')

const set_specific_version = {
  files: 'node_modules/@codetrix-studio/capacitor-google-auth/android/build.gradle',
  from: 'gms:play-services-auth:18.+',
  to: 'gms:play-services-auth:18.1.0',
  allowEmptyPaths: false
}
replace(set_specific_version)
  .then(() => {
    console.log('postinstall.ts: Modified file succesfully !')
  })
  .catch(error => {
    console.error('postinstall.ts: Error occurred:', error)
  })
