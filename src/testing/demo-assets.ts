import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { installDemoAssetLoader } from '../app/core/db/demo-seed';

export function installDemoAssets(): void {
  installDemoAssetLoader(async (filename) => {
    const file = await readFile(join(process.cwd(), 'src', 'assets', filename));
    return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
  });
}
