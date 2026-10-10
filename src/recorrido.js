'use strict';

// El recorrido de Vela: la fuente entrega, el documento queda sellado y sin
// publicar, alguien intenta publicarlo antes de tiempo y no puede, los medios
// invitados verifican uno por uno, y la publicación ocurre cuando se alcanza el
// número. Cada línea sale de una ejecución real. La fuente, la institución, el
// documento y los medios son de EJEMPLO, y esto no cumple ninguna norma.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Vela, UMBRAL, FUENTE, verifyReceipt } = require('./vela.js');

const T0 = '2026-09-29T12:00:00.000Z';
const VENTANA = '2030-01-01T00:00:00.000Z';

const CONTENIDO = 'Texto de ejemplo: la institucion-ejemplo registra una operacion que sus propios libros contradicen. Documento ficticio.';
const MEDIOS = ['medio-1', 'medio-2', 'medio-3'];

function linea(t = '') { process.stdout.write(`${t}\n`); }
function titulo(t) { linea(`\n── ${t}`); }
function mostrar(r, sangria = '  ') {
  linea(`${sangria}estado:  ${r.estado}`);
  linea(`${sangria}detalle: ${r.detalle}`);
  if (r.salida) linea(`${sangria}salida:  ${r.salida}`);
  if (r.recibo) linea(`${sangria}recibo:  ${r.recibo.status} · sello ${String(r.recibo.digest).slice(0, 16)}… · anclaje ${r.recibo.anchor.status} en ${r.recibo.anchor.network}`);
}

async function main() {
  const dir = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'vela-recorrido-'));
  const v = new Vela({ dir });
  linea(`Vela — recorrido completo. Registro en: ${path.join(dir, 'registro.jsonl')}`);
  linea('Fuente, institución, documento y medios son de EJEMPLO. Sin red, sin blockchain, sin pagos, sin un tercero.');
  linea(`Este canal NO es un Anonymous: no vuelve invisible a nadie. Hace que la publicación espere a la verificación. Umbral exigido: ${UMBRAL}.`);

  titulo('1. La fuente entrega el documento');
  linea(`  La fuente entrega como «${FUENTE}»: un asiento sin nombre, sin contacto y sin metadato.`);
  const sello = await v.entregar({ documento: 'doc-1', institucion: 'institucion-ejemplo', contenido: CONTENIDO }, { now: T0 });
  linea(`  estado:  ${sello.estado}`);
  linea(`  huella:  ${sello.huella.slice(0, 32)}…`);
  linea(`  recibo:  ${sello.recibo.status} · sello ${sello.recibo.digest.slice(0, 16)}… · anclaje ${sello.recibo.anchor.status} en ${sello.recibo.anchor.network}`);
  linea('  El documento queda SELLADO y SIN PUBLICAR. Nadie lo ve. La fuente queda sin exponer por algo que no salió.');

  titulo('2. La pertenencia a la institución, y lo que NO está construido');
  const p = v.demostrarPertenencia('doc-1');
  linea(`  institución declarada: ${p.institucion}`);
  linea(`  estado de la demostración: ${p.estado}  ·  simulada: ${p.simulado}  ·  prueba: ${p.prueba === null ? 'ninguna' : p.prueba}`);
  linea(`  qué haría falta: ${p.que_haria_falta}`);
  linea(`  por qué no está aquí: ${p.por_que_no_esta_aqui}`);
  linea('  SIN RODEOS: aquí no hay conocimiento cero corriendo. Hay un lugar donde iría. El verificador ZK');
  linea('  el kernel 0.1.5 lo incluye, pero Vela no integra el verificador y esta demostración sigue pendiente.');

  titulo('3. Alguien intenta publicar antes de tiempo: no puede');
  const temprano = await v.publicar({ documento: 'doc-1' }, { now: T0 });
  mostrar(temprano);
  linea(`  en el registro, publicaciones de doc-1: ${v.publicacion().filter((x) => x.documento === 'doc-1').length}`);

  titulo('4. La fuente intenta colgar su propia identidad: el sistema no la acepta');
  try {
    await v.publicar({ documento: 'doc-1', identidad: 'Ana Pérez' }, { now: T0 });
    linea('  NO DEBERÍA LLEGAR AQUÍ');
  } catch (err) {
    linea(`  rechazado: ${err.message}`);
  }
  linea(`  «Ana» aparece en el registro? ${fs.readFileSync(path.join(dir, 'registro.jsonl'), 'utf8').includes('Ana') ? 'SÍ — eso sería un defecto' : 'no'}`);
  linea('  Ni la fuente ni nadie más puede identificarse por este camino. Tampoco hay forma de filtrar datos de terceros.');
  linea('  Esto no hackea, no filtra y no identifica: no se construye ninguna de las tres, ni siquiera de ejemplo.');

  titulo('5. Un medio que no fue invitado intenta verificar: no puede');
  const noInvitado = await v.verificar({ documento: 'doc-1', medio: 'medio-9' }, { now: T0 });
  mostrar(noInvitado);

  titulo('6. El custodio invita a tres medios (organizaciones de EJEMPLO)');
  for (const medio of MEDIOS) {
    v.invitar({ documento: 'doc-1', medio, vence: VENTANA });
    linea(`  ${medio} invitado, con ventana hasta ${VENTANA.slice(0, 10)}`);
  }
  linea('  Ninguno de estos medios existe, no se contacta a nadie y no hay verificación periodística real detrás.');

  titulo('7. Las verificaciones llegan una por una, y el primero no repite');
  for (const medio of MEDIOS) {
    const r = await v.verificar({ documento: 'doc-1', medio, declara: 'documento-autentico' }, { now: T0 });
    linea(`  ${medio} → ${r.estado} · ${r.detalle}`);
  }
  const repetido = await v.verificar({ documento: 'doc-1', medio: MEDIOS[0] }, { now: T0 });
  linea(`  ${MEDIOS[0]} otra vez → ${repetido.estado}`);
  linea(`      ${repetido.detalle}`);
  const e = v.estadoDe('doc-1');
  linea(`  estado del documento: ${e.verificaciones}/${e.umbral} verificaciones · publicado: ${e.publicado} · intacto: ${e.intacto}`);

  titulo('8. Ahora sí: la publicación ocurre');
  const publicada = await v.publicar({ documento: 'doc-1' }, { now: T0 });
  mostrar(publicada);
  linea(`  cobertura recomputada por el verificador: ${publicada.recibo.coverage.join(', ')}`);
  linea(`  NO cubierto por el recibo: ${publicada.recibo.notCovered.join(', ')}`);
  linea(`  El anclaje quedó en «${publicada.recibo.anchor.status}»: nada llegó a una red. Esto NO está verificado afuera.`);

  titulo('9. Y no se reabre');
  const reabierta = await v.publicar({ documento: 'doc-1' }, { now: T0 });
  mostrar(reabierta);
  linea(`  publicaciones totales de doc-1 en el registro: ${v.publicacion().filter((x) => x.documento === 'doc-1').length}`);

  titulo('10. Un segundo documento: si alguien lo edita después del sello, tampoco sale');
  const otro = await v.entregar({ documento: 'doc-2', institucion: 'institucion-ejemplo', contenido: 'Otro texto de ejemplo, para el caso de la alteración.' }, { now: T0 });
  for (const medio of MEDIOS) {
    v.invitar({ documento: 'doc-2', medio, vence: VENTANA });
    await v.verificar({ documento: 'doc-2', medio, declara: 'documento-autentico' }, { now: T0 });
  }
  linea(`  doc-2 tiene ${v.estadoDe('doc-2').verificaciones}/${UMBRAL} verificaciones y está sellado.`);
  fs.writeFileSync(path.join(dir, 'doc-2.sellado'), 'Texto EDITADO después del sello: ya no es lo que la fuente entregó.', 'utf8');
  linea('  Alguien edita el archivo del documento por fuera del sistema.');
  const alterado = await v.publicar({ documento: 'doc-2' }, { now: T0 });
  mostrar(alterado);
  linea(`  la auditoría del sello lo dice aparte: ${v.auditar(otro.recibo).motivo}`);

  titulo('11. La tercera parte audita sin creer a nadie');
  for (const r of v.recibos()) {
    const s = verifyReceipt(r.recibo);
    const a = v.auditar(r.recibo);
    linea(`  ${r.clase.padEnd(13)} ${r.clave.padEnd(22)} sello ${s.ok ? 'verifica' : 'NO verifica'} · auditoría ${a.ok ? 'pasa' : 'NO pasa'}`);
  }
  const editado = JSON.parse(JSON.stringify(v.selloDe('doc-1').recibo));
  editado.detail = 'todo bien';
  linea(`  un recibo de doc-1 editado a mano → ${v.auditar(editado).motivo}`);

  titulo('12. Lo que cualquiera puede leer sin Vela');
  for (const lineaRegistro of v.leer()) {
    linea(`  ${JSON.stringify(lineaRegistro)}`);
  }
  linea('  — registro.jsonl es un JSONL: se abre con cualquier editor, sin Vela y sin permiso.');

  titulo('13. Lo que este recorrido NO demuestra');
  linea('  - NO hay conocimiento cero corriendo: la demostración de pertenencia es un lugar, no una función.');
  linea('  - NO hay hash en testnet ni recibo en explorador: el anclaje quedó en `pending` a propósito.');
  linea('  - NO hay hackeo, NO hay filtrado y NO hay identificación de la fuente, ni reales ni simulados.');
  linea('  - NO hay medios reales: las tres organizaciones son de fantasía, no se contacta a nadie');
  linea('    y no hay ninguna verificación periodística real detrás de este recorrido.');
  linea('  - NO cumple ninguna norma y no se le atribuye ninguna: no hay ancla normativa que citar.');
  linea('  - NO es un Anonymous: nadie se vuelve invisible aquí. Lo que hay es una publicación que espera.');
  linea('  - El umbral de tres es un parámetro del proyecto, no una cifra acordada.');
  linea('');
  return dir;
}

if (require.main === module) {
  main().then((dir) => { process.stdout.write(`registro: ${path.join(dir, 'registro.jsonl')}\n`); });
}

module.exports = { main };
