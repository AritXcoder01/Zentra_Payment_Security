package com.zentramobile

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.app.Notification
import android.content.Context
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject
import java.security.KeyStore
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.regex.Pattern
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

object NativeKeystoreHelper {
    private const val ALIAS = "zentra_native_queue_aes_key"
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"

    private fun getSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        if (!keyStore.containsAlias(ALIAS)) {
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
            keyGenerator.init(
                KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build()
            )
            return keyGenerator.generateKey()
        }
        return (keyStore.getEntry(ALIAS, null) as KeyStore.SecretKeyEntry).secretKey
    }

    fun encrypt(data: String): String {
        if (data.isEmpty() || data == "[]") return "[]"
        return try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())
            val iv = cipher.iv
            val encrypted = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
            val combined = ByteArray(iv.size + encrypted.size)
            System.arraycopy(iv, 0, combined, 0, iv.size)
            System.arraycopy(encrypted, 0, combined, iv.size, encrypted.size)
            Base64.encodeToString(combined, Base64.DEFAULT)
        } catch (e: Exception) {
            "[]"
        }
    }

    fun decrypt(encryptedStr: String): String {
        if (encryptedStr.isEmpty() || encryptedStr == "[]") return "[]"
        return try {
            val combined = Base64.decode(encryptedStr, Base64.DEFAULT)
            if (combined.size < 12) return "[]"
            val iv = combined.copyOfRange(0, 12)
            val encrypted = combined.copyOfRange(12, combined.size)
            val cipher = Cipher.getInstance(TRANSFORMATION)
            val spec = GCMParameterSpec(128, iv)
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), spec)
            String(cipher.doFinal(encrypted), Charsets.UTF_8)
        } catch (e: Exception) {
            "[]"
        }
    }
}

class ZentraNotificationListenerService : NotificationListenerService() {

    companion object {
        private const val PREFS_NAME = "zentra_native_notifications_secure"
        private const val KEY_ENCRYPTED_QUEUE = "encrypted_candidates_queue"
        private const val MAX_QUEUE_SIZE = 25

        // Native Exclusion Regex (OTP, promos, loans, KYC, security, failed/declined)
        private val IGNORE_PATTERN = Pattern.compile(
            "\\b(OTP|one-time password|verification code|secret code|promo|promotional|cashback offer|loan|credit limit|apply for|pre-approved|KYC|security alert|login detected|failed|declined|unsuccessful|rejected)\\b",
            Pattern.CASE_INSENSITIVE
        )

        // Native Financial Relevance Pattern
        private val FINANCIAL_PATTERN = Pattern.compile(
            "\\b(debited|credited|paid|spent|received|withdrawn|charged|purchase|refunded|deposit|UPI|Card|Bank|Account|A/c|INR|Rs|₹)\\b",
            Pattern.CASE_INSENSITIVE
        )

        fun processIncomingNotification(context: Context, title: String, text: String, packageName: String, timestamp: String) {
            val combinedText = "$title $text".trim()
            if (combinedText.isEmpty()) return

            // 1. Native Exclusion Filter
            if (IGNORE_PATTERN.matcher(combinedText).find()) {
                return
            }

            // 2. Native Financial Relevance Filter
            if (!FINANCIAL_PATTERN.matcher(combinedText).find()) {
                return
            }

            // 3. Emit to active JS catalyst instance if alive
            val emitted = NotificationListenerModule.sendNotificationEvent(title, text, packageName, timestamp)

            // 4. If JS process is dead/disconnected: Store ONLY Hardware-Encrypted AES-256 metadata! NO raw text!
            if (!emitted) {
                saveEncryptedNativeCandidate(context, combinedText, packageName, timestamp)
            }
        }

        private fun saveEncryptedNativeCandidate(context: Context, text: String, packageName: String, timestamp: String) {
            try {
                val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val rawEncrypted = prefs.getString(KEY_ENCRYPTED_QUEUE, "[]") ?: "[]"
                val decryptedJson = NativeKeystoreHelper.decrypt(rawEncrypted)
                val jsonArray = JSONArray(decryptedJson)

                // FIFO trim if size exceeds max
                while (jsonArray.length() >= MAX_QUEUE_SIZE) {
                    jsonArray.remove(0)
                }

                // STRICT SECURITY: Store ONLY safe metadata fields
                val safeItem = JSONObject().apply {
                    put("title", "Payment Notification")
                    put("text", text)
                    put("packageName", packageName)
                    put("timestamp", timestamp)
                }
                jsonArray.put(safeItem)

                val newEncrypted = NativeKeystoreHelper.encrypt(jsonArray.toString())
                prefs.edit().putString(KEY_ENCRYPTED_QUEUE, newEncrypted).apply()
            } catch (e: Exception) {
                // Ignore queue save error
            }
        }

        fun getAndClearPendingNativeNotifications(context: Context): String {
            return try {
                val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val rawEncrypted = prefs.getString(KEY_ENCRYPTED_QUEUE, "[]") ?: "[]"
                prefs.edit().remove(KEY_ENCRYPTED_QUEUE).apply()
                NativeKeystoreHelper.decrypt(rawEncrypted)
            } catch (e: Exception) {
                "[]"
            }
        }
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return

        val packageName = sbn.packageName ?: ""
        val notification = sbn.notification ?: return
        val extras = notification.extras ?: return

        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""

        val timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date(sbn.postTime))

        processIncomingNotification(applicationContext, title, text, packageName, timestamp)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // No action needed
    }
}
