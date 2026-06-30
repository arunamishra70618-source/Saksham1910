import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

const APP_NAME = "DelhiGhar";
const DEVELOPER_EMAIL = "mishra250zxclp@gmail.com";
const DEVELOPER_PHONE = "+91 96961 49694";
const EFFECTIVE_DATE = "June 28, 2025";

const sections = [
  {
    title: "1. About DelhiGhar",
    content: [
      `${APP_NAME} is a zero-broker rental property marketplace for Delhi, designed to connect tenants directly with verified property owners. The platform supports Flat, PG, and Hostel listings across Delhi, and provides identity verification, escrow payments, fraud reporting, visit scheduling, and location-based property discovery.`,
      "By using DelhiGhar, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the app.",
    ],
  },
  {
    title: "2. Information We Collect",
    content: [
      "**Account Information:** Name, email address, and password when you create an account.",
      "**Property Listing Data:** Property name, address, area, locality, landmark, rent, deposit, room type, gender preference, amenities, house rules, and up to 6 photos when you post a property.",
      "**Owner Contact Details:** Phone number and alternate phone number of the property owner, collected when posting a listing.",
      "**Identity Verification (Aadhaar):** If you opt into Aadhaar verification, we collect and process your Aadhaar card image. This is processed securely and only for the purpose of owner identity verification.",
      "**Location Data:** With your explicit permission, we access your device location to show properties near you and provide directions. We do not store your location on our servers.",
      "**Saved Listings:** We store which listings you have saved to your account.",
      "**Visit Scheduling:** Name, phone number, and preferred visit date when you schedule a property visit.",
      "**Fraud Reports:** Details you submit when reporting a fraudulent or suspicious listing.",
      "**Usage Data:** Device type, operating system, browser, IP address, pages visited, and feature usage patterns — used to improve app performance.",
      "**Payment Data:** When using Escrow Pay, payment processing is handled by Razorpay (PCI-DSS compliant). DelhiGhar does not store card, UPI, or bank account details.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: [
      "To create and authenticate your account.",
      "To display, filter, and manage property listings.",
      "To connect tenants with verified property owners.",
      "To verify the identity of property owners (Aadhaar and Phone OTP) with your explicit consent.",
      "To show your current location on the map and calculate directions to a property (only when you grant location permission).",
      "To process escrow token payments and issue refunds when applicable.",
      "To notify you of visit confirmations, listing updates, and platform alerts.",
      "To investigate and act on fraud reports submitted by users.",
      "To moderate and remove fake, fraudulent, or inappropriate listings via our admin panel.",
      "To improve app features, fix bugs, and enhance user experience.",
      "To comply with applicable Indian laws and regulations.",
    ],
  },
  {
    title: "4. Location Data",
    content: [
      "DelhiGhar requests access to your device's location (GPS) to show nearby PG, Flat, and Hostel listings on a map and to provide directions from your current location to a listed property.",
      "**Location permission is optional.** The app works without it — the map will show only the property's location without your position.",
      "Your location is processed on-device only. We do not transmit, store, or share your GPS coordinates on our servers.",
      "We use OpenStreetMap (OSM) tiles to render maps. Directions are opened via Google Maps. Please refer to their respective privacy policies for data handling on their platforms.",
      "You can revoke location permission at any time through your device settings (Settings → Apps → DelhiGhar → Permissions).",
    ],
  },
  {
    title: "5. Phone Number Visibility",
    content: [
      "Property owner phone numbers are hidden by default and only revealed when a tenant explicitly taps the 'Show Number' button.",
      "Each reveal is logged (listing ID, timestamp) to prevent misuse and spam.",
      "Owners are informed at the time of listing that their phone number may be revealed to genuine tenants.",
    ],
  },
  {
    title: "6. Escrow Payments",
    content: [
      "Payment processing is powered by Razorpay, a PCI-DSS compliant payment gateway. DelhiGhar does not store full card or bank details on its servers.",
      "Escrow funds are held securely and released to property owners only after the tenant confirms a satisfactory property visit.",
      "Full refunds are issued if a visit is cancelled before it takes place, or if a fraud report against the property is confirmed valid by our admin team.",
      "For payment disputes, contact us at " + DEVELOPER_EMAIL + " within 7 days of the transaction.",
    ],
  },
  {
    title: "7. Fraud Reporting & Admin Moderation",
    content: [
      "Users can report suspicious or fraudulent listings through the app. Reports include a reason and are reviewed by our admin team.",
      "Listings with confirmed fraud reports may be hidden, flagged, or permanently deleted by our admin panel.",
      "Fraud report counts are visible to all users on the listing detail page to promote transparency.",
      "Our admin panel allows moderators to verify Aadhaar documents, approve or reject listings, and delete fake or spam PG listings.",
      "If your listing was incorrectly deleted, contact us at " + DEVELOPER_EMAIL + ".",
    ],
  },
  {
    title: "8. Information Sharing & Disclosure",
    content: [
      "**We do not sell your personal data.** Your information is never sold, rented, or traded to any third party for advertising or marketing.",
      "**Razorpay:** We share payment-related data with Razorpay solely to process escrow transactions.",
      "**Firebase:** We use Firebase services for authentication and file storage. Data processed by Firebase is subject to Google's Privacy Policy.",
      "**OpenStreetMap & Google Maps:** Map tiles and directions links use third-party map services. No personal data is shared with them beyond a standard HTTP request.",
      "**Legal Requirements:** We may disclose information if required by Indian law, court order, or to protect the safety and rights of our users.",
      "**Business Transfer:** In the event of a merger or acquisition, user data may be transferred under the same privacy obligations.",
    ],
  },
  {
    title: "9. Data Retention",
    content: [
      "Active account data is retained for as long as your account exists.",
      "Listing data is retained until a listing is deleted by the owner or our admin team.",
      "Visit and payment records are retained for 3 years for legal and financial compliance.",
      "Fraud report logs are retained for 2 years.",
      "Upon account deletion, all personal data associated with your account is permanently removed within 30 days.",
    ],
  },
  {
    title: "10. Data Security",
    content: [
      "We use industry-standard HTTPS encryption for all data transmitted between your device and our servers.",
      "Admin actions (verification, deletion, moderation) require a separate admin password and are logged.",
      "Aadhaar images, if provided, are stored with restricted access and not publicly visible.",
      "We conduct periodic security reviews of our application and infrastructure.",
      "In the event of a data breach affecting your information, we will notify you within 72 hours via your registered email.",
    ],
  },
  {
    title: "11. Children's Privacy",
    content: [
      `${APP_NAME} is intended for users aged 18 and above. We do not knowingly collect personal information from children under 18.`,
      "If we discover that a user under 18 has created an account, we will delete their information and account promptly.",
    ],
  },
  {
    title: "12. Your Rights",
    content: [
      "**Access:** You can view your account information within the app at any time.",
      "**Correction:** You can update your name, email, and listing details at any time.",
      "**Deletion:** You have the right to request deletion of your account and all associated data (see Section 13 below).",
      "**Opt-Out:** You can revoke location permission, notification permissions, and other optional consents at any time via device settings.",
      "**Data Portability:** Contact us at " + DEVELOPER_EMAIL + " to request a copy of your data in a readable format.",
    ],
  },
  {
    title: "13. Account & Data Deletion",
    content: [
      "You have the right to delete your DelhiGhar account and all associated personal data at any time.",
      "**How to request deletion:**",
      "1. Send an email to **" + DEVELOPER_EMAIL + "** with the subject line: **'Account Deletion Request'**",
      "2. Include your registered email address and full name in the email.",
      "3. We will confirm receipt within 48 hours and complete the deletion within 30 days.",
      "**What gets deleted:** Your name, email, saved listings, posted listings, visit history, and all account data.",
      "**What is retained:** Anonymized fraud report logs and payment records may be retained for legal/financial compliance for up to 3 years.",
      "Alternatively, you can also call or WhatsApp us at **" + DEVELOPER_PHONE + "** to request deletion.",
    ],
  },
  {
    title: "14. Cookies & Tracking",
    content: [
      "The DelhiGhar web app uses local browser storage (localStorage) to maintain your login session. No cross-site tracking cookies are used.",
      "We do not use advertising cookies or tracking pixels.",
      "Third-party services (Razorpay, Firebase) may use their own cookies as governed by their respective privacy policies.",
    ],
  },
  {
    title: "15. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. Material changes will be communicated via an in-app notification or email.",
      "The effective date at the top of this page indicates when the policy was last updated.",
      "Continued use of the app after changes constitutes your acceptance of the updated policy.",
    ],
  },
  {
    title: "16. Grievance Officer",
    content: [
      "In accordance with the Information Technology Act, 2000 and IT (Intermediary Guidelines) Rules, the details of the Grievance Officer are:",
      "**Name:** DelhiGhar Support Team",
      "**Email:** " + DEVELOPER_EMAIL,
      "**Phone:** " + DEVELOPER_PHONE,
      "**Address:** New Delhi, India",
      "**Response Time:** Grievances will be acknowledged within 48 hours and resolved within 30 days.",
    ],
  },
  {
    title: "17. Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy, please contact:",
      "📧 **Email:** " + DEVELOPER_EMAIL,
      "📞 **Phone / WhatsApp:** " + DEVELOPER_PHONE,
      "🕐 **Support Hours:** Monday – Saturday, 9 AM – 7 PM IST",
      "📍 **Location:** New Delhi, India",
    ],
  },
];

function renderText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part
  );
}

export function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-[#1A2340] text-white px-4 pt-12 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-white/60 text-xs mt-0.5">Effective Date: {EFFECTIVE_DATE}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-1">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 text-sm text-foreground leading-relaxed">
          At <strong>{APP_NAME}</strong>, your privacy matters deeply. This policy explains exactly what data we collect, why we collect it, how we use it, and what rights you have. By using DelhiGhar — including browsing listings, posting a PG, scheduling visits, or using Escrow Pay — you agree to this policy.
        </div>

        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-card rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${idx * 30}ms`, animationFillMode: "both" }}
          >
            <div className="px-4 py-3 bg-muted/50 border-b border-border">
              <h2 className="font-bold text-sm text-foreground">{section.title}</h2>
            </div>
            <div className="px-4 py-3 space-y-2">
              {section.content.map((item, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {renderText(item)}
                </p>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center text-xs text-muted-foreground pt-6 pb-8 space-y-1">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>App Version 1.0.0 · Made in India 🇮🇳</p>
        </div>
      </div>
    </div>
  );
}
