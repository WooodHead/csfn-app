//
//  PhotoPermissionsPlugin.m
//  CSFN
//
//  Created by Lester Pérez on 19/7/22.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(PhotoPermissionsPlugin, "PhotoPermissions",
    CAP_PLUGIN_METHOD(check, CAPPluginReturnPromise);
)
