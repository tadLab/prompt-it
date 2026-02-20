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
          <p className="text-white/30 text-sm">
            Works with ChatGPT, Claude, Gemini and other AI models
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
