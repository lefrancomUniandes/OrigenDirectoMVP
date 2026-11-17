import { create } from 'qrcode';

function crc32(data: Uint8Array): number {
  let crc = ~0;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

export async function qrPng(text: string): Promise<Uint8Array> {
  const qr = create(text, { errorCorrectionLevel: 'M' });
  const modules = qr.modules.size;
  const scale = 8;
  const margin = 4;
  const dim = (modules + margin * 2) * scale;
  const rows = new Uint8Array(dim * (dim + 1));
  let offset = 0;
  for (let y = 0; y < dim; y++) {
    rows[offset++] = 0;
    const moduleY = Math.floor(y / scale) - margin;
    for (let x = 0; x < dim; x++) {
      const moduleX = Math.floor(x / scale) - margin;
      const dark =
        moduleY >= 0 &&
        moduleX >= 0 &&
        moduleY < modules &&
        moduleX < modules &&
        qr.modules.get(moduleY, moduleX) === 1;
      rows[offset++] = dark ? 0 : 255;
    }
  }
  const raw = new ArrayBuffer(rows.byteLength);
  new Uint8Array(raw).set(rows);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(raw));
      controller.close();
    },
  });
  const compressed = new Uint8Array(
    await new Response(stream.pipeThrough(new CompressionStream('deflate'))).arrayBuffer(),
  );
  const ihdr = new Uint8Array(13);
  const header = new DataView(ihdr.buffer);
  header.setUint32(0, dim);
  header.setUint32(4, dim);
  ihdr[8] = 8;
  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [signature, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', new Uint8Array())];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of parts) {
    png.set(part, cursor);
    cursor += part.length;
  }
  return png;
}
