# OrigenDirecto

Aplicativo web para que las fincas cafeteras publiquen sus cosechas y se conecten
directamente con compradores. Este repositorio contiene el MVP, que funciona sin
backend: los datos viven en IndexedDB, en el navegador del usuario.

Generado con [Angular CLI](https://github.com/angular/angular-cli) 22.2.5.

## Requisitos

Node 22.22.3+, 24.15.0+ o 26+ (ver `.nvmrc`). Instalar dependencias con `npm install`.

## Arquitectura

```
src/app/
  core/       # infraestructura compartida, se instancia una sola vez
    db/       # Dexie: esquema de IndexedDB y helper liveQuerySignal()
    data/     # contrato CrudRepository y su implementacion base sobre Dexie
  shared/     # componentes, pipes y utilidades reutilizables sin estado
  layout/     # shell de la aplicacion (toolbar + router-outlet)
  features/   # una carpeta por feature, cargada con lazy loading
```

El flujo de datos va en una sola direccion: los componentes leen signals del servicio
de su feature, el servicio usa el repositorio a traves del contrato `CrudRepository`, y
hoy ese contrato lo cumple Dexie sobre IndexedDB. Cuando exista backend solo se cambia
la implementacion del repositorio.

Reglas de dependencia: `features` puede usar `core` y `shared`; `shared` no conoce
`features`; `core` no conoce a ninguno de los dos. Ver
[`src/app/features/README.md`](src/app/features/README.md) para la estructura de una feature.

Las lecturas usan `liveQuerySignal()`, que envuelve el `liveQuery` de Dexie: cualquier
escritura en una tabla vuelve a emitir las consultas que dependen de ella, asi que las
vistas se actualizan solas sin recargar a mano.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Despliegue en AWS Amplify

El build lo define [`amplify.yml`](amplify.yml), no la deteccion automatica de la consola.
Dos puntos que hay que respetar:

- La imagen de build de Amplify trae una version de Node anterior a la que exige el CLI de
  Angular, por eso el `preBuild` hace `nvm install $(cat .nvmrc)`. Para cambiar la version
  de Node del pipeline basta con editar `.nvmrc`.
- Los artefactos salen en `dist/origen-directo/browser`, con la subcarpeta `browser` que
  genera Angular. Apuntar a `dist/origen-directo` publica un sitio vacio.

Como es una SPA, hay que agregar una regla de rewrite en la consola de Amplify
(Hosting > Rewrites and redirects), o cualquier ruta abierta en forma directa respondera 404:

| Source | Target | Type |
| --- | --- | --- |
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json\|webp)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

La expresion excluye las extensiones de los archivos estaticos para que solo las rutas de
navegacion caigan en `index.html`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
