import { Struct } from "../struct/mod";

export const prelude_struct_def = Struct.define('prelude', [
  'stack_start',
  'heap_start',
  'program_start',
  'unused_0',
  'unused_1',
  'unused_2',
  'unused_3',
  'unused_4',
])