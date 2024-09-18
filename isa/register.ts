const register_ids = {
  0: 'general_purpose_0',
  1: 'general_purpose_1',
  2: 'general_purpose_2',
  3: 'general_purpose_3',
  4: 'general_purpose_4',
  5: 'general_purpose_5',
  6: 'general_purpose_6',
  7: 'general_purpose_7',
} as const;

export type RegisterID = keyof typeof register_ids;

export const toRegisterId = (value: number): RegisterID => {
  switch (value) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      return value;
    default:
      throw new Error();
  }
}