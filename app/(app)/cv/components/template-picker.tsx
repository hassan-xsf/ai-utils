"use client";

import { X } from "lucide-react";
import type { CvTemplate } from "@/lib/cv/types";

interface TemplatePickerProps {
  templates: CvTemplate[];
  currentId: string;
  onSelect: (template: CvTemplate) => void;
  onClose: () => void;
}

export function TemplatePicker({ templates, currentId, onSelect, onClose }: TemplatePickerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="panel w-full max-w-2xl max-h-[80vh] flex flex-col"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold tracking-tight">Choose a Template</h2>
          <button onClick={onClose} className="btn" style={{ padding: "0.35rem 0.6rem" }}>
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 grid sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="panel p-4 flex flex-col gap-2"
              style={tpl.id === currentId ? { borderColor: "var(--accent)" } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{tpl.name}</span>
                {tpl.id === currentId && (
                  <span className="badge badge-ok" style={{ fontSize: 10 }}>Current</span>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--fg-dim)" }}>{tpl.description}</p>
              {tpl.id !== currentId && (
                <button
                  className="btn btn-primary mt-1 justify-center"
                  style={{ fontSize: 12 }}
                  onClick={() => onSelect(tpl)}
                >
                  Use this template
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
