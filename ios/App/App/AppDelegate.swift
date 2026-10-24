import UIKit
import Capacitor
import CoreNFC

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// MARK: - Worn With Care: reading the coat's NFC tag from inside the app


/// Reads the NDEF tag sewn into the coat and hands its link back to the
/// passport, which checks the passport ID. Everything happens on the phone.
@objc(WornNFCPlugin)
public class WornNFCPlugin: CAPPlugin, CAPBridgedPlugin, NFCNDEFReaderSessionDelegate {
    public let identifier = "WornNFCPlugin"
    public let jsName = "WornNFC"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise),
    ]

    private var session: NFCNDEFReaderSession?
    private var pendingCall: CAPPluginCall?

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": NFCNDEFReaderSession.readingAvailable])
    }

    @objc func scan(_ call: CAPPluginCall) {
        guard NFCNDEFReaderSession.readingAvailable else {
            call.reject("NFC reading isn't available on this iPhone.", "UNAVAILABLE")
            return
        }
        pendingCall?.reject("A new scan started.", "CANCELLED")
        pendingCall = call
        let prompt = call.getString("message") ?? "Hold the top of your iPhone near the tag in your coat."
        DispatchQueue.main.async {
            self.session = NFCNDEFReaderSession(delegate: self, queue: nil, invalidateAfterFirstRead: true)
            self.session?.alertMessage = prompt
            self.session?.begin()
        }
    }

    public func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        var urls: [String] = []
        var texts: [String] = []
        for message in messages {
            for record in message.records {
                if let url = record.wellKnownTypeURIPayload() {
                    urls.append(url.absoluteString)
                } else if let text = record.wellKnownTypeTextPayload().0 {
                    texts.append(text)
                }
            }
        }
        pendingCall?.resolve(["urls": urls, "texts": texts])
        pendingCall = nil
    }

    public func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        defer { self.session = nil }
        guard let call = pendingCall else { return }
        pendingCall = nil
        if let nfcError = error as? NFCReaderError {
            switch nfcError.code {
            case .readerSessionInvalidationErrorFirstNDEFTagRead:
                return
            case .readerSessionInvalidationErrorUserCanceled:
                call.reject("Scan cancelled.", "CANCELLED")
                return
            default:
                break
            }
        }
        call.reject(error.localizedDescription, "FAILED")
    }
}

/// The app's main screen: Capacitor's web view, plus the NFC reader above.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WornNFCPlugin())
    }
}
