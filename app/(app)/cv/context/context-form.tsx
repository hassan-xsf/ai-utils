"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { saveContext } from "@/app/(app)/cv/actions";
import type { CvContext } from "@/lib/cv/types";

const FIELDS = [
  { key: "bio", label: "Bio", rows: 3, placeholder: "A short professional summary about yourself…" },
  { key: "skills", label: "Skills", rows: 3, placeholder: "List your technical and soft skills…" },
  { key: "experience", label: "Experience", rows: 6, placeholder: "Your work history, roles, responsibilities, and achievements…" },
  { key: "education", label: "Education", rows: 4, placeholder: "Degrees, institutions, years, GPA…" },
  { key: "projects", label: "Projects", rows: 4, placeholder: "Personal and professional projects with impact…" },
  { key: "certifications", label: "Certifications", rows: 3, placeholder: "Certifications, awards, and recognitions…" },
] as const;

const INIT_STATE = { ok: false as boolean, error: undefined as string | undefined };

interface ContextFormProps {
  context: CvContext | null;
}

export function ContextForm({ context }: ContextFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof INIT_STATE, fd: FormData) => {
      const result = await saveContext(_prev, fd);
      return { ok: result.ok, error: result.error };
    },
    INIT_STATE
  );

  useEffect(() => {
    if (state.ok && !state.error) {
      router.push("/cv");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {FIELDS.map(({ key, label, rows, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <label className="label block capitalize">{label}</label>
          <textarea
            name={key}
            defaultValue={context?.[key] ?? ""}
            className="textarea"
            rows={rows}
            placeholder={placeholder}
          />
        </div>
      ))}

      {state.error && (
        <div className="text-xs" style={{ color: "var(--danger)" }}>{state.error}</div>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}
