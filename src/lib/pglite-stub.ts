/** Production stub so PGLite WASM is never bundled into the Cloudflare Worker. */
export class PGlite {
  constructor() {
    throw new Error("PGLite is not available on Cloudflare Workers.");
  }
}
