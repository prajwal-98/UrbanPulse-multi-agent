"use client";

import React from "react";
import { NoData, SectionTitle, RankedList } from "../pipeline-shared-ui";

export default function Step6View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A6_output ?? data;
  const platforms: any[] = Array.isArray(out.platform) ? out.platform : [];
  const brands: any[] = Array.isArray(out.brand) ? out.brand : [];
  const categories: any[] = Array.isArray(out.category) ? out.category : [];
  const cities: any[] = Array.isArray(out.city) ? out.city : [];
  const time: any = out.time ?? null;

  if (!platforms.length && !brands.length && !categories.length && !cities.length && !time) return <NoData />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <RankedList title="Platforms" items={platforms} />
        <RankedList title="Brands" items={brands} />
        <RankedList title="Categories" items={categories} />
        <RankedList title="Cities" items={cities} />
      </div>

      {time && (
        <div>
          <SectionTitle>Time Signal</SectionTitle>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
            {time.label && <p className="text-sm font-bold text-slate-900">{time.label}</p>}
            {time.multiplier != null && (
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-bold text-amber-600">{time.multiplier}×</span> complaint volume vs. average
              </p>
            )}
            {(time.context ?? time.insight) && <p className="text-xs text-slate-500 leading-relaxed mt-1">{time.context ?? time.insight}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
