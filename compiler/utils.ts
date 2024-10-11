let id_counter = 0;

export const id = (namespace: string): string => {
  return `${namespace}:${id_counter++}`;
};