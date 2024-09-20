export const register_ids = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export type RegisterID = typeof register_ids[number];

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