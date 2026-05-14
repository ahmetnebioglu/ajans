/**
 * Server-only exports
 * Bu dosya sadece server component'lerde ve server action'larda kullanılmalıdır.
 * Client component'lerde import etmeyin!
 */

export * from "./settings";
export * from "./netgsm";
export { protectedAction } from "./actions/protected-action";
export type { ActionContext, ActionResponse } from "./actions/protected-action";
