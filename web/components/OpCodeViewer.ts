import { FunctionComponent, h } from "preact";
import { CompilerDebug } from "../../compiler/compile";
import { Span } from "../../compiler/codegen/span";
import { Instructions } from "isa";

export type OpCodeViewerProps = {
  instruction_index: number,
  debug: CompilerDebug,

  breakpoints: Set<number>,
  onToggleBreakpoint?: (breakpoint: number) => void,
};

export const OpCodeViewer: FunctionComponent<OpCodeViewerProps> = ({
  instruction_index,
  debug,
  breakpoints,
  onToggleBreakpoint = _ => {},
}) => {
  const spanMap = new Map<number, Span[]>();
  for (const span of debug.exec_debug.spans) {
    const spanList = spanMap.get(span.start) || []
    spanList.push(span);
    spanMap.set(span.start, spanList);
  }

  const onClick = (index: number) => () => {
    onToggleBreakpoint(index);
  }

  return h('pre', {}, debug.exec_debug.instructions.map((instr, index) => {
    const spans = spanMap.get(index) || [];
    return [
      spans.map(span => h('div', { style: { fontStyle: 'italics' } }, '// ' + span.id)),
      h('div', { style: { fontWeight: index === instruction_index ? 'bold' : 'normal' }, onClick: onClick(index) },
        [
          breakpoints.has(index) && ' 🔴 ',
          `${instr.type} (`,
          Instructions.defs_by_type[instr.type].args.map(arg => instr[arg[0]] && `${arg[0]}: ${instr[arg[0]]}, `),
          `)`
        ])
      ];
    }
  ))
};
