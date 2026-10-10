'use strict';

// Vela — proyecto 10 de los diez de Vespi: «proteger a quien dice la verdad».
//
// Este archivo es la carrocería; el núcleo ejecutable es el kernel de Vespi, que
// este proyecto consume sin modificar. El predicado de suficiencia, la
// operación, el recibo sellado y su verificación son del núcleo. Lo que el
// núcleo no puede expresar y este proyecto agrega son el sello, la invitación,
// la cuenta de verificaciones y el bloqueo de la publicación.
//
// Lo que sí funciona de verdad aquí es el bloqueo. La demostración de
// pertenencia con conocimiento cero NO está construida: el verificador ZK es
// aunque el kernel 0.1.5 lo incluye, este proyecto todavía no lo integra y conserva el lugar
// donde iría. `demostrarPertenencia` dice lo que falta y no fabrica una prueba,
// porque un ejemplo de prueba sería un enlace entre el documento y la fuente —
// exactamente el defecto que este proyecto no construye.
//
// El núcleo se carga desde la copia vendorizada que Lore Plugin instala en los
// hosts, no desde el árbol de desarrollo: esa copia está fijada al corte y sus
// bytes están declarados en su `SOURCE.md`, mientras el árbol de desarrollo
// avanza. `test/kernel.test.js` verifica esas huellas, así que si el corte se
// mueve, esta suite lo dice.

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const KERNEL = '../vendor/vespi-kernel';

const { sufficient } = require(`${KERNEL}/authority.js`);
const { createOperation, runOperation } = require(`${KERNEL}/operation.js`);
const { verifyReceipt } = require(`${KERNEL}/receipt.js`);

const REGISTRO = 'registro.jsonl';

// El número de verificaciones que exige la publicación. La consigna dice «varios
// medios» y no fija la cifra: este es un parámetro del proyecto, no un número
// acordado, y se cambia en esta línea. Nada más del proyecto depende de él.
const UMBRAL = 3;

// Lo que el verificador independiente tiene que recomputar desde el registro.
// Devolver un subconjunto, o agregar uno propio, es creerle al ejecutor en vez
// de mirar; `auditar` rechaza las dos cosas.
const CHECKS_INDEPENDIENTES = [
  'sello-intacto',
  'umbral-alcanzado',
  'medios-invitados',
  'sin-firmas-repetidas',
  'publicacion-consistente',
  'sin-identidad-en-el-registro',
];

// Las claves que podrían llevar la identidad de alguien. La API las rechaza y la
// auditoría las busca en todo el registro, incluidas las claves anidadas: la
// prohibición de identificar a la fuente es de construcción, no de uso.
const CLAVES_DE_IDENTIDAD = [
  'identidad', 'nombre', 'autor', 'autora', 'apellido', 'contacto', 'correo',
  'email', 'telefono', 'domicilio', 'firma', 'password', 'secreto',
];

// Lo que un medio puede declarar es un conjunto cerrado, no texto libre. Una
// frase libre sería, técnicamente, un lugar donde el nombre de la fuente podría
// quedar escrito —y un filtro de palabras sobre prosa produce falsos positivos
// que convierten el control en teatro—. Verificar es una atestación sobre un
// hecho: el documento es auténtico, está incompleto, o el medio no puede
// certificarlo. Nada más.
const DECLARACIONES = ['documento-autentico', 'documento-incompleto', 'no-puedo-verificar'];

// El asiento de la fuente. No es un perfil: no hay nombre, ni contacto, ni
// metadato que la distinga de otra entrega. El registro dice `fuente-1` y nada
// más, y ninguna clave del registro tiene espacio para decir quién es.
const FUENTE = 'fuente-1';

function entero(value) {
  if (typeof value === 'bigint') return value >= 0n ? value : null;
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 ? BigInt(value) : null;
  return typeof value === 'string' && /^\d+$/.test(value) ? BigInt(value) : null;
}

function texto(value) {
  return typeof value === 'string' && value.length > 0;
}

function huellaDe(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function huellaDeJson(value) {
  return createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex');
}

function iso(now) {
  if (now === undefined || now === null) return new Date().toISOString();
  const ms = Date.parse(now);
  return Number.isNaN(ms) ? new Date().toISOString() : new Date(ms).toISOString();
}

class Vela {
  constructor({ dir, umbral = UMBRAL } = {}) {
    this.dir = dir;
    this.umbral = entero(umbral) === null ? UMBRAL : Number(umbral);
    this.ruta = path.join(dir, REGISTRO);
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.ruta)) fs.writeFileSync(this.ruta, '', 'utf8');
  }

  leer() {
    return fs.readFileSync(this.ruta, 'utf8').split('\n').filter((l) => l.trim().length > 0).map((l) => JSON.parse(l));
  }

  escribir(linea) {
    fs.appendFileSync(this.ruta, `${JSON.stringify(linea)}\n`, 'utf8');
    return linea;
  }

  lineas(tipo) {
    return this.leer().filter((l) => l.tipo === tipo);
  }

  documentos() { return this.lineas('documento'); }
  invitaciones() { return this.lineas('invitacion'); }
  verificaciones(documento) { return this.lineas('verificacion').filter((v) => v.documento === documento); }
  publicacion() { return this.lineas('publicacion'); }
  recibos() { return this.lineas('recibo'); }

  documentoDe(id) {
    return this.documentos().find((d) => d.id === id) || null;
  }

  // El contenido sellado vive en su propio archivo y no en el registro: el
  // registro describe el estado del documento, y el documento es una cosa
  // aparte. Alguien que edite el archivo está alterando el documento, y el
  // sello se entera porque las huellas dejan de calzar.
  rutaSellada(id) {
    return path.join(this.dir, `${id}.sellado`);
  }

  contenidoDe(id) {
    const ruta = this.rutaSellada(id);
    return fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : null;
  }

  huellaActual(id) {
    const contenido = this.contenidoDe(id);
    return contenido === null ? null : huellaDe(contenido);
  }

  selloDe(id) {
    const documento = this.documentoDe(id);
    if (!documento) return null;
    const recibo = this.recibos().find((r) => r.clave === `sello:${id}`);
    return { documento, recibo: recibo ? recibo.recibo : null };
  }

  estadoDe(id) {
    const documento = this.documentoDe(id);
    if (!documento) return null;
    const verificaciones = this.verificaciones(id);
    const publicadas = this.publicacion().filter((p) => p.documento === id);
    const pendientes = Math.max(0, this.umbral - verificaciones.length);
    return {
      documento: id,
      sellado: true,
      publicado: publicadas.length > 0,
      verificaciones: verificaciones.length,
      umbral: this.umbral,
      pendiente: pendientes,
      intacto: this.huellaActual(id) === documento.huella,
      invitaciones: this.invitaciones().filter((i) => i.documento === id).length,
    };
  }

  // --- La puerta: lo que el grant no puede decir, y después el predicado ---

  // Lo primero, antes de correr nada: esta puerta no tiene campo para la
  // identidad de la fuente. Si el que llama intenta entregarla, se rechaza en
  // el umbral y no se escribe una línea.
  rechazarIdentidad(spec) {
    for (const clave of Object.keys(spec || {})) {
      if (CLAVES_DE_IDENTIDAD.includes(clave.toLowerCase())) {
        throw new Error(
          `«${clave}» no se acepta: este canal no lleva el nombre de quien entrega el documento. `
          + 'La fuente entrega el documento y el registro guarda un asiento, no una persona.',
        );
      }
    }
  }

  evaluarPublicacion(id, now) {
    const documento = this.documentoDe(id);
    if (!documento) {
      return {
        ok: false,
        motivo: `no hay documento sellado ${String(id)}: publicar no es un atajo para saltarse el sello`,
        salida: 'la fuente entrega primero el documento por el canal; el sello es lo que abre la cuenta de verificaciones',
      };
    }
    const actual = this.huellaActual(id);
    if (actual !== documento.huella) {
      return {
        ok: false,
        motivo: `el documento ${id} fue alterado después del sello: su huella ya no calza con la del sello `
          + `(sellado ${documento.huella.slice(0, 12)}…, ahora ${String(actual).slice(0, 12)}…)`,
        salida: 'un documento que cambió después de sellarse no se publica: se entrega de nuevo, con su propio sello',
      };
    }
    const publicadas = this.publicacion().filter((p) => p.documento === id);
    if (publicadas.length > 0) {
      return {
        ok: false,
        motivo: `el documento ${id} ya publicado desde ${publicadas[0].en} no se reabre: `
          + 'una publicación no es un estado que se pueda volver a entrar',
        salida: 'nada que hacer: lo que se decidió de este documento ya salió',
      };
    }
    const hechas = this.verificaciones(id);
    const ventana = this.invitaciones().filter((i) => i.documento === id).map((i) => i.vence).sort().pop() || null;
    // El grant de publicación se arma AHORA, con las verificaciones que el
    // registro sostiene en este instante. No se escribe antes de tiempo: si
    // alguien edita el registro, el grant se arma con lo editado y el recibo
    // deja de verificar.
    const autoridad = {
      spend: [{
        asset: `confirmacion:${id}`,
        maxAmount: String(hechas.length),
        to: 'publicacion:local',
        ...(ventana ? { expiresAt: ventana } : {}),
      }],
    };
    const check = sufficient([{ asset: `confirmacion:${id}`, amount: String(this.umbral), to: 'publicacion:local' }], autoridad, { now });
    if (!check.ok) {
      const faltan = this.umbral - hechas.length;
      return {
        ok: false,
        autoridad: { spend: [] },
        motivo: `no se publica ${id}: hay ${hechas.length} ${hechas.length === 1 ? 'verificación' : 'verificaciones'} `
          + `y se exigen ${this.umbral}. Faltan ${faltan}. El núcleo lo dice con su propia cuenta: ${check.reason}`,
        salida: `invita a ${faltan} ${faltan === 1 ? 'medio' : 'medios'} más y deja que verifique; `
          + 'nadie puede publicar antes, tampoco quien administra el canal',
      };
    }
    // Y antes de dejar que `perform` escriba la línea de publicación, se
    // recomputa **todo** lo que la auditoría va a exigir. Sin esto, `perform`
    // correría primero y dejaría el documento publicado en el registro mientras
    // el recibo decía otra cosa: el registro afirmaría una publicación que la
    // verificación nunca aprobó.
    const motivoRecomputado = this.puertaDeRecomputacion(id);
    if (motivoRecomputado) {
      return {
        ok: false,
        autoridad: { spend: [] },
        motivo: `no se publica ${id}: el registro no sostiene lo que la publicación afirmaría. ${motivoRecomputado}`,
        salida: 'se revisa lo que el registro dice antes de publicar: si algo no calza, primero se corrige el registro, no el veredicto',
      };
    }
    return { ok: true, autoridad, ventana, hechas };
  }

  puertaDeRecomputacion(id) {
    const recomputado = this.recomputar(id);
    const caidas = Object.keys(recomputado.checks).filter((c) => !recomputado.verificadas.includes(c));
    if (caidas.length === 0) return null;
    return caidas.map((c) => recomputado.motivos[c]).join('; ');
  }

  capacidadSellar(id, contenido, institucion, puerta) {
    const self = this;
    return {
      id: 'vela:entregar',
      required: () => {
        if (!puerta.ok) return { impossible: true, reason: puerta.motivo, exit: puerta.salida };
        return { spend: [{ asset: `documento:${id}`, amount: '1', to: 'registro:local' }] };
      },
      perform: async () => {
        fs.writeFileSync(self.rutaSellada(id), contenido, 'utf8');
        const linea = {
          tipo: 'documento',
          id,
          institucion,
          fuente: FUENTE,
          huella: huellaDe(contenido),
          en: iso(),
        };
        self.escribir(linea);
        return {
          ok: true,
          evidence: { operationId: id, type: 'sello', status: 'sellado', code: linea.huella },
        };
      },
      io: { verify: (evidencia) => self.verificarSello(evidencia) },
    };
  }

  async verificarSello(evidencia) {
    const id = evidencia && evidencia.operationId;
    const documentos = this.lineas('documento').filter((d) => d.id === id);
    const documento = documentos[0] || null;
    const checks = {
      'documento-registrado': documentos.length === 1,
      'huella-del-sello': Boolean(documento) && this.huellaActual(id) === documento.huella,
    };
    const verified = Object.values(checks).every((x) => x === true);
    return { verified, checks, reason: verified ? 'el documento está sellado y su contenido calza' : 'el documento no está sellado como el registro dice' };
  }

  // --- Entregar: el sello, y a partir de ahí nada sale ---

  // La puerta más externa de todas, antes de mirar el documento, antes del
  // grant y antes de cualquier espera: si alguien intenta colgar su identidad de
  // la entrega, se rechaza de inmediato y no se escribe una línea. Por eso
  // `entregar` y `publicar` no son `async`: el rechazo tiene que salir antes de
  // que exista una promesa, no después.
  entregar(spec = {}, opciones = {}) {
    this.rechazarIdentidad(spec);
    const { documento: id, contenido } = spec;
    if (!texto(id)) throw new Error('un documento necesita id');
    if (!texto(contenido)) throw new Error('un documento necesita contenido: el sello es de un contenido, no de una promesa');
    return this.entregarEnKernel(spec, opciones);
  }

  async entregarEnKernel(spec, opciones) {
    const { documento: id, contenido, institucion } = spec;

    const previa = this.documentoDe(id);
    const puerta = previa
      ? {
        ok: false,
        motivo: `el documento ${id} ya tiene un sello desde ${previa.en}: sellar dos veces el mismo documento es imposible, `
          + 'porque su presupuesto de un uso ya se consumió',
        salida: 'un documento que vuelve a entregarse es un documento distinto: entraría con su propio id y su propio sello',
      }
      : { ok: true };
    const autoridad = puerta.ok
      ? { spend: [{ asset: `documento:${id}`, maxAmount: '1', to: 'registro:local' }] }
      : { spend: [] };

    const op = createOperation({
      goal: `${FUENTE} entrega el documento ${id} y queda sellado, sin publicar`,
      action: 'vela:entregar',
      agent: FUENTE,
      exit: puerta.ok ? null : puerta.salida,
      authority: autoridad,
    });
    const cap = this.capacidadSellar(id, contenido, institucion, puerta);
    const resultado = await runOperation(op, cap, { verify: cap.io.verify });
    const recibo = resultado.receipt;
    if (recibo && recibo.status === 'verified') {
      this.escribir({ tipo: 'recibo', clave: `sello:${id}`, documento: id, clase: 'sello', recibo });
    }
    const documento = this.documentoDe(id);
    if (!documento) {
      return { estado: 'bloqueada', detalle: (recibo && (recibo.detail || recibo.reason)) || 'no se selló', salida: puerta.salida, recibo };
    }
    return {
      estado: 'sellado',
      documento: id,
      institucion,
      huella: documento.huella,
      recibo,
      publicado: false,
      pertenencia: this.demostrarPertenencia(id),
    };
  }

  // --- Invitar: lo que acredita a un medio para firmar una vez ---

  invitar({ documento: id, medio, vence }) {
    if (!texto(id)) throw new Error('una invitación necesita el documento');
    if (!texto(medio)) throw new Error('una invitación necesita el medio invitado');
    if (!this.documentoDe(id)) throw new Error(`no hay documento sellado ${String(id)}: no se invita a firmar lo que no está sellado`);
    if (Number.isNaN(Date.parse(vence))) throw new Error('la invitación necesita una ventana: un medio sin plazo es un medio sin límite');
    const previa = this.invitaciones().find((i) => i.documento === id && i.medio === medio);
    if (previa) return previa;
    return this.escribir({ tipo: 'invitacion', documento: id, medio, vence: iso(vence), en: iso() });
  }

  evaluarVerificacion(id, medio, now) {
    const documento = this.documentoDe(id);
    if (!documento) {
      return { ok: false, motivo: `no hay documento sellado ${String(id)}`, salida: 'la fuente entrega primero el documento' };
    }
    const invitacion = this.invitaciones().find((i) => i.documento === id && i.medio === medio);
    if (!invitacion) {
      return {
        ok: false,
        motivo: `${String(medio)} no fue invitado a verificar ${String(id)}: en este canal verifica quien fue invitado, `
          + 'y el registro muestra la invitación o no la muestra',
        salida: `el custodio del canal invita a ${String(medio)} con una ventana, y recién entonces puede firmar`,
      };
    }
    const hechas = this.verificaciones(id).filter((v) => v.medio === medio);
    const restante = 1 - hechas.length;
    if (restante <= 0) {
      return {
        ok: false,
        motivo: `${medio} ya firmó ${id} el ${hechas[0].en}: un medio verifica una vez, `
          + 'porque su invitación acredita una sola firma y ese presupuesto ya se consumió',
        salida: 'otro medio invitado firma; el mismo medio no repite su firma para descontar el mismo documento',
      };
    }
    const actual = this.huellaActual(id);
    if (actual !== documento.huella) {
      return {
        ok: false,
        motivo: `el documento ${id} fue alterado después del sello: su huella ya no calza, y nadie verifica un documento que cambió`,
        salida: 'el documento alterado vuelve a entrar por el canal, con su propio sello',
      };
    }
    const autoridad = {
      spend: [{
        asset: `verificacion:${id}`,
        maxAmount: String(restante),
        to: 'registro:verificaciones',
        expiresAt: invitacion.vence,
      }],
    };
    const check = sufficient([{ asset: `verificacion:${id}`, amount: '1', to: 'registro:verificaciones' }], autoridad, { now });
    if (!check.ok) {
      return {
        ok: false,
        motivo: `la invitación de ${medio} para ${id} no cubre esta verificación: ${check.reason}`,
        salida: 'la ventana de la invitación ya pasó o su presupuesto se consumió; se invita de nuevo, con otra ventana',
      };
    }
    return { ok: true, autoridad };
  }

  capacidadVerificar(id, medio, declaracion, puerta, opciones) {
    const self = this;
    return {
      id: 'vela:verificar',
      required: () => {
        if (!puerta.ok) return { impossible: true, reason: puerta.motivo, exit: puerta.salida };
        return { spend: [{ asset: `verificacion:${id}`, amount: '1', to: 'registro:verificaciones' }] };
      },
      perform: async () => {
        const documento = self.documentoDe(id);
        const linea = {
          tipo: 'verificacion',
          documento: id,
          medio,
          declara: declaracion,
          huella: documento.huella,
          en: iso(opciones.now),
        };
        self.escribir(linea);
        return {
          ok: true,
          evidence: { operationId: id, type: 'verificacion', status: 'registrada', code: huellaDeJson(linea) },
        };
      },
      io: { verify: (evidencia) => self.verificarVerificacion(evidencia) },
    };
  }

  async verificarVerificacion(evidencia) {
    const id = evidencia && evidencia.operationId;
    const documento = this.documentoDe(id);
    const hechas = this.verificaciones(id);
    const repetidos = new Set();
    const vistos = new Set();
    for (const v of hechas) {
      if (vistos.has(v.medio)) repetidos.add(v.medio);
      vistos.add(v.medio);
    }
    const checks = {
      'verificacion-registrada': hechas.length >= 1,
      'firma-de-medio-invitado': hechas.every((v) => this.invitaciones().some((i) => i.documento === v.documento && i.medio === v.medio)),
      'sin-firmas-repetidas': repetidos.size === 0,
      'documento-sin-alterar': Boolean(documento) && hechas.every((v) => v.huella === documento.huella),
    };
    const verified = Object.values(checks).every((x) => x === true);
    return { verified, checks, reason: verified ? 'la verificación está registrada y el documento sigue siendo el sellado' : 'el registro no respalda la verificación' };
  }

  async verificar({ documento: id, medio, declara } = {}, opciones = {}) {
    if (!texto(id)) throw new Error('una verificación necesita el documento');
    if (!texto(medio)) throw new Error('una verificación necesita el medio que firma');
    if (declara !== undefined && !DECLARACIONES.includes(declara)) {
      // El conjunto es cerrado a propósito: no hay texto libre por donde el
      // nombre de la fuente pudiera quedar escrito dentro del registro.
      throw new Error(`una verificación declara una de: ${DECLARACIONES.join(', ')}`);
    }
    const declaracion = DECLARACIONES.includes(declara) ? declara : DECLARACIONES[0];
    const now = opciones.now;
    const puerta = this.evaluarVerificacion(id, medio, now);
    const op = createOperation({
      goal: `${medio} verifica el documento ${id}`,
      action: 'vela:verificar',
      agent: medio,
      exit: puerta.ok ? null : puerta.salida,
      authority: puerta.ok ? puerta.autoridad : { spend: [] },
    });
    const cap = this.capacidadVerificar(id, medio, declaracion, puerta, opciones);
    const resultado = await runOperation(op, cap, { verify: cap.io.verify });
    const recibo = resultado.receipt;
    if (recibo && recibo.status === 'verified') {
      this.escribir({ tipo: 'recibo', clave: `verificacion:${id}:${medio}`, documento: id, clase: 'verificacion', recibo });
    }
    if (recibo && recibo.status === 'verified') {
      const hechas = this.verificaciones(id);
      return {
        estado: 'verificada',
        detalle: `${medio} firmó; hay ${hechas.length} de ${this.umbral} verificaciones`,
        salida: null,
        recibo,
      };
    }
    return {
      estado: 'rechazada',
      detalle: (recibo && (recibo.detail || recibo.reason)) || puerta.motivo
        || 'la verificación no quedó registrada y el motivo aún no tiene nombre',
      salida: puerta.salida || 'otro medio invitado firma',
      recibo,
    };
  }

  // --- La demostración de conocimiento cero: el lugar donde iría, y nada más ---

  demostrarPertenencia(id) {
    const documento = this.documentoDe(id);
    return {
      documento: id,
      institucion: documento ? documento.institucion : null,
      estado: 'pendiente',
      simulado: true,
      prueba: null,
      que_haria_falta:
        'integrar el verificador ZK del kernel 0.1.5 y acreditar que el documento pertenece a '
        + `${documento ? documento.institucion : 'la institución'} sin revelar quién lo entregó`,
      por_que_no_esta_aqui:
        'la pertenencia está declarada y la demostración que la sostiene no está construida. '
        + 'Un ejemplo de prueba, aunque sea de mentira, sería un enlace entre el documento y la fuente, '
        + 'que es la misma clase de defecto que este proyecto no construye.',
    };
  }

  // --- Publicar: la única puerta que escribe una publicación, y tiene umbral ---

  capacidadPublicar(id, puerta, opciones) {
    const self = this;
    return {
      id: 'vela:publicar',
      required: () => {
        if (!puerta.ok) return { impossible: true, reason: puerta.motivo, exit: puerta.salida };
        return { spend: [{ asset: `confirmacion:${id}`, amount: String(self.umbral), to: 'publicacion:local' }] };
      },
      perform: async () => {
        const hechas = self.verificaciones(id);
        const linea = {
          tipo: 'publicacion',
          documento: id,
          verificaciones: hechas.length,
          umbral: self.umbral,
          medios: hechas.map((v) => v.medio),
          en: iso(opciones.now),
        };
        self.escribir(linea);
        return {
          ok: true,
          evidence: { operationId: id, type: 'publicacion', status: 'publicada', code: huellaDeJson(linea) },
        };
      },
      io: { verify: (evidencia) => self.recomputar(evidencia.operationId).verificacion },
    };
  }

  publicar(spec = {}, opciones = {}) {
    // La puerta más externa de todas: antes de mirar el documento, antes del
    // grant, antes de nada. Si alguien intenta colgar su identidad de la
    // publicación, se rechaza aquí y no se escribe una línea.
    this.rechazarIdentidad(spec);
    const id = spec.documento;
    if (!texto(id)) throw new Error('publicar necesita el documento');
    return this.publicarEnKernel(id, opciones);
  }

  async publicarEnKernel(id, opciones) {
    const now = opciones.now;
    const puerta = this.evaluarPublicacion(id, now);
    const op = createOperation({
      goal: `publicar el documento ${id}, que queda sin publicar hasta que se alcancen ${this.umbral} verificaciones`,
      action: 'vela:publicar',
      agent: 'vela:canal',
      exit: puerta.ok ? null : puerta.salida,
      authority: puerta.ok ? puerta.autoridad : { spend: [] },
    });
    const cap = this.capacidadPublicar(id, puerta, opciones);
    const resultado = await runOperation(op, cap, { verify: cap.io.verify });
    const recibo = resultado.receipt;
    if (recibo && recibo.status === 'verified') {
      this.escribir({ tipo: 'recibo', clave: `publicacion:${id}`, documento: id, clase: 'publicacion', recibo });
      const linea = this.publicacion().find((p) => p.documento === id);
      return {
        estado: 'publicada',
        detalle: `${id} se publica: ${linea.verificaciones} verificaciones de medios invitados (de ejemplo): ${linea.medios.join(', ')}`,
        salida: null,
        recibo,
      };
    }
    // El motivo nunca puede quedar vacío: un rechazo que no dice por qué es un
    // rechazo con el que nadie puede hacer nada.
    const motivo = (recibo && (recibo.detail || recibo.reason))
      || puerta.motivo
      || this.puertaDeRecomputacion(id)
      || 'algo no calza y el proyecto todavía no lo está diciendo';
    return {
      estado: 'bloqueada',
      detalle: motivo,
      salida: puerta.salida || 'se revisa el registro antes de volver a intentarlo',
      recibo,
    };
  }

  // --- La tercera parte: recomputa desde el registro y no cree a nadie ---

  // Recomputa **todo** lo que cualquier recibo del documento podría afirmar, no
  // solo las seis de la publicación. La auditoría de un recibo de sello no tiene
  // por qué exigir que el umbral esté alcanzado: exige que lo que ese recibo dice
  // sea cierto. Mezclar las dos preguntas hacía que un sello sano se leyera como
  // una auditoría fallida.
  recomputar(id) {
    const documento = this.documentoDe(id);
    const hechas = this.verificaciones(id);
    const publicadas = this.publicacion().filter((p) => p.documento === id);
    const sello = this.selloDe(id);
    const vistos = new Set();
    let repetidos = false;
    for (const v of hechas) {
      if (vistos.has(v.medio)) repetidos = true;
      vistos.add(v.medio);
    }
    const selladoIntacto = Boolean(documento)
      && Boolean(sello && sello.recibo && verifyReceipt(sello.recibo).ok)
      && this.huellaActual(id) === documento.huella;
    const checks = {
      'documento-registrado': Boolean(documento),
      'huella-del-sello': Boolean(documento) && this.huellaActual(id) === documento.huella,
      'sello-intacto': selladoIntacto,
      'verificacion-registrada': hechas.length >= 1,
      'firma-de-medio-invitado': hechas.every((v) => this.invitaciones().some((i) => i.documento === v.documento && i.medio === v.medio)),
      'documento-sin-alterar': Boolean(documento) && hechas.every((v) => v.huella === documento.huella),
      'sin-firmas-repetidas': !repetidos,
      'umbral-alcanzado': hechas.length >= this.umbral,
      'medios-invitados': hechas.every((v) => this.invitaciones().some((i) => i.documento === v.documento && i.medio === v.medio)),
      'publicacion-consistente': publicadas.every((p) => p.verificaciones >= this.umbral),
      'sin-identidad-en-el-registro': this.registroSinIdentidad(),
    };
    const motivos = {
      'documento-registrado': `no hay documento sellado ${String(id)}`,
      'huella-del-sello': `el contenido de ${String(id)} ya no calza con la huella de su sello: el documento fue alterado después de sellarse`,
      'sello-intacto': `el sello de ${String(id)} no está intacto: o el recibo del sello no verifica, o el documento cambió`,
      'verificacion-registrada': `no hay ninguna verificación registrada para ${String(id)}`,
      'firma-de-medio-invitado': 'hay una verificación de un medio que no figura como invitado en el registro',
      'documento-sin-alterar': 'se verificó una versión del documento que ya no es la que está sellada',
      'sin-firmas-repetidas': 'un medio firmó más de una vez el mismo documento',
      'umbral-alcanzado': `hay ${hechas.length} verificaciones y se exigen ${this.umbral}`,
      'medios-invitados': 'hay una verificación de un medio que no figura como invitado en el registro',
      'publicacion-consistente': 'hay una publicación registrada por debajo del umbral',
      'sin-identidad-en-el-registro': 'el registro tiene una clave por donde puede viajar la identidad de alguien',
    };
    const verificadas = Object.entries(checks).filter(([, ok]) => ok).map(([nombre]) => nombre);
    // `checks` es un objeto, no un arreglo: `checks.length` sería `undefined` y
    // el veredicto saldría falso con todas las comprobaciones en verde.
    const verified = verificadas.length === Object.keys(checks).length;
    return {
      checks,
      motivos,
      verificadas,
      verificacion: {
        verified,
        checks,
        reason: verified ? 'recomputado desde el registro' : 'el registro no respalda lo que el recibo dice',
      },
    };
  }

  // El registro entero, claves anidadas incluidas, y nada de prosa libre: una
  // palabra suelta en un campo de texto no es una identidad, y un filtro sobre
  // prosa produce falsos positivos que convierten el control en teatro. Lo que
  // hace falta es que **ninguna clave** pueda llevar una identidad, y eso se
  // comprueba clave por clave, de arriba abajo.
  registroSinIdentidad() {
    const bajar = (valor) => {
      if (valor === null || typeof valor !== 'object') return true;
      if (Array.isArray(valor)) return valor.every(bajar);
      for (const clave of Object.keys(valor)) {
        if (CLAVES_DE_IDENTIDAD.includes(clave.toLowerCase())) return false;
        if (!bajar(valor[clave])) return false;
      }
      return true;
    };
    return this.leer().every(bajar);
  }

  auditar(recibo) {
    if (!recibo) return { ok: false, motivo: 'no hay recibo que auditar' };
    const sello = verifyReceipt(recibo);
    if (!sello.ok) return { ok: false, motivo: `el recibo no verifica: ${sello.reason}` };
    const id = recibo.evidence && recibo.evidence.operationId;
    const recomputado = this.recomputar(id);
    const afirmadas = Array.isArray(recibo.coverage) ? recibo.coverage : [];

    // 1. Lo que el recibo AFIRMA tiene que estar en el registro. Un recibo que
    //    declara una comprobación que la recomputación no respalda no pasa.
    const sinSustento = afirmadas.filter((c) => !recomputado.verificadas.includes(c));
    if (sinSustento.length > 0) {
      return {
        ok: false,
        motivo: `el registro no respalda lo que este recibo afirma: ${sinSustento.map((c) => recomputado.motivos[c] || c).join('; ')}`,
        cobertura: afirmadas,
        checks: recomputado.verificadas,
      };
    }

    // 2. La integridad del documento no es negociable para ningún recibo suyo: si
    //    el contenido ya no calza con su sello, ni el sello ni una firma previa
    //    siguen siendo ciertos, aunque cada uno firmara en su momento.
    if (!recomputado.verificadas.includes('sello-intacto')) {
      return {
        ok: false,
        motivo: recomputado.motivos['sello-intacto'],
        cobertura: afirmadas,
        checks: recomputado.verificadas,
      };
    }

    // 3. La publicación es el caso que exige las seis: es el único acto del
    //    proyecto que cambia lo que el mundo puede ver, y por eso no se publica
    //    con un verificador que solo comprobó una parte.
    const esPublicacion = recibo.capability === 'vela:publicar';
    if (esPublicacion) {
      const faltan = CHECKS_INDEPENDIENTES.filter((c) => !afirmadas.includes(c));
      if (faltan.length > 0) {
        return {
          ok: false,
          motivo: `el verificador creyó al ejecutor: no recomputó ${faltan.join(', ')} desde el registro, `
            + 'y una verificación independiente no puede dar por bueno lo que no midió',
          cobertura: afirmadas,
          checks: recomputado.verificadas,
        };
      }
    }
    return {
      ok: true,
      motivo: `el registro, el sello y el recibo dicen lo mismo (${esPublicacion ? 'publicación' : `recibo de ${recibo.capability}`})`,
      cobertura: afirmadas,
      checks: recomputado.verificadas,
    };
  }
}

module.exports = { Vela, UMBRAL, CHECKS_INDEPENDIENTES, FUENTE, CLAVES_DE_IDENTIDAD, DECLARACIONES, verifyReceipt };
