import { ComponentChild, h, VNode } from "preact"
import { useMemo } from 'preact/hooks';
import classes from './Tables.module.css';

export type DataTableProps = {
  values: number[],
  columns?: number,
  renderValue?: (value: number, index: number) => ComponentChild
};

export const DataTable = ({ columns = 8, values, renderValue = v => v }: DataTableProps) => {

  const lines = useMemo(() => {
    return Array.from({ length: Math.ceil(values.length / columns) })
      .map((_, line_index) => {
        return Array.from({ length: columns }).map((_, column_index) => {
          return values[(line_index * columns) + column_index] || 0;
        });
      })
  }, [values, columns]);

  return h('table', { class: classes.table }, [
    h('tr', {}, [
      h('th', {}, ''),
      Array.from({ length: columns }).map((_, column_index) => h('th', {}, column_index))
    ]),
    lines.map((line, line_index) => {
      return h('tr', {}, [
        h('th', {}, "+" + (line_index * columns)),
        line.map((value, column_index) =>
          h('td', {}, renderValue(value, (line_index * columns) + column_index)))
      ])
    })
  ])
}