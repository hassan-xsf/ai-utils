import type { CvTemplate, ResumeData } from "@/lib/cv/types";
import { JakesTemplate } from "./jakes";
import { AwesomeTemplate } from "./awesome";
import { AcademicTemplate } from "./academic";
import { DeedyTemplate } from "./deedy";
import { AltaCvTemplate } from "./altacv";

export type TemplateComponent = (props: { data: ResumeData }) => React.JSX.Element;

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: "jakes",
    name: "Jake's Resume",
    description: "Clean single-column layout popular in SWE. Section headers with tight spacing.",
  },
  {
    id: "awesome",
    name: "Awesome CV",
    description: "Bold name header with subtitle and contact line. Clean single-column.",
  },
  {
    id: "academic",
    name: "Academic",
    description: "Traditional serif layout for research and academia. Publications and awards sections.",
  },
  {
    id: "deedy",
    name: "Deedy CV",
    description: "Two-column: skills sidebar on the left, experience on the right.",
  },
  {
    id: "altacv",
    name: "AltaCV",
    description: "Dark header with sidebar for skills/education, main column for experience.",
  },
];

export const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  jakes: JakesTemplate,
  awesome: AwesomeTemplate,
  academic: AcademicTemplate,
  deedy: DeedyTemplate,
  altacv: AltaCvTemplate,
};

export function getTemplate(id: string): CvTemplate {
  const tpl = CV_TEMPLATES.find((t) => t.id === id);
  if (!tpl) throw new Error(`Unknown CV template: ${id}`);
  return tpl;
}

export function getTemplateComponent(id: string): TemplateComponent {
  return TEMPLATE_COMPONENTS[id] ?? JakesTemplate;
}
