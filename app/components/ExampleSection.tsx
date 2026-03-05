import Link from "next/link";

export default function ExampleSection() {
  return (
    <section id="example" className="scroll-mt-20 py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="badge inline-block mb-4">See the difference</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            WHY STRUCTURED PROMPTS WORK BETTER
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            Compare a vague prompt with a structured one — the difference in AI output is dramatic.
          </p>
        </div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Before */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-400 font-bold text-lg">✗</span>
              <h3 className="text-lg font-semibold">before</h3>
            </div>
            <div className="glass-card p-6 min-h-[200px] mb-6">
              <p className="text-white/70">Write a blog post on my idea.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">
                Problems:
              </h4>
              <ul className="space-y-2">
                {[
                  'Too vague - AI doesn\'t know what "my idea" is',
                  "No context or target audience specified",
                  "Missing tone, style, and format requirements",
                  "Results will be generic and unusable",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/50">
                    <span className="text-red-400 mt-0.5">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* After */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-emerald-400 font-bold text-lg">✓</span>
              <h3 className="text-lg font-semibold">after</h3>
            </div>
            <div className="glass-card-bright p-6 min-h-[200px] mb-6 space-y-4">
              {[
                {
                  heading: "### Role",
                  text: "Act as an expert copywriter specializing in SaaS product launches.",
                },
                {
                  heading: "### Goal",
                  text: "Write a blog post announcing a new AI-powered productivity tool.",
                },
                {
                  heading: "### Context",
                  text: '"Target audience: project managers at mid-size companies. Tone: professional but approachable."',
                },
                {
                  heading: "### Output format",
                  text: "Blog post with heading, 3-4 sections, and a clear CTA. Around 800 words.",
                },
                {
                  heading: "### Requirements",
                  text: "Include real-world examples. Avoid jargon. Focus on benefits over features.",
                },
              ].map((section, i) => (
                <div key={i}>
                  <h4 className="text-emerald-400 text-sm font-bold mb-1">
                    {section.heading}
                  </h4>
                  <p className="text-white/80 text-sm">{section.text}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3">
                Benefits:
              </h4>
              <ul className="space-y-2">
                {[
                  "Clear role and expertise defined",
                  "Specific goal and target audience",
                  "Exact format and length requirements",
                  "Gets you high-quality, usable results",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/50">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/50 mb-4">
            Ready to create your own structured prompt?
          </p>
          <Link href="/builder" className="btn-primary inline-flex items-center gap-2">
            Build my prompt <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
