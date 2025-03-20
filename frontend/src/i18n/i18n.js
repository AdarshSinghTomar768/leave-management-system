import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Navigation
      "app.title": "Leave Manager",
      "nav.dashboard": "Dashboard",
      "nav.requestLeave": "Request Leave",
      "nav.myLeaves": "My Leaves",
      "nav.profile": "Profile",
      "nav.help": "Help",
      "nav.logout": "Logout",

      // Auth
      "auth.login": "Login",
      "auth.register": "Register",
      "auth.email": "Email",
      "auth.password": "Password",

      // Leave Management
      "leave.annual": "Annual Leave",
      "leave.sick": "Sick Leave",
      "leave.personal": "Personal Leave",
      "leave.startDate": "Start Date",
      "leave.endDate": "End Date",
      "leave.reason": "Reason",
      "leave.status": "Status",
      "leave.approved": "Approved",
      "leave.pending": "Pending",
      "leave.rejected": "Rejected",
      "leave.submit": "Submit",
      "leave.cancel": "Cancel",

      // Profile
      "profile.name": "Name",
      "profile.role": "Role",
      "profile.department": "Department",
      "profile.update": "Update Profile",

      // Common
      "common.save": "Save",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.back": "Back",
      "common.success": "Success",
      "common.error": "Error",
      "common.loading": "Loading...",
    },
  },
  hi: {
    translation: {
      // Navigation
      "app.title": "छुट्टी प्रबंधक",
      "nav.dashboard": "डैशबोर्ड",
      "nav.requestLeave": "छुट्टी के लिए आवेदन",
      "nav.myLeaves": "मेरी छुट्टियाँ",
      "nav.profile": "प्रोफ़ाइल",
      "nav.help": "सहायता",
      "nav.logout": "लॉग आउट",

      // Auth
      "auth.login": "लॉग इन",
      "auth.register": "रजिस्टर",
      "auth.email": "ईमेल",
      "auth.password": "पासवर्ड",

      // Leave Management
      "leave.annual": "वार्षिक छुट्टी",
      "leave.sick": "बीमारी की छुट्टी",
      "leave.personal": "व्यक्तिगत छुट्टी",
      "leave.startDate": "आरंभ तिथि",
      "leave.endDate": "समाप्ति तिथि",
      "leave.reason": "कारण",
      "leave.status": "स्थिति",
      "leave.approved": "स्वीकृत",
      "leave.pending": "विचाराधीन",
      "leave.rejected": "अस्वीकृत",
      "leave.submit": "जमा करें",
      "leave.cancel": "रद्द करें",

      // Profile
      "profile.name": "नाम",
      "profile.role": "भूमिका",
      "profile.department": "विभाग",
      "profile.update": "प्रोफ़ाइल अपडेट करें",

      // Common
      "common.save": "सहेजें",
      "common.edit": "संपादित करें",
      "common.delete": "हटाएं",
      "common.back": "वापस",
      "common.success": "सफल",
      "common.error": "त्रुटि",
      "common.loading": "लोड हो रहा है...",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
