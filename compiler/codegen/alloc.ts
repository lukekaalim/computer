import { defineStruct } from "./struct";

export const alloc_state_def = defineStruct('Allocator State', [
  'next_free_slot',
  'allocation_count',
]);