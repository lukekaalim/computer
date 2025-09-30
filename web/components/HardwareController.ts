import { Clock, CPU, Memory } from "hardware";
import { Instructions } from "isa";
import { FunctionComponent, h } from "preact";
import { CompilerDebug } from "../../compiler/compile";

export type HardwareControllerProps = {
  cpu: CPU,
  clock: Clock,
  memory: Memory,

  breakpoints: Set<number>

  onTick?: () => void,
};

export const getInstructionAddress = (cpu: CPU) => {
  return cpu.registers.instruction_address.read() + cpu.registers.instruction_cache_offset.read()
}

export const HardwareController: FunctionComponent<HardwareControllerProps> = ({ cpu, clock, onTick, memory, breakpoints }) => {

  const onClickTickClock = () => {
    clock.tick();
    if (onTick)
      onTick();
  }

  const onClickTickOp = () => {
    const currentInstruction = getInstructionAddress(cpu);
    while (getInstructionAddress(cpu) === currentInstruction && cpu.registers.state.read() !== 0) {
      clock.tick();
    }
    if (onTick)
      onTick();
  }
  const onClickTickComplete = () => {
    while (cpu.registers.state.read() !== 0) {
      const currentInstruction = getInstructionAddress(cpu) / 4;
      if (breakpoints.has(currentInstruction)) {
        console.log('Breaking due to breakpoint', breakpoints, currentInstruction)
        break;
      }
      clock.tick();
    }
    if (onTick)
      onTick();
  }

  const currentInstructionAddress = getInstructionAddress(cpu);
  const nextInstructionAddress = currentInstructionAddress + 4;

  let currentInstruction = null, nextInstruction = null;
  try {
    currentInstruction = Instructions.deserialize(
      memory.contents.slice(currentInstructionAddress, currentInstructionAddress + 4)
    );
    nextInstruction = Instructions.deserialize(
      memory.contents.slice(nextInstructionAddress, nextInstructionAddress + 4)
    );
  } catch {

  }

  
  return [
    h('div', {}, [
      h('button', { onClick: onClickTickClock }, `Tick Clock (${cpu.registers.instruction_address.read()})`),
      h('button', { onClick: onClickTickOp }, `Tick Until Next Instruction (${cpu.registers.instruction_address.read()})`),
      h('button', { onClick: onClickTickComplete }, `Tick Until Complete`),
      h('button', { }, `CPU State (${cpu.registers.state.read()})`),
    ]),
    h('table', { style: { 'border-collapse': 'collapse' } }, [
      h('tr', {}, [
        [...Object.keys(cpu.registers.general_purpose)].map((key) =>
          h('th', { style: { border: '1px solid black', padding: '8px' } }, key))
      ]),
      h('tr', {}, [
        [...Object.values(cpu.registers.general_purpose)].map((register) =>
          h('td', { style: { border: '1px solid black', padding: '8px' } }, register.read()))
      ]),
    ]),
    h('div', { style: { display: 'flex' }}, [
      currentInstruction && h('pre', {}, JSON.stringify(currentInstruction, null, 2)) || 'No Valid Current Instruction',
      nextInstruction && h('pre', {}, JSON.stringify(nextInstruction, null, 2)) || 'No Valid Next Instruction',
    ]),
  ]
};
