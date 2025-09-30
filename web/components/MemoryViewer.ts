import { ComponentChild, FunctionComponent, h } from "preact";
import { useEffect, useRef } from "preact/hooks";

export type MemoryViewerGroup = {
  startInclusive: number,
  endExclusive: number,
  label: string,
  color: string,
};

export type MemoryViewerProps = {
  values: number[],
  groups: MemoryViewerGroup[],
};

const ROW_SIZE = 8;
const CELL_SIZE = 64; // px

const getLogicalPosition = (index: number) => {
  const x = (index % ROW_SIZE);
  const y = (Math.floor(index / ROW_SIZE));
  return { x, y };
}

const getPosition = (index: number) => {
  let { x, y } = getLogicalPosition(index);
  x *= CELL_SIZE;
  y *= CELL_SIZE;
  return { x, y };
}

export const MemoryViewer: FunctionComponent<MemoryViewerProps> = ({ values, groups }) => {
  const viewBox =`0 0 ${CELL_SIZE * ROW_SIZE} ${CELL_SIZE * Math.ceil(values.length / ROW_SIZE)}`;

  return h('svg', { viewBox, style: { width: '100%' } }, [
    values.map((_, index) => {
      const { x, y } = getPosition(index);
      return h('rect', {
        fill: 'white',
        stroke: 'black',
        x,
        y,
        width: CELL_SIZE,
        height: CELL_SIZE,
      })
    }),
    values.map((_, index) => {
      const { x, y } = getPosition(index);
      return h('text', {
        fill: 'black',
        'font-size': '12px',
        x: x + CELL_SIZE - 2,
        y: y + 12,
        'text-anchor': 'end',
      }, index)
    }),
    values.map((value, index) => {
      return h(ValueViewer, { value, index })
    }),
    groups.map(group => {
      return h(GroupViewer, { group });
    })
  ]);
};

type ValueViewerProps = {
  value: number,
  index: number,
}

const ValueViewer: FunctionComponent<ValueViewerProps> = ({ value, index }) => {
  const { x, y } = getPosition(index);

  return h('text', {
    x: x + (CELL_SIZE / 2),
    y: y + (CELL_SIZE / 2) + 6,
    'font-family': 'monospace',
    'text-anchor': 'middle',
    'font-size': '16px'
  }, value);
}

type GroupViewerProps = {
  group: MemoryViewerGroup
}

const GroupViewer: FunctionComponent<GroupViewerProps> = ({ group }) => {

  const startPosition = getLogicalPosition(group.startInclusive);
  const endPosition = getLogicalPosition(group.endExclusive);
  
  const length = group.endExclusive - group.startInclusive;

  return [
    h('rect', {
      fill: group.color,
      opacity: 0.4,
      x: startPosition.x * CELL_SIZE,
      y: startPosition.y * CELL_SIZE,
      width: Math.min(CELL_SIZE * length, (ROW_SIZE - startPosition.x) * CELL_SIZE),
      height: CELL_SIZE
    }),
    h('text', {
      x: startPosition.x * CELL_SIZE + 4,
      y: (startPosition.y * CELL_SIZE) + CELL_SIZE - 4,
      'font-size': '8px'
    }, group.label),
    (endPosition.y - startPosition.y > 1) && h('rect', {
      fill: group.color,
      opacity: 0.4,
      x: 0,
      y: (startPosition.y + 1) * CELL_SIZE,
      width: ROW_SIZE * CELL_SIZE,
      height: (endPosition.y - startPosition.y - 1) * CELL_SIZE
    }),
    startPosition.y !== endPosition.y && endPosition.x > 0 && h('rect', {
      fill: group.color,
      opacity: 0.4,
      x: 0,
      y: endPosition.y * CELL_SIZE,
      width: endPosition.x * CELL_SIZE,
      height: CELL_SIZE
    }),
  ]
};