// Gimme Golf operates in Utah (America/Denver). Always derive "today" from
// the Denver calendar — never from `new Date().toISOString()`, which is UTC.
// On the Vercel server (UTC) and in the evening locally, UTC has already
// rolled to tomorrow, so a UTC "today" lands a day ahead. en-CA formats as
// YYYY-MM-DD.
//
// IMPORTANT: only use this on a *real* instant (e.g. `new Date()` / now+offset).
// Do NOT use it on stored booking start_times, which are saved as UTC-literal
// local times — those must keep using `toISOString()` to read back correctly.
export function denverDateStr(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver" }).format(d);
}
