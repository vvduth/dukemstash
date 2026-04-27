export type ActionFail = { success: false; error: string };
export type ActionOk<T = void> = T extends void
  ? { success: true }
  : { success: true; data: T };
export type ActionResult<T = void> = ActionOk<T> | ActionFail;

export function fail(error: string): ActionFail {
  return { success: false as const, error };
}

export function ok(): { success: true };
export function ok<T>(data: T): { success: true; data: T };
export function ok<T>(data?: T) {
  if (data === undefined) {
    return { success: true as const };
  }
  return { success: true as const, data };
}
