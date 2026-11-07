# OrigenDirecto

## Producto

Aplicativo web para pequenas y medianas fincas cafeteras: publican su historia y sus
cosechas de cafe de origen, y se conectan directamente con compradores a precios justos,
sin los intermediarios tradicionales de la cadena. El MVP se parece a una red social, donde
cada caficultor tiene su pagina y existe un feed con lo que van publicando.

## Stack

- Angular 22, standalone y zoneless. Estado con signals nativos.
- Angular Material (tema azure-blue) y SCSS.
- Sin backend: los datos viven en IndexedDB del navegador, via Dexie 4.
- Node 22.23.4, fijado en `.nvmrc` y en `engines`. Tests con Vitest.
- Despliegue en AWS Amplify; el build lo define `amplify.yml`, no la deteccion automatica.

## Decisiones tomadas y su porque

- **Sin backend, pero con capa de servicio.** Los componentes nunca tocan Dexie: pasan por
  el servicio de su feature, que a su vez usa el contrato `CrudRepository`. Cuando exista
  backend se sustituye la implementacion del repositorio y el resto no se entera.
- **Lecturas con `liveQuerySignal()`.** Envuelve el `liveQuery` de Dexie, asi que escribir
  en una tabla refresca solas las vistas que dependen de ella. Es lo que hace viable el feed
  sin montar un estado global.
- **Signals en vez de NgRx.** El MVP no justifica el boilerplate. Si el estado compartido
  entre features crece, se reevalua.
- **Node 22 y no mas nuevo.** Los binarios de Node 24 en adelante dependen de `libatomic`,
  que no esta en la imagen de build de Amplify y rompe el pipeline. Subir la version de
  Node es romper el CI.
- **Sin ESLint, Prettier extra ni husky.** Decision explicita de ir rapido: solo lo que
  trae `ng new`.
- **Nada de pantallas ni entidades "de base".** El scaffold se dejo vacio a proposito; cada
  feature trae lo suyo cuando se construye.
- **Identificadores en ingles.** Clases, metodos, signals e ids van en ingles para
  alinearlos con el stack. Los textos de la interfaz y los nombres de las pruebas van en
  espanol, que es el idioma del producto y de los criterios.
- **`reset` en la URL borra la base local.** Al arrancar, si la direccion trae `reset`,
  se borra IndexedDB, se quita el parametro y se recarga para volver a sembrar. Sirve
  para descartar datos viejos del navegador.

## Como trabajamos

- El flujo lo definen las skills `/backlog`, `/story` y `/pair`: historias verticales que
  cortan todas las capas, criterios de aceptacion primero, y codigo en ciclos de test y
  minimo codigo.
- Lo mas simple que cumpla el criterio. Nada de abstracciones, capas ni configuracion "para
  el futuro".
- No hacer commit salvo que yo lo pida.

## Donde esta cada cosa

- Reglas de capas y dependencias: `.cursor/rules/arquitectura.mdc`
- Estructura de una feature: `src/app/features/README.md`
- Esquema de la base: `src/app/core/db/origen-directo.db.ts`
- Catalogos estaticos (departamentos, variedades): `src/app/core/catalogs/`
- Build y despliegue: `amplify.yml` y la seccion de Amplify del `README.md`

## Deuda que se va dejando

Cuando una historia deja un cabo para otra, se anota aqui con el nombre de esa historia.
No se resuelve de paso ni se olvida.

- **Perfil.** Marcar cual es la foto de perfil. El feed usa la primera foto guardada.
- **Perfil.** Pagina de la finca: contacto, datos, lotes y volver al feed. «Visitar perfil» abre el aviso del navegador porque esa pagina sigue en proceso.
- **Admin.** Aprobar o desaprobar fincas. El feed muestra todas las que se registran.
- **Feed.** Cargar mas tarjetas al bajar, en lotes, con un indicador mientras llegan.
