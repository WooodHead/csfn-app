import {registerPlugin} from '@capacitor/core'

export interface PhotoPermissionsPlugin {
  check(texts: {
    acceptText: string,
    cancelText: string,
    deniedText: string,
    limitedText: string,
    selectMoreText: string,
    keepText: string,
    selectAllText: string,
  }): Promise<{next: boolean}>
}

const PhotoPermissions = registerPlugin<PhotoPermissionsPlugin>('PhotoPermissions')

export default PhotoPermissions
