[![Vela: a legal channel that holds publication until verification](./assets/cover.png)](./assets/cover.png)

# Vela

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/status-vertical_slice-D7B698?style=for-the-badge&labelColor=07111A" alt="Status: vertical slice"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-review--only-D7B698?style=for-the-badge&labelColor=07111A" alt="License: review only"></a>
  <a href="./docs/EVIDENCE.md"><img src="https://img.shields.io/badge/suite-10_of_11-D7B698?style=for-the-badge&labelColor=07111A" alt="Suite: 10 of 11 tests pass today"></a>
  <a href="./docs/HOW_IT_WORKS.md"><img src="https://img.shields.io/badge/agreement-before-code-E0C170?style=for-the-badge&labelColor=07111A" alt="Agreement before code"></a>
  <a href="https://github.com/andresanemic/vespi"><img src="https://img.shields.io/badge/built_with-Vespi_%C2%B7_Lore_Plugin-E0C170?style=for-the-badge&labelColor=07111A" alt="Built with Vespi and Lore Plugin"></a>
</p>

<p align="center">
  <b>Vela holds a source's document sealed until invited verifiers support its publication.</b>
</p>

<p align="center">
  If you build on Stellar or are judging Find Your Way or Meridian, this project shows one way to put a human verification threshold before publication.
</p>

<p align="center">
  This repository contains the agreement, project explanation and test evidence, not source code. The code will open during the judges' review period under a review-only license that permits reading and cloning for evaluation.
</p>

---

<details>
<summary><b>Read in English</b></summary>

<a id="english"></a>

**Vela makes waiting for verification part of the publication rule.**

> **The unit is the sealed document and the verifications that may support its release.**

Vela is a legal-channel project for a person who has a document and cannot safely publish it alone. The source submits it once; it is sealed and remains unpublished while invited, fictional media verify it one at a time. Publication is attempted only after the required number of verifications is recorded. The document's institutional membership is declared, but its proof is pending: zero-knowledge verification is not built here.

**Why.** A source can hand evidence to an institution and still be left exposed if the institution stays silent. Publishing without backing can make the document a weapon and shift the cost onto the source. Vela's design keeps the document unpublished after delivery and makes several invited verifications a condition of publication. The project tests that boundary; it does not establish that a real source is protected or that a document is true.

**If you are judging Find Your Way or Meridian, start here.**

1. **Start with the prior agreement's scope.** The agreement was written before implementation; its problem, actors, authority limits and open ZK work are summarized in [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md).
2. **Follow the flow.** [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) describes the source, the custodian, the invited verifiers, the reader and the publication threshold.
3. **Check today's suite.** [`docs/EVIDENCE.md`](./docs/EVIDENCE.md) lists the test names and explains the 10 of 11 result, including the kernel digest check that fails.
4. **Review the limits.** [`docs/LEGAL_AND_LIMITS.md`](./docs/LEGAL_AND_LIMITS.md) explains that the agreement cites no law and that Vela claims no legal compliance.
5. **Inspect the code when it opens.** It will be available during the judging period under the review-only terms in [`LICENSE`](./LICENSE), for reading and cloning to evaluate.

## In one minute

In this fictional example, `fuente-1` submits a sample document about a made-up institution. The source is recorded only as `fuente-1`, without a name, contact, signature or identifying metadata. Vela seals the document and leaves publication pending. The custodian invites `medio-1`, `medio-2` and `medio-3`, all fictional. Each may verify once and choose from the fixed attestations `documento-autentico`, `documento-incompleto` or `no-puedo-verificar`. With fewer than three recorded verifications, a publication attempt is rejected with its reason. Once the threshold is met, the project recomputes the checks before writing a publication line. This is a synthetic walkthrough, not a real journalistic review or a claim that the document is authentic.

## Why Vela

| You need | What Vela gives you | Where it lives |
|---|---|---|
| A record that a document was received once | A one-use authority grant and a receipt whose digest is checked against later edits | [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) |
| Publication to wait for independent attestations | One invitation and one verification per invited fictional medium; a threshold read from the record at each attempt | [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) |
| A visible reason when the threshold is not met | A rejected attempt whose reason comes from the kernel's `sufficient` predicate | [`docs/EVIDENCE.md`](./docs/EVIDENCE.md) |
| A readable record | A local JSONL record that can be opened without Vela | [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) |
| A clear boundary around the identity proof | A declared institutional membership with its zero-knowledge proof marked pending | [`docs/LEGAL_AND_LIMITS.md`](./docs/LEGAL_AND_LIMITS.md) |

**What Vela is not.** It is not an Anonymous, an anonymity product, a leak site, a hacking tool, a system for identifying a source, or a live journalism service. It does not contact real media, run zero-knowledge verification, use a network or testnet, make payments, or establish that a document is true. Its current example uses fictional data only.

## How it works

```
source submits once
        |
        v
document sealed; unpublished
        |
        v
custodian invites fictional verifiers
        |
        v
each invited verifier attests once
        |
        v
recompute receipts and count recorded verifications
        |
        +-- below threshold --> reject publication; keep the reason
        |
        +-- threshold met ----> write the publication line
```

| Actor | Rights in the described flow | Limits |
|---|---|---|
| Source (`fuente-1`) | Submit the document once | No identity field is accepted; the project does not promise invisibility or prove who submitted it |
| Channel custodian (Vela) | Seal, count, invite and apply the threshold | Does not decide whether the document is true and cannot publish before the threshold |
| Invited verifier | Verify once and make one of the fixed attestations | Fictional organization; no real medium is named or contacted, and the verifier does not see who submitted the document |
| Reader | Open and inspect `datos/registro.jsonl` with any editor | The record and its receipt digests do not establish who kept or supplied the file |

More detail, including the grant budgets, receipt checks and the example through all steps, is in [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md).

## Evidence you can open

The available evidence is the named local test suite in the supplied project material. It reports 10 passing tests and 1 failing test out of 11. The passing cases cover publication blocking, invitation and one-use limits, document integrity, source identity rejection, closed publication, the successful threshold path, the pending ZK boundary and the record's identity-field boundary. The only current failure is the test that compares the consumed kernel module digest with the pinned value.

Before implementation, the RED phase recorded nine cases failing one by one while two core digest checks passed. The agreement and phase notes describe three defects found while moving from RED to GREEN: free-form verifier text could admit unsafe content, publication was written before verification completed, and an audit required publication-level checks even for a receipt that only represented a seal. Those are phase notes, not evidence of an independent real-world review.

The nine functional project repositories were built on 2026-09-29 against kernel cut `54c20c7`, and their records report green suites at that cut. Each project pins the kernel it consumes by digest and deliberately fails a digest check if the kernel moves. Against the installed kernel `0.1.3`, part of the suite therefore fails until the pin is refreshed and checked again. That re-pin is pending. The suite result is a bounded test result, not evidence that Vela is ready for use. The documents describe a vertical path that works, not a finished product.

There are no Vela network transactions to inspect: the agreement says the effect is local and reversible, with no network, blockchain, testnet, payments or external anchor. When the source code opens, review [`docs/EVIDENCE.md`](./docs/EVIDENCE.md), run `npm test` from the project directory in a fresh process, then run `npm run recorrido` to inspect the documented end-to-end path. No testnet transaction step is part of this project.

## Vela, Vespi and Lore Plugin

Vela is the tenth of ten functional projects built on Vespi with Lore Plugin. It consumes Vespi's kernel through the copy vendored by Lore Plugin, fixed by the digests listed in its `SOURCE.md`. The agreement describes four one-use authority budgets: the source's seal, a custodian's invitation, a verifier's attestation and a publication grant assembled from the verifications in the record. Kernel receipts carry digests; `verifyReceipt` checks them, and edits to a sealed document make its receipt fail verification. The invited verifiers' one-use signatures and the threshold model a human review gate. The project uses fictional organizations and signatures, so this is not evidence of an actual human review. Vela recomputes its checks from the record before publication instead of trusting the execution path. The separate receipts let an audit inspect the recorded actions and their digests. The receipt digest does not authenticate who kept or supplied a file.

## What it does not do, and what is not verified

Vela does not run a zero-knowledge proof. The document's institutional membership is declared and its proof is pending; a place where verification might go does not produce a proof. Vela does not hack, leak, identify the source or simulate those capabilities. Vela's sample records use synthetic data only and contain no personal data; no real source, institution or medium appears in its examples. The project does not claim legal compliance or cite a legal standard. It has no network, testnet, payment or external anchor. The project material says no live agent session with RC5 was verified. The kernel re-pin is pending, the suite is 10 of 11 today, and product readiness is not established. See [`docs/LEGAL_AND_LIMITS.md`](./docs/LEGAL_AND_LIMITS.md).

## How to review this project

This repository contains the project explanation and current test evidence, but no source code. [`CODE_NOT_INCLUDED.md`](./CODE_NOT_INCLUDED.md) explains why and when code will be opened. During the judges' review period, the code will be available under the review-only license so judges and the community can read and clone it to evaluate it. The license is proprietary, is not OSI-approved and is marked as a working draft that needs review by a lawyer.

## Author

**Andrés Peña**, repository authority: [`andresanemic`](https://github.com/andresanemic).

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[How it works](./docs/HOW_IT_WORKS.md) · [Evidence](./docs/EVIDENCE.md) · [Legal and limits](./docs/LEGAL_AND_LIMITS.md) · [Code not included](./CODE_NOT_INCLUDED.md) · [Review-only license](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>

<details>
<summary><b>Leer en español</b></summary>

<a id="espanol"></a>

**Vela convierte la espera de verificación en una regla para publicar.**

> **La unidad es el documento sellado y las verificaciones que pueden respaldar su publicación.**

Vela es un proyecto de canal legal para una persona que tiene un documento y no puede publicarlo de forma segura por su cuenta. La fuente lo entrega una vez; queda sellado y sin publicar mientras medios ficticios invitados lo verifican uno por uno. La publicación solo se intenta después de registrar el número exigido de verificaciones. La pertenencia del documento a la institución se declara, pero su prueba está pendiente: aquí no se construye la verificación de conocimiento cero.

**Por qué.** Una fuente puede entregar evidencia a una institución y aun así quedar expuesta si la institución guarda silencio. Publicar sin respaldo puede convertir el documento en un arma y trasladar el costo a la fuente. El diseño de Vela mantiene el documento sin publicar después de la entrega y condiciona la publicación a varias verificaciones invitadas. El proyecto prueba ese límite; no establece que una fuente real esté protegida ni que un documento sea verdadero.

**Si estás evaluando Find Your Way o Meridian, empieza aquí.**

1. **Empieza por el alcance del acuerdo previo.** El acuerdo se escribió antes de la implementación; su problema, actores, límites de autoridad y trabajo ZK pendiente se resumen en [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md).
2. **Sigue el recorrido.** [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) describe la fuente, el custodio, los verificadores invitados, el lector y el umbral de publicación.
3. **Revisa la suite de hoy.** [`docs/EVIDENCE.md`](./docs/EVIDENCE.md) enumera las pruebas y explica el resultado de 10 de 11, incluido el fallo de digest del kernel.
4. **Revisa los límites.** [`docs/LEGAL_AND_LIMITS.md`](./docs/LEGAL_AND_LIMITS.md) explica que el acuerdo no cita leyes y que Vela no afirma cumplir ninguna norma.
5. **Inspecciona el código cuando se abra.** Estará disponible durante el periodo de los jueces bajo los términos de solo revisión de [`LICENSE`](./LICENSE), para leer y clonar con fines de evaluación.

## En un minuto

En este ejemplo ficticio, `fuente-1` entrega un documento de muestra sobre una institución inventada. La fuente solo aparece como `fuente-1`, sin nombre, contacto, firma ni metadatos que la identifiquen. Vela sella el documento y deja la publicación pendiente. El custodio invita a `medio-1`, `medio-2` y `medio-3`, todos ficticios. Cada uno puede verificar una vez y elegir entre las atestaciones cerradas `documento-autentico`, `documento-incompleto` o `no-puedo-verificar`. Con menos de tres verificaciones registradas, se rechaza el intento de publicación y se conserva su motivo. Cuando se alcanza el umbral, el proyecto vuelve a calcular las comprobaciones antes de escribir una línea de publicación. Es un recorrido sintético, no una revisión periodística real ni una afirmación de autenticidad.

## Por qué Vela

| Necesitas | Qué te da Vela | Dónde vive |
|---|---|---|
| Un registro de que el documento se recibió una vez | Un grant de autoridad de un solo uso y un recibo cuyo digest se comprueba frente a ediciones posteriores | [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) |
| Que la publicación espere atestaciones independientes | Una invitación y una verificación por medio ficticio invitado; el umbral se lee del registro en cada intento | [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) |
| Un motivo visible cuando no se alcanza el umbral | Un intento rechazado cuyo motivo proviene del predicado `sufficient` del núcleo | [`docs/EVIDENCE.md`](./docs/EVIDENCE.md) |
| Un registro legible | Un JSONL local que puede abrirse sin Vela | [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md) |
| Un límite claro para la prueba de identidad institucional | La pertenencia institucional declarada y su prueba de conocimiento cero marcada como pendiente | [`docs/LEGAL_AND_LIMITS.md`](./docs/LEGAL_AND_LIMITS.md) |

**Qué no es Vela.** No es Anonymous, un producto de anonimato, un sitio de filtraciones, una herramienta para hackear, un sistema para identificar a una fuente ni un servicio periodístico activo. No contacta a medios reales, no ejecuta verificación de conocimiento cero, no usa una red ni testnet, no realiza pagos ni establece que un documento sea verdadero. El ejemplo actual usa solo datos ficticios.

## Cómo funciona

```
la fuente entrega una vez
        |
        v
documento sellado; sin publicar
        |
        v
el custodio invita a verificadores ficticios
        |
        v
cada verificador invitado atestigua una vez
        |
        v
recalcular recibos y contar las verificaciones registradas
        |
        +-- bajo el umbral --> rechazar publicación; conservar el motivo
        |
        +-- umbral alcanzado -> escribir la línea de publicación
```

| Actor | Derechos en el recorrido descrito | Límites |
|---|---|---|
| Fuente (`fuente-1`) | Entregar el documento una vez | No se acepta un campo de identidad; el proyecto no promete invisibilidad ni prueba quién lo entregó |
| Custodio del canal (Vela) | Sellar, contar, invitar y aplicar el umbral | No decide si el documento es verdadero y no puede publicar antes del umbral |
| Verificador invitado | Verificar una vez y elegir una atestación cerrada | Organización ficticia; no se nombra ni contacta a un medio real y no ve quién entregó el documento |
| Lector | Abrir e inspeccionar `datos/registro.jsonl` con cualquier editor | El registro y los digests de sus recibos no establecen quién guardó o entregó el archivo |

El detalle, incluidos los presupuestos de los grants, las comprobaciones de recibos y el ejemplo completo, está en [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md).

## Evidencia que puedes abrir

La evidencia disponible es la suite local nombrada en los materiales del proyecto. Informa 10 pruebas aprobadas y 1 fallida de 11. Los casos aprobados cubren el bloqueo de la publicación, los límites de invitación y uso único, la integridad del documento, el rechazo de identidad de la fuente, el cierre de la publicación, la ruta positiva al alcanzar el umbral, el límite ZK pendiente y la ausencia de campos de identidad en el registro. El único fallo actual es la prueba que compara el digest del módulo consumido del kernel con el valor fijado.

Antes de implementar, la fase RED registró nueve casos que fallaron uno por uno, mientras dos comprobaciones de digest del núcleo pasaron. El acuerdo y las notas de fase describen tres defectos encontrados al pasar de RED a GREEN: el texto libre del verificador podía admitir contenido inseguro, la publicación se escribía antes de terminar la verificación y una auditoría exigía comprobaciones de publicación incluso a un recibo que solo representaba un sello. Son notas de fase, no evidencia de una revisión independiente en el mundo real.

Los nueve repositorios funcionales se construyeron el 2026-09-29 sobre el corte del kernel `54c20c7`, y sus registros informan suites verdes en ese corte. Cada proyecto fija por digest el kernel que consume y falla deliberadamente una comprobación si el kernel se mueve. Frente al kernel instalado `0.1.3`, por eso falla parte de la suite hasta renovar el pin y comprobarlo de nuevo. Esa re-fijación está pendiente. El resultado de la suite es una prueba acotada, no demuestra que Vela esté listo para usarse. Los documentos muestran un recorrido vertical que funciona, no un producto terminado.

No hay transacciones de Vela en una red para inspeccionar: el acuerdo dice que el efecto es local y reversible, sin red, blockchain, testnet, pagos ni anclaje externo. Cuando se abra el código fuente, revisa [`docs/EVIDENCE.md`](./docs/EVIDENCE.md), ejecuta `npm test` desde el directorio del proyecto en un proceso nuevo y luego `npm run recorrido` para inspeccionar el recorrido completo documentado. Este proyecto no incluye pasos de transacciones en testnet.

## Vela, Vespi y Lore Plugin

Vela es el décimo de diez proyectos funcionales construidos sobre Vespi con Lore Plugin. Consume el núcleo de Vespi desde la copia vendorizada que instala Lore Plugin, fijada por los digests de su `SOURCE.md`. El acuerdo describe cuatro presupuestos de autoridad de un solo uso: el sello de la fuente, la invitación del custodio, la atestación del verificador y un grant de publicación construido a partir de las verificaciones del registro. Los recibos del núcleo llevan digests; `verifyReceipt` los comprueba, y una edición del documento sellado hace que su recibo deje de verificarse. Las firmas de un solo uso de los verificadores invitados y el umbral modelan una compuerta de revisión humana. El proyecto usa organizaciones y firmas ficticias, así que esto no demuestra una revisión humana real. Antes de publicar, Vela vuelve a calcular las comprobaciones desde el registro en vez de confiar en la ejecución. Los recibos separados permiten auditar las acciones registradas y sus digests. El digest del recibo no autentica a quien guardó o entregó un archivo.

## Lo que no hace Vela y lo que no está verificado

Vela no ejecuta una prueba de conocimiento cero. La pertenencia del documento a la institución se declara y su prueba está pendiente; un lugar donde podría ir la verificación no produce una prueba. Vela no hackea, filtra, identifica a la fuente ni simula esas capacidades. Los registros de muestra de Vela usan solo datos sintéticos y no contienen datos personales; en sus ejemplos no aparece ninguna fuente, institución ni medio real. El proyecto no afirma cumplir una ley ni cita una norma legal. No tiene red, testnet, pagos ni anclaje externo. Los materiales dicen que no se verificó una sesión activa de agente con RC5. La re-fijación del kernel está pendiente, la suite marca 10 de 11 hoy y no se ha establecido preparación para uso. Consulta [`docs/LEGAL_AND_LIMITS.md`](./docs/LEGAL_AND_LIMITS.md).

## Cómo revisar este proyecto

Este repositorio contiene la explicación del proyecto y la evidencia de pruebas disponible, pero no el código fuente. [`CODE_NOT_INCLUDED.md`](./CODE_NOT_INCLUDED.md) explica por qué y cuándo se abrirá. Durante el periodo de los jueces, el código estará disponible bajo la licencia de solo revisión para que el jurado y la comunidad puedan leerlo y clonarlo con fines de evaluación. La licencia es propietaria, no está aprobada por OSI y está marcada como borrador de trabajo que debe revisar una persona abogada.

## Autor

**Andrés Peña**, autoridad del repositorio: [`andresanemic`](https://github.com/andresanemic).

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[Cómo funciona](./docs/HOW_IT_WORKS.md) · [Evidencia](./docs/EVIDENCE.md) · [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) · [Código no incluido](./CODE_NOT_INCLUDED.md) · [Licencia de solo revisión](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>
