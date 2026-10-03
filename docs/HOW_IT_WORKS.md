# How Vela works

## Scope

Vela is a local, reversible project path for receiving a document once, sealing it, recording invitations and attestations, and withholding publication until the configured threshold is met. Its example data and organizations are fictional. Institutional membership is declared, but its proof is pending. Zero-knowledge verification is not implemented.

## Participants and rights

| Participant | What they may do in the described flow | What this does not establish |
|---|---|---|
| Source (`fuente-1`) | Submit the document once | The record has no name, contact, signature or identifying metadata for the source. This does not prove who submitted the file or promise invisibility. |
| Channel custodian (Vela) | Seal and count the record, invite fictional media, and apply the publication threshold | The custodian does not decide whether a document is true and cannot publish before the threshold. |
| Invited verifier (`medio-1`, `medio-2`, `medio-3`) | Verify once and select one fixed attestation | These are fictional organizations. No real medium is contacted, and a verifier does not see who submitted the document. |
| Reader | Open `datos/registro.jsonl` with any editor and inspect the recorded state | A receipt digest does not authenticate the person who kept or supplied the file. |

## Walkthrough: one fictional document

This example uses only synthetic data described by the project agreement. It is not a real institution, source or journalistic review.

1. **Submit once.** `fuente-1` gives Vela a sample text about `institucion-ejemplo`, a made-up institution. The input has no field for a source's identity. An explicit attempt to provide identity is rejected before it writes a record line.
2. **Seal the document.** A one-use grant for `documento:<id>` allows the seal operation to write to the local record. Its core receipt contains a canonical digest tying the recorded content to that point. `verifyReceipt` checks it. If the document is edited afterwards, the receipt no longer verifies.
3. **Declare, but do not prove, membership.** The document's relationship to the institution is declared. The zero-knowledge proof that would support that declaration is pending. No proof artifact is fabricated.
4. **Invite verifiers.** The custodian invites the fictional media with an expiry (`vence`). Each invitation grants a one-use budget for `verificacion:<id>` to write a verification. A verifier without an invitation has no grant to sign.
5. **Record attestations.** An invited verifier signs once. The available attestations are the closed set `documento-autentico`, `documento-incompleto` and `no-puedo-verificar`, rather than free-form text. A verifier's second attempt is rejected because its one-use grant has already been spent. Each verification has its own receipt and carries a fingerprint of the document as it stood when signed.
6. **Try publication.** Vela rereads the verification count from the record each time. It constructs the publication grant from that count, then asks the kernel's `sufficient` predicate whether the requested threshold can be spent. If the available count is below the threshold, publication is rejected and the reason is reported. The block is returned by the kernel predicate, not a separate project condition.
7. **Publish only after the gate.** When the threshold is met, the project recomputes the full checks before the publication line is written. The agreement chooses three verifications as a changeable project parameter; it is not a number fixed by the kernel. The record remains local and reversible.
8. **Inspect the record.** A reader can open the JSONL record without Vela. If someone edits the record by hand, receipts stop verifying and the independent audit detects the mismatch. The digest itself does not say who kept or supplied the file; custody of the file remains a declared limit.

```text
source: one submission
        |
        v
sealed document + receipt -------------------+
        |                                      |
        v                                      v
custodian invites fictional verifiers     local JSONL record
        |                                      ^
        v                                      |
one signed, fixed attestation per invite -----+
        |
        v
re-read record; recompute receipts; count verifications
        |
        +-- fewer than threshold --> reject; report kernel reason
        |
        +-- threshold met ---------> write publication line
```

## Authority and rules in plain language

Vela uses four chained authority budgets. Each limits a different action, and the publication grant is assembled only when publication is attempted.

- **The seal:** the source submits once. The grant allows one write for that document to the local record. Its receipt digest binds the receipt to the submitted content at that point. Editing the document makes the receipt fail verification.
- **The invitation:** the custodian grants a named fictional verifier one write to the verification record, within the invitation window. Without an invitation, a verifier has no authority to sign.
- **The verification:** each invited medium can attest once. The one-use budget is consumed by that signature. Repeated signatures by the same medium are rejected.
- **The publication:** Vela builds the grant from the number of verifications found in the record. The grant's maximum is that count. Publication requires spending the configured threshold. If the record cannot support it, the kernel's `sufficient` predicate rejects the request and Vela reports the returned reason.

The threshold is three in the described project example. The agreement treats it as a parameter selected for this project, not a fixed rule of the kernel. The publication grant is not written in advance. A manually edited verification count affects what is assembled, but receipt checks and the independent audit expose a record that no longer verifies.

The record is local and reversible. There is no network, blockchain, testnet, payment, external anchor or live x402 operation. Each seal, invitation, verification and publication has its own receipt, which an audit can inspect alongside the record. Receipt checks are local project behavior; they do not make the file's custodian independently trustworthy.

## What the flow proves and does not prove

The described tests exercise the seal, invitations, one-verification-per-invite rule, tamper detection, source-identity rejection, the publication block below threshold, successful publication at the threshold, the closed publication state and the pending ZK boundary. The record can show which fictional verifier signed which fixed attestation and what the project computed from the supplied local record.

This does not prove the document is true, that it belongs to the institution, that any real journalism took place, that a real source is safe or anonymous, or that a real institution received anything. It does not prove identity, authenticity of the file custodian, legal compliance, legal effect or readiness for use. The zero-knowledge proof is pending. All sample records and organizations are synthetic; no real source, institution or medium is included in those examples.

## Español

### Alcance

Vela es un recorrido local y reversible para recibir un documento una vez, sellarlo, registrar invitaciones y atestaciones, y retener la publicación hasta alcanzar el umbral configurado. Los datos y las organizaciones del ejemplo son ficticios. La pertenencia institucional se declara, pero su prueba está pendiente. La verificación de conocimiento cero no está implementada.

### Participantes y derechos

| Participante | Qué puede hacer en el recorrido descrito | Qué no establece |
|---|---|---|
| Fuente (`fuente-1`) | Entregar el documento una vez | El registro no contiene nombre, contacto, firma ni metadatos que la identifiquen. Esto no prueba quién entregó el archivo ni promete invisibilidad. |
| Custodio del canal (Vela) | Sellar y contar el registro, invitar a medios ficticios y aplicar el umbral de publicación | El custodio no decide si el documento es verdadero y no puede publicarlo antes del umbral. |
| Verificador invitado (`medio-1`, `medio-2`, `medio-3`) | Verificar una vez y elegir una atestación cerrada | Son organizaciones ficticias. No se contacta a ningún medio real y el verificador no ve quién entregó el documento. |
| Lector | Abrir `datos/registro.jsonl` con cualquier editor e inspeccionar el estado registrado | Un digest de recibo no autentica a quien guardó o entregó el archivo. |

### Recorrido: un documento ficticio

El ejemplo usa solo datos sintéticos descritos por el acuerdo del proyecto. No representa una institución, fuente ni revisión periodística reales.

1. **Entrega única.** `fuente-1` entrega a Vela un texto de muestra sobre `institucion-ejemplo`, una institución inventada. La entrada no tiene campo para la identidad de la fuente. Si se intenta entregar identidad de forma explícita, se rechaza la petición antes de escribir una línea.
2. **Sellado.** Un grant de un solo uso para `documento:<id>` permite escribir el sello en el registro local. El recibo del núcleo contiene un digest canónico que vincula el contenido registrado con ese momento. `verifyReceipt` lo comprueba. Si el documento se edita después, el recibo deja de verificarse.
3. **Pertenencia declarada, no probada.** Se declara la relación del documento con la institución. La prueba de conocimiento cero que respaldaría esa declaración está pendiente. No se fabrica ningún artefacto de prueba.
4. **Invitación.** El custodio invita a los medios ficticios con un vencimiento (`vence`). Cada invitación concede un presupuesto de un solo uso para `verificacion:<id>` en el registro de verificaciones. Un verificador sin invitación no tiene un grant para firmar.
5. **Atestaciones.** Un verificador invitado firma una vez. Las atestaciones son el conjunto cerrado `documento-autentico`, `documento-incompleto` y `no-puedo-verificar`, no texto libre. Se rechaza un segundo intento porque el grant ya se consumió. Cada verificación tiene su recibo e incluye una huella del documento tal como estaba al firmarse.
6. **Intento de publicación.** Vela vuelve a leer el conteo en cada intento. Construye el grant de publicación a partir de ese conteo y le pide al predicado `sufficient` del núcleo evaluar si puede gastarse el umbral. Si el conteo es menor, se rechaza la publicación y se informa el motivo. El bloqueo viene del predicado del núcleo, no de una condición separada del proyecto.
7. **Publicar tras la compuerta.** Cuando se alcanza el umbral, el proyecto vuelve a calcular las comprobaciones completas antes de escribir la línea de publicación. El acuerdo elige tres verificaciones como parámetro modificable del proyecto; no es una cifra fijada por el núcleo. El registro sigue siendo local y reversible.
8. **Inspección.** Un lector puede abrir el JSONL sin Vela. Si se edita el registro a mano, los recibos dejan de verificarse y la auditoría independiente detecta la diferencia. El digest no indica quién guardó o entregó el archivo; la custodia es un límite declarado.

```text
fuente: una entrega
        |
        v
documento sellado + recibo ----------------+
        |                                      |
        v                                      v
custodio invita a verificadores ficticios  registro JSONL local
        |                                      ^
        v                                      |
una atestación firmada por invitación -------+
        |
        v
releer registro; recalcular recibos; contar verificaciones
        |
        +-- bajo el umbral ------> rechazar; informar motivo del núcleo
        |
        +-- umbral alcanzado ----> escribir línea de publicación
```

### Autoridad y reglas en lenguaje claro

Vela usa cuatro presupuestos de autoridad encadenados. Cada uno limita una acción distinta y el grant de publicación solo se arma cuando se intenta publicar.

- **El sello:** la fuente entrega una vez. El grant permite una escritura para ese documento en el registro local. El digest del recibo lo vincula con el contenido entregado en ese momento. Si el documento se edita, el recibo deja de verificarse.
- **La invitación:** el custodio concede a un verificador ficticio nombrado una escritura en el registro de verificaciones, dentro de la ventana de invitación. Sin invitación, no tiene autoridad para firmar.
- **La verificación:** cada medio invitado puede atestiguar una vez. La firma consume el presupuesto de un solo uso. Se rechazan las firmas repetidas del mismo medio.
- **La publicación:** Vela construye el grant a partir del conteo de verificaciones del registro. El máximo del grant es ese conteo. La publicación exige gastar el umbral configurado. Si el registro no lo permite, el predicado `sufficient` del núcleo rechaza la solicitud y Vela informa el motivo.

El umbral descrito es tres. El acuerdo lo trata como un parámetro elegido para este proyecto, no como una regla fija del núcleo. El grant no se escribe por adelantado. Una edición manual del conteo afecta lo que se arma, pero las comprobaciones de recibos y la auditoría independiente exponen el registro que ya no verifica.

El registro es local y reversible. No hay red, blockchain, testnet, pagos, anclaje externo ni operación x402 activa. Cada sello, invitación, verificación y publicación tiene su propio recibo, que una auditoría puede inspeccionar junto con el registro. Las comprobaciones de recibos son comportamiento local; no vuelven confiable de forma independiente a quien custodia el archivo.

### Qué prueba y qué no prueba el recorrido

Las pruebas descritas ejercitan el sello, las invitaciones, la regla de una verificación por invitación, la detección de alteraciones, el rechazo de la identidad de la fuente, el bloqueo de publicación bajo el umbral, la publicación al alcanzarlo, el estado cerrado tras publicar y el límite ZK pendiente. El registro puede mostrar qué verificador ficticio firmó qué atestación cerrada y qué calculó el proyecto a partir del registro local.

Esto no prueba que el documento sea verdadero, que pertenezca a la institución, que haya ocurrido periodismo real, que una fuente real esté segura o sea anónima, ni que una institución real haya recibido algo. Tampoco prueba identidad, autenticidad de quien custodia el archivo, cumplimiento legal, efecto jurídico ni preparación para uso. La prueba ZK está pendiente, las organizaciones y los datos son sintéticos y no hay datos reales.