import React from "react";

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3.5 w-24 bg-slate-800 rounded-md" />
        <div className="h-8 w-8 bg-slate-800 rounded-xl" />
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-8 w-36 bg-slate-800 rounded-lg" />
        <div className="h-3 w-28 bg-slate-800/60 rounded-md" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-800/60">
      <td className="py-4 px-5">
        <div className="h-4 w-20 bg-slate-800 rounded" />
      </td>
      <td className="py-4 px-5">
        <div className="h-4 w-44 bg-slate-800 rounded" />
      </td>
      <td className="py-4 px-5">
        <div className="h-5 w-16 bg-slate-800 rounded-full" />
      </td>
      <td className="py-4 px-5 text-right">
        <div className="h-4 w-24 bg-slate-800 rounded ml-auto" />
      </td>
      <td className="py-4 px-5">
        <div className="h-4 w-32 bg-slate-800/60 rounded" />
      </td>
      <td className="py-4 px-5">
        <div className="h-7 w-16 bg-slate-800/80 rounded-lg mx-auto" />
      </td>
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-48 bg-slate-800 rounded" />
        <div className="h-7 w-32 bg-slate-800 rounded-lg" />
      </div>
      <div className="h-4 w-full bg-slate-800/60 rounded-full" />
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="h-16 bg-slate-800/40 rounded-xl" />
        <div className="h-16 bg-slate-800/40 rounded-xl" />
        <div className="h-16 bg-slate-800/40 rounded-xl" />
      </div>
    </div>
  );
}
