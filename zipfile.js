// Reads one file out of a .zip archive, with no outside library, and compares version numbers. The updater uses it to
// take the AppImage out of the release zip. It handles stored and deflated entries in archives under 4 GB.
const zlib = require('node:zlib');

const END_RECORD = 0x06054b50;
const CENTRAL_HEADER = 0x02014b50;
const LOCAL_HEADER = 0x04034b50;

function findEndRecord(zip) {
  for (let at = zip.length - 22; at >= Math.max(0, zip.length - 65557); at--) {
    if (zip.readUInt32LE(at) === END_RECORD) return at;
  }
  throw new Error('not a zip file');
}

/** The first file whose name passes nameMatches, as a Buffer. Throws when the zip has no such file. */
function readZipFile(zip, nameMatches) {
  const end = findEndRecord(zip);
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  if (count === 0xffff || at === 0xffffffff) throw new Error('zip64 archives are not supported');

  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(at) !== CENTRAL_HEADER) throw new Error('the zip is damaged');
    const method = zip.readUInt16LE(at + 10);
    const size = zip.readUInt32LE(at + 24);
    const compressedSize = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const extraLength = zip.readUInt16LE(at + 30);
    const commentLength = zip.readUInt16LE(at + 32);
    const localAt = zip.readUInt32LE(at + 42);
    // Some tools write folder separators as backslashes. Compare names with forward slashes either way.
    const name = zip.toString('utf8', at + 46, at + 46 + nameLength).replace(/\\/g, '/');
    at += 46 + nameLength + extraLength + commentLength;
    if (!nameMatches(name)) continue;

    if (zip.readUInt32LE(localAt) !== LOCAL_HEADER) throw new Error('the zip is damaged');
    const start = localAt + 30 + zip.readUInt16LE(localAt + 26) + zip.readUInt16LE(localAt + 28);
    const packed = zip.subarray(start, start + compressedSize);
    let data;
    if (method === 0) data = Buffer.from(packed);
    else if (method === 8) data = zlib.inflateRawSync(packed);
    else throw new Error(`unsupported zip compression ${method}`);
    if (data.length !== size) throw new Error('the zip is damaged');
    return data;
  }
  throw new Error('no matching file in the zip');
}

/** True when version a is newer than version b, comparing numbers, so 0.10.0 is newer than 0.9.1. */
function isNewer(a, b) {
  const pa = String(a).replace(/^v/i, '').split('.').map(Number);
  const pb = String(b).replace(/^v/i, '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

module.exports = { readZipFile, isNewer };
