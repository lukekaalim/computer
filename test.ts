import { createMemory, createCPU, createClock } from "hardware";
import * as isa from "isa";

const clock = createClock()
const memory = createMemory(clock);
const cpu = createCPU(clock, memory);

const is = isa.Core.factory;

const program: number[] = [
  is.put(1, 0),
  is.put(0, 1),

  ...Array.from({ length: 10 }).map(() => [
    is.read(1, 2),
    is.add(0, 1, 1),
  ]).flat(1),

  is.halt(),
].map(isa.Core.serializer.write).flat(1)

memory.contents.push(...program);
cpu.registers.state.write(1);

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
  record();

  clock.tick();
  i++;

  if (cpu.registers.state.read() === 0) {
    stop();
  }
}

const stop = () => {
  record();
  console.table(Array.from({ length: Math.ceil(program.length / 8) }).map((_, line) => {
    return program.slice(line * 8, (line + 1) * 8)
  }));
  console.table(states.filter(s => s['state'] === 3 && s['instruction_state'] === 0))
  clearInterval(interval_id);
}

const interval_id = setInterval(tick, 0);