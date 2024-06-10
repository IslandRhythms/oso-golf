'use strict';

import fs from 'fs';
import path from 'path';

export function getHtmlTemplate(): string {
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  return fs.readFileSync(filePath, 'utf-8');
}