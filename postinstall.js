const replace = require('replace-in-file')

const set_specific_version = {
    files: 'node_modules/@codetrix-studio/capacitor-google-auth/android/build.gradle',
    from: 'gms:play-services-auth:18.+',
    to: 'gms:play-services-auth:18.1.0',
    allowEmptyPaths: false
}
replace(set_specific_version)
    .then(() => {
        console.log('postinstall.ts: Replaced play-services-auth version !')
    })
    .catch(error => {
        console.error('postinstall.ts: Error occurred:', error)
    })


const multi_image_chooser = {
    files: 'android/capacitor-cordova-android-plugins/src/main/java/com/synconset/MultiImageChooserActivity.java',
    from: ['import android.support.v7.app.ActionBar;', 'import android.support.v7.app.AppCompatActivity;', 'extends ImageView'],
    to: ['import androidx.appcompat.app.ActionBar;', 'import androidx.appcompat.app.AppCompatActivity;', 'extends androidx.appcompat.widget.AppCompatImageView'],
    allowEmptyPaths: false
}

replace(multi_image_chooser)
    .then(() => {
        console.log('postinstall.ts: Replaced multi_image_chooser version !')
    })
    .catch(error => {
        console.error('postinstall.ts: Error occurred:', error)
    })

const image_picker = {
    files: 'android/capacitor-cordova-android-plugins/src/main/java/com/synconset/ImagePicker.java',
    from: ['import android.support.v4.app.ActivityCompat;', 'import android.support.v4.content.ContextCompat;'],
    to: ['import androidx.core.app.ActivityCompat;', 'import androidx.core.content.ContextCompat;'],
    allowEmptyPaths: false
}

replace(image_picker)
    .then(() => {
        console.log('postinstall.ts: Replaced image_picker version !')
    })
    .catch(error => {
        console.error('postinstall.ts: Error occurred:', error)
    })

