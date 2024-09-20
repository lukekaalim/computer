import { defineStruct } from "../codegen/struct";

export const prelude_struct_def = defineStruct('prelude', [
  'stack_start',
  'heap_start',
  'program_start'
])