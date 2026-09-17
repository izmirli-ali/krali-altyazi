#!/usr/bin/env node
/*
 * KRALI ALTYAZI release guard
 *
 * Runs without npm dependencies. It reads the shipped ZIP rather than an
 * unpacked working copy so the check applies to the exact OTA payload.
 * Usage: node scripts/verify-appearance-release.js [path/to/release.zip]
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const zipPath = path.resolve(process.argv[2] || 'KRALI_ALTYAZI_v6.6.2_OTA_FINAL.zip');
if (!fs.existsSync(zipPath)) throw new Error(`Paket bulunamadı: ${zipPath}`);

function list() {
  return execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' }).trim().split(/\r?\n/);
}
function read(entry) {
  return execFileSync('unzip', ['-p', zipPath, entry], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
}
function expect(name, condition) {
  if (!condition) throw new Error(`FAIL ${name}`);
  console.log(`PASS ${name}`);
}

const files = list();
const root = files.find(x => /index\.html$/.test(x)).replace(/index\.html$/, '');
const html = read(`${root}index.html`);
const css = read(`${root}style.css`);
const app = read(`${root}js/app.js`);
const host = read(`${root}jsx/host.jsx`);

expect('v6.6.2 package identity', html.includes('KRALİ - ALTYAZI v6.6.2') && app.includes('version:"6.6.2"'));

const requiredInputs = [
  'k26FillOn', 'k26Fill',
  'k26StrokeOn', 'k26Stroke', 'k26StrokeW',
  'k26BgOn', 'k26Bg', 'k26BgOp',
  'k26ShadowOn', 'k26Shadow', 'k26ShadowBlur'
];
requiredInputs.forEach(id => expect(`authoritative input #${id}`, (html.match(new RegExp(`id="${id}"`, 'g')) || []).length === 1));

const expectedRows = [
  '["Dolgu","k26FillOn","k26Fill",null]',
  '["Kontur","k26StrokeOn","k26Stroke","k26StrokeW"]',
  '["Arka Plan","k26BgOn","k26Bg","k26BgOp"]',
  '["Gölge","k26ShadowOn","k26Shadow","k26ShadowBlur"]'
];
expect('four intended appearance rows', expectedRows.every(row => app.includes(row)));
expect('main rows have no sliders', css.includes('#krali661main input[type=range],#krali661main .v53range{display:none!important}'));
expect('controls move before container cleanup',
  app.indexOf('var rows=document.createDocumentFragment()') >= 0 &&
  app.indexOf('var rows=document.createDocumentFragment()') < app.indexOf('box.innerHTML="";box.appendChild(rows)')
);
expect('advanced section remains separate', app.includes('master.innerHTML=\'<summary>GELİŞMİŞ <span>›</span></summary>'));

expect('shared Canvas renderer preserved', app.includes('function k31draw(ctx,W,H,text)'));
expect('timeline writer preserved', host.includes('writeKraliTextTrackV50=function(payloadJSON)'));
expect('ASR export preserved', host.includes('exportAsMediaDirect') && app.includes('whisper-cli'));

console.log('\nKRALI appearance release guard tamamlandı.');
