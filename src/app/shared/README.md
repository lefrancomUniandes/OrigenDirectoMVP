# shared

Piezas reutilizables y sin estado: componentes de presentacion, pipes, directivas y
utilidades que usan varias features.

```
shared/
  ui/          # componentes presentacionales (entradas y salidas, sin acceso a datos)
  pipes/
  directives/
  utils/
```

Reglas:

- No importa nada de `features`.
- No accede a la base de datos ni a repositorios; recibe los datos por `input()`.
