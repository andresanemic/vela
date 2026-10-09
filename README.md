[![Vela: a legal channel that holds publication until verification](./assets/cover.png)](./assets/cover.png)

# Vela

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/status-vertical_slice-D7B698?style=for-the-badge&labelColor=07111A" alt="Status: vertical slice"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-review--only-D7B698?style=for-the-badge&labelColor=07111A" alt="License: review only"></a>
  <a href="./docs/EVIDENCE.md"><img src="https://img.shields.io/badge/suite-11_of_11-D7B698?style=for-the-badge&labelColor=07111A" alt="Suite: 11 of 11 tests pass"></a>
  <a href="./docs/HOW_IT_WORKS.md"><img src="https://img.shields.io/badge/agreement-written_before_code-E0C170?style=for-the-badge&labelColor=07111A" alt="Agreement written before code"></a>
  <a href="https://github.com/andresanemic/vespi"><img src="https://img.shields.io/badge/built_with-Vespi_and_Lore_Plugin-E0C170?style=for-the-badge&labelColor=07111A" alt="Built with Vespi and Lore Plugin"></a>
  <a href="https://github.com/andresanemic/vespi/tree/ed559e83c976dd6e6a379a5510db776206f670b4"><img src="https://img.shields.io/badge/kernel-0.1.5_release-ed559e8?style=for-the-badge&labelColor=07111A&color=E0C170" alt="Kernel: 0.1.5 release (commit ed559e8)"></a>
</p>

<p align="center"><b>A document stays sealed until invited verifiers support its publication.</b></p>

---

<details>
<summary><b>Read in English</b></summary>

<a id="english"></a>

> **The unit is the sealed document and the verifications that may support its publication.**

Vela is a documented vertical slice for a legal channel where a person can submit a document they cannot publish alone. The document is sealed and remains unpublished while invited, fictional media verify it one at a time. Publication is attempted only after the configured number of verifications is recorded. Institutional membership is declared, but its proof is pending: Vela does not build zero-knowledge verification.

## The problem

A person can hand over evidence and still be left exposed when an institution stays silent. Nothing reaches the public, yet the person who submitted it has already taken the risk. The opposite shortcut is no better: publishing a document without enough review can turn it into a weapon and leave its source carrying the cost. Vela makes waiting part of the publication rule: seal first, invite fictional verifiers, and keep the document unpublished until the record meets the chosen threshold.

## If you are judging Find Your Way or Meridian, start here

1. Read the project foundation and its walkthrough. Start with [How it works](./docs/HOW_IT_WORKS.md).

2. Open the test record. See [Evidence](./docs/EVIDENCE.md).

3. Read the legal and verification limits. See [Legal and limits](./docs/LEGAL_AND_LIMITS.md).

4. Review the publication conditions. See [Code not included](./CODE_NOT_INCLUDED.md) and the [review-only license](./LICENSE).

## In one minute

Imagine a person, recorded only as `fuente-1`, submitting a fictional document about `institucion-ejemplo`. Vela seals it and leaves it unpublished. The custodian invites `medio-1`, `medio-2` and `medio-3`, all fictional. Each invite permits one closed attestation. With fewer than three recorded verifications, publication is rejected and the reason is retained; once the configured threshold is met, Vela recomputes the checks before writing the publication line. The threshold of three is this project's choice, not a rule of the kernel. This is a synthetic walkthrough, not real journalism or proof that a document is authentic.

## What it looks like in practice

The scene below follows the agreement and the behaviors named in the test suite. It is an illustrative dialogue, not a transcript of a program run; the supplied sources do not include the output of `npm run recorrido`. The organizations and document are fictional, and the attestations are the project's closed set.

```text
Source       “I submit the sample document once.”
Vela         The document is sealed. Publication remains closed.
Custodian    Invites medio-1, medio-2 and medio-3.
medio-1      Attests: documento-autentico.
Custodian    Tries to publish while the count is below three.
Vela         Publication is rejected; the reason is retained.
medio-2      Attests: documento-incompleto.
medio-3      Attests: no-puedo-verificar.
Custodian    Tries publication after the configured threshold is met.
Vela         Recomputes the checks, then writes the publication line.
```

Those dialogue lines explain the specified path; they are not quoted terminal output. One real failure reason is recorded in the agreement: `requirements consume 3 against grant max 1`. The captured suite output is reproduced in [Evidence](./docs/EVIDENCE.md). A second signature from the same invited medium is rejected, an uninvited medium cannot attest, and changing the sealed document prevents publication even if the count is reached.

## How it works

```text
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
recompute receipts and count the local record
        |
        +-- below threshold --> reject; retain the reason
        |
        +-- threshold met ----> write the publication line
```

| Actor | Rights in the described flow | Limits |
|---|---|---|
| Source (`fuente-1`) | Submit one document | No identity field is accepted; Vela does not promise anonymity or prove who submitted it |
| Channel custodian (Vela) | Seal, invite, count, and apply the threshold | Does not decide whether a document is true and cannot publish before the threshold |
| Invited verifier | Use one invitation for one closed attestation | Fictional organization; no real medium is named or contacted |
| Reader | Open the local JSONL record with an editor | Receipt digests do not establish who kept or supplied the file |

The source submission, verifier invitation and each verification use separate one-use authority grants and leave receipts. Vela builds the publication grant from the count it reads at the time of the attempt, and the published state does not reopen. The kernel's `sufficient` predicate decides whether that grant can cover the configured threshold. Before writing publication, Vela recomputes the checks from the record. The receipt digest helps detect changes; it does not authenticate the person who held the file.

## Why Vela

| You need | What it gives you | Where it lives |
|---|---|---|
| A record that a document was submitted once | A one-use seal and a receipt tied to the document digest | [How it works](./docs/HOW_IT_WORKS.md) |
| Publication to wait for several attestations | One invitation and one attestation per fictional verifier; a threshold checked from the record | [How it works](./docs/HOW_IT_WORKS.md) |
| A reason when publication cannot proceed | A rejected attempt whose insufficiency comes from the kernel predicate | [Evidence](./docs/EVIDENCE.md) |
| A record a reader can inspect | A local JSONL file that can be opened without Vela | [How it works](./docs/HOW_IT_WORKS.md) |
| A clear boundary around institutional membership | Membership is declared and its zero-knowledge proof is marked pending | [Legal and limits](./docs/LEGAL_AND_LIMITS.md) |

## What Vela is not

Vela is not an anonymity product, an Anonymous service, a leak site, a hacking tool, a source-identification system or a live journalism service. It does not contact real media or establish that a document is true. Its sample scenario uses synthetic data, fictional organizations and fictional signatures.

## Evidence you can open

The supplied test record reports **11 passing tests out of 11, with 0 failing and 0 skipped**, run under Node v24.15.0. The nine functional tests cover early-publication rejection, invitation and one-use limits, document integrity after sealing, rejection of an attempt to publish source identity, closed publication, the successful threshold path, the pending ZK boundary and the absence of an identity field in the record. One test checks the vendored kernel copy module by module against its SOURCE.md, and one additional passing test checks that the five module headers name the same commit.

The 2026-10-03 capture was red because the project was pinned to the older kernel cut (0.1.3, commit 54c20c7); that re-pin to 0.1.5 is done. The earlier RED phase records nine project cases failing before implementation and two digest checks passing; its counts are not the same measurement as the current 11/11 output. The agreement and phase notes also record three defects found and corrected during GREEN: free-form verifier text, publication written before recomputation, and receipt audits applying publication checks to a seal receipt. These are internal adversarial phase notes, not an independent security audit. [Evidence](./docs/EVIDENCE.md) includes the test names and limits.

## Vela, Vespi and Lore Plugin

Vela is the tenth of ten functional projects in the Vespi project set. It uses the kernel copy vendored by Lore Plugin, pinned by module digests. The project runs on kernel **0.1.5 release** (commit `ed559e8`), verified module by module against its SOURCE.md in the 2026-10-09 suite. The documented kernel pieces Vela consumes are bounded authority grants, one-use budgets, the `sufficient` threshold predicate, receipt digests and receipt verification. Lore Plugin provides the vendored kernel copy described in the agreement; the agreement does not name other Lore Plugin features as part of this flow. This project has no network, testnet, payment or external anchor. See [Vespi](https://github.com/andresanemic/vespi) and [Lore Plugin](https://github.com/andresanemic/lore-plugin).

## What it does not do, and what is not verified

There is no running zero-knowledge proof. Institutional membership is declared and its proof is pending. Vela does not hack, leak or identify a source, even in simulation. It does not use real documents, personal data, real media or a network, and it claims no legal compliance. The project materials do not verify an active agent session with RC5, and they do not establish readiness for real use. The kernel re-pin to 0.1.5 is done; the current suite is 11/11. See [Legal and limits](./docs/LEGAL_AND_LIMITS.md).

## How to review this project

This repository contains the agreement, explanation and test record, but not the source code. [Code not included](./CODE_NOT_INCLUDED.md) explains the publication conditions. The code is stated to open during the judges' review period under the review-only terms in [LICENSE](./LICENSE), which permits reading and cloning for evaluation. The license is proprietary and marked as a working draft for legal review.

## Author

**Andrés Peña**, repository authority: [`andresanemic`](https://github.com/andresanemic).

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[How it works](./docs/HOW_IT_WORKS.md) · [Evidence](./docs/EVIDENCE.md) · [Legal and limits](./docs/LEGAL_AND_LIMITS.md) · [Code not included](./CODE_NOT_INCLUDED.md) · [Review-only license](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>

<details>
<summary><b>Leer en español</b></summary>

<a id="espanol"></a>

**El documento queda sellado hasta que verificadores invitados respalden su publicación.**

> **La unidad es el documento sellado y las verificaciones que pueden respaldar su publicación.**

Vela es un recorrido vertical documentado para un canal legal donde una persona puede entregar un documento que no puede publicar por su cuenta. El documento queda sellado y sin publicar mientras medios ficticios invitados lo verifican uno por uno. La publicación se intenta solo después de registrar el número configurado de verificaciones. La pertenencia a la institución se declara, pero su prueba está pendiente: Vela no construye verificación de conocimiento cero.

## El problema

Una persona puede entregar evidencia y aun así quedar expuesta si una institución guarda silencio. Nada llega al público, pero quien entregó el documento ya asumió el riesgo. La otra salida tampoco resuelve el problema: publicar sin suficiente revisión puede convertir el documento en un arma y dejar el costo sobre su fuente. Vela incorpora la espera en la regla de publicación: primero sella, luego invita a verificadores ficticios y mantiene el documento sin publicar hasta que el registro alcanza el umbral elegido.

## Si estás evaluando Find Your Way o Meridian, empieza aquí

1. Lee la base del proyecto y su recorrido. Empieza por [Cómo funciona](./docs/HOW_IT_WORKS.md).

2. Abre el registro de pruebas. Consulta [Evidencia](./docs/EVIDENCE.md).

3. Lee los límites jurídicos y de verificación. Consulta [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md).

4. Revisa las condiciones de publicación. Consulta [Código no incluido](./CODE_NOT_INCLUDED.md) y la [licencia de solo revisión](./LICENSE).

## En un minuto

Imagina que una persona, registrada solo como `fuente-1`, entrega un documento ficticio sobre `institucion-ejemplo`. Vela lo sella y lo mantiene sin publicar. El custodio invita a `medio-1`, `medio-2` y `medio-3`, todos ficticios. Cada invitación permite una atestación cerrada. Si hay menos de tres verificaciones registradas, se rechaza la publicación y se conserva el motivo; cuando se alcanza el umbral configurado, Vela vuelve a calcular las comprobaciones antes de escribir la línea de publicación. El umbral de tres es una elección de este proyecto, no una regla del kernel. Es un recorrido sintético, no periodismo real ni una prueba de que el documento sea auténtico.

## Cómo se ve en la práctica

La escena sigue el acuerdo y los comportamientos descritos por los nombres de las pruebas. Es un diálogo ilustrativo, no una transcripción de una ejecución: las fuentes entregadas no incluyen la salida de `npm run recorrido`. Las organizaciones y el documento son ficticios, y las atestaciones pertenecen al conjunto cerrado del proyecto.

```text
Fuente       «Entrego una vez el documento de muestra».
Vela         El documento queda sellado. La publicación sigue cerrada.
Custodio     Invita a medio-1, medio-2 y medio-3.
medio-1      Atestigua: documento-autentico.
Custodio     Intenta publicar cuando el conteo aún no llega a tres.
Vela         Rechaza la publicación y conserva el motivo.
medio-2      Atestigua: documento-incompleto.
medio-3      Atestigua: no-puedo-verificar.
Custodio     Intenta publicar después de alcanzar el umbral configurado.
Vela         Recalcula las comprobaciones y escribe la línea de publicación.
```

Estas líneas explican el recorrido especificado; no son una salida literal de terminal. Un motivo real de rechazo que aparece en el acuerdo es `requirements consume 3 against grant max 1`. La salida capturada de la suite está reproducida en [Evidencia](./docs/EVIDENCE.md). Una segunda firma del mismo medio invitado se rechaza, un medio no invitado no puede atestiguar y alterar el documento sellado impide publicarlo aunque se alcance el conteo.

## Cómo funciona

```text
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
recalcular recibos y contar el registro local
        |
        +-- bajo el umbral --> rechazar; conservar el motivo
        |
        +-- umbral alcanzado -> escribir la línea de publicación
```

| Actor | Derechos en el recorrido descrito | Límites |
|---|---|---|
| Fuente (`fuente-1`) | Entregar un documento una vez | No se acepta un campo de identidad; Vela no promete anonimato ni prueba quién lo entregó |
| Custodio del canal (Vela) | Sellar, invitar, contar y aplicar el umbral | No decide si un documento es verdadero y no puede publicar antes del umbral |
| Verificador invitado | Usar una invitación para una atestación cerrada | Organización ficticia; no se nombra ni contacta a ningún medio real |
| Lector | Abrir el registro JSONL local con un editor | Los digests de recibos no acreditan quién guardó o entregó el archivo |

La entrega de la fuente, la invitación del verificador y cada verificación usan grants de autoridad de un solo uso y dejan recibos. Vela construye el grant de publicación a partir del conteo que lee en el momento del intento, y el estado publicado no se reabre. El predicado `sufficient` del kernel determina si ese grant cubre el umbral configurado. Antes de escribir la publicación, Vela vuelve a calcular las comprobaciones desde el registro. El digest del recibo ayuda a detectar cambios, pero no autentica a la persona que conservó el archivo.

## Por qué Vela

| Necesitas | Qué te da Vela | Dónde vive |
|---|---|---|
| Registrar que un documento se entregó una vez | Un sello de un solo uso y un recibo ligado al digest del documento | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Que la publicación espere varias atestaciones | Una invitación y una atestación por verificador ficticio; el umbral se comprueba desde el registro | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Conocer el motivo cuando no se puede publicar | Un intento rechazado cuya insuficiencia viene del predicado del kernel | [Evidencia](./docs/EVIDENCE.md) |
| Inspeccionar el registro | Un archivo JSONL local que se puede abrir sin Vela | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Delimitar la pertenencia institucional | Pertenencia declarada y prueba de conocimiento cero marcada como pendiente | [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) |

## Qué no es Vela

Vela no es un producto de anonimato, un servicio Anonymous, un sitio de filtraciones, una herramienta para hackear, un sistema de identificación de fuentes ni un servicio periodístico activo. No contacta a medios reales ni establece que un documento sea verdadero. Su ejemplo usa datos sintéticos, organizaciones ficticias y firmas ficticias.

## Evidencia que puedes abrir

El registro de pruebas entregado informa **11 aprobadas de 11, con 0 fallidas y 0 omitidas**, ejecutadas con Node v24.15.0. Las nueve pruebas funcionales cubren el rechazo de una publicación anticipada, los límites de invitación y uso único, la integridad del documento después del sello, el rechazo de un intento de publicar la identidad de la fuente, el cierre de una publicación, el recorrido positivo al alcanzar el umbral, el límite ZK pendiente y la ausencia de un campo de identidad en el registro. Una prueba comprueba la copia vendorizada del kernel módulo por módulo contra su SOURCE.md, y otra prueba aprobada comprueba que los encabezados de los cinco módulos declaren el mismo commit.

La captura del 2026-10-03 estaba en rojo porque el proyecto estaba fijado al corte viejo del kernel (0.1.3, commit 54c20c7); esa re-fijación a 0.1.5 ya está hecha. La fase RED anterior registró nueve casos del proyecto que fallaban antes de implementar y dos comprobaciones de digest que pasaban; esos conteos no miden lo mismo que el 11/11 actual. El acuerdo y las notas de fase también documentan tres defectos hallados y corregidos al pasar a GREEN: texto libre de verificación, publicación escrita antes del recálculo y auditorías que exigían comprobaciones de publicación a un recibo de sello. Son notas adversariales internas, no una auditoría de seguridad independiente. [Evidencia](./docs/EVIDENCE.md) incluye los nombres de las pruebas y sus límites.

## Vela, Vespi y Lore Plugin

Vela es el décimo de diez proyectos funcionales del conjunto de Vespi. Usa la copia del kernel incluida por Lore Plugin, fijada por digest de módulo. El proyecto corre con el kernel **0.1.5 publicado** (commit `ed559e8`), verificado módulo por módulo contra su SOURCE.md en la suite del 2026-10-09. Las piezas del kernel que Vela documenta que consume son grants de autoridad acotada, presupuestos de un solo uso, el predicado `sufficient` para el umbral, digests de recibos y su verificación. Lore Plugin aporta la copia vendorizada del kernel descrita en el acuerdo; el acuerdo no nombra otras funciones de Lore Plugin como parte de este recorrido. Este proyecto no tiene red, testnet, pagos ni anclaje externo. Consulta [Vespi](https://github.com/andresanemic/vespi) y [Lore Plugin](https://github.com/andresanemic/lore-plugin).

## Lo que no hace Vela y lo que no está verificado

No hay una prueba de conocimiento cero activa. La pertenencia institucional se declara y su prueba está pendiente. Vela no hackea, filtra ni identifica a una fuente, ni siquiera en simulación. No usa documentos reales, datos personales, medios reales ni una red, y no afirma cumplir normas jurídicas. Los materiales del proyecto no verifican una sesión activa de agente con RC5 ni establecen que esté listo para uso real. La re-fijación del kernel a 0.1.5 está hecha; la suite actual es 11/11. Consulta [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md).

## Cómo revisar este proyecto

Este repositorio contiene el acuerdo, la explicación y el registro de pruebas, pero no el código fuente. [Código no incluido](./CODE_NOT_INCLUDED.md) explica las condiciones de publicación. Se indica que el código se abrirá durante el periodo de revisión de los jueces bajo los términos de solo revisión de [LICENSE](./LICENSE), que permiten leerlo y clonarlo para evaluarlo. La licencia es propietaria y está marcada como borrador de trabajo para revisión jurídica.

## Autor

**Andrés Peña**, autoridad del repositorio: [`andresanemic`](https://github.com/andresanemic).

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[Cómo funciona](./docs/HOW_IT_WORKS.md) · [Evidencia](./docs/EVIDENCE.md) · [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) · [Código no incluido](./CODE_NOT_INCLUDED.md) · [Licencia de solo revisión](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>
