# features

Una carpeta por feature de negocio. Cada una es autocontenida y se carga bajo demanda
desde [`app.routes.ts`](../app.routes.ts).

```
features/
  <feature>/
    routes.ts        # rutas de la feature, exportadas como `routes`
    pages/           # componentes enrutados (contenedores)
    components/      # componentes propios de la feature
    services/        # estado y casos de uso con signals
    data/            # modelo de la entidad y su repositorio (extiende DexieRepository)
```

Reglas:

- Una feature puede importar de `core` y `shared`, nunca de otra feature.
  Si dos features necesitan lo mismo, ese codigo sube a `shared` (UI) o a `core` (datos).
- Los componentes no hablan con el repositorio directamente: pasan por el servicio
  de la feature, que es quien expone signals y concentra las reglas.
- La tabla de IndexedDB se declara en [`core/db/origen-directo.db.ts`](../core/db/origen-directo.db.ts)
  agregando una nueva version del esquema.
