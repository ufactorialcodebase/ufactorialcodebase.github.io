import React from "react";

export default function DataTable({ headers, rows }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
      <div className="grid gap-px bg-white/5" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
        {headers.map((h, i) => (
          <div key={i} className="bg-white/10 px-4 py-3 text-sm font-semibold text-white">
            {h}
          </div>
        ))}
        {rows.map((row, ri) =>
          row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className="bg-white/[0.03] px-4 py-3 text-sm text-white/60">
              {cell}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
