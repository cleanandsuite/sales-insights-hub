import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-2">SellSig Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: January 9, 2026</p>

          <p className="text-foreground leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the SellSig website, platform, and related services (collectively, the "Service") operated by SellSig Inc. ("SellSig," "we," "us," or "our"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Eligibility and Account Registration</h2>
          <p className="text-foreground leading-relaxed">
            You must be at least 18 years old to use the Service. By creating an account, you represent that you meet this requirement and that all information you provide is accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. We reserve the right to refuse or terminate accounts at our sole discretion.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. License to Use the Service</h2>
          <p className="text-foreground leading-relaxed">
            We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal or internal business purposes, subject to these Terms. You may not: (i) modify, disassemble, decompile, or reverse engineer the Service; (ii) rent, lease, resell, or distribute the Service; (iii) use automated tools, bots, or scrapers to access or extract data; or (iv) use the Service for illegal activities or to violate third-party rights.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Content Ownership and Intellectual Property</h2>
          
          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Our Content</h3>
          <p className="text-foreground leading-relaxed">
            All content, features, AI-generated outputs, coaching suggestions, insights, logos, code, and materials in the Service ("Our Content") are owned by SellSig or its licensors. You are granted a limited license to view and use Our Content solely within the Service. You may not copy, reproduce, distribute, create derivative works, or publicly display Our Content without express written permission. Violation constitutes infringement, and we will pursue all legal remedies, including injunctions and damages.
          </p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Your Content</h3>
          <p className="text-foreground leading-relaxed">
            You retain ownership of your recordings, transcripts, and inputs ("Your Content"). By uploading Your Content, you grant us a perpetual, worldwide, royalty-free license to store, process, analyze, and use it (including anonymized aggregates) to provide and improve the Service. We may delete Your Content after account termination.
          </p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Extra Protections</h3>
          <p className="text-foreground leading-relaxed">
            You agree not to use any method to circumvent protections on Our Content, including AI scraping or data mining. All AI outputs are protected by copyright and trade secrets—resale or commercial use prohibited. We employ monitoring and watermarking to detect misuse.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. User Conduct and Prohibitions</h2>
          <p className="text-foreground leading-relaxed">
            You agree not to: (i) upload harmful, illegal, or infringing content; (ii) interfere with the Service's operation; (iii) impersonate others; or (iv) harvest data for competitive purposes. We may monitor usage to enforce these Terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Payment Terms</h2>
          <p className="text-foreground leading-relaxed">
            Subscriptions are billed monthly via Stripe. You authorize recurring payments. No refunds except as required by law. We may change pricing with 30 days' notice. Taxes are your responsibility. Late payments may result in suspension.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Data Protection and Privacy</h2>
          <p className="text-foreground leading-relaxed">
            We comply with applicable data protection laws (e.g., GDPR, CCPA). Your Content is encrypted at rest and in transit. We use industry-standard security, but no system is impenetrable—you assume risk of breaches. See our Privacy Policy for details. Extra: Tokens/credentials are encrypted with rotating keys; access audited. No data shared without consent except for Service delivery.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Disclaimers and Limitations of Liability</h2>
          <p className="text-foreground leading-relaxed uppercase font-medium">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES. AI OUTPUTS ARE ADVISORY ONLY—ACCURACY NOT GUARANTEED (E.G., 80-95% BASED ON BENCHMARKS). WE DISCLAIM ALL LIABILITY FOR ERRORS, LOSSES, OR DAMAGES ARISING FROM USE. OUR TOTAL LIABILITY SHALL NOT EXCEED FEES PAID IN THE LAST 12 MONTHS. NO INDIRECT DAMAGES (E.G., LOST PROFITS). EXTRA: YOU INDEMNIFY US AGAINST CLAIMS FROM YOUR MISUSE, INCLUDING THIRD-PARTY IP INFRINGEMENT OR DATA BREACHES CAUSED BY YOUR NEGLIGENCE.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Indemnification</h2>
          <p className="text-foreground leading-relaxed">
            You agree to indemnify and hold us harmless from any claims, losses, or damages arising from your use of the Service, violation of Terms, or infringement of rights.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Termination</h2>
          <p className="text-foreground leading-relaxed">
            We may terminate your access for any reason, with or without notice. Upon termination, your license ends, and we may delete Your Content after 30 days.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Governing Law and Dispute Resolution</h2>
          <p className="text-foreground leading-relaxed">
            Governed by Delaware law. Disputes resolved via binding arbitration in Delaware (AAA rules)—no class actions. You waive jury trial rights.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Miscellaneous</h2>
          <ul className="list-disc pl-6 text-foreground space-y-2">
            <li><strong>Severability:</strong> Invalid provisions do not affect others.</li>
            <li><strong>Force Majeure:</strong> No liability for uncontrollable events.</li>
            <li><strong>Changes:</strong> We may update Terms (email notice). Continued use = acceptance.</li>
            <li><strong>Entire Agreement:</strong> These Terms supersede prior agreements.</li>
          </ul>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-foreground">
              <strong>Contact:</strong>{" "}
              <a href="mailto:legal@sellsig.com" className="text-primary hover:underline">
                legal@sellsig.com
              </a>
            </p>
            <p className="text-muted-foreground mt-2">
              By using SellSig, you accept these Terms.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default TermsOfService;
