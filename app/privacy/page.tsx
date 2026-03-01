import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for prompt it.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-6 py-24">
        <div className="max-w-3xl mx-auto prose-custom">
          <h1 className="text-3xl font-bold tracking-tight mb-8">
            Privacy Policy
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Last updated: March 1, 2026
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            1. Information We Collect
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            When you sign in with Google, we receive your email address and
            basic profile information. We also collect usage data such as prompts
            generated and ratings you provide. Payment information is processed
            directly by Stripe — we do not store your card details on our
            servers.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            2. How We Use Your Data
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            We use your data to provide and operate the service, process
            payments, track your coin balance, and improve the product. We do
            not sell your personal information to third parties.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            3. Third-Party Services
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            prompt it relies on the following third-party services, each of
            which processes data according to their own privacy policies:
          </p>
          <ul className="text-white/60 text-sm leading-relaxed mb-6 list-disc list-inside space-y-1">
            <li>
              <strong>Supabase</strong> — database and authentication
            </li>
            <li>
              <strong>Stripe</strong> — payment processing
            </li>
            <li>
              <strong>Anthropic</strong> — AI prompt generation
            </li>
            <li>
              <strong>Vercel</strong> — hosting and deployment
            </li>
            <li>
              <strong>Google</strong> — OAuth sign-in
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-8 mb-3">4. Cookies</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            We use a minimal number of cookies. Supabase authentication cookies
            are required for the service to function and keep you signed in. We
            also use a referral tracking cookie that expires after 30 days. We
            do not use advertising or analytics cookies.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            5. Data Retention
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Your account data is kept for as long as your account exists. Prompt
            history is stored so you can access it within the app. If you delete
            your account, your data will be removed from our systems.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">6. Your Rights</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            You have the right to request an export of your data, request
            deletion of your account and associated data, or ask questions about
            how your data is handled. To exercise any of these rights, contact
            us at the email below.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">7. Security</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            We use industry-standard security measures to protect your data,
            including encrypted connections (HTTPS) and secure authentication
            flows. However, no method of transmission over the internet is 100%
            secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            8. Changes to This Policy
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date. We encourage you to review
            this policy periodically.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">9. Contact</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            If you have questions about this Privacy Policy, please reach out
            at{" "}
            <a
              href="mailto:hello@tadeasn.com"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              hello@tadeasn.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
