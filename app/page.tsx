import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="badge inline-block mb-6">✨ AI-Powered Prompt Engineering</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            BUILD BETTER PROMPTS.
            <br />
            GET BETTER AI RESULTS.
          </h1>
          <p className="text-white/60 text-lg mb-2">
            Engineer prompts that AI actually understands.
          </p>
          <p className="text-white/50 text-base mb-10">
            We turn your idea into a structured prompt and recommend the best AI model for it.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <Link href="/builder" className="btn-primary inline-flex items-center gap-2">
              Build my prompt <span className="text-lg">→</span>
            </Link>
            <Link href="/example" className="btn-secondary">
              See example
            </Link>
          </div>
          {/* How it works */}
          <div className="grid grid-cols-3 gap-6 mt-16 mb-8 max-w-lg mx-auto">
            {[
              { step: "1", label: "Describe", desc: "Tell us what you need" },
              { step: "2", label: "Generate", desc: "AI builds your prompt" },
              { step: "3", label: "Use", desc: "Copy & paste into any AI" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-2 text-emerald-400 text-sm font-bold">
                  {item.step}
                </div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-sm">
            Works with ChatGPT, Claude, Gemini and other AI models
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
