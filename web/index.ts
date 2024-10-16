import { Fragment, h, render } from 'preact';

import { } from 'compiler/ast';

import { assemble } from '../compiler/link/assemble';
import { DataTable } from './components/DataTable';
import { StructTable } from './components/StructTable';
import { prelude_struct_def } from '../compiler/link/prelude';
import { useEffect, useState } from 'preact/hooks';
import { createClock, createCPU, createMemory } from 'hardware';
import { loadExecutable } from 'operating_system';
import { HardwardSnapshotRender } from './components/HardwareSnapshotRender';
import { captureSnapshot, HardwareSnapshot } from './data/snapshot';
import { compile } from '../compiler/compile';
import { Instructions } from 'isa';
import { Struct } from '../compiler/struct/mod';
import { ILRender } from './components/ILRender';
import { ASTRender } from './components/ASTRender';

const program_text = `
// const string = "hello!";
const one = 1;
const two = 2;
const three = one + two;
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

  const current_instruction = snapshot && Instructions.deserialize(
    snapshot.memory.slice(snapshot.instruction_address, snapshot.instruction_address + 4),
  );

  return h(Fragment, {}, [
    h('details', {}, [
      h('summary', {}, 'Code details'),
      h('pre', {}, h('code', {}, program_text)),
      h('pre', {}, h('code', {}, debug.exec_debug.instructions.map(i => JSON.stringify(i) + '\n'))),
      h(DataTable, { values: exe.memory }),
      h(StructTable, { struct_def: prelude_struct_def, values: exe.memory.slice(0, Struct.sizeOf(prelude_struct_def))  }),
    ]),
    h('div', {}, snapshots.length),
    h('div', { style: { display: 'flex', flex: 1, overflow: 'hidden' } }, [
      h('div', {}, [
        h('input', { type: 'range', min: 0, step: 1, max: snapshots.length - 1, value: snapshotIndex,
          onInput: e => setSnapshotIndex(e.currentTarget.valueAsNumber)
         }),
        snapshot && [
          h(HardwardSnapshotRender, { snapshot })
        ]
      ]),
      h('div', { style: { overflowY: 'auto' } }, [
        current_instruction_index,
        h('ol', {}, debug.ast_debug.tokens.map(token => h('li', {}, h('pre', {}, JSON.stringify(token))))),
        h(ASTRender, { program: debug.ast, instruction_index: current_instruction_index, spans: debug.exec_debug.spans }),
        h(ILRender, { root: debug.il }),
        h('pre', {}, h('code', {},
          debug.exec_debug.instructions.map((i, index) =>
            current_instruction_index === index
              ? h('span', { style: { background: 'red', color: 'white' }}, JSON.stringify(i) + '\n')
              : (JSON.stringify(i) + '\n')
            )
        )),
        h('div', {}, [
          debug.exec_debug.spans.map(group => {
            const isActive = group.start <=current_instruction_index && group.end > current_instruction_index;
            const style = isActive && {
              background: 'blue',
              color: 'white'
            } || {};
            return h('div', { style }, [group.id, ` Start: ${group.start}, End: ${group.end}` ])
          }),
          snapshot && [
            h(StructTable, {
              struct_def: prelude_struct_def,
              values: snapshot.memory.slice(debug.exec_debug.prelude_start, debug.exec_debug.prelude_start + Struct.sizeOf(prelude_struct_def))
            }),
            /*
            h(StructTable, {
              address: debug.exec_debug.heap_start,
              struct_def: alloc_state_def,
              values: snapshot.memory.slice(debug.exec_debug.heap_start, debug.exec_debug.heap_start + getStructSize(alloc_state_def))
            }),
            */
          ]
        ])
      ]),
    ])
  ]);
}

render(h(App, {}), document.body);
