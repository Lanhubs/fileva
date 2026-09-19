import JSZip from 'jszip';

export interface ZipFileEntry {
  name: string;
  blob: Blob;
  folder?: string;
}

export async function createZipArchive(entries: ZipFileEntry[]): Promise<Blob> {
  const zip = new JSZip();

  for (const entry of entries) {
    if (entry.folder) {
      zip.folder(entry.folder)?.file(entry.name, entry.blob);
    } else {
      zip.file(entry.name, entry.blob);
    }
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
