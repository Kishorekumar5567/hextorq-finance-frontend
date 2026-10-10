import React from "react";

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3.5 w-24 bg-slate-100 rounded-md" />
        <div className="h-8 w-8 bg-slate-100 rounded-xl" />
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-8 w-36 bg-slate-200 rounded-lg" />
        <div className="h-3 w-28 bg-slate-100 rounded-md" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="py-4 px-4 text-center">
        <div className="h-4 w-4 bg-slate-200 rounded mx-auto" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-20 bg-slate-100 rounded" />
      </td>
      <td className="py-4 px-5">
        <div className="h-4 w-44 bg-slate-200 rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-5 w-16 bg-slate-100 rounded-full" />
      </td>
      <td className="py-4 px-5 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
      </td>
      <td className="py-4 px-5">
        <div className="h-4 w-32 bg-slate-100 rounded" />
      </td>
      <td className="py-4 px-4 text-center">
        <div className="h-6 w-14 bg-slate-100 rounded-lg mx-auto" />
      </td>
    </tr>
  );
}
