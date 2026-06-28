import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "**Personal Information:** When you create an account or post a listing, we collect your name, email address, phone number, and any other information you voluntarily provide.",
      "**Property Listing Data:** Details about properties you list, including address, rent, photos, and amenities.",
      "**Verification Documents:** If you opt into Aadhaar verification, we collect and securely process the document image solely for identity verification.",
      "**Usage Data:** We automatically collect information such as IP address, browser type, device information, pages visited, and time spent on the platform to improve our services.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To create and manage your account.",
      "To display and manage property listings on the platform.",
      "To facilitate communication between property seekers and owners.",
      "To verify the identity of property owners (with your consent).",
      "To process escrow payments securely.",
      "To send you service-related notifications and updates.",
      "To detect and prevent fraud, spam, and misuse of the platform.",
      "To improve our platform, features, and user experience.",
    ],
  },
  {
    title: "3. Information Sharing",
    content: [
      "**We do not sell your personal data.** We never sell, rent, or trade your personal information to third parties for marketing purposes.",
      "**Property Seekers:** Your phone number is only revealed when a property seeker explicitly requests to view it. This is disclosed to you during listing creation.",
      "**Service Providers:** We share data with trusted third-party service providers (such as payment processors and cloud storage) who assist us in operating the platform, under strict confidentiality agreements.",
      "**Legal Compliance:** We may disclose information if required by law, court order, or to protect the rights and safety of DelhiGhar, our users, or the public.",
    ],
  },
  {
    title: "4. Escrow Payments",
    content: [
      "Payment processing is handled by Razorpay, a PCI-DSS compliant payment gateway. DelhiGhar does not store your full card details.",
      "Escrow funds are held securely and released to property owners only after the buyer confirms a satisfactory property visit.",
      "Refund policies apply as described in our Escrow Terms. Full refunds are issued if a property visit is cancelled before it occurs or if a fraud report is confirmed.",
    ],
  },
  {
    title: "5. Data Security",
    content: [
      "We implement industry-standard security measures including SSL/TLS encryption, secure servers, and access controls to protect your personal information.",
      "Aadhaar documents are stored with end-to-end encryption and are accessible only to authorized administrators for verification purposes.",
      "While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.",
    ],
  },
  {
    title: "6. Cookies and Tracking",
    content: [
      "We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze platform usage.",
      "You can control cookie settings through your browser. Disabling cookies may affect certain features of the platform.",
    ],
  },
  {
    title: "7. Your Rights",
    content: [
      "**Access:** You have the right to request a copy of the personal information we hold about you.",
      "**Correction:** You can update or correct inaccurate information through your account settings or by contacting us.",
      "**Deletion:** You may request deletion of your account and associated data, subject to legal and operational requirements.",
      "**Opt-Out:** You can opt out of non-essential communications by updating your notification preferences.",
      "To exercise any of these rights, please contact us at privacy@delhighar.in",
    ],
  },
  {
    title: "8. Data Retention",
    content: [
      "We retain your personal data for as long as your account is active or as necessary to provide our services.",
      "After account deletion, certain data may be retained for up to 90 days for security and fraud prevention purposes, after which it is permanently deleted.",
      "Transaction and payment records may be retained for up to 7 years as required by financial regulations.",
    ],
  },
  {
    title: "9. Children's Privacy",
    content: [
      "DelhiGhar is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will take steps to delete it promptly.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or a prominent notice on the platform.",
      "Your continued use of DelhiGhar after any changes constitutes your acceptance of the updated Privacy Policy.",
    ],
  },
  {
    title: "11. Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:",
      "**Email:** privacy@delhighar.in",
      "**Address:** DelhiGhar Technologies Pvt. Ltd., New Delhi, India",
      "**Response Time:** We aim to respond to all privacy-related inquiries within 7 business days.",
    ],
  },
];

export function PrivacyPolicy() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-8">
      <div className="bg-secondary px-5 pt-12 pb-8 text-white">
        <Link href="/" data-testid="button-back" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6">
          <ArrowLeft size={18} />
          Back
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-primary" />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-white/70 text-sm">Last updated: June 28, 2025</p>
      </div>

      <div className="px-5 pt-6">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6">
          <p className="text-sm text-foreground leading-relaxed">
            At DelhiGhar, your privacy is our priority. This policy explains how we collect, use, and protect your personal information when you use our platform. Please read it carefully.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-foreground text-base mb-3">{section.title}</h2>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {item.startsWith("**") ? (
                      <span>
                        <strong className="text-foreground font-semibold">
                          {item.match(/\*\*(.*?)\*\*/)?.[1]}
                        </strong>
                        {item.replace(/\*\*(.*?)\*\*/, "")}
                      </span>
                    ) : (
                      <span className="flex gap-2">
                        <span className="text-primary mt-1 shrink-0">•</span>
                        <span>{item}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/contact" className="text-primary text-sm font-medium" data-testid="link-contact-us">
            Have questions? Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
}
