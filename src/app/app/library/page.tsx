"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<
    Id<"folders"> | "all" | "favorites"
  >("all");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const folders = useQuery(api.folders.list);
  const toolkits = useQuery(api.toolkits.list, {
    folderId:
      selectedFolder !== "all" && selectedFolder !== "favorites"
        ? selectedFolder
        : undefined,
    favoritesOnly: selectedFolder === "favorites" ? true : undefined,
    search: search || undefined,
  });

  const createFolder = useMutation(api.folders.create);
  const toggleFavorite = useMutation(api.toolkits.toggleFavorite);

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    await createFolder({ name: newFolderName.trim() });
    setNewFolderName("");
    setShowNewFolder(false);
  }

  if (!toolkits || !folders) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-48" />
          <div className="h-12 bg-brand-card rounded" />
          <div className="h-32 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-white">Library</h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title, verse, or topic..."
        className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-gold"
      />

      {/* Folder tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedFolder("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedFolder === "all"
              ? "bg-brand-gold text-brand-black"
              : "bg-brand-dark text-brand-muted border border-brand-border hover:text-brand-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedFolder("favorites")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedFolder === "favorites"
              ? "bg-brand-gold text-brand-black"
              : "bg-brand-dark text-brand-muted border border-brand-border hover:text-brand-white"
          }`}
        >
          Favorites
        </button>
        {folders.map((folder) => (
          <button
            key={folder._id}
            onClick={() => setSelectedFolder(folder._id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedFolder === folder._id
                ? "bg-brand-gold text-brand-black"
                : "bg-brand-dark text-brand-muted border border-brand-border hover:text-brand-white"
            }`}
          >
            {folder.name}
          </button>
        ))}
        <button
          onClick={() => setShowNewFolder(true)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-dark text-brand-muted border border-brand-border border-dashed hover:text-brand-white transition-colors"
        >
          + Folder
        </button>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="flex-1 px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-gold text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setShowNewFolder(false);
            }}
            autoFocus
          />
          <button
            onClick={handleCreateFolder}
            className="px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-sm font-medium hover:bg-brand-gold-light transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => setShowNewFolder(false)}
            className="px-4 py-2 bg-brand-dark text-brand-muted border border-brand-border rounded-lg text-sm hover:text-brand-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Toolkit list */}
      {toolkits.length === 0 ? (
        <EmptyState
          emoji="📁"
          title="No toolkits yet"
          description="Generate your first teaching toolkit and save it here."
          action={{ label: "Generate Toolkit", href: "/app" }}
        />
      ) : (
        <div className="space-y-2">
          {toolkits.map((toolkit) => (
            <div
              key={toolkit._id}
              className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/30 transition-colors"
            >
              <button
                onClick={() =>
                  toggleFavorite({ toolkitId: toolkit._id })
                }
                className="text-xl flex-shrink-0"
                title={
                  toolkit.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {toolkit.isFavorite ? "⭐" : "☆"}
              </button>
              <Link
                href={`/app/library/${toolkit._id}`}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-brand-white truncate">
                  {toolkit.title}
                </p>
                <p className="text-xs text-brand-muted">
                  {toolkit.verse || toolkit.topic} -{" "}
                  {toolkit.audience === "adults"
                    ? "Adults"
                    : toolkit.audience === "youth"
                      ? "Youth"
                      : "Kids"}{" "}
                  - {formatDate(toolkit.createdAt)}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
