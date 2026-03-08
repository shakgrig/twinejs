/**
 * Creates twine-<version>-web.zip in dist/ using the version from package.json.
 * Uses archiver for cross-platform zip creation (no system zip required).
 */
import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const distDir = path.join(root, 'dist');
const webDir = path.join(distDir, 'web');
const outputPath = path.join(distDir, `twine-${version}-web.zip`);

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
	console.log(`Created ${path.basename(outputPath)} (${(archive.pointer() / 1024).toFixed(1)} KB)`);
});

archive.on('error', (err) => {
	throw err;
});

archive.pipe(output);
archive.directory(webDir, 'web');
archive.finalize();
