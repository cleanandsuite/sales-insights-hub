import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">SellSig Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: January 9, 2026</p>

          <p className="text-foreground leading-relaxed">
            SellSig Inc. ("SellSig," "we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, platform, and services (the "Service"). By using the Service, you consent to the practices described here.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <ul className="list-disc pl-6 text-foreground space-y-2">
            <li><strong>Personal Information:</strong> Name, email, phone (account creation), company/role (optional).</li>
            <li><strong>Payment Information:</strong> Processed via Stripe (card details never stored by us).</li>
            <li><strong>Usage Data:</strong> IP address, browser type, device info, usage patterns.</li>
            <li><strong>User Content:</strong> Audio recordings, transcripts, CRM tokens (encrypted), leads (PII: names, emails, phones, budgets).</li>
            <li><strong>Third-Party Data:</strong> From integrations (e.g., Salesforce tokens you provide).</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. How We Collect Information</h2>
          <ul className="list-disc pl-6 text-foreground space-y-2">
            <li>Directly from you (signup, uploads).</li>
            <li>Automatically (cookies, analytics).</li>
            <li>From third parties (AssemblyAI, OpenAI for transcription/analysis).</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-foreground space-y-2">
            <li>Provide/improve Service (transcription, AI coaching).</li>
            <li>Process payments/subscriptions.</li>
            <li>Communicate updates/support.</li>
            <li>Anonymized aggregates for AI training/improvements.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Sharing Your Information</h2>
          <p className="text-foreground leading-relaxed font-semibold mb-3">
            We do not sell your data. We share:
          </p>
          <ul className="list-disc pl-6 text-foreground space-y-2">
            <li>With service providers (Supabase, Stripe, AssemblyAI, OpenAI) under strict contracts.</li>
            <li>For legal compliance (subpoenas, court orders).</li>
            <li>In business transfers (merger/sale).</li>
            <li>Anonymized data for research/analytics.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Data Security</h2>
          <p className="text-foreground leading-relaxed">
            We implement encryption (at rest/transit), access controls (RLS, JWT), and monitoring. Tokens encrypted with rotation. No system is 100% secure—you assume residual risk.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Your Rights</h2>
          <ul className="list-disc pl-6 text-foreground space-y-2">
            <li>Access, correct, delete data (email <a href="mailto:support@sellsig.com" className="text-primary hover:underline">support@sellsig.com</a>).</li>
            <li>Opt-out of marketing.</li>
            <li>CCPA/GDPR rights (request deletion, opt-out of sale—though we do not sell).</li>
            <li>Response within 30-45 days.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Data Retention</h2>
          <ul className="list-disc pl-6 text-foreground space-y-2">
            <li><strong>Account data:</strong> While active + 30 days post-termination.</li>
            <li><strong>Recordings:</strong> Until deleted or account closed.</li>
            <li><strong>Anonymized aggregates:</strong> Indefinite for improvements.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Children's Privacy</h2>
          <p className="text-foreground leading-relaxed">
            Service not for under 16. No knowing collection from children.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Changes to Policy</h2>
          <p className="text-foreground leading-relaxed">
            We may update (email notice). Continued use = acceptance.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Contact</h2>
          <p className="text-foreground leading-relaxed">
            Questions:{" "}
            <a href="mailto:privacy@sellsig.com" className="text-primary hover:underline">privacy@sellsig.com</a>
            {" "}or{" "}
            <a href="mailto:legal@sellsig.com" className="text-primary hover:underline">legal@sellsig.com</a>.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Governing Law</h2>
          <p className="text-foreground leading-relaxed">
            Delaware law. Disputes via arbitration (see{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>).
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground">
              By using SellSig, you accept this Privacy Policy.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
