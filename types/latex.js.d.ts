declare module "latex.js" {
  export class HtmlGenerator {
    constructor(options?: { hyphenate?: boolean });
    stylesAndScripts(baseUrl: string): string;
  }
  export function parse(latex: string, options: { generator: HtmlGenerator }): {
    documentElement(): HTMLElement;
  };
}
