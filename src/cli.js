'use strict';

// La terminal de Vela. Los mismos comandos del recorrido, uno por uno, para
// poder mirar una puerta sin correr todo el camino. Sin dependencias y sin red.

const path = require('node:path');
const { Vela, UMBRAL } = require('./vela.js');

const AYUDA = `Vela — canal legal para proteger a quien entrega un documento.

  estado <doc>                    qué está pasando con el documento
  pertenencia <doc>               qué se declaró y qué demonstration falta (aquí no hay ZK)
  publicar <doc>                  intenta publicar; se bloquea si faltan verificaciones
  auditar <doc>                   recomputa el estado del documento sin creer al registro

Umbral exigido: ${UMBRAL}. Todos los datos son de EJEMPLO y no cumplen ninguna norma.
`;

async function main() {
  const [comando, ...resto] = process.argv.slice(2);
  const dir = process.env.VELA_DIR || path.join(__dirname, '..', 'datos');
  const v = new Vela({ dir });

  if (!comando || comando === 'ayuda' || comando === '--help') {
    process.stdout.write(AYUDA);
    return dir;
  }
  const id = resto[0];
  if (!id) throw new Error('falta el documento');

  if (comando === 'estado') {
    const e = v.estadoDe(id);
    process.stdout.write(e ? `${JSON.stringify(e, null, 2)}\n` : `no hay documento ${id}\n`);
  } else if (comando === 'pertenencia') {
    process.stdout.write(`${JSON.stringify(v.demostrarPertenencia(id), null, 2)}\n`);
  } else if (comando === 'publicar') {
    const r = await v.publicar({ documento: id });
    process.stdout.write(`${r.estado}: ${r.detalle}\n${r.salida ? `salida: ${r.salida}\n` : ''}`);
  } else if (comando === 'auditar') {
    const sello = v.selloDe(id);
    if (!sello || !sello.recibo) {
      process.stdout.write(`no hay sello de ${id}\n`);
    } else {
      const a = v.auditar(sello.recibo);
      process.stdout.write(`${a.ok ? 'pasa' : 'NO pasa'}: ${a.motivo}\n`);
    }
  } else {
    throw new Error(`comando desconocido: ${comando}\n\n${AYUDA}`);
  }
  return dir;
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`${err.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { main };
