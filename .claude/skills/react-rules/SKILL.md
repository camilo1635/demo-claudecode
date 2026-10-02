---
name: react-rules
description: Genera un proyecto con la estructura de React con TypeScript. Úsalo cuando el usuario pida crear una aplicación o componente React, o agregar/modificar componentes, hooks, estado, formularios o lógica de UI en React.
---

# react-rules

Mejores prácticas para crear y modificar código React con TypeScript.

## Cuándo activarse
- El usuario pide crear una aplicación o un componente React.
- El usuario pide agregar o modificar componentes, hooks, estado, formularios o lógica de UI en React.

## Versiones y lenguaje
- Usa React **19.2.5 o superior** (última disponible en https://www.npmjs.com/package/react; verifica con `npm view react version`).
- Usa **TypeScript** en lugar de JavaScript para mejorar el tipado, la seguridad del código y la mantenibilidad.

## Estado y datos
- **Estado global:** usa Zustand. Crea el store con `create()` definiendo estado y acciones.
- **Validación:** usa Zod con esquemas (`z.object`, `z.string`, ...) y valida con `parse` o `safeParse`.
- **Formularios:** integra Zod con React Hook Form.
- **Datos de API:** usa React Query o SWR cuando un componente obtenga datos de una API y los comparta o reutilice entre varios componentes, con cache y refetch automático.
- **Inmutabilidad:** no mutes el estado directamente; crea siempre nuevas copias de objetos o arrays.

## Componentes
- Mantenlos pequeños, simples y con una sola responsabilidad.
- Los componentes y hooks deben ser puros: sin side effects durante el render.
- Para comunicar cambios al padre, usa callbacks por props y ejecútalos desde el hijo cuando algo cambie.
- Para reiniciar o ajustar estado usa `key`, deriva el estado desde props o actualízalo en eventos.

## Hooks
- No llames hooks dentro de bucles, condicionales o funciones anidadas.
- Extrae lógica reutilizable en custom hooks (`useAuth`, `useFetch`, etc.) para mantener los componentes claros.
- Comparte lógica entre eventos usando funciones reutilizables o hooks.
- Usa `useMemo` para cachear cálculos costosos.

## useEffect
- Úsalo **solo** para sincronizar con sistemas externos (API, DOM, librerías).
- No lo uses para lógica derivada de props o estado: calcúlala en el render o en handlers.
- La lógica causada por interacción del usuario va en event handlers, no en `useEffect`.
- Mantén los effects simples y con dependencias claras.

## Registro en CLAUDE.md
Al aplicar este skill, verifica que `CLAUDE.md` tenga las secciones `Available skills` y `Skill trigger rules` con `react-rules`; si no existen, créalas.
