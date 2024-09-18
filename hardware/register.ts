export const createRegister = (initialValue: number = 0) => {
  const state = {
    value: initialValue
  };

  const read = () => {
    return state.value;
  };
  const write = (nextValue: number) => {
    state.value = nextValue;
  };

  return { read, write };
};
