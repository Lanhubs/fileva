/**
 * Pure client-side binary ICO encoder.
 * Packs multiple PNG blobs (e.g. 16x16, 32x32, 48x48) into a valid Windows multi-resolution ICO file.
 * Uses native ArrayBuffer and DataView. Zero external dependencies.
 */
export async function createIcoFromPngs(
  pngEntries: Array<{ width: number; height: number; blob: Blob }>
): Promise<Blob> {
  const count = pngEntries.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + count * dirEntrySize;

  // Convert all blobs to Uint8Arrays
  const buffers: Uint8Array[] = [];
  for (const entry of pngEntries) {
    const arrayBuffer = await entry.blob.arrayBuffer();
    buffers.push(new Uint8Array(arrayBuffer));
  }

  // Calculate total file size
  const totalDataSize = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const totalFileSize = dirSize + totalDataSize;

  const icoBuffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(icoBuffer);
  const uint8View = new Uint8Array(icoBuffer);

  // 1. Write ICO Header
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Type 1 = ICO
  view.setUint16(4, count, true); // Number of images

  // 2. Write Directory Entries and Copy PNG byte buffers
  let currentDataOffset = dirSize;

  for (let i = 0; i < count; i++) {
    const entry = pngEntries[i];
    const buffer = buffers[i];
    const entryOffset = headerSize + i * dirEntrySize;

    const w = entry.width >= 256 ? 0 : entry.width;
    const h = entry.height >= 256 ? 0 : entry.height;

    view.setUint8(entryOffset + 0, w); // Width
    view.setUint8(entryOffset + 1, h); // Height
    view.setUint8(entryOffset + 2, 0); // Palette colors count (0 = no palette)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32bpp RGBA)
    view.setUint32(entryOffset + 8, buffer.byteLength, true); // Size of image data
    view.setUint32(entryOffset + 12, currentDataOffset, true); // Offset to image data

    // Copy PNG bytes into payload position
    uint8View.set(buffer, currentDataOffset);
    currentDataOffset += buffer.byteLength;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}
