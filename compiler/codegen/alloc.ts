import { Core, RegisterID } from "isa";
import { CodegenInstruction, group, loadVar } from "./instructions";
import { defineStruct, generateWriteStruct, getStructSize } from "./struct";

export const alloc_state_def = defineStruct('Allocator State', [
  'next_free_slot',
  'allocation_count',
]);

export const global_vars = [
  'alloc_state_addr'
] as const;

/**
 * Create a segment that allocates a block of memory
 * using the global allocator.
 * 
 * @param size_rid 
 * @param destination_rid 
 * @param tmp_0_rid 
 * @param tmp_1_rid 
 * @returns 
 */
export const generateAlloc = (
  size_rid: RegisterID,
  destination_rid: RegisterID,
  
  tmp_0_rid: RegisterID,
  tmp_1_rid: RegisterID,
): CodegenInstruction[] => {

  return [
    group([
      loadVar('alloc_state_addr', destination_rid),
      // store address to allocator (copy this to tmp0 as well)
      // read allocator to get next slot
      Core.factory.copy(destination_rid, tmp_0_rid),
      Core.factory.read(destination_rid, destination_rid),
  
      // (now, to update the allocater)
      Core.factory.add(size_rid, destination_rid, tmp_1_rid),
      Core.factory.write(tmp_0_rid, tmp_1_rid),
    ], 'alloc')
  ];
}

/**
 * Generates the structures that are needed to init the allocator,
 * before any allocation gets made
 */
export const generateAllocInitalizer = (
  temp_0_rid: RegisterID,
  temp_1_rid: RegisterID,
  temp_2_rid: RegisterID
) => {
  return [group([
    loadVar('heap_start', temp_0_rid),
    Core.factory.put(getStructSize(alloc_state_def), temp_1_rid),
    
    Core.factory.add(temp_0_rid, temp_1_rid, temp_1_rid),
    ...generateWriteStruct(
      temp_0_rid,
      temp_1_rid,
      temp_2_rid,
      alloc_state_def,
      'next_free_slot'
    ),
    Core.factory.put(0, temp_1_rid),
    ...generateWriteStruct(
      temp_0_rid,
      temp_1_rid,
      temp_2_rid,
      alloc_state_def,
      'allocation_count'
    ),
  ], 'allocater_initializer')];
}