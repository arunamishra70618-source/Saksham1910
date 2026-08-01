import { Link } from "wouter";
import { ArrowLeft, Shield, User, Home, ShieldCheck } from "lucide-react";

const APP_NAME = "Mera PG";
const DEVELOPER_EMAIL = "mishra250zxclp@gmail.com";
const DEVELOPER_PHONE = "+91 96961 49694";
const EFFECTIVE_DATE = "July 19, 2026";

// ─── TENANT / GENERAL USER DATA ─────────────────────────────────────────────
const userDataRows = [
  { field: "Name", why: "Shown on visit bookings and account display", stored: "Server (database)", optional: false },
  { field: "Phone Number (10-digit)", why: "OTP login — used to verify identity", stored: "Server (database)", optional: false },
  { field: "Email Address", why: "OTP delivery + booking notifications", stored: "Server (database)", optional: false },
  { field: "GPS Location", why: "Show nearby PGs on map, sort by distance", stored: "On-device only — never sent to server", optional: true },
  { field: "Saved Listings", why: "Your saved PGs persist across devices", stored: "Server (database)", optional: true },
  { field: "Visit Details (name, phone, date)", why: "Schedule a property visit", stored: "Server (database)", optional: true },
  { field: "Fraud Report Details", why: "Review and act on reported listings", stored: "Server (database)", optional: true },
  { field: "Push Notification Permission", why: "Visit reminders, booking confirmations", stored: "Browser only — not sent to server", optional: true },
  { field: "Recent Viewed Listings", why: "Show recently browsed PGs in the app", stored: "Browser localStorage only", optional: true },
  { field: "Last Used Filters", why: "Remember your search preferences", stored: "Browser localStorage only", optional: true },
  { field: "Login Session Cookie (httpOnly)", why: "Keep you logged in securely for 7 days", stored: "Encrypted browser cookie — unreadable by scripts", optional: false },
  { field: "IP Address", why: "Rate limiting, security monitoring, fraud prevention", stored: "Server logs (non-personally identifiable)", optional: false },
];

// ─── PROPERTY OWNER DATA ────────────────────────────────────────────────────
const ownerDataRows = [
  { field: "All Tenant fields above", why: "Owners also log in via OTP", stored: "Same as above", optional: false },
  { field: "Property Name & Address", why: "Display listing to tenants", stored: "Server (database)", optional: false },
  { field: "Area, Locality, Landmark", why: "Location-based search and map display", stored: "Server (database)", optional: false },
  { field: "Rent & Deposit Amount", why: "Show pricing to tenants", stored: "Server (database)", optional: false },
  { field: "Room Type, Gender Preference", why: "Filtering and matching with tenants", stored: "Server (database)", optional: false },
  { field: "Amenities & House Rules", why: "Inform prospective tenants", stored: "Server (database)", optional: false },
  { field: "Up to 6 Property Photos", why: "Display in listing gallery", stored: "Server (database)", optional: true },
  { field: "Owner Phone (primary + alternate)", why: "Revealed to tenants only on tap — logged per reveal", stored: "Server (database)", optional: false },
  { field: "Aadhaar Card Image", why: "Identity verification — reviewed by admin only", stored: "Server (restricted access)", optional: true },
  { field: "Listing Statistics", why: "Show visit count, reviews, ratings on owner dashboard", stored: "Server (database)", optional: false },
];

// ─── ADMIN DATA ──────────────────────────────────────────────────────────────
const adminDataRows = [
  { field: "Admin Password", why: "Authenticate admin panel access — stored as an encrypted environment secret, never in the database", stored: "Environment secret (not database)", optional: false },
  { field: "IP Address of Admin Requests", why: "Brute-force protection — IP blocked after 5 wrong attempts for 30 minutes", stored: "Server memory (cleared on restart)", optional: false },
  { field: "Admin Action Logs", why: "Audit trail — what listing was approved/rejected/deleted, and when", stored: "Server logs", optional: false },
  { field: "OTP Admin Actions", why: "When admin performs Aadhaar verification or escrow actions, event is logged", stored: "Server logs", optional: false },
];

const sections = [
  {
    title: "1. About Mera PG",
    content: [
      `${APP_NAME} is a zero-broker rental property marketplace for Delhi, designed to connect tenants directly with verified property owners. The platform supports Flat, PG, and Hostel listings across Delhi, and provides identity verification, escrow payments, fraud reporting, visit scheduling, and location-based property discovery.`,
      "By using Mera PG, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the app.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: [
      "To authenticate your identity via OTP (phone + email).",
      "To display, filter, and manage property listings.",
      "To connect tenants with verified property owners.",
      "To verify the identity of property owners (Aadhaar) with your explicit consent.",
      "To show nearby properties when you grant location permission (processed on-device only).",
      "To process escrow token payments and issue refunds when applicable.",
      "To send push notifications for visit reminders and booking confirmations (only if you grant permission).",
      "To investigate and act on fraud reports submitted by users.",
      "To moderate and remove fake, fraudulent, or inappropriate listings via our admin panel.",
      "To improve app features, fix bugs, and enhance user experience.",
      "To comply with applicable Indian laws and regulations.",
    ],
  },
  {
    title: "4. Location Data",
    content: [
      `${APP_NAME} requests access to your device's GPS location to show nearby PG, Flat, and Hostel listings and sort them by distance from your current position.`,
      "**Location permission is completely optional.** The app works fully without it — listings are shown without distance sorting.",
      "Your location coordinates are processed entirely on your device. We do not transmit, store, or share your GPS coordinates on our servers at any point.",
      "We use OpenStreetMap (OSM) tiles for map rendering. Please refer to OpenStreetMap's privacy policy for their data handling.",
      "You can revoke location permission at any time via your device settings.",
    ],
  },
  {
    title: "5. Phone Number Visibility",
    content: [
      "Property owner phone numbers are hidden by default and only revealed when a tenant explicitly taps 'Show Number'.",
      "Each phone reveal is logged (listing ID + timestamp) to prevent spam and misuse. This log does not include the tenant's identity.",
      "Owners are informed at the time of listing that their phone number may be revealed to genuine tenants who tap that button.",
    ],
  },
  {
    title: "6. Push Notifications",
    content: [
      `${APP_NAME} may request permission to send you browser push notifications.`,
      "Notifications are used for: visit booking confirmations, visit reminders, and important account alerts.",
      "**Push notification permission is optional.** You can deny it and the app works normally.",
      "You can revoke notification permission at any time via your browser settings (Settings → Notifications → Mera PG).",
      "We do not send marketing or promotional notifications. Only transactional alerts related to your activity.",
    ],
  },
  {
    title: "7. Escrow Payments",
    content: [
      "Payment processing is powered by Razorpay, a PCI-DSS compliant payment gateway. Mera PG does not store full card, UPI, or bank account details on its servers.",
      "Escrow funds are held securely and released to property owners only after the tenant confirms a satisfactory property visit.",
      "Full refunds are issued if a visit is cancelled before it takes place, or if a fraud report against the property is confirmed valid by our admin team.",
      "For payment disputes, contact us at " + DEVELOPER_EMAIL + " within 7 days of the transaction.",
    ],
  },
  {
    title: "8. Fraud Reporting & Admin Moderation",
    content: [
      "Users can report suspicious or fraudulent listings. Reports include a reason and are reviewed by our admin team.",
      "Listings with confirmed fraud reports may be hidden, flagged, or permanently deleted.",
      "Fraud report counts are visible to all users on the listing detail page to promote transparency.",
      "Our admin panel allows moderators to verify Aadhaar documents, approve or reject listings, and remove fake or spam PG listings.",
      "If your listing was incorrectly deleted, contact us at " + DEVELOPER_EMAIL + ".",
    ],
  },
  {
    title: "9. Information Sharing & Disclosure",
    content: [
      "**We do not sell your personal data.** Your information is never sold, rented, or traded to any third party for advertising or marketing.",
      "**Razorpay:** We share payment-related data with Razorpay solely to process escrow transactions.",
      "**OpenStreetMap:** Map tiles are fetched from OpenStreetMap servers. No personal data is shared — only standard HTTP map tile requests.",
      "**Legal Requirements:** We may disclose information if required by Indian law, court order, or to protect the safety and rights of our users.",
    ],
  },
  {
    title: "10. Data Retention",
    content: [
      "Active account data is retained for as long as your account exists.",
      "Listing data is retained until deleted by the owner or our admin team.",
      "Visit and payment records are retained for 3 years for legal and financial compliance.",
      "Fraud report logs are retained for 2 years.",
      "Upon account deletion, all personal data is permanently removed within 30 days.",
    ],
  },
  {
    title: "11. Session Security & Cookies",
    content: [
      "After OTP login, Mera PG sets a secure **httpOnly session cookie** on your browser. This cookie cannot be read by JavaScript or browser extensions — only by our server.",
      "Session cookies expire automatically after **7 days** of inactivity. You can also log out manually to destroy the session immediately.",
      "We use **localStorage** only for non-sensitive display preferences (recently viewed listings, last used filters). No personal or account data is stored in localStorage.",
      "We do not use advertising cookies, tracking pixels, or cross-site tracking cookies of any kind.",
      "Third-party services (Razorpay) may use their own cookies as governed by their respective privacy policies.",
    ],
  },
  {
    title: "12. Data Security",
    content: [
      "All data is transmitted over HTTPS (TLS encryption) between your device and our servers.",
      "Login sessions use secure httpOnly cookies — immune to XSS-based cookie theft.",
      "Admin panel is protected by password authentication + IP-based brute-force lockout (5 failed attempts = 30-minute IP ban).",
      "All API inputs are sanitized to strip HTML/script tags and checked for SQL injection patterns before processing.",
      "Rate limiting is enforced on all sensitive endpoints (OTP send, phone reveal, reviews, reports).",
      "Aadhaar images, if provided, are stored with restricted access and are not publicly visible.",
      "In the event of a data breach affecting your information, we will notify you within 72 hours via your registered email.",
    ],
  },
  {
    title: "13. Children's Privacy",
    content: [
      `${APP_NAME} is intended for users aged 18 and above. We do not knowingly collect personal information from children under 18.`,
      "If we discover that a user under 18 has created an account, we will delete their information and account promptly.",
    ],
  },
  {
    title: "14. Your Rights",
    content: [
      "**Access:** You can view your account information within the app at any time.",
      "**Correction:** You can update your name, email, and listing details at any time.",
      "**Deletion:** You have the right to request deletion of your account and all associated data (see Section 15 below).",
      "**Opt-Out:** You can revoke location permission, notification permission, and other optional consents at any time via device or browser settings.",
      "**Data Portability:** Contact us at " + DEVELOPER_EMAIL + " to request a copy of your data in a readable format.",
    ],
  },
  {
    title: "15. Account & Data Deletion",
    content: [
      "You have the right to delete your Mera PG account and all associated personal data at any time.",
      "**How to request deletion:**",
      "1. Send an email to **" + DEVELOPER_EMAIL + "** with subject: **'Account Deletion Request'**",
      "2. Include your registered phone number and name in the email.",
      "3. We will confirm within 48 hours and complete deletion within 30 days.",
      "**What gets deleted:** Name, email, phone, saved listings, posted listings, visit history, and all account data.",
      "**What is retained:** Anonymized fraud report logs and payment records may be retained for legal/financial compliance for up to 3 years.",
      "Alternatively, call or WhatsApp us at **" + DEVELOPER_PHONE + "** to request deletion.",
    ],
  },
  {
    title: "16. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. Material changes will be communicated via an in-app notification or email.",
      "The effective date at the top of this page indicates when the policy was last updated.",
      "Continued use of the app after changes constitutes your acceptance of the updated policy.",
    ],
  },
  {
    title: "17. Grievance Officer",
    content: [
      "In accordance with the Information Technology Act, 2000 and IT (Intermediary Guidelines) Rules, the details of the Grievance Officer are:",
      "**Name:** Mera PG Support Team",
      "**Email:** " + DEVELOPER_EMAIL,
      "**Phone:** " + DEVELOPER_PHONE,
      "**Address:** New Delhi, India",
      "**Response Time:** Grievances will be acknowledged within 48 hours and resolved within 30 days.",
    ],
  },
  {
    title: "18. Contact Us",
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

interface DataRow {
  field: string;
  why: string;
  stored: string;
  optional: boolean;
}

function DataTable({ rows }: { rows: DataRow[] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border text-xs">
      <div className="grid grid-cols-[2fr_2fr_2fr_auto] bg-muted/70 px-3 py-2 font-semibold text-foreground gap-2">
        <span>Data Collected</span>
        <span>Why We Collect It</span>
        <span>Where Stored</span>
        <span>Optional?</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-[2fr_2fr_2fr_auto] px-3 py-2 gap-2 items-start border-t border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
        >
          <span className="text-foreground font-medium">{row.field}</span>
          <span className="text-muted-foreground">{row.why}</span>
          <span className="text-muted-foreground">{row.stored}</span>
          <span className={`font-semibold text-center ${row.optional ? "text-green-600" : "text-orange-500"}`}>
            {row.optional ? "Yes" : "No"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
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

      <div className="p-4 space-y-3">
        {/* Intro banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm text-foreground leading-relaxed">
          At <strong>{APP_NAME}</strong>, your privacy matters deeply. This policy explains exactly what data we collect from <strong>users</strong>, <strong>property owners</strong>, and <strong>admins</strong> — why we collect it, how it is stored, and what rights you have.
        </div>

        {/* ── Section 2: User Data ── */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
            <User size={15} className="text-primary" />
            <h2 className="font-bold text-sm text-foreground">2A. Data Collected from Tenants / General Users</h2>
          </div>
          <div className="px-3 py-3">
            <DataTable rows={userDataRows} />
          </div>
        </div>

        {/* ── Section 2B: Owner Data ── */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "30ms", animationFillMode: "both" }}>
          <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
            <Home size={15} className="text-primary" />
            <h2 className="font-bold text-sm text-foreground">2B. Additional Data Collected from Property Owners</h2>
          </div>
          <div className="px-3 py-3">
            <DataTable rows={ownerDataRows} />
          </div>
        </div>

        {/* ── Section 2C: Admin Data ── */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "60ms", animationFillMode: "both" }}>
          <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
            <ShieldCheck size={15} className="text-primary" />
            <h2 className="font-bold text-sm text-foreground">2C. Data Collected from Admins</h2>
          </div>
          <div className="px-3 py-3">
            <DataTable rows={adminDataRows} />
          </div>
          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground">Admins are internal team members only. Admin access is protected by a password (stored as an encrypted environment secret) and an IP-based brute-force guard. Admin actions (listing approvals, deletions, Aadhaar reviews) are fully logged for accountability.</p>
          </div>
        </div>

        {/* Remaining sections */}
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-card rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${(idx + 3) * 30}ms`, animationFillMode: "both" }}
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
