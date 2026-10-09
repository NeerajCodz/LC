/** Observe native buffer allocation without adding synchronous GL queries. */
export function trackNativeBuffers() {
  const contexts = new WeakMap<
    WebGL2RenderingContext,
    {
      bindings: Map<number, WebGLBuffer | null>;
      sizes: WeakMap<WebGLBuffer, number>;
      bytes: number;
      programs: Set<WebGLProgram>;
    }
  >();
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    ...args
  ) {
    const gl = Reflect.apply(original, this, args);
    if (args[0] === "webgl2" && gl && !contexts.has(gl)) {
      const state = {
        bindings: new Map(),
        sizes: new WeakMap(),
        bytes: 0,
        programs: new Set<WebGLProgram>(),
      };
      contexts.set(gl, state);
      Object.defineProperty(this, "nativeBufferBytes", {
        value: () => state.bytes,
      });
      Object.defineProperty(this, "nativeProgramCount", {
        value: () => state.programs.size,
      });
    }
    return gl;
  } as typeof original;
  const prototype = WebGL2RenderingContext.prototype;
  const bind = prototype.bindBuffer,
    allocate = prototype.bufferData,
    free = prototype.deleteBuffer;
  prototype.bindBuffer = function (target, buffer) {
    contexts.get(this)?.bindings.set(target, buffer);
    return bind.call(this, target, buffer);
  };
  prototype.bufferData = function (this: WebGL2RenderingContext, ...args) {
    const state = contexts.get(this),
      buffer = state?.bindings.get(args[0]);
    if (state && buffer) {
      const size =
        typeof args[1] === "number" ? args[1] : (args[1]?.byteLength ?? 0);
      state.bytes += size - (state.sizes.get(buffer) ?? 0);
      state.sizes.set(buffer, size);
    }
    return Reflect.apply(allocate, this, args);
  } as typeof allocate;
  prototype.deleteBuffer = function (buffer) {
    const state = contexts.get(this);
    if (state && buffer) {
      state.bytes -= state.sizes.get(buffer) ?? 0;
      state.sizes.delete(buffer);
    }
    return free.call(this, buffer);
  };
  const createProgram = prototype.createProgram,
    deleteProgram = prototype.deleteProgram;
  prototype.createProgram = function () {
    const program = createProgram.call(this);
    if (program) contexts.get(this)?.programs.add(program);
    return program;
  };
  prototype.deleteProgram = function (program) {
    if (program) contexts.get(this)?.programs.delete(program);
    return deleteProgram.call(this, program);
  };
}
