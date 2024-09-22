import { defineStruct } from "../codegen/struct";

export const prelude_struct_def = defineStruct('prelude', [
  'stack_start',
  'heap_start',
  'program_start',
  'unused_0',
  'unused_1',
  'unused_2',
  'unused_3',
  'unused_4',
])