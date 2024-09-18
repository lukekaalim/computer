import { createMemory, createCPU, createClock } from "hardware";
import * as isa from "isa";

const clock = createClock()
const memory = createMemory(clock);
const cpu = createCPU(clock, memory);

const program: number[] = [
  isa.Core.factory.put(1, 0),
  isa.Core.factory.add(0, 1, 1),
  isa.Core.factory.add(0, 1, 1),
  isa.Core.factory.add(0, 1, 1),
  isa.Core.factory.add(0, 1, 1),
  isa.Core.factory.halt(),
].map(isa.Core.serializer.write).flat(1)

memory.contents.push(...program);
cpu.registers.state.write(1);

const states: Record<string, string | number>[] = [];
const record = () => {
  states.push({
    tick: i,
    state: cpu.registers.state.read(),
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
  console.table(states.filter(s => s['state'] === 3))
  clearInterval(interval_id);
}

const interval_id = setInterval(tick, 0);