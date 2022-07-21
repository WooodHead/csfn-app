//
//  PhotoPermissionsPlugin.swift
//  CSFN
//
//  Created by Lester Pérez on 19/7/22.
//
import Capacitor
import PhotosUI

@objc(PhotoPermissionsPlugin)

public class PhotoPermissionsPlugin: CAPPlugin, PHPhotoLibraryChangeObserver {
        
    var call: CAPPluginCall? = nil;
    
    public override func load() {
        PHPhotoLibrary.shared().register(self);
    }

    
    @objc func check(_ call: CAPPluginCall) {
        self.call = call;
        if #available(iOS 14, *) {
            PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
                switch status {
                case .limited:
                    self.limitedAccess(limitedText: call.getString("limitedText", ""),
                                       selectMoreText: call.getString("selectMoreText", ""),
                                       keepText: call.getString("keepText", ""),
                                       selectAllText: call.getString("selectAllText", ""));
                    break;
                case .denied:
                    self.accessDenied(deniedText:  call.getString("deniedText", ""),
                                      acceptText:  call.getString("acceptText", ""),
                                      cancelText:  call.getString("cancelText", ""));
                    break;
                case .notDetermined:
                    self.resolve();
                    break;
                case .restricted:
                    self.resolve();
                    break;
                case .authorized:
                    self.resolve();
                    break;
                @unknown default:
                    self.resolve();
                    break;
                }
            }
        }else {
            self.resolve();
        }
    }
    
    func limitedAccess(limitedText: String, selectMoreText: String, keepText: String, selectAllText: String) {
        let alert = UIAlertController( title: nil, message: limitedText, preferredStyle: .actionSheet);
        let cancelAction = UIAlertAction(title: keepText, style: .cancel) { UIAlertAction in
            self.resolve();
        };
        let acceptAction = UIAlertAction(title: selectMoreText, style: .default, handler: selectMorePictures);
        let selectAll = UIAlertAction(title: selectAllText, style: .default, handler: openPrivacySettings);
    
        alert.addAction(cancelAction);
        alert.addAction(acceptAction);
        alert.addAction(selectAll);
        
        DispatchQueue.main.async {
            self.bridge?.viewController!.present(alert, animated: true);
        }
        
    }
    
    func selectMorePictures(action: UIAlertAction){
        if #available(iOS 15, *){
            PHPhotoLibrary.shared().presentLimitedLibraryPicker(from: (self.bridge?.viewController)!) { _ in
                self.resolveDelayed()
            }
        } else if #available(iOS 14, *) {
            self.resolve(next: false);
            PHPhotoLibrary.shared().presentLimitedLibraryPicker(from: (self.bridge?.viewController)!);
        }
    }
    
    func accessDenied(deniedText: String, acceptText: String, cancelText: String){
        let alert = UIAlertController( title: nil, message: deniedText, preferredStyle: .alert);
        let cancelAction = UIAlertAction(title: cancelText, style: .cancel){ UIAlertAction in
            self.resolve();
        };
        let acceptAction = UIAlertAction(title: acceptText, style: .default, handler: openPrivacySettings);
        
    
        alert.addAction(cancelAction);
        alert.addAction(acceptAction);
        
        DispatchQueue.main.async {
            self.bridge?.viewController!.present(alert, animated: true);
        }
    }
    
    func openPrivacySettings(action: UIAlertAction) {
        self.resolve(next: false);
        guard let url = URL(string: UIApplication.openSettingsURLString),
               UIApplication.shared.canOpenURL(url) else {
                   return
           }

           UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }
 
    func resolve(next: Bool = true) {
        if(call != nil) {
            self.call?.resolve(["next": next]);
        }
    }
    
    func resolveDelayed() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { // Change `2.0` to the desired number of seconds.
            self.resolve();
        }
    }
    
    public func photoLibraryDidChange(_ changeInstance: PHChange) {
        resolveDelayed();
    }
}
