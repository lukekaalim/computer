import { Fragment, FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";

import { CompilerDebug } from 'compiler';
import { ASTRender } from "./ASTRender";
import { ILRender } from "./ILRender";
import { OpCodeViewer } from "./OpCodeViewer";

const code_viewer_modes = [
  'source',
  'tokens',
  'ast',
  'il',
  'instructions'
] as const;

type CodeViewerMode = typeof code_viewer_modes[number];

export type CodeViewerProps = {
  debug: CompilerDebug,
  
  instruction_index: number,


  breakpoints: Set<number>,
  onToggleBreakpoint?: (breakpoint: number) => void,
};

export const CodeViewer = ({ debug, instruction_index, breakpoints, onToggleBreakpoint }: CodeViewerProps) => {
  const [mode, setMode] = useState<CodeViewerMode>('source');

  const onModeInput = (e: InputEvent) => {
    setMode((e.currentTarget as HTMLSelectElement).value as CodeViewerMode)
  }

  return h(Fragment, {}, [
    h('select', { onInput: onModeInput }, code_viewer_modes.map(mode_option =>
      h('option', { selected: mode === mode_option }, mode_option)
    )),
    mode === 'source' && h('pre', {},debug.source_code),
    mode === 'tokens' &&
      h('pre', {}, debug.tokens.map(t =>
        JSON.stringify(t)
      ).join('\n')),
    mode === 'ast' && h(ASTRender, {
      program: debug.ast,
      instruction_index,
      spans: debug.exec_debug.spans
    }),
    mode === 'il' && h(ILRender, {
      root: debug.il,
      instruction_index,
    }),
    mode === 'instructions' && h(OpCodeViewer, { instruction_index, debug, breakpoints, onToggleBreakpoint })
  ]);
};
