"use client";
import React from "react";

type Props = {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void } | { label: string; href: string };
};

export default function ServiceCard({ title, description, action }: Props) {
  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      {action && "onClick" in action && (
        <button
          onClick={action.onClick}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {action.label}
        </button>
      )}
      {action && "href" in action && (
        <a
          href={(action as any).href}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 inline-block rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
