"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { exportToolkitPDF } from "@/lib/pdf-export";

const SECTIONS = [
  { key: "sermonOutline" as const, label: "Sermon Outline", icon: "📖" },
  { key: "objectLesson" as const, label: "Object Lesson", icon: "🎯" },
  { key: "discussionQuestions" as const, label: "Discussion Questions", icon: "💬" },
  { key: "prayerPoints" as const, label: "Prayer Points", icon: "🙏" },
  { key: "kidsVersion" as const, label: "Kids Version", icon: "👶" },
];

export default function ToolkitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toolkitId = params.id as Id<"toolkits">;

  const toolkit = useQuery(api.toolkits.getById, { toolkitId });
  const tags = useQuery(api.tags.listByToolkit, { toolkitId });
  const folders = useQuery(api.folders.list);

  const toggleFavorite = useMutation(api.toolkits.toggleFavorite);
  const moveToFolder = useMutation(api.toolkits.moveToFolder);
  const addTag = useMutation(api.tags.add);
  const removeTag = useMutation(api.tags.remove);
  const shareToolkit = useMutation(api.shares.share);
  const removeToolkit = useMutation(api.toolkits.remove);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareStatus, setShareStatus] = useState<
    "idle" | "sharing" | "shared" | "error"
  >("idle");
  const [showDelete, setShowDelete] = useState(false);

  if (toolkit === undefined) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-64" />
          <div className="h-48 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  if (toolkit === null) {
    return (
      <div className="p-4 md:p-6 text-center py-16">
        <p className="text-brand-muted">Toolkit not found.</p>
        <Link href="/app/library" className="text-brand-gold text-sm mt-2 inline-block">
          Back to Library
        </Link>
      </div>
    );
  }

  async function handleCopy(key: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;
    await addTag({ toolkitId, label: newTag.trim() });
    setNewTag("");
  }

  async function handleShare() {
    if (!shareEmail.trim()) return;
    setShareStatus("sharing");
    try {
      await shareToolkit({ toolkitId, email: shareEmail.trim() });
      setShareStatus("shared");
      setShareEmail("");
      setTimeout(() => setShareStatus("idle"), 3000);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  }

  async function handleDelete() {
    await removeToolkit({ toolkitId });
    router.push("/app/library");
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/app/library"
        className="text-brand-muted text-sm hover:text-brand-gold transition-colors"
      >
        &larr; Back to Library
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-white">
            {toolkit.title}
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {toolkit.verse || toolkit.topic} -{" "}
            {toolkit.audience === "adults"
              ? "Adults"
              : toolkit.audience === "youth"
                ? "Youth"
                : "Kids"}{" "}
            - {formatDate(toolkit.createdAt)}
          </p>
        </div>
        <button
          onClick={() => toggleFavorite({ toolkitId })}
          className="text-2xl"
        >
          {toolkit.isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => exportToolkitPDF(toolkit)}
          className="px-4 py-2 bg-brand-dark border border-brand-border rounded-lg text-sm text-brand-white hover:border-brand-gold/30 transition-colors"
        >
          Export PDF
        </button>
        {folders && (
          <select
            value={toolkit.folderId || ""}
            onChange={(e) =>
              moveToFolder({
                toolkitId,
                folderId: e.target.value
                  ? (e.target.value as Id<"folders">)
                  : undefined,
              })
            }
            className="px-4 py-2 bg-brand-dark border border-brand-border rounded-lg text-sm text-brand-white focus:outline-none focus:border-brand-gold"
          >
            <option value="">No folder</option>
            {folders.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => setShowDelete(!showDelete)}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">
            Are you sure? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="px-4 py-2 bg-brand-dark text-brand-muted border border-brand-border rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <p className="text-sm text-brand-muted">Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <span
              key={tag._id}
              className="flex items-center gap-1 px-3 py-1 bg-brand-dark border border-brand-border rounded-full text-sm text-brand-white"
            >
              {tag.label}
              <button
                onClick={() => removeTag({ tagId: tag._id })}
                className="text-brand-muted hover:text-red-400 ml-1"
              >
                x
              </button>
            </span>
          ))}
          <div className="flex gap-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              className="px-3 py-1 bg-brand-dark border border-brand-border border-dashed rounded-full text-sm text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-gold w-28"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTag();
              }}
            />
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-brand-white">
          Share with someone
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="Their email address..."
            className="flex-1 px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-sm text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-gold"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleShare();
            }}
          />
          <button
            onClick={handleShare}
            disabled={shareStatus === "sharing"}
            className="px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-sm font-medium hover:bg-brand-gold-light transition-colors disabled:opacity-50"
          >
            {shareStatus === "sharing"
              ? "Sharing..."
              : shareStatus === "shared"
                ? "Shared!"
                : shareStatus === "error"
                  ? "Error"
                  : "Share"}
          </button>
        </div>
      </div>

      {/* Content sections */}
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
                handleCopy(section.key, toolkit[section.key])
              }
              className="text-xs text-brand-muted hover:text-brand-gold transition-colors"
            >
              {copiedSection === section.key ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4 text-brand-white text-sm leading-relaxed whitespace-pre-wrap">
            {toolkit[section.key]}
          </div>
        </div>
      ))}
    </div>
  );
}
