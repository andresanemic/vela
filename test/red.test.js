'use strict';

// RED de Vela. Escrito ANTES del código, el 2026-09-29.
//
// Los seis rojos que la consigna del proyecto 10 nombra: publicación antes del
// número de verificaciones, verificación de un medio no invitado, verificación
// de un medio que ya firmó, documento alterado después del sello, la fuente
// intenta publicar su propia identidad, e intento de reabrir un documento ya
// publicado. Más el caso de control, que debe pasar: la publicación ocurre al
// alcanzar el número.
//
// Y dos que son del recorte de esta consigna: la demostración de pertenencia
// con conocimiento cero se declara pendiente y no fabrica prueba, y el registro
// no tiene ninguna clave por donde pueda viajar la identidad de la fuente.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Vela, UMBRAL } = require('../src/vela.js');

const T0 = '2026-09-29T12:00:00.000Z';
const VENTANA = '2030-01-01T00:00:00.000Z';

const CONTENIDO = 'Texto de ejemplo: la institucion-ejemplo registra una operacion que sus propios libros contradicen. Documento ficticio.';
const CONTENIDO_ALTERADO = 'Texto de ejemplo, pero editado despues del sello: ya no es lo que la fuente entrego.';

function temporal() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'vela-'));
}

// Un documento entregado y sellado, sin ninguna verificacion.
async function sellado() {
  const dir = temporal();
  const v = new Vela({ dir });
  const sello = await v.entregar({ documento: 'doc-1', institucion: 'institucion-ejemplo', contenido: CONTENIDO });
  return { dir, v, sello };
}

// Un documento entregado, sellado y con el umbral cubierto por medios invitados.
async function verificado(medios = ['medio-1', 'medio-2', 'medio-3']) {
  const { dir, v, sello } = await sellado();
  for (const medio of medios) {
    v.invitar({ documento: 'doc-1', medio, vence: VENTANA });
    await v.verificar({ documento: 'doc-1', medio, now: T0 });
  }
  return { dir, v, sello };
}

test('rojo 1: publicar antes del número de verificaciones se rechaza y deja el motivo', async () => {
  const { v } = await sellado();
  const r = await v.publicar({ documento: 'doc-1', now: T0 });
  assert.equal(r.estado, 'bloqueada');
  assert.match(r.detalle, /exigen|umbral/);
  assert.match(r.detalle, new RegExp(String(UMBRAL)));
  assert.ok(r.salida, 'el bloqueo tiene que decir qué se puede hacer');
  assert.equal(r.recibo.status, 'blocked');
  assert.equal(v.publicacion().length, 0, 'no puede haber publicación antes del número');
  assert.equal(v.estadoDe('doc-1').publicado, false);
});

test('rojo 2: un medio que no fue invitado no verifica', async () => {
  const { v } = await sellado();
  const r = await v.verificar({ documento: 'doc-1', medio: 'medio-4', now: T0 });
  assert.equal(r.estado, 'rechazada');
  assert.match(r.detalle, /invitad/);
  assert.equal(r.recibo.status, 'blocked');
  assert.equal(v.verificaciones('doc-1').length, 0);
});

test('rojo 3: un medio que ya firmó no vuelve a firmar', async () => {
  const { v } = await sellado();
  v.invitar({ documento: 'doc-1', medio: 'medio-1', vence: VENTANA });
  const uno = await v.verificar({ documento: 'doc-1', medio: 'medio-1', now: T0 });
  assert.equal(uno.estado, 'verificada');
  const dos = await v.verificar({ documento: 'doc-1', medio: 'medio-1', now: T0 });
  assert.equal(dos.estado, 'rechazada');
  assert.match(dos.detalle, /ya firmó|una vez|presupuesto/);
  assert.equal(v.verificaciones('doc-1').length, 1);
});

test('rojo 4: un documento alterado después del sello no se publica, ni aunque el número se alcance', async () => {
  const { dir, v } = await verificado();
  // Alguien edita el documento por fuera del sistema, después del sello.
  fs.writeFileSync(path.join(dir, 'doc-1.sellado'), CONTENIDO_ALTERADO, 'utf8');
  const r = await v.publicar({ documento: 'doc-1', now: T0 });
  assert.equal(r.estado, 'bloqueada');
  assert.match(r.detalle, /huella|alterad/);
  assert.equal(v.publicacion().length, 0, 'el número se alcanzó, pero el documento ya no es el sellado');
  const auditoria = v.auditar(v.selloDe('doc-1').recibo);
  assert.equal(auditoria.ok, false);
  assert.match(auditoria.motivo, /huella|alterad/);
});

test('rojo 5: la fuente intenta publicar su propia identidad y el sistema no la acepta', async () => {
  const { dir, v } = await sellado();
  assert.throws(
    () => v.publicar({ documento: 'doc-1', identidad: 'Ana Pérez', now: T0 }),
    /identidad|no lleva el nombre/,
  );
  const crudo = fs.readFileSync(path.join(dir, 'registro.jsonl'), 'utf8');
  assert.equal(crudo.includes('Ana'), false, 'la identidad no puede quedar en el registro');
  assert.equal(crudo.includes('Pérez'), false, 'la identidad no puede quedar en el registro');
});

test('rojo 6: un documento ya publicado no se reabre', async () => {
  const { v } = await verificado();
  const una = await v.publicar({ documento: 'doc-1', now: T0 });
  assert.equal(una.estado, 'publicada');
  const otra = await v.publicar({ documento: 'doc-1', now: T0 });
  assert.equal(otra.estado, 'bloqueada');
  assert.match(otra.detalle, /ya publicad/);
  assert.equal(v.publicacion().length, 1, 'reabrir no agrega una segunda publicación');
});

test('control: al alcanzar el número de verificaciones, la publicación ocurre', async () => {
  const { v, sello } = await verificado();
  const estado = v.estadoDe('doc-1');
  assert.equal(estado.verificaciones, UMBRAL);
  assert.equal(estado.publicado, false, 'antes de publicar sigue sin publicar');
  const r = await v.publicar({ documento: 'doc-1', now: T0 });
  assert.equal(r.estado, 'publicada');
  assert.equal(r.recibo.status, 'verified');
  assert.equal(r.recibo.coverage.includes('umbral-alcanzado'), true);
  assert.equal(v.publicacion().length, 1);
  assert.equal(v.estadoDe('doc-1').publicado, true);
  const auditoria = v.auditar(r.recibo);
  assert.equal(auditoria.ok, true, auditoria.motivo);
  assert.equal(v.selloDe('doc-1').recibo.digest, sello.recibo.digest);
});

test('recorte: la demostración de pertenencia con conocimiento cero se declara pendiente y no fabrica prueba', async () => {
  const { v } = await sellado();
  const p = v.demostrarPertenencia('doc-1');
  assert.equal(p.estado, 'pendiente');
  assert.equal(p.simulado, true);
  assert.equal(p.prueba, null, 'un ejemplo de prueba sería un enlace entre el documento y la fuente');
  assert.match(p.que_haria_falta, /0\.1\.5|verificador ZK/);
});

test('recorte: el registro no tiene ninguna clave por donde pueda viajar la identidad de la fuente', async () => {
  const { dir, v } = await verificado();
  await v.publicar({ documento: 'doc-1', now: T0 });
  const crudo = fs.readFileSync(path.join(dir, 'registro.jsonl'), 'utf8').trim().split('\n').map((x) => JSON.parse(x));
  const prohibidas = /nombre|autor|autora|identidad|contacto|correo|email|telefono|telefono|domicilio|firma|apellido|password|secreto/i;
  for (const linea of crudo) {
    for (const clave of Object.keys(linea)) {
      assert.equal(prohibidas.test(clave), false, `el registro tiene una clave que podría llevar una identidad: ${clave}`);
    }
  }
});
