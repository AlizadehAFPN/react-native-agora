/** Returns 1–2 uppercase initials from a display name. */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** RTM `message` may arrive as string, `Uint8Array`, or an object with a `data` buffer field. */
export function rtmPayloadToUint8Array(raw: unknown): Uint8Array {
  if (raw instanceof Uint8Array) {
    return raw;
  }
  const wrapped = raw as {data?: unknown};
  const inner = wrapped.data ?? raw;
  if (inner instanceof Uint8Array) {
    return inner;
  }
  if (inner instanceof ArrayBuffer) {
    return new Uint8Array(inner);
  }
  if (ArrayBuffer.isView(inner)) {
    const v = inner as ArrayBufferView;
    return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
  }
  return new Uint8Array(inner as ArrayLike<number>);
}
