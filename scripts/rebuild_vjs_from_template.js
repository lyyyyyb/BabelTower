"use strict";

const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error("[rebuild-vjs] " + message);
  process.exit(1);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function findBlock(buffer, wanted) {
  const count = buffer.readUInt32LE(12);
  for (let index = 0; index < count; index += 1) {
    const entry = 16 + index * 12;
    const name = buffer.toString("ascii", entry, entry + 4);
    if (name !== wanted) continue;
    return {
      entry,
      offset: entry + 4 + buffer.readUInt32LE(entry + 4),
      size: buffer.readUInt32LE(entry + 8),
    };
  }
  return null;
}

const [templatePath, sourcePath, outputPath] = process.argv.slice(2);
if (!templatePath || !sourcePath || !outputPath) {
  fail("usage: node rebuild_vjs_from_template.js <template.vjs_c> <source.js> <output.vjs_c>");
}

const template = fs.readFileSync(templatePath);
const source = fs.readFileSync(sourcePath);
const data = findBlock(template, "DATA");
if (!data || data.offset + data.size !== template.length) fail("template DATA block is invalid");
if (template.readUInt32LE(0) !== template.length) fail("template file size header is invalid");

const oldSource = template.subarray(data.offset, data.offset + data.size);
const oldCrc = crc32(oldSource);
const oldCrcBytes = Buffer.allocUnsafe(4);
oldCrcBytes.writeUInt32LE(oldCrc, 0);
const crcOffset = template.subarray(0, data.offset).indexOf(oldCrcBytes);
if (crcOffset < 0) fail("template source CRC was not found");
if (template.subarray(0, data.offset).indexOf(oldCrcBytes, crcOffset + 1) >= 0) {
  fail("template source CRC is ambiguous");
}

const header = Buffer.from(template.subarray(0, data.offset));
header.writeUInt32LE(header.length + source.length, 0);
header.writeUInt32LE(source.length, data.entry + 8);
header.writeUInt32LE(crc32(source), crcOffset);

const output = Buffer.concat([header, source]);
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, output);
console.log(JSON.stringify({ ok: true, bytes: output.length, sourceBytes: source.length }));
