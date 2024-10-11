import { Fragment, FunctionComponent, h } from "preact";
import { HardwareSnapshot } from "../data/snapshot";
import { DataTable } from "./DataTable";
import { Instructions } from "isa";

const styles = {
  instruction: {
    backgroundColor: 'black',
    color: 'white',
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  address: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: '12px'
  },
  instruction_address: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: '12px',
    color: 'white'
  }
} as const;

export type HardwareSnapshotRenderProps = {
  snapshot: HardwareSnapshot,
};

export const HardwardSnapshotRender: FunctionComponent<HardwareSnapshotRenderProps> = ({
  snapshot
}) => {
  const current_instruction = Instructions.deserialize(snapshot.memory.slice(snapshot.instruction_address, snapshot.instruction_address + 4));

  return h(Fragment, {}, [
    h('div', {}, [
      current_instruction.type
    ]),
    h(DataTable, {
      values: snapshot.memory,
      renderValue: (value, index) => {
        if (index >= snapshot.instruction_address && index < snapshot.instruction_address + 4)
          return h('div', { style: styles.instruction }, [
            value,
            h('div', { style: styles.instruction_address }, index),
        ]);
        return h('div', {}, [
          value,
          h('div', { style: styles.address }, index),
        ]);
      }
    }),
    h(DataTable, {
      values: Object.values(snapshot.general_registers),
    }),
  ]);
};
