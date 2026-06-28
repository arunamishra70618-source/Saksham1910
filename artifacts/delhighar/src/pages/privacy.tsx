import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

const DEVELOPER_NAME = "DelhiGhar";
const DEVELOPER_EMAIL = "mishra250zxclp@gmail.com";
const DEVELOPER_PHONE = "+91 96961 49694";
const EFFECTIVE_DATE = "June 28, 2025";
const CURRENT_YEAR = new Date().getFullYear();

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "**Account Information:** When you create an account, we collect your name, email address, and phone number.",
      "**Property Listing Data:** When you post a property, we collect the address, rent, photos, amenities, and owner contact details you provide.",
      "**Verification Documents:** If you opt into Aadhaar verification, we securely process your document image only for identity verification purposes.",
      "**Usage Data:** We automatically collect device information, IP address, browser type, pages visited, and app usage patterns to improve our service.",
      "**Payment Data:** When using Escrow Pay, payment processing is handled by Razorpay. We do not store card or bank details on our servers.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To create and manage your account.",
      "To display and manage property listings on the platform.",
      "To connect property seekers with verified owners.",
      "To verify the identity of property owners (only with your explicit consent).",
      "To process escrow payments and token money securely.",
      "To send you service-related notifications, booking confirmations, and updates.",
      "To detect, investigate, and prevent fraud, spam, and platform abuse.",
      "To comply with applicable laws and legal obligations.",
      "To improve our app features, performance, and user experience.",
    ],
  },
  {
    title: "3. Information Sharing & Disclosure",
    content: [
      "**We do not sell your personal data.** Your information is never sold, rented, or traded to any third party for marketing.",
      "**Phone Number Visibility:** Your phone number is only revealed to a property seeker when they explicitly tap 'View Phone'. This is disclosed clearly before you post.",
      "**Payment Processors:** We share necessary payment data with Razorpay (PCI-DSS compliant) solely to process transactions.",
      "**Legal Requirements:** We may disclose information if required by law, court order, or to protect the safety and rights of our users.",
      "**Business Transfer:** In the event of a merger or acquisition, user data may be transferred to the new entity under the same privacy obligations.",
    ],
  },
  {
    title: "4. Escrow Payments & Refunds",
    content: [
      "Payment processing is handled by Razorpay, a PCI-DSS compliant gateway. DelhiGhar does not store full card or UPI details.",
      "Escrow funds are held securely and released to property owners only after the tenant confirms a satisfactory property visit.",
      "Full refunds are issued if a visit is cancelled before it occurs, or if a fraud report against the property is confirmed valid.",
      "For payment disputes, contact us at " + DEVELOPER_EMAIL + " within 7 days of the transaction.",
    ],
  },
  {
    title: "5. Data Security",
    content: [
      "We implement industry-standard security including SSL/TLS encryption, secure cloud servers, and role-based access controls.",
      "Aadhaar documents are stored with encryption and are accessible only to authorized administrators for verification.",
      "While we take all reasonable precautions, no internet transmission is 100% secure. We cannot guarantee absolute security.",
    ],
  },
  {
    title: "6. Cookies & Analytics",
    content: [
      "We use local storage and session cookies to keep you logged in and remember your preferences.",
      "We may use analytics tools to understand how users interact with the app. This data is anonymized and aggregated.",
      "You can clear cookies and local storage via your browser or device settings at any time.",
    ],
  },
  {
    title: "7. Your Rights",
    content: [
      "**Access:** You may request a copy of the personal data we hold about you.",
      "**Correction:** You can update incorrect information through your account settings or by contacting us.",
      "**Deletion:** You have the right to request deletion of your account and all associated personal data. See Section 8 for details.",
      "**Withdraw Consent:** You may withdraw consent for Aadhaar verification at any time by contacting us.",
      "**Opt-Out:** You can opt out of non-essential communications through your notification settings.",
      "To exercise any of these rights, email us at " + DEVELOPER_EMAIL,
    ],
  },
  {
    title: "8. Account & Data Deletion",
    content: [
      "You have the right to request permanent deletion of your DelhiGhar account and all associated personal data.",
      "**How to request deletion:** Send an email to " + DEVELOPER_EMAIL + " with the subject line 'Account Deletion Request', including your registered email address and phone number.",
      "Alternatively, you can use the Contact Us page within the app and select 'Account Deletion Request' as the subject.",
      "We will process your request within 30 days and confirm deletion via email.",
      "After deletion: your account, listings, saved properties, and personal information will be permanently removed. Transaction records may be retained for up to 7 years as required by financial regulations.",
      "Pending escrow payments will be settled before account deletion is processed.",
    ],
  },
  {
    title: "9. Data Retention",
    content: [
      "We retain your personal data for as long as your account is active or as needed to provide our services.",
      "After account deletion, personal data is permanently removed within 30 days.",
      "Transaction and payment records may be retained for up to 7 years as required by Indian financial regulations.",
    ],
  },
  {
    title: "10. Children's Privacy",
    content: [
      "DelhiGhar is not intended for users under 18 years of age. We do not knowingly collect personal data from minors.",
      "If we discover that a minor has provided personal information, it will be deleted promptly. If you believe a minor has registered, contact us immediately at " + DEVELOPER_EMAIL,
    ],
  },
  {
    title: "11. Third-Party Services",
    content: [
      "DelhiGhar integrates with the following third-party services, each governed by their own privacy policies:",
      "**Razorpay** — Payment processing (razorpay.com/privacy)",
      "**Firebase (Google)** — Authentication and cloud storage (firebase.google.com/support/privacy)",
      "**Google Maps** — Location and map links (policies.google.com/privacy)",
      "We are not responsible for the privacy practices of these third-party services.",
    ],
  },
  {
    title: "12. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of material changes via email or an in-app notice at least 7 days before the change takes effect.",
      "Your continued use of DelhiGhar after the effective date of any update constitutes acceptance of the revised policy.",
      "We encourage you to review this page periodically for the latest information.",
    ],
  },
  {
    title: "13. Contact & Grievance Officer",
    content: [
      "For any privacy-related questions, complaints, or requests:",
      "**Developer / Grievance Officer:** " + DEVELOPER_NAME,
      "**Email:** " + DEVELOPER_EMAIL,
      "**Phone:** " + DEVELOPER_PHONE,
      "**Response Time:** We aim to respond to all privacy inquiries within 7 business days.",
    ],
  },
];

function renderLine(item: string) {
  const boldMatch = item.match(/^\*\*(.*?)\*\*(.*)$/);
  if (boldMatch) {
    return (
      <span>
        <strong className="text-foreground font-semibold">{boldMatch[1]}</strong>
        {boldMatch[2]}
      </span>
    );
  }
  return <span className="flex gap-2"><span className="text-primary mt-1 shrink-0">•</span><span>{item}</span></span>;
}

export function PrivacyPolicy() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-10">
      <div className="bg-secondary px-5 pt-12 pb-8 text-white">
        <Link href="/" data-testid="button-back" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6">
          <ArrowLeft size={18} />
          Back
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-primary" />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-white/70 text-sm">Effective Date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="px-5 pt-6">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-5">
          <p className="text-sm text-foreground leading-relaxed">
            At <strong>DelhiGhar</strong>, your privacy matters deeply. This policy explains what data we collect, how we use it, and your rights. By using DelhiGhar, you agree to this policy.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-foreground text-base mb-3">{section.title}</h2>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {renderLine(item)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            © {CURRENT_YEAR} {DEVELOPER_NAME}. All rights reserved.{"\n"}
            Unauthorized reproduction or distribution of this app's content is prohibited.
          </p>
          <p className="text-xs text-center text-muted-foreground mt-2">
            App Version 1.0.0 · Made in India 🇮🇳
          </p>
        </div>

        <div className="mt-4 text-center pb-4">
          <Link href="/contact" className="text-primary text-sm font-medium" data-testid="link-contact-us">
            Questions? Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
}
