export const createClock = () => {
  const listeners: (() => void)[] = [];

  const listen = (listener: () => void) => {
    listeners.push(listener);
  };

  const tick = () => {
    for (const listener of listeners) {
      listener();
    }
  }

  return { listen, tick }
};

export type Clock = ReturnType<typeof createClock>;
