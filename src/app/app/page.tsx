"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Audience = "adults" | "youth" | "kids";

interface ToolkitResult {
  title: string;
  sermonOutline: string;
  objectLesson: string;
  discussionQuestions: string;
  prayerPoints: string;
  kidsVersion: string;
}

const SECTIONS = [
  { key: "sermonOutline" as const, label: "Sermon Outline", icon: "📖" },
  { key: "objectLesson" as const, label: "Object Lesson", icon: "🎯" },
  { key: "discussionQuestions" as const, label: "Discussion Questions", icon: "💬" },
  { key: "prayerPoints" as const, label: "Prayer Points", icon: "🙏" },
  { key: "kidsVersion" as const, label: "Kids Version", icon: "👶" },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Choose Your Topic",
    description: "Enter a Bible verse, topic, or theme",
  },
  {
    step: 2,
    title: "Generate",
    description:
      "AI creates a complete sermon outline, discussion questions, and more",
  },
  {
    step: 3,
    title: "Customize",
    description: "Edit, save to folders, and share with your team",
  },
];

export default function GeneratePage() {
  const [inputType, setInputType] = useState<"verse" | "topic">("verse");
  const [input, setInput] = useState("");
  const [audience, setAudience] = useState<Audience>("adults");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolkitResult | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const createToolkit = useMutation(api.toolkits.create);
  const allToolkits = useQuery(api.toolkits.list, {});

  const stats = useMemo(() => {
    if (!allToolkits) return null;
    return {
      total: allToolkits.length,
      adults: allToolkits.filter((t) => t.audience === "adults").length,
      youth: allToolkits.filter((t) => t.audience === "youth").length,
      favorites: allToolkits.filter((t) => t.isFavorite).length,
    };
  }, [allToolkits]);

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);

    try {
      const body: Record<string, string> = { audience };
      if (inputType === "verse") {
        body.verse = input.trim();
      } else {
        body.topic = input.trim();
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    try {
      await createToolkit({
        title: result.title,
        verse: inputType === "verse" ? input.trim() : undefined,
        topic: inputType === "topic" ? input.trim() : undefined,
        audience,
        sermonOutline: result.sermonOutline,
        objectLesson: result.objectLesson,
        discussionQuestions: result.discussionQuestions,
        prayerPoints: result.prayerPoints,
        kidsVersion: result.kidsVersion,
      });
      setSaved(true);
    } catch {
      setError("Failed to save toolkit");
    }
  }

  async function handleCopy(sectionKey: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-white">
          Welcome to Ministry Toolkit
        </h1>
        <p className="text-brand-muted text-sm md:text-base">
          AI-powered sermon and lesson creator for church leaders
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Toolkits Created", value: stats?.total ?? "—" },
          { label: "For Adults", value: stats?.adults ?? "—" },
          { label: "For Youth", value: stats?.youth ?? "—" },
          { label: "Favorites", value: stats?.favorites ?? "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-brand-card border border-brand-border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-brand-gold">{stat.value}</p>
            <p className="text-xs text-brand-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-brand-black flex items-center justify-center text-sm font-bold">
                {item.step}
              </span>
              <div>
                <p className="text-brand-white font-medium text-sm">
                  {item.title}
                </p>
                <p className="text-brand-muted text-xs mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      <h2 className="text-xl font-bold text-brand-white">Generate Toolkit</h2>

      {/* Input section */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
        {/* Verse vs Topic toggle */}
        <div className="flex bg-brand-dark rounded-lg p-1 gap-1 w-fit">
          <button
            onClick={() => setInputType("verse")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputType === "verse"
                ? "bg-brand-gold text-brand-black"
                : "text-brand-muted hover:text-brand-white"
            }`}
          >
            Bible Verse
          </button>
          <button
            onClick={() => setInputType("topic")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputType === "topic"
                ? "bg-brand-gold text-brand-black"
                : "text-brand-muted hover:text-brand-white"
            }`}
          >
            Topic
          </button>
        </div>

        {/* Input field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            inputType === "verse"
              ? 'e.g. John 3:16, Psalm 23, Romans 8:28'
              : 'e.g. forgiveness, faith during trials, love your neighbor'
          }
          className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-gold"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleGenerate();
          }}
        />

        {/* Audience picker */}
        <div>
          <label className="text-sm text-brand-muted mb-2 block">
            Audience
          </label>
          <div className="flex gap-2">
            {(["adults", "youth", "kids"] as Audience[]).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  audience === a
                    ? "bg-brand-gold text-brand-black"
                    : "bg-brand-dark text-brand-muted border border-brand-border hover:text-brand-white"
                }`}
              >
                {a === "adults"
                  ? "Adults"
                  : a === "youth"
                    ? "Youth/Teens"
                    : "Kids"}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Toolkit"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block animate-pulse">✝️</span>
          <p className="text-brand-muted">
            Creating your teaching toolkit...
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-white">
              {result.title}
            </h2>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                saved
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-brand-gold text-brand-black hover:bg-brand-gold-light"
              }`}
            >
              {saved ? "Saved!" : "Save to Library"}
            </button>
          </div>

          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="bg-brand-card border border-brand-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                <h3 className="font-semibold text-brand-white flex items-center gap-2">
                  <span>{section.icon}</span>
                  {section.label}
                </h3>
                <button
                  onClick={() =>
                    handleCopy(section.key, result[section.key])
                  }
                  className="text-xs text-brand-muted hover:text-brand-gold transition-colors"
                >
                  {copiedSection === section.key ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="p-4 text-brand-white text-sm leading-relaxed whitespace-pre-wrap">
                {result[section.key]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
