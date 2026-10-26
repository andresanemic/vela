'use strict';

// El corte del núcleo, verificado por bytes.
//
// Vela consume la copia del kernel que Lore Plugin instala en los tres hosts.
// Esa copia tiene un encabezado de procedencia de tres líneas y, debajo, los
// bytes exactos del commit fijado. Estos cinco digest son los que ese
// `SOURCE.md` declara; si el corte se mueve, esta prueba falla en vez de dejar
// que el proyecto siga corriendo contra un núcleo que nadie revisó.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const KERNEL = path.join(__dirname, '..', 'vendor', 'vespi-kernel');

const ESPERADOS = {
  'authority.js': '6cdf59ff884c5acc51ea00d7dfa946b6cf2058b67f4779e63250edfc0623d946',
  'continuity.js': 'abbee9cab8c92b2c4680dba2d573bf8eb6a50ab63194e4a0b0b525af5f044e6c',
  'delegation.js': 'd6c96c7fbfe02c7d2c2dc0ec7b5ca54bdc78d8ebdd3e4e5f802b0912183399c4',
  'operation.js': '5cf64d6bd477ef0f2dd2a5ebc8ec3b391473763d101f8fcb3819000434848399',
  'receipt.js': '0a443b45967efdf23a6ddaa3abd00361acc87b59297bae94e929b99abe11d69a',
};

test('el núcleo que consume Vela es el corte fijado, módulo por módulo', () => {
  for (const [archivo, esperado] of Object.entries(ESPERADOS)) {
    const crudo = fs.readFileSync(path.join(KERNEL, archivo));
    const cuerpo = crudo.slice(crudo.indexOf(10, crudo.indexOf(10, crudo.indexOf(10) + 1) + 1) + 1);
    const real = createHash('sha256').update(cuerpo).digest('hex');
    assert.equal(real, esperado, `${archivo}: el núcleo se movió; repínalo a mano y vuelve a correr la suite`);
  }
});

test('el encabezado de los cinco módulos declara el mismo commit', () => {
  const commits = new Set();
  for (const archivo of Object.keys(ESPERADOS)) {
    const lineas = fs.readFileSync(path.join(KERNEL, archivo), 'utf8').split('\n').slice(0, 3).join(' ');
    const encontrado = lineas.match(/commit ([0-9a-f]{7,40})/);
    assert.ok(encontrado, `${archivo}: el encabezado no declara un commit`);
    commits.add(encontrado[1].slice(0, 7));
  }
  assert.equal(commits.size, 1, `los cinco módulos no apuntan al mismo commit: ${[...commits].join(', ')}`);
});
