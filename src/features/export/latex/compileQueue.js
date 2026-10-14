/** Run compile tasks one at a time. A failure does not block the next task. */
export const createCompileQueue = () => {
  let tail = Promise.resolve();
  return (task) => {
    const run = tail.then(() => task(), () => task());
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
};
