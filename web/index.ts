import { Fragment, h, render } from 'preact';
import { lex } from '../compiler/ast/lexer';
import { parse } from '../compiler/ast/parser';
import { generateProgram } from '../compiler/codegen/program';
import { assemble } from '../compiler/link/assemble';
import { DataTable } from './components/DataTable';
import { StructTable } from './components/StructTable';
import { prelude_struct_def } from '../compiler/link/prelude';
import { getStructSize } from '../compiler/codegen/struct';
import { useEffect, useState } from 'preact/hooks';
import { createClock, createCPU, createMemory } from 'hardware';
import { loadExecutable } from 'operating_system';
import { Core } from 'isa';
import { HardwardSnapshotRender } from './components/HardwareSnapshotRender';
import { captureSnapshot, HardwareSnapshot } from './data/snapshot';
import { compile } from '../compiler/compile';
import { alloc_state_def } from '../compiler/codegen/alloc';

const program_text = `
const eight = 3 + 5;
`
const [exe, debug] = compile(program_text);

const clock = createClock();
const memory = createMemory(clock);
const cpu = createCPU(clock, memory);

loadExecutable(cpu, memory, exe);

const App = () => {
  const [snapshots, setSnapshot] = useState<HardwareSnapshot[]>([]);
  const [snapshotIndex, setSnapshotIndex] = useState(0);

  const saveSnapshot = () => {
    if (cpu.registers.state.read() !== 3)
      return;
    if (cpu.registers.instruction_state.read() !== 0)
      return;
    
    const snapshot = captureSnapshot(cpu, memory);
    
    setSnapshot(s => [...s, snapshot])
  };

  useEffect(() => {
    const id = setInterval(() => {
      saveSnapshot();
      clock.tick();
      if (cpu.registers.state.read() === 0) {
        clearInterval(id);
        saveSnapshot();
      }
    }, 10)
  }, [])

  const snapshot = snapshots[snapshotIndex];

  const current_instruction_index = snapshot &&
    (snapshot.instruction_address - debug.exec_debug.program_start) / 4;

  const current_instruction = snapshot && Core.serializer.read(
    snapshot.memory,
    snapshot.instruction_address,
  );

  return h(Fragment, {}, [
    h('details', {}, [
      h('summary', {}, 'Code details'),
      h('pre', {}, h('code', {}, program_text)),
      h('pre', {}, h('code', {}, debug.exec_debug.final_instructions.map(i => JSON.stringify(i) + '\n'))),
      h(DataTable, { values: exe.memory }),
      h(StructTable, { struct_def: prelude_struct_def, values: exe.memory.slice(0, getStructSize(prelude_struct_def))  }),
    ]),
    h('div', {}, snapshots.length),
    h('div', { style: { display: 'flex' }}, [
      h('div', {}, [
        h('input', { type: 'range', min: 0, step: 1, max: snapshots.length - 1, value: snapshotIndex,
          onInput: e => setSnapshotIndex(e.currentTarget.valueAsNumber)
         }),
        snapshot && [
          h(HardwardSnapshotRender, { snapshot })
        ]
      ]),
      h('div', {}, [
        current_instruction_index,
        h('pre', {}, h('code', {},
          debug.exec_debug.final_instructions.map((i, index) =>
            current_instruction_index === index
              ? h('span', { style: { background: 'red', color: 'white' }}, JSON.stringify(i) + '\n')
              : (JSON.stringify(i) + '\n')
            )
        )),
        h('div', {}, [
          debug.exec_debug.instruction_groups.map(group => {
            const isActive = group.start_index <=current_instruction_index && group.end_index > current_instruction_index;
            const style = isActive && {
              background: 'blue',
              color: 'white'
            } || {};
            return h('div', { style }, [group.id, ` Start: ${group.start_index}, End: ${group.end_index}` ])
          }),
          snapshot && [
            h(StructTable, {
              struct_def: prelude_struct_def,
              values: snapshot.memory.slice(debug.exec_debug.prelude_start, debug.exec_debug.prelude_start + getStructSize(prelude_struct_def))
            }),
            h(StructTable, {
              address: debug.exec_debug.heap_start,
              struct_def: alloc_state_def,
              values: snapshot.memory.slice(debug.exec_debug.heap_start, debug.exec_debug.heap_start + getStructSize(alloc_state_def))
            }),
          ]
        ])
      ]),
    ])
  ]);
}

render(h(App, {}), document.body);
