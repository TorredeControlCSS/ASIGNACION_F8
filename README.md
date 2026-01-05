# SIGUELO - Asignación F8 (Dashboard v1)

Este paquete contiene un dashboard estático (GitHub Pages) para visualizar y exportar la asignación de inventario a pedidos F8.

## Qué hace (v1)
- Toma pedidos (SALMI) y un inventario neto de corte (DISPONIBLE).
- Aplica reglas:
  - Solicitado en unidades sueltas.
  - Redondeo hacia abajo por empaque terciario (fallback secundario/primario/1).
  - Priorización por categoría de UE (CEDIS > Hospital > ... > CAPPS).
  - Dentro de cada prioridad: procesa pedidos del más reciente al más antiguo.
  - FEFO por lote, bloqueando lotes con vencimiento < 30 días desde el corte.
  - Permite asignación parcial y división en múltiples lotes.
- Permite filtrar, ver KPIs y exportar CSV de la vista.

## Archivos
- `index.html`: dashboard (copiar tal cual a un repo de GitHub Pages).
- `allocation.json`: datos de asignación (input del dashboard).
- `allocation.csv`: respaldo en CSV.
- `inventory_remaining.csv/json`: inventario elegible remanente luego de asignar.
- `ue_unmatched.csv/json`: UEs que no encontraron categoría (SIN_CATEGORIA).
- `params.json`: parámetros del corte y notas.

## Publicación rápida en GitHub Pages
1. Crea un repo (ej. `sigueelo-asignacion-f8`).
2. Sube todos los archivos a la raíz del repo.
3. En GitHub: Settings → Pages → Deploy from a branch → `main` / root.
4. Abre el URL publicado por GitHub Pages.

## Actualizar datos
Regenera `allocation.json` y vuelve a subirlo (manteniendo `index.html`).

Corte del dataset actual: **2026-01-02** (lotes elegibles >= 2026-02-01).
