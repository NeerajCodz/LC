// Avoid two temporary WebGPU devices competing with the WebGL scene at startup.
let tail: Promise<unknown> = Promise.resolve();
export function queueBake<T>(task: () => Promise<T>): Promise<T> {
  const result = tail.then(task);
  tail = result.catch(() => undefined);
  return result;
}
