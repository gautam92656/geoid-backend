import type { UserAppLanguage } from "../constants"

export type MessageKey =
  // Auth
  | "auth.signup.success"
  | "auth.email_already_exists"
  | "auth.otp.sent"
  | "auth.otp.resent"
  | "auth.otp.invalid"
  | "auth.otp.already_verified"
  | "auth.otp.verified"
  | "auth.login.unverified_otp_sent"
  | "auth.login.success"
  | "auth.login.invalid_credentials"
  | "auth.forgot_password.sent"
  | "auth.password.reset_success"
  | "auth.password.change_success"
  | "auth.password.current_incorrect"
  | "auth.user_not_found"
  | "auth.invalid_reset"
  // Profile
  | "profile.image_required"
  | "profile.image_updated"
  | "profile.updated"
  | "profile.logout_success"
  | "profile.delete_account_confirm_mismatch"
  | "profile.delete_account_success"
  | "profile.email_in_use"
  // Billing
  | "billing.not_configured"
  | "billing.plan_not_found"
  | "billing.promo_invalid"
  | "billing.promo_expired"
  | "billing.promo_limit_reached"
  | "billing.promo_already_used"
  | "billing.promo_min_order"
  | "billing.payment_signature_invalid"
  | "billing.payment_already_recorded"
  // User preferences
  | "preferences.sos_cannot_disable"
  // Trusted contacts
  | "trusted_contacts.max_reached"
  | "trusted_contacts.not_found"
  | "trusted_contacts.deleted"
  | "trusted_contacts.already_exists"
  | "trusted_contacts.added"
  | "trusted_contacts.updated"
  | "trusted_contacts.removed"
  // SOS
  | "sos.no_trusted_contacts"
  | "sos.no_active_incident"
  | "sos.already_active"
  | "sos.started"
  | "sos.cancelled"
  | "sos.resolved"
  | "sos.ended"
  // Device
  | "device.not_found"
  | "device.renamed"
  | "device.deleted"
  // Shipping address
  | "shipping_address.not_found"
  | "shipping_address.max_reached"
  | "shipping_address.added"
  | "shipping_address.updated"
  | "shipping_address.deleted"
  | "shipping_address.default_updated"
  // Support
  | "support.submitted"
  | "support.bug_report_submitted"
  // General
  | "general.not_found"
  | "general.unauthorized"
  | "general.forbidden"

type Messages = Record<MessageKey, string>

const en: Messages = {
  // Auth
  "auth.signup.success": "Registration successful. Please check your email for the OTP to verify your account.",
  "auth.email_already_exists": "An account with this email already exists",
  "auth.otp.sent": "A new OTP has been sent to your email",
  "auth.otp.resent": "A new OTP has been sent to your email",
  "auth.otp.invalid": "Invalid or expired OTP code",
  "auth.otp.already_verified": "Email is already verified",
  "auth.otp.verified": "Email verified successfully",
  "auth.login.unverified_otp_sent": "Email is not verified yet. OTP has been sent to your email.",
  "auth.login.success": "Login successful",
  "auth.login.invalid_credentials": "Invalid email or password",
  "auth.forgot_password.sent": "If an account exists for this email, a reset OTP has been sent",
  "auth.password.reset_success": "Password reset successfully",
  "auth.password.change_success": "Password changed successfully",
  "auth.password.current_incorrect": "Current password is incorrect",
  "auth.user_not_found": "User not found",
  "auth.invalid_reset": "Invalid reset request",
  // Profile
  "profile.image_required": "Profile image file is required",
  "profile.image_updated": "Profile image updated successfully",
  "profile.updated": "Profile updated successfully",
  "profile.logout_success": "Logged out successfully",
  "profile.delete_account_confirm_mismatch": "Confirmation phrase does not match",
  "profile.delete_account_success": "Account deleted successfully",
  "profile.email_in_use": "This email address is already in use",
  // Billing
  "billing.not_configured": "Billing is not configured",
  "billing.plan_not_found": "Plan not found",
  "billing.promo_invalid": "Invalid or inactive promo code",
  "billing.promo_expired": "This promo code has expired",
  "billing.promo_limit_reached": "This promo code has reached its usage limit",
  "billing.promo_already_used": "You have already used this promo code",
  "billing.promo_min_order": "This promo code requires a minimum order amount",
  "billing.payment_signature_invalid": "Payment verification failed: invalid signature",
  "billing.payment_already_recorded": "Payment already recorded",
  // User preferences
  "preferences.sos_cannot_disable": "SOS alerts cannot be disabled",
  // Trusted contacts
  "trusted_contacts.max_reached": "You have reached the maximum number of trusted contacts",
  "trusted_contacts.not_found": "Trusted contact not found",
  "trusted_contacts.deleted": "Trusted contact deleted",
  "trusted_contacts.already_exists": "This phone number is already saved as a trusted contact",
  "trusted_contacts.added": "Trusted contact added",
  "trusted_contacts.updated": "Trusted contact updated",
  "trusted_contacts.removed": "Trusted contact removed",
  // SOS
  "sos.no_trusted_contacts": "Add at least one trusted contact before sending an SOS alert",
  "sos.no_active_incident": "No active SOS incident found",
  "sos.already_active": "An SOS incident is already active for this account. Cancel it before starting another.",
  "sos.started": "SOS incident started",
  "sos.cancelled": "SOS cancelled",
  "sos.resolved": "SOS resolved",
  "sos.ended": "SOS alert ended",
  // Device
  "device.not_found": "Device not found",
  "device.renamed": "Device renamed successfully",
  "device.deleted": "Device removed successfully",
  // Shipping address
  "shipping_address.not_found": "Shipping address not found",
  "shipping_address.max_reached": "You can save at most 5 shipping addresses",
  "shipping_address.added": "Shipping address added",
  "shipping_address.updated": "Shipping address updated",
  "shipping_address.deleted": "Shipping address deleted",
  "shipping_address.default_updated": "Default address updated",
  // Support
  "support.submitted": "Your message has been received",
  "support.bug_report_submitted": "Bug report submitted",
  // General
  "general.not_found": "Not found",
  "general.unauthorized": "Unauthorized",
  "general.forbidden": "Forbidden",
}

const hi: Messages = {
  // Auth
  "auth.signup.success": "पंजीकरण सफल। कृपया अपना ईमेल जांचें, आपके खाते को सत्यापित करने के लिए OTP भेजा गया है।",
  "auth.email_already_exists": "इस ईमेल से पहले से एक खाता मौजूद है",
  "auth.otp.sent": "आपके ईमेल पर एक नया OTP भेजा गया है",
  "auth.otp.resent": "आपके ईमेल पर एक नया OTP भेजा गया है",
  "auth.otp.invalid": "OTP कोड अमान्य या समाप्त हो गया है",
  "auth.otp.already_verified": "ईमेल पहले से सत्यापित है",
  "auth.otp.verified": "ईमेल सफलतापूर्वक सत्यापित हो गया",
  "auth.login.unverified_otp_sent": "ईमेल अभी तक सत्यापित नहीं हुई। OTP आपके ईमेल पर भेजा गया है।",
  "auth.login.success": "लॉगिन सफल",
  "auth.login.invalid_credentials": "ईमेल या पासवर्ड गलत है",
  "auth.forgot_password.sent": "यदि इस ईमेल से कोई खाता मौजूद है, तो रीसेट OTP भेजा गया है",
  "auth.password.reset_success": "पासवर्ड सफलतापूर्वक रीसेट हो गया",
  "auth.password.change_success": "पासवर्ड सफलतापूर्वक बदल दिया गया",
  "auth.password.current_incorrect": "वर्तमान पासवर्ड गलत है",
  "auth.user_not_found": "उपयोगकर्ता नहीं मिला",
  "auth.invalid_reset": "अमान्य रीसेट अनुरोध",
  // Profile
  "profile.image_required": "प्रोफ़ाइल छवि फ़ाइल आवश्यक है",
  "profile.image_updated": "प्रोफ़ाइल छवि सफलतापूर्वक अपडेट हो गई",
  "profile.updated": "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई",
  "profile.logout_success": "सफलतापूर्वक लॉग आउट हो गए",
  "profile.delete_account_confirm_mismatch": "पुष्टि वाक्यांश मेल नहीं खाता",
  "profile.delete_account_success": "खाता सफलतापूर्वक हटा दिया गया",
  "profile.email_in_use": "यह ईमेल पता पहले से उपयोग में है",
  // Billing
  "billing.not_configured": "बिलिंग कॉन्फ़िगर नहीं है",
  "billing.plan_not_found": "प्लान नहीं मिला",
  "billing.promo_invalid": "अमान्य या निष्क्रिय प्रोमो कोड",
  "billing.promo_expired": "यह प्रोमो कोड समाप्त हो गया है",
  "billing.promo_limit_reached": "यह प्रोमो कोड अपनी उपयोग सीमा तक पहुँच गया है",
  "billing.promo_already_used": "आप इस प्रोमो कोड का उपयोग पहले ही कर चुके हैं",
  "billing.promo_min_order": "इस प्रोमो कोड के लिए न्यूनतम ऑर्डर राशि आवश्यक है",
  "billing.payment_signature_invalid": "भुगतान सत्यापन विफल: अमान्य हस्ताक्षर",
  "billing.payment_already_recorded": "भुगतान पहले ही दर्ज किया जा चुका है",
  // User preferences
  "preferences.sos_cannot_disable": "SOS अलर्ट को अक्षम नहीं किया जा सकता",
  // Trusted contacts
  "trusted_contacts.max_reached": "आप विश्वसनीय संपर्कों की अधिकतम संख्या तक पहुँच गए हैं",
  "trusted_contacts.not_found": "विश्वसनीय संपर्क नहीं मिला",
  "trusted_contacts.deleted": "विश्वसनीय संपर्क हटा दिया गया",
  "trusted_contacts.already_exists": "यह फ़ोन नंबर पहले से विश्वसनीय संपर्क के रूप में सहेजा गया है",
  "trusted_contacts.added": "विश्वसनीय संपर्क जोड़ा गया",
  "trusted_contacts.updated": "विश्वसनीय संपर्क अपडेट किया गया",
  "trusted_contacts.removed": "विश्वसनीय संपर्क हटा दिया गया",
  // SOS
  "sos.no_trusted_contacts": "SOS अलर्ट भेजने से पहले कम से कम एक विश्वसनीय संपर्क जोड़ें",
  "sos.no_active_incident": "कोई सक्रिय SOS घटना नहीं मिली",
  "sos.already_active": "इस खाते के लिए पहले से एक SOS घटना सक्रिय है। नई शुरू करने से पहले इसे रद्द करें।",
  "sos.started": "SOS घटना शुरू हो गई",
  "sos.cancelled": "SOS रद्द कर दिया गया",
  "sos.resolved": "SOS हल हो गया",
  "sos.ended": "SOS अलर्ट समाप्त हो गया",
  // Device
  "device.not_found": "डिवाइस नहीं मिली",
  "device.renamed": "डिवाइस का नाम सफलतापूर्वक बदल दिया गया",
  "device.deleted": "डिवाइस सफलतापूर्वक हटा दी गई",
  // Shipping address
  "shipping_address.not_found": "शिपिंग पता नहीं मिला",
  "shipping_address.max_reached": "आप अधिकतम 5 शिपिंग पते सहेज सकते हैं",
  "shipping_address.added": "शिपिंग पता जोड़ा गया",
  "shipping_address.updated": "शिपिंग पता अपडेट किया गया",
  "shipping_address.deleted": "शिपिंग पता हटा दिया गया",
  "shipping_address.default_updated": "डिफ़ॉल्ट पता अपडेट किया गया",
  // Support
  "support.submitted": "आपका संदेश प्राप्त हो गया है",
  "support.bug_report_submitted": "बग रिपोर्ट सबमिट की गई",
  // General
  "general.not_found": "नहीं मिला",
  "general.unauthorized": "अनधिकृत",
  "general.forbidden": "निषिद्ध",
}

const catalog: Record<UserAppLanguage, Messages> = { en, hi }

export function t(lang: UserAppLanguage, key: MessageKey): string {
  return catalog[lang]?.[key] ?? en[key]
}
