export function parseTimestamp(ts: any): number {
  if (ts == null) return NaN
  // primitives
  if (typeof ts === "number") return ts
  if (typeof ts === "string") {
    const n = Date.parse(ts)
    return Number.isNaN(n) ? NaN : n
  }

  // If it's an object produced by Java's ZonedDateTime serialization
  // e.g. { year, monthValue, dayOfMonth, hour, minute, second, nano }
  if (typeof ts === "object") {
    // Mongo / Spring may serialize Date as ISO string inside $date
    if (ts.$date) {
      const n = Date.parse(ts.$date)
      return Number.isNaN(n) ? NaN : n
    }

    const year = ts.year ?? ts.y ?? null
    const month = ts.monthValue ?? ts.month ?? ts.m ?? null
    const day = ts.dayOfMonth ?? ts.day ?? ts.d ?? null
    if (year != null && month != null && day != null) {
      const hour = ts.hour ?? ts.h ?? 0
      const minute = ts.minute ?? ts.min ?? 0
      const second = ts.second ?? ts.s ?? 0
      const nano = ts.nano ?? ts.nanosecond ?? 0
      return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6)).getTime()
    }

    // Firestore-like object
    if (ts.seconds != null && ts.nanoseconds != null) {
      return ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1e6)
    }
  }

  return NaN
}
