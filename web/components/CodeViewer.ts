import { Fragment, FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";

import { CompilerDebug } from 'compiler';
import { ASTRender } from "./ASTRender";
import { ILRender } from "./ILRender";

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
};

export const CodeViewer = ({ debug, instruction_index }: CodeViewerProps) => {
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
    mode === 'instructions' && h('pre', {}, debug.exec_debug.instructions.map((instr, index) =>
      h('div', { style: { fontWeight: index === instruction_index ? 'bold' : 'normal' } },
        JSON.stringify(instr))
    ))
  ]);
};
