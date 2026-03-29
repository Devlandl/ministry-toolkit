"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default function SharedPage() {
  const sharedToolkits = useQuery(api.shares.listSharedWithMe);

  if (!sharedToolkits) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-48" />
          <div className="h-32 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-white">Shared with Me</h1>

      {sharedToolkits.length === 0 ? (
        <EmptyState
          emoji="🤝"
          title="Nothing shared yet"
          description="When someone shares a toolkit with you, it will appear here."
        />
      ) : (
        <div className="space-y-2">
          {sharedToolkits.filter(Boolean).map((toolkit) => {
            if (!toolkit) return null;
            return (
              <Link
                key={toolkit._id}
                href={`/app/library/${toolkit._id}`}
                className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/30 transition-colors"
              >
                <span className="text-xl flex-shrink-0">🤝</span>
                <div className="flex-1 min-w-0">
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
