/** Finalise streaming RIFF headers so browsers can show duration and seek. */
export function normalizeWaveHeader(input: Uint8Array): Uint8Array {
  const bytes = Buffer.from(input);
  if (bytes.length < 44 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") return input;
  bytes.writeUInt32LE(bytes.length - 8, 4);
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const kind = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    if (kind === "data") {
      if (!size || size > bytes.length - offset - 8) bytes.writeUInt32LE(bytes.length - offset - 8, offset + 4);
      break;
    }
    const next = offset + 8 + size + (size % 2);
    if (next <= offset || next > bytes.length) break;
    offset = next;
  }
  return new Uint8Array(bytes);
}
