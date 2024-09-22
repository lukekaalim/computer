import { FunctionComponent, h } from "preact";
import { StructDefinition } from "../../compiler/codegen/struct";
import classes from './Tables.module.css';

export type StructTableProps = {
  struct_def: StructDefinition,
  address?: number,
  values: number[]
};

export const StructTable: FunctionComponent<StructTableProps> = ({ struct_def, values, address }) => {
  return h('table', { class: classes.table }, [
    typeof address === 'number' && [
      h('tr', {}, h('th', { colSpan: struct_def.fields.length }, address))
    ],
    h('tr', {}, struct_def.fields.map(field => h('th', {}, field))),
    h('tr', {}, values.map(value => h('td', {}, value))),
  ])
};