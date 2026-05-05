"use client";

import React from "react";
import { NoData, SectionTitle, Tag } from "../pipeline-shared-ui";

export default function Step3View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A3_output ?? data;
  const anchor: any = out.anchor_review ?? null;
  const similar: any[] = Array.isArray(out.similar_reviews) ? out.similar_reviews : [];
  const theme: any = out.semantic_theme ?? null;

  return (
    <div className="space-y-6">
      {anchor && (
        <div>
          <SectionTitle>Anchor Review</SectionTitle>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-800 leading-relaxed italic">
              "{anchor.text ?? anchor.review ?? String(anchor)}"
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {anchor.city && <Tag color="blue">{anchor.city}</Tag>}
              {anchor.platform && <Tag color="violet">{anchor.platform}</Tag>}
              {anchor.rating != null && <Tag color="amber">★ {anchor.rating}</Tag>}
            </div>
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div>
          <SectionTitle>Similar Reviews ({similar.length})</SectionTitle>
          <div className="space-y-2.5">
            {similar.slice(0, 5).map((r, i) => {
              const text = typeof r === "string" ? r : (r.text ?? r.review ?? "");
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-700 leading-relaxed">{text}</p>
                  {typeof r === "object" && (
                    <div className="mt-2 flex gap-1.5">
                      {r.city && <Tag color="blue">{r.city}</Tag>}
                      {r.platform && <Tag color="violet">{r.platform}</Tag>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {theme && (
        <div>
          <SectionTitle>Semantic Theme</SectionTitle>
          <div className="bg-slate-900 text-white rounded-xl px-5 py-4">
            {typeof theme === "string" ? (
              <p className="text-sm font-medium">{theme}</p>
            ) : (
              <>
                {theme.title && <p className="text-sm font-bold mb-1">{theme.title}</p>}
                {theme.description && <p className="text-xs text-slate-400 leading-relaxed">{theme.description}</p>}
              </>
            )}
          </div>
        </div>
      )}

      {!anchor && !similar.length && !theme && <NoData />}
    </div>
  );
}
