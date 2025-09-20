import { CompilerDebug, Struct } from "compiler"
import { HardwareSnapshot } from "../data/snapshot";
import { Fragment, h } from "preact";
import { StructTable } from "./StructTable";

export type StackViewerProps = {
  snapshot: HardwareSnapshot,
  debug: CompilerDebug,
  instruction_index: number,
}

export const StackViewer = ({ debug, instruction_index, snapshot }: StackViewerProps) => {
  const stack_spans = debug.exec_debug.spans.filter(span => span.id.startsWith('stack:'));

  const active_stack_spans = stack_spans.filter(span => {
    return instruction_index >= span.start && instruction_index < span.end
  });

  return h(Fragment, {}, [
    'WIP'
  ])

}