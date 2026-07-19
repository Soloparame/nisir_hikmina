/** Authoritative English privacy & medical disclaimer content for /privacy */

export type PolicyBulletSection = {
  id: string;
  title: string;
  intro?: string;
  bullets?: string[];
  paragraphs?: string[];
  closing?: string[];
  subsections?: {
    title: string;
    intro?: string;
    bullets?: string[];
    paragraphs?: string[];
    closing?: string[];
  }[];
};

export const PRIVACY_LAST_UPDATED = "July 19, 2026";

export const PRIVACY_INTRO = [
  "At Eagle Medical Care, we are committed to protecting your privacy and keeping your personal information secure. This Privacy Policy explains how we collect, use, store, protect, and share information when you use our website, platform, and healthcare-related services.",
  "By using Eagle Medical Care, you acknowledge that you have read and understood this Privacy Policy.",
] as const;

export const PRIVACY_SECTIONS: PolicyBulletSection[] = [
  {
    id: "about",
    title: "1. About Eagle Medical Care",
    paragraphs: [
      "Eagle Medical Care is a digital healthcare platform that helps patients connect with healthcare professionals and access healthcare-related services.",
    ],
    intro: "Our platform may allow users to:",
    bullets: [
      "Create and manage accounts",
      "Create professional profiles",
      "Find healthcare professionals",
      "Book and manage appointments",
      "Communicate with healthcare professionals",
      "Share relevant health information",
      "Upload images and documents",
      "Access healthcare-related services and information",
    ],
    closing: [
      "This Privacy Policy applies to patients, healthcare professionals, visitors, and other users of Eagle Medical Care.",
    ],
  },
  {
    id: "collect",
    title: "2. Information We Collect",
    paragraphs: [
      "We may collect different types of information depending on how you use our platform.",
    ],
    subsections: [
      {
        title: "2.1 Account Information",
        intro: "When you create an account, we may collect:",
        bullets: [
          "Full name",
          "Email address",
          "Phone number",
          "Password or authentication information",
          "Date of birth, where necessary",
          "Profile picture",
          "Account type, such as patient or healthcare professional",
        ],
      },
      {
        title: "2.2 Healthcare Professional Information",
        intro: "Healthcare professionals may provide:",
        bullets: [
          "Professional name",
          "Medical specialty",
          "Qualifications and certifications",
          "License or registration information",
          "Professional experience",
          "Professional biography",
          "Profile photo",
          "Availability",
          "Consultation fees",
          "Other information necessary to verify their professional profile",
        ],
      },
      {
        title: "2.3 Patient and Health Information",
        intro:
          "Depending on the services you use, patients may provide information such as:",
        bullets: [
          "Medical history",
          "Symptoms",
          "Health concerns",
          "Medical documents",
          "Medical images",
          "Prescription-related information",
          "Appointment information",
          "Communications with healthcare professionals",
        ],
        closing: [
          "Health information is sensitive information. We only use such information for legitimate purposes related to providing and improving our services and in accordance with applicable laws.",
        ],
      },
      {
        title: "2.4 Communications",
        intro:
          "If you communicate through Eagle Medical Care, we may process information contained in:",
        bullets: [
          "Messages",
          "Appointment communications",
          "Support requests",
          "Feedback",
          "Other communications sent through the platform",
        ],
      },
      {
        title: "2.5 Technical Information",
        intro:
          "When you use our platform, we may automatically collect certain technical information, including:",
        bullets: [
          "IP address",
          "Browser type",
          "Device information",
          "Operating system",
          "Usage information",
          "Log information",
          "General information about how you interact with the platform",
        ],
        closing: [
          "This information helps us maintain security, improve performance, and understand how our platform is used.",
        ],
      },
    ],
  },
  {
    id: "use",
    title: "3. How We Use Your Information",
    intro: "We may use personal information to:",
    bullets: [
      "Create and manage user accounts",
      "Provide and operate Eagle Medical Care services",
      "Connect patients with healthcare professionals",
      "Manage appointments",
      "Facilitate communication between users",
      "Process and manage healthcare-related services",
      "Verify healthcare professional information",
      "Improve the security and functionality of the platform",
      "Respond to questions and support requests",
      "Detect and prevent fraud, abuse, and unauthorized activity",
      "Comply with legal and regulatory requirements",
      "Improve our services and user experience",
    ],
    closing: [
      "We do not use your health information for purposes unrelated to the services we provide without an appropriate legal basis or permission where required.",
    ],
  },
  {
    id: "sharing",
    title: "4. Sharing of Information",
    paragraphs: ["We do not sell your personal information."],
    intro:
      "We may share information in limited circumstances, including:",
    subsections: [
      {
        title: "With Healthcare Professionals",
        paragraphs: [
          "When necessary to provide healthcare services, relevant information may be shared between patients and healthcare professionals through the platform.",
        ],
      },
      {
        title: "With Service Providers",
        intro:
          "We may use trusted third-party service providers to help operate our platform, such as providers for:",
        bullets: [
          "Hosting",
          "Database services",
          "Authentication",
          "Cloud storage",
          "Communication",
          "Payment processing",
          "Security",
          "Technical infrastructure",
        ],
        closing: [
          "These service providers may only access information necessary to provide their services to us.",
        ],
      },
      {
        title: "For Legal and Safety Reasons",
        intro:
          "We may disclose information where reasonably necessary to:",
        bullets: [
          "Comply with applicable law",
          "Respond to valid legal requests",
          "Protect the safety of users",
          "Prevent fraud or abuse",
          "Protect the rights and security of Eagle Medical Care",
        ],
      },
    ],
  },
  {
    id: "protect",
    title: "5. How We Protect Your Information",
    intro:
      "We take reasonable technical and organizational measures to protect personal information from:",
    bullets: [
      "Unauthorized access",
      "Unauthorized disclosure",
      "Loss",
      "Misuse",
      "Alteration",
      "Destruction",
    ],
    closing: [
      "However, no online system can be guaranteed to be completely secure.",
      "Users are also responsible for protecting their account credentials and should immediately notify us if they believe their account has been compromised.",
    ],
  },
  {
    id: "retention",
    title: "6. Data Retention",
    intro:
      "We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including:",
    bullets: [
      "Providing our services",
      "Maintaining business and platform records",
      "Meeting legal obligations",
      "Resolving disputes",
      "Preventing fraud and abuse",
      "Enforcing our agreements",
    ],
    closing: [
      "When information is no longer necessary, we may delete it, anonymize it, or securely dispose of it where appropriate.",
    ],
  },
  {
    id: "rights",
    title: "7. Your Privacy Rights",
    intro:
      "Depending on applicable law, you may have rights regarding your personal information, including the right to:",
    bullets: [
      "Request access to your personal information",
      "Request correction of inaccurate information",
      "Request deletion of information where legally permitted",
      "Withdraw consent where processing is based on consent",
      "Ask questions about how your information is used",
    ],
    closing: [
      "To make a privacy-related request, contact us using the contact information provided below.",
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies and Similar Technologies",
    intro: "Eagle Medical Care may use cookies and similar technologies to:",
    bullets: [
      "Maintain user sessions",
      "Remember preferences",
      "Improve platform functionality",
      "Understand platform usage",
      "Improve security",
    ],
    closing: [
      "You may be able to control cookies through your browser settings. Disabling certain cookies may affect some platform functionality.",
    ],
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    paragraphs: [
      "Eagle Medical Care is not intended for individuals who are not legally permitted to use the services under applicable law.",
      "We do not knowingly collect personal information from children in violation of applicable legal requirements.",
      "If you believe that a child has provided personal information to us improperly, please contact us.",
    ],
  },
  {
    id: "third-party",
    title: "10. Third-Party Services and Links",
    paragraphs: [
      "Our platform may contain links to third-party websites, services, or applications.",
      "We are not responsible for the privacy practices or content of third-party services.",
      "We encourage users to review the privacy policies of third-party services before providing personal information.",
    ],
  },
  {
    id: "changes",
    title: "11. Changes to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time.",
      "When we make important changes, we may provide notice through the platform or other appropriate means.",
      'The updated Privacy Policy will include a new "Last Updated" date.',
      "Your continued use of Eagle Medical Care after changes become effective means that you acknowledge the updated Privacy Policy.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact Us",
    paragraphs: [
      "If you have questions about this Privacy Policy or how we handle personal information, please contact us:",
    ],
  },
];

export const MEDICAL_DISCLAIMER_INTRO =
  "Important information about the limits of Eagle Medical Care as a technology platform.";

export const MEDICAL_DISCLAIMER_SECTIONS: PolicyBulletSection[] = [
  {
    id: "disclaimer-platform",
    title: "1. Eagle Medical Care Is a Technology Platform",
    paragraphs: [
      "Eagle Medical Care is a technology platform designed to help patients connect with healthcare professionals and access healthcare-related services.",
      "Eagle Medical Care itself does not replace a hospital, clinic, emergency service, or licensed healthcare professional.",
    ],
  },
  {
    id: "disclaimer-emergency",
    title: "2. No Emergency Medical Service",
    paragraphs: [
      "Eagle Medical Care is not an emergency medical service.",
      "If you are experiencing a medical emergency, a life-threatening condition, severe symptoms, or any situation requiring immediate medical attention, do not rely on the Eagle Medical Care platform.",
      "You should immediately contact the appropriate emergency services or visit the nearest emergency medical facility.",
    ],
  },
  {
    id: "disclaimer-responsibility",
    title: "3. Healthcare Professional Responsibility",
    paragraphs: [
      "Healthcare professionals using Eagle Medical Care are responsible for the professional services, advice, diagnosis, and treatment they provide.",
      "The healthcare professional is responsible for exercising independent professional judgment and providing services in accordance with applicable professional standards and laws.",
      "Eagle Medical Care does not independently guarantee or endorse every diagnosis, treatment recommendation, or professional opinion provided through the platform.",
    ],
  },
  {
    id: "disclaimer-outcomes",
    title: "4. No Guarantee of Medical Outcomes",
    paragraphs: [
      "Medical conditions and treatment outcomes vary between individuals.",
    ],
    intro: "Eagle Medical Care does not guarantee:",
    bullets: [
      "A specific diagnosis",
      "A particular treatment result",
      "A specific medical outcome",
      "The availability of a particular healthcare professional",
      "That every healthcare service will meet a user's expectations",
    ],
  },
  {
    id: "disclaimer-general",
    title: "5. General Health Information",
    paragraphs: [
      "Information available through Eagle Medical Care may be provided for general informational and educational purposes.",
      "General health information should not be considered a substitute for professional medical advice, diagnosis, or treatment.",
      "You should consult a qualified healthcare professional regarding your individual medical condition.",
    ],
  },
  {
    id: "disclaimer-delay",
    title: "6. Do Not Delay Medical Care",
    paragraphs: [
      "You should never delay seeking professional medical care or disregard professional medical advice because of information obtained through Eagle Medical Care.",
      "If you believe you may have a medical emergency, seek immediate emergency medical assistance.",
    ],
  },
  {
    id: "disclaimer-acceptance",
    title: "7. Acceptance",
    paragraphs: [
      "By using Eagle Medical Care, you acknowledge that you have read and understood this Medical Disclaimer.",
      "If you do not agree with this disclaimer, you should not use the healthcare-related services provided through the platform.",
    ],
  },
];
