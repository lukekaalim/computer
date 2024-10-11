import { FunctionComponent, h } from "preact";
import classes from './Tables.module.css';
import { Struct } from "../../compiler/struct/mod";

export type StructTableProps = {
  struct_def: Struct.Definition,
  address?: number,
  values: number[]
};

export const StructTable: FunctionComponent<StructTableProps> = ({ struct_def, values, address }) => {
  return h('table', { class: classes.table }, [
    [
      h('tr', {}, h('th', { colSpan: struct_def.fields.length }, `${struct_def.name}` + (address ? ` (${address})` : '')))
    ],
    h('tr', {}, struct_def.fields.map(field => h('th', {}, field))),
    h('tr', {}, values.map(value => h('td', {}, value))),
  ])
};