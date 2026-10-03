# Evidence and test status

## What is available

The working sources contain the output of the current suite, but there is no separate Vela evidence directory and no transaction archive. The agreement says Vela has no network, blockchain, testnet, payments or external anchor. The tests are local; they are not real journalism, source-protection outcomes or legal validation.

## Current suite: 10 of 11

The supplied `suite-hoy.txt` reports 11 tests, 10 passing and 1 failing. The test names are reproduced below as recorded.

### Kernel pin and continuity

- **Fail:** `el núcleo que consume Vela es el corte fijado, módulo por módulo`. The reported assertion says `continuity.js` moved from the pinned digest and asks for a manual re-pin. This is today's only failure.
- **Pass:** `el encabezado de los cinco módulos declara el mismo commit`.

The nine functional project repositories were built on 2026-09-29 against kernel cut `54c20c7`; their records report green suites at that cut. Each project pins its consumed kernel by digest and intentionally fails the digest check if that kernel moves. Against the installed kernel `0.1.3`, part of each suite fails until it is re-pinned. That re-pin is pending. This is a compatibility and pinning check, not evidence of a defect in the Vela flow. No claim of readiness for use follows from the earlier green run: the project shows a working vertical path, not a finished product.

### Functional boundaries

The following named tests pass in the current output:

- `rojo 1: publicar antes del número de verificaciones se rechaza y deja el motivo`
- `rojo 2: un medio que no fue invitado no verifica`
- `rojo 3: un medio que ya firmó no vuelve a firmar`
- `rojo 4: un documento alterado después del sello no se publica, ni aunque el número se alcance`
- `rojo 5: la fuente intenta publicar su propia identidad y el sistema no la acepta`
- `rojo 6: un documento ya publicado no se reabre`
- `control: al alcanzar el número de verificaciones, la publicación ocurre`
- `recorte: la demostración de pertenencia con conocimiento cero se declara pendiente y no fabrica prueba`
- `recorte: el registro no tiene ninguna clave por donde pueda viajar la identidad de la fuente`

These tests cover the project behavior named in their descriptions. Passing them does not prove source safety, document truth, a real verifier's independence, legal effect or performance with real data.

## What the pre-code adversarial phase found

`FASES.md` reports that before implementation the RED phase ran 11 tests: two kernel digest checks passed and nine project cases failed one by one. It records three defects found while moving from RED to GREEN, also described in the agreement:

- Free-form verifier text left a path where source identity could be written into a record. Vela uses a closed set of attestations instead.
- The first version wrote the publication line before recomputing the full verification. The gate now recomputes first and writes only after the checks pass.
- The first audit demanded publication-level checks from every receipt, including a healthy seal receipt. Receipts now answer for the action they represent; publication requires the complete set of checks.

The agreement's closure conditions refer to seven RED cases, while `FASES.md` describes nine failing project cases plus two passing digest checks. The supplied sources do not explain the difference, so both counts are preserved here and not treated as interchangeable. These phase notes describe internal adversarial tests, not an independent external security audit.

## How to rerun when code opens

During the judges' review period, once the code is present:

1. Run `npm test` from the project directory in a fresh process. The source package defines the suite command as `node --test "test/*.test.js"`.
2. Check the output against the current list above. Confirm that the kernel pin matches the intended kernel copy before interpreting the result.
3. Run `npm run recorrido` to inspect the documented end-to-end path and its local receipts.
4. Re-run the tests after any manual kernel re-pin. The re-pin should be reviewed alongside the five module digests in the consumed kernel's `SOURCE.md`.

Vela has no testnet transactions to replay or inspect. The agreement states that its receipt anchor remains `pending` and that no external network operation occurs.

## Español

### Qué evidencia hay

Las fuentes de trabajo contienen la salida de la suite actual, pero no hay un directorio independiente de evidencia de Vela ni un archivo de transacciones. El acuerdo dice que Vela no usa red, blockchain, testnet, pagos ni anclaje externo. Son pruebas locales; no son periodismo real, resultados de protección de fuentes ni validación jurídica.

### Suite actual: 10 de 11

El archivo `suite-hoy.txt` informa 11 pruebas, 10 aprobadas y 1 fallida. A continuación se reproducen los nombres registrados.

### Pin del kernel y continuidad

- **Falla:** `el núcleo que consume Vela es el corte fijado, módulo por módulo`. La aserción informa que `continuity.js` se movió respecto del digest fijado y pide re-fijarlo manualmente. Es el único fallo de hoy.
- **Pasa:** `el encabezado de los cinco módulos declara el mismo commit`.

Los nueve repositorios funcionales se construyeron el 2026-09-29 contra el corte `54c20c7` del kernel; sus registros informan suites verdes en ese corte. Cada proyecto fija por digest el kernel que consume y falla deliberadamente la comprobación si ese kernel se mueve. Frente al kernel instalado `0.1.3`, parte de cada suite falla hasta que se vuelva a fijar. Esa re-fijación está pendiente. Es una comprobación de compatibilidad y del pin, no evidencia de un defecto en el recorrido de Vela. La corrida verde anterior no permite afirmar que esté listo para usarse: el proyecto muestra un camino vertical que funciona, no un producto terminado.

### Límites funcionales

Estas pruebas nombradas pasan en la salida actual:

- `rojo 1: publicar antes del número de verificaciones se rechaza y deja el motivo`
- `rojo 2: un medio que no fue invitado no verifica`
- `rojo 3: un medio que ya firmó no vuelve a firmar`
- `rojo 4: un documento alterado después del sello no se publica, ni aunque el número se alcance`
- `rojo 5: la fuente intenta publicar su propia identidad y el sistema no la acepta`
- `rojo 6: un documento ya publicado no se reabre`
- `control: al alcanzar el número de verificaciones, la publicación ocurre`
- `recorte: la demostración de pertenencia con conocimiento cero se declara pendiente y no fabrica prueba`
- `recorte: el registro no tiene ninguna clave por donde pueda viajar la identidad de la fuente`

Estas pruebas cubren el comportamiento que nombran. Que pasen no demuestra seguridad de una fuente, verdad del documento, independencia de un verificador real, efecto jurídico ni funcionamiento con datos reales.

### Qué encontró la fase adversarial previa al código

`FASES.md` informa que antes de implementar, la fase RED corrió 11 pruebas: dos comprobaciones de digest del kernel pasaron y nueve casos del proyecto fallaron uno por uno. Registra tres defectos hallados al pasar de RED a GREEN, también descritos en el acuerdo:

- El texto libre del verificador dejaba una vía para escribir identidad de la fuente en un registro. Vela usa ahora un conjunto cerrado de atestaciones.
- La primera versión escribía la línea de publicación antes de recalcular toda la verificación. La compuerta recalcula primero y solo escribe después de que pasan las comprobaciones.
- La primera auditoría exigía comprobaciones propias de publicación a todos los recibos, incluido un recibo de sello sano. Ahora cada recibo responde por la acción que representa; la publicación exige el conjunto completo de comprobaciones.

Las condiciones de cierre del acuerdo hablan de siete casos RED, mientras que `FASES.md` describe nueve casos del proyecto que fallaron y dos comprobaciones de digest que pasaron. Las fuentes entregadas no explican la diferencia, así que se conservan ambos conteos y no se tratan como equivalentes. Estas notas describen pruebas adversariales internas, no una auditoría de seguridad independiente.

### Cómo volver a correrla cuando se abra el código

Durante el periodo de los jueces, cuando esté el código:

1. Ejecuta `npm test` desde el directorio del proyecto en un proceso nuevo. El paquete fuente define la suite como `node --test "test/*.test.js"`.
2. Compara la salida con la lista anterior. Confirma que el pin del kernel corresponde a la copia prevista antes de interpretar el resultado.
3. Ejecuta `npm run recorrido` para inspeccionar el recorrido completo documentado y sus recibos locales.
4. Vuelve a correr las pruebas después de cualquier re-fijación manual del kernel. Revisa esa fijación junto con los cinco digests de módulo en el `SOURCE.md` del kernel consumido.

No hay transacciones de Vela en testnet que repetir o inspeccionar. El acuerdo declara que el anclaje del recibo queda `pending` y que no hay operación de red externa.