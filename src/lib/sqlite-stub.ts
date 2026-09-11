/** Worker-build stub so `node:sqlite` is never bundled into Cloudflare. */
export class DatabaseSync {
  constructor() {
    throw new Error("node:sqlite is not available on Cloudflare Workers.");
  }
}
