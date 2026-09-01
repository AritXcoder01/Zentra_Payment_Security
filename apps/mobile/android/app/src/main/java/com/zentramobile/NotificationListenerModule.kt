package com.zentramobile

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationListenerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NotificationListenerModule"

    companion object {
        private var instance: NotificationListenerModule? = null

        fun sendNotificationEvent(title: String, text: String, packageName: String, timestamp: String): Boolean {
            val mod = instance ?: return false
            val reactCtx = mod.reactContext
            if (reactCtx.hasActiveCatalystInstance()) {
                try {
                    val params = Arguments.createMap().apply {
                        putString("title", title)
                        putString("text", text)
                        putString("packageName", packageName)
                        putString("timestamp", timestamp)
                    }
                    reactCtx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onNotificationReceived", params)
                    return true
                } catch (e: Exception) {
                    return false
                }
            }
            return false
        }
    }

    init {
        instance = this
    }

    @ReactMethod
    fun isNotificationListenerEnabled(promise: Promise) {
        try {
            val packageName = reactContext.packageName
            val flat = Settings.Secure.getString(
                reactContext.contentResolver,
                "enabled_notification_listeners"
            )
            var enabled = false
            if (!TextUtils.isEmpty(flat)) {
                val names = flat.split(":".toRegex()).toTypedArray()
                for (name in names) {
                    val cn = ComponentName.unflattenFromString(name)
                    if (cn != null && TextUtils.equals(packageName, cn.packageName)) {
                        enabled = true
                        break
                    }
                }
            }
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("ERROR_CHECKING_LISTENER", e.message, e)
        }
    }

    @ReactMethod
    fun openNotificationListenerSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR_OPENING_SETTINGS", e.message, e)
        }
    }

    @ReactMethod
    fun getPendingNativeNotifications(promise: Promise) {
        try {
            val jsonStr = ZentraNotificationListenerService.getAndClearPendingNativeNotifications(reactContext.applicationContext)
            promise.resolve(jsonStr)
        } catch (e: Exception) {
            promise.reject("ERROR_GETTING_PENDING", e.message, e)
        }
    }

    @ReactMethod
    fun postSyntheticNotification(title: String, text: String, promise: Promise) {
        try {
            val timestamp = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).format(java.util.Date())
            ZentraNotificationListenerService.processIncomingNotification(
                reactContext.applicationContext,
                title,
                text,
                "com.zentramobile.synthetic",
                timestamp
            )
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR_POSTING_SYNTHETIC", e.message, e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN Event Emitter
    }
}
