# PSLG Editor
Its a viewer/editor for planar straight-line graphs.
Visit [here](https://mennemann.github.io/PSLGEditor/).
View code [here](https://github.com/mennemann/PSLGEditor/).

Currently mobile devices are not supported and may cause unexpected behavior.

## Usage
### Navigation
Use `← ↓ ↑ →` or the arrow keys to move around.

Use `+` and `-` buttons/keys to zoom.


### Controls
Click on empty space: Create a point

Click on a point
+ while no other point is highlighted: highlight the clicked point (marked by blue rim)
+ while another point is highlighted: connect the 2 points with a line segment


To fix a point in place, highlight it, then press `f`. To loosen a point, do the same.

Cick on a line segment:
+ while no point is selected: split it
+ while a point is selected: construct a segment from the highlighted point to the projection of the point onto the clicked segment

To delete a line segment or a point, rightclick it

Points can be dragged around


### Analysis
If `Auto analyze` is checked, the graph will be analyzed after editing. If not, press `Analyze` to analyze it.

Points/edges that are part of at least one triangle, non-obtuse angles and non-intersecting edges will be marked green.

Note that due to floating point error, it is recommended to check exact 90° angles by hand.

The convex hull of the PSLG will be shown in gray.

To view the unanalyzed PSLG hold rightclick on empty space.

### Importing/Exporting
You can import PSLGs according to the format specified by the [CG:SHOP SoCG Competition 2025](https://cgshop.ibr.cs.tu-bs.de/competition/cg-shop-2025/#instance-format).

Files must be in `.json` format or compressed json format (`.json.xz`).

Points added by importing are fixed by default.

Exporting will be implemented soon.

### Constrained Delaunay triangulation
You can generate the CDT of the current PSLG by pressing `Generate Constrained Delaunay Triangulation`.

The current input must not break any PSLG constraints.

## Bugs and feature ideas
feel free to reach out to me or create an [issue](https://github.com/mennemann/PSLGEditor/issues) with any bugs you discover or features you would like to see.

---
&copy; Marcin Mennemann 2024. View [license](https://raw.githubusercontent.com/mennemann/PSLGEditor/main/LICENSE)
