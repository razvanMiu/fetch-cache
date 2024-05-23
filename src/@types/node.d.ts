import type { RequestInit as NodeRequestInit } from "node-fetch";

declare module "node-fetch" {
  export interface RequestInit extends NodeRequestInit {
    tags?: string[];
  }
}

declare global {
  namespace NodeJS {
    export interface RequestInit extends NodeRequestInit {
      tags?: string[];
    }
  }
}
