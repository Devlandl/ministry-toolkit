import Link from "next/link";

const features = [
  {
    emoji: "📖",
    title: "Sermon Outlines",
    description:
      "Full sermon structure with intro hook, 3 main points, illustrations, and altar call.",
  },
  {
    emoji: "🎯",
    title: "Object Lessons",
    description:
      "Hands-on activities that make Bible concepts tangible. Props list and step-by-step instructions included.",
  },
  {
    emoji: "💬",
    title: "Discussion Questions",
    description:
      "5-7 ready-to-use questions for small groups, Bible studies, or classroom discussion.",
  },
  {
    emoji: "🙏",
    title: "Prayer Points",
    description:
      "Guided prayer prompts tied to the verse or topic. Ready for corporate or personal prayer.",
  },
  {
    emoji: "👶",
    title: "Kids Version",
    description:
      "Age-appropriate lesson with simple language and a craft or activity idea.",
  },
  {
    emoji: "📁",
    title: "Save & Organize",
    description:
      "Build a personal library with folders, tags, and search. Export to PDF or share with your team.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Ministry Toolkit",
            applicationCategory: "ReligiousApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "AI-powered sermon and lesson creator for church leaders. Enter a verse or topic, get a complete teaching toolkit.",
          }),
        }}
      />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-6xl mb-6 block">✝️</span>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-white mb-4">
            Ministry Toolkit
          </h1>
          <p className="text-xl text-brand-muted mb-2 max-w-2xl mx-auto">
            AI-powered sermon and lesson creator for church leaders.
          </p>
          <p className="text-lg text-brand-gold mb-4">
            Enter a verse or topic. Get a complete teaching toolkit.
          </p>
          <p className="text-sm text-brand-muted mb-8">
            Created by Anthony Talton
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-brand-gold text-brand-black font-bold rounded-xl text-lg hover:bg-brand-gold-light transition-colors"
            >
              Get Started - It&apos;s Free
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 border border-brand-border text-brand-white font-medium rounded-xl text-lg hover:border-brand-gold/30 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-brand-white mb-8">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="flex-1">
            <span className="text-4xl mb-3 block">1️⃣</span>
            <h3 className="font-semibold text-brand-white mb-1">
              Enter a verse or topic
            </h3>
            <p className="text-brand-muted text-sm">
              Type &quot;John 3:16&quot; or &quot;forgiveness&quot; or &quot;faith during trials&quot;
            </p>
          </div>
          <div className="flex-1">
            <span className="text-4xl mb-3 block">2️⃣</span>
            <h3 className="font-semibold text-brand-white mb-1">
              Pick your audience
            </h3>
            <p className="text-brand-muted text-sm">
              Adults, Youth/Teens, or Kids
            </p>
          </div>
          <div className="flex-1">
            <span className="text-4xl mb-3 block">3️⃣</span>
            <h3 className="font-semibold text-brand-white mb-1">
              Get your toolkit
            </h3>
            <p className="text-brand-muted text-sm">
              Sermon outline, object lesson, discussion questions, prayer points, and kids version
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-brand-white text-center mb-12">
          Everything in One Generation
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-brand-card border border-brand-border rounded-xl p-6"
            >
              <span className="text-3xl mb-3 block">{feature.emoji}</span>
              <h3 className="text-lg font-semibold text-brand-white mb-2">
                {feature.title}
              </h3>
              <p className="text-brand-muted text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free callout */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-brand-card border border-brand-gold/30 rounded-2xl p-8 max-w-sm mx-auto">
          <p className="text-brand-gold text-sm font-medium mb-2">
            ALWAYS FREE
          </p>
          <p className="text-5xl font-bold text-brand-white mb-2">$0</p>
          <p className="text-brand-muted mb-6">
            Free forever. A gift for those who serve.
          </p>
          <Link
            href="/sign-up"
            className="block w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-brand-gold-light transition-colors"
          >
            Start Creating
          </Link>
        </div>
      </section>

      {/* TVR badge */}
      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-brand-muted text-sm">
          Available on the{" "}
          <a
            href="https://tvrapp.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:text-brand-gold-light"
          >
            TVR App Store
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border py-8 text-center">
        <p className="text-brand-muted text-sm">
          &copy; {new Date().getFullYear()} Ministry Toolkit. A TVR App Store
          Product.
        </p>
      </footer>
    </div>
  );
}
