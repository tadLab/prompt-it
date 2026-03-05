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
            Last updated: March 5, 2026
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            1. Information We Collect
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            prompt it does not require an account or collect personal
            information. We collect only the prompt inputs you provide during
            generation, which are sent to our AI provider to generate your
            prompt. Prompt history is stored locally in your browser.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            2. How We Use Your Data
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Your prompt inputs are sent to our AI provider solely to generate
            your structured prompt. We do not store, sell, or share your
            inputs with third parties beyond what is necessary to operate the
            service.
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
              <strong>Anthropic</strong> — AI prompt generation
            </li>
            <li>
              <strong>Vercel</strong> — hosting and deployment
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-8 mb-3">4. Cookies</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            We use minimal cookies required for the service to function. We
            do not use advertising or third-party analytics cookies.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            5. Data Retention
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Your prompt history is stored only in your browser&apos;s local
            storage. We do not retain prompt data on our servers after
            generation is complete.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">
            6. Changes to This Policy
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date.
          </p>

          <h2 className="text-lg font-semibold mt-8 mb-3">7. Contact</h2>
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
