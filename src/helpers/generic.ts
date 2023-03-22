import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function readDirRecursive(dir: string): Promise<string[]> {
  const files = await readdir(dir, { withFileTypes: true });

  const paths = files.map(async file => {
    const path = join(dir, file.name);

    if (file.isDirectory()) return await readDirRecursive(path);

    return path;
  });

  return (await Promise.all(paths)).flat(Infinity) as string[];
}

export function resolveVar<T>(val: string, map: Record<string, T>) {
  const keys = Object.keys(map);
  const idx = keys.findIndex(e => e.toLowerCase() == val.toLowerCase());
  if (idx < 0) { throw new Error(`Invalid env. variable - ${val}`); }
  return map[keys[idx]];
}