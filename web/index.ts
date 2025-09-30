import { Fragment, h, render } from 'preact';

import { assemble } from '../compiler/link/assemble';
import { DataTable } from './components/DataTable';
import { StructTable } from './components/StructTable';
import { useEffect, useState } from 'preact/hooks';
import { createClock, createCPU, createMemory } from 'hardware';
import { loadExecutable } from 'operating_system';
import { HardwardSnapshotRender } from './components/HardwareSnapshotRender';
import { captureSnapshot, HardwareSnapshot } from './data/snapshot';

import { compile } from 'compiler';

import { Instructions } from 'isa';
import { CodeViewer } from './components/CodeViewer';
import { StackViewer } from './components/StackViewer';
import { MemoryViewer } from './components/MemoryViewer';
import { getInstructionAddress, HardwareController } from './components/HardwareController';

const program_text = `
// const string = "hello!";
const one = 1;
const bignumber = 22 + 43;
const two = 2;
//const three = one + two;

//const a_function = () => {
//  const four = two + three;
//};
`
const [exe, debug] = compile(program_text);

const clock = createClock();
const memory = createMemory(clock);
const cpu = createCPU(clock, memory);

loadExecutable(cpu, memory, exe);

const App = () => {
  const [_, setUpdate] = useState(0);

  const [breakpoints, setBreakpoints] = useState(new Set<number>());

  const values = [...memory.contents];

  const i = getInstructionAddress(cpu)
  const current_instruction_index = i / 4;

  const onToggleBreakpoint = (breakpoint: number) => {
    setBreakpoints(breakpoints => {
      const newBreakpoints = new Set(breakpoints);
      if (breakpoints.has(breakpoint))
        newBreakpoints.delete(breakpoint);
      else
        newBreakpoints.add(breakpoint);
      return newBreakpoints;
    })
  }

  return h('div', { style: { padding: '0 0px', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' } }, [
    h(HardwareController, { cpu, clock, onTick: () => setUpdate(u => u + 1), memory, breakpoints }),
    h('div', { style: { display: 'flex', flex: 1, overflow: 'hidden' } }, [
      h('div', { style: { overflow: 'auto', height: '100%', flex: 1 }}, [
        h(MemoryViewer, { values, groups: [
            {
              startInclusive: i,
              endExclusive: i + 4,
              label: 'instruction_pointer',
              color: 'green'
            },
            ...[...debug.exec_debug.data_table.offsetsById.entries()].map(([id, offset]) => ({
              startInclusive: offset + debug.exec_debug.data_start,
              endExclusive: (debug.exec_debug.data_table.sizesById.get(id) as number) + offset + debug.exec_debug.data_start,
              label: id.slice('data:'.length),
              color: 'yellow'
            }))
          ]
        }),
      ]),
      h('div', { style: { overflow: 'auto' }},
        h(CodeViewer, { debug, instruction_index: current_instruction_index, breakpoints, onToggleBreakpoint })
      ),
    ]),
  ])


  const [snapshots, setSnapshot] = useState<HardwareSnapshot[]>([]);
  const [snapshotIndex, setSnapshotIndex] = useState(0);

  const saveSnapshot = (force = false) => {
    if (!force) {
      if (cpu.registers.state.read() !== 3)
        return;
      if (cpu.registers.instruction_state.read() !== 0)
        return;
    }
    
    const snapshot = captureSnapshot(cpu, memory);
    
    setSnapshot(s => [...s, snapshot])
  };

  useEffect(() => {
    saveSnapshot(true);
    return;
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

  //const current_instruction_index = snapshot &&
  //  (snapshot.instruction_address - debug.exec_debug.program_start) / 4;

  const current_instruction = snapshot && Instructions.deserialize(
    snapshot.memory.slice(snapshot.instruction_address, snapshot.instruction_address + 4),
  );

  return h(Fragment, {}, [
    h('details', {}, [
      h('summary', {}, 'Code details'),
      h('pre', {}, h('code', {}, program_text)),
      h('pre', {}, h('code', {}, debug.exec_debug.instructions.map(i => JSON.stringify(i) + '\n'))),
      h(DataTable, { values: exe.memory }),
      //h(StructTable, { struct_def: prelude_struct_def, values: exe.memory.slice(0, Struct.sizeOf(prelude_struct_def))  }),
    ]),
    h('div', {}, snapshots.length),
    h('div', { style: { display: 'flex', flex: 1, overflow: 'hidden' } }, [
      h('div', { style: { overflow: 'auto' } }, [
        h('input', { type: 'range', min: 0, step: 1, max: snapshots.length - 1, value: snapshotIndex,
          onInput: e => setSnapshotIndex(e.currentTarget.valueAsNumber)
         }),
        snapshot && [
          h(HardwardSnapshotRender, { snapshot })
        ]
      ]),
      h('div', { style: { overflowY: 'auto' } }, [
        h(CodeViewer, { debug, instruction_index: current_instruction_index }),
        snapshot && [
          h(StackViewer, { debug, instruction_index: current_instruction_index, snapshot })
        ],
      ]),
    ])
  ]);
}

render(h(App, {}), document.body);
