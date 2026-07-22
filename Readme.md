# Excel Grid Task

## Architecture Overview

### 1. State & Configuration
* **States**: Tracks cell data, row dimensions, column widths, and selection ranges (`anchorRow`, `anchorCol`, `focusRow`, `focusCol`).
* **Constants**: Grid limits (total rows/cols), cell dimensions, scroll speeds, and hit-box thresholds.

---

### 2. Canvas Maths & Layout
Handles dynamic viewport calculations and index translation:
* **`colBounds` / `rowBound`**: Calculates active viewport boundaries (`totalX`, `startRow`, `endRow`, etc.).
* **Index Mapping**: `colAtX`, `rowAtY`, `borderX`, and `borderY` for hit-testing interaction.
* **Helpers**: `getCellRect(x, y)`, `ensureColVisible()`, `ensureRowVisible()`.

---

### 3. Events & Interactions

#### Input Listeners
* **HTML UI**: Triggers themes, font sizes, colors, and JSON import.
* **Wheel Scroll & Drag Auto-Scroll**: Smooth scrolling across axes during mouse drag edge operations.
* **Pointer & Keyboard Listeners**: Captures raw click, drag, tab, arrow keys, and shift modifiers.

#### Event Delegation Handlers
* **Keyboard Handler**: Maps keyboard events down to `RowEvent`, `ColumnEvent`, or `CellEvent`.
* **Pointer Handler**: Dispatches pointer interactions to `RowEvent`, `ColumnEvent`, `CellEvent`, `ResizeColEvent`, or `ResizeRowEvent`.

---

### 4. Cell Editing & Formatting
* **Cell Editor**: Overlays an input field for editing upon keypress (`F2`, `Enter`) or `dblClick`. Handles `commit` and live changes.
* **Cell Properties**: Dynamically applies HTML inputs to style cells (font color, background color, font size).
* **Selection Stat**: Calculates aggregated values (`sum`, `avg`, `min`, `max`, `count`) over the current selection range.

---

### 5. Rendering Pipeline
* **RenderEngine**: Coordinates core canvas components (cells, headers, column/row selections).
* **PaintEngine**: Executes actual draw calls for cells, active headers, and bounding selections.
* **Paint Props**: Manages color schemes for default mode, dark mode, and active selection highlights.

---

### 6. History & State Management
* **History Manager**: Maintains `undoStack` and `redoStack`.
* **Command Pattern**: Encapsulates atomic user actions into executable `do`, `undo`, and `redo` operations.

---

## Key Features
* **Fast Rendering**: Uses standard HTML5 Canvas math instead of heavy DOM structures.
* **Column/Row Resizing**: Built-in edge detection for quick dynamic resizing.
* **Custom Themes**: Native dark mode support and custom inline cell styling.
* **Undo/Redo Stack**: Full state control via standard command pattern execution.