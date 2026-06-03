# Flujo con Git

Para mantener un desarrollo ordenado y colaborativo, sigue estas buenas prácticas:

- **Uso de ramas por vista/funcionalidad:**
  - Crea una rama nueva para cada funcionalidad o vista importante (ejemplo: `navbar+footer`, `hero+deco_web`).
- **Pull Request (PR) por parte importante:**
  - Cada vez que completes una parte relevante, abre una PR para revisión antes de fusionar a `main`.
- **Commits descriptivos:**
  - Escribe mensajes de commit claros y específicos sobre los cambios realizados.
- **No trabajar directamente en `main`:**
  - Evita hacer cambios prolongados o directos en la rama principal. Usa siempre ramas de funcionalidad y PRs.

## Ejemplo de flujo
1. `git checkout -b nombre_rama_funcionalidad`
2. Realiza tus cambios y haz commits descriptivos.
3. Sube la rama: `git push origin nombre_rama_funcionalidad`
4. Abre una Pull Request en GitHub para revisión.
5. Una vez aprobada, fusiona la PR a `main`.
