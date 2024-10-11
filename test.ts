import { createMemory, createCPU, createClock } from "hardware";
import { loadExecutable } from "operating_system";

import {} from 'compiler';

import { assembly } from "./compiler/test";

const clock = createClock()
const memory = createMemory(clock);
const cpu = createCPU(clock, memory);

loadExecutable(cpu, memory, assembly);

const states: Record<string, string | number>[] = [];
const record = () => {
  states.push({
    tick: i,
    state: cpu.registers.state.read(),
    instruction_state: cpu.registers.instruction_state.read(),
    address: cpu.registers.instruction_address.read() + cpu.registers.instruction_cache_offset.read(),
    ...Object.fromEntries(
      Object.entries(cpu.registers.general_purpose).map(([index, register]) => [index, register.read()])
    )
  })
}

let i = 0;
const tick = () => {
  try {
    record();
  
    clock.tick();
    i++;
  
    if (cpu.registers.state.read() === 0) {
      stop();
    }
  } catch (error) {
    console.error(error)
    stop()
  }
}

const printMemory = (memory: number[]) => {
  console.table(Array.from({ length: Math.ceil(memory.length / 8) }).map((_, line) => {
    const slice =  memory.slice(line * 8, (line + 1) * 8);
    return [
      slice[0], slice[1], slice[2], slice[3],
      slice[4], slice[5], slice[6], slice[7],
    ].map(v => typeof v === 'number' ? v : '~')
  }));
}

const stop = () => {
  record();
  //printMemory(program);
  console.log('MEMORY');
  printMemory(memory.contents);
  console.log('STATE');
  console.table(states.filter(s => s['state'] === 3 && s['instruction_state'] === 0))
  clearInterval(interval_id);
}

const interval_id = setInterval(tick, 5);
