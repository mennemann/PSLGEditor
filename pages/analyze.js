function createConvexHull(points) {
    function cross(o, a, b) {
        return (
            (a.X() - o.X()) * (b.Y() - o.Y()) -
            (a.Y() - o.Y()) * (b.X() - o.X())
        );
    }

    points.sort((a, b) => {
        return a.X() === b.X() ? a.Y() - b.Y() : a.X() - b.X();
    });

    let lower = [];
    for (let i = 0; i < points.length; i++) {
        while (
            lower.length >= 2 &&
            cross(
                lower[lower.length - 2],
                lower[lower.length - 1],
                points[i]
            ) <= 0
        )
            lower.pop();

        lower.push(points[i]);
    }

    let upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (
            upper.length >= 2 &&
            cross(
                upper[upper.length - 2],
                upper[upper.length - 1],
                points[i]
            ) <= 0
        )
            upper.pop();

        upper.push(points[i]);
    }

    upper.pop();
    lower.pop();

    return board.create("polygon", lower.concat(upper), {
        color: "gray",
        borders: {
            strokeColor: "none",
            highlight: false,
        },
        fillOpacity: 0.5,
        layer: 0,
        highlight: false,
    });
}

let points = [];
let segments = [];
let triangles = [];
let angles = [];
let convex_hull = undefined;

function analyzeBoard() {
    if (!wasmLoaded) return;
    board.suspendUpdate();
    console.time("total analysis time");

    for (let id in board.objects) {
        const obj = board.objects[id];

        if (!obj.getAttribute("userCreated")) continue;

        if (obj.elType === "point") {
            points.push(obj);
        } else if (obj.elType === "segment") {
            segments.push(obj);
        }
    }

    console.time("generating convex hull");
    convex_hull = createConvexHull(points);
    console.timeEnd("generating convex hull");

    let w = convertforwasm()

    const points_x_ptr = Module._malloc(
        w.points_x.length * w.points_x.BYTES_PER_ELEMENT
    );
    const points_y_ptr = Module._malloc(
        w.points_y.length * w.points_y.BYTES_PER_ELEMENT
    );
    const segments_flat_ptr = Module._malloc(
        w.segments_flat.length * w.segments_flat.BYTES_PER_ELEMENT
    );

    Module.HEAPF64.set(w.points_x, points_x_ptr / w.points_x.BYTES_PER_ELEMENT);
    Module.HEAPF64.set(w.points_y, points_y_ptr / w.points_y.BYTES_PER_ELEMENT);
    Module.HEAP32.set(
        w.segments_flat,
        segments_flat_ptr / w.segments_flat.BYTES_PER_ELEMENT
    );

    Module._analyze(
        w.num_points,
        points_x_ptr,
        points_y_ptr,
        w.num_segments,
        segments_flat_ptr
    );

    Module._free(points_x_ptr);
    Module._free(points_y_ptr);
    Module._free(segments_flat_ptr);

    if (highlighted_point) highlightPoint(highlighted_point);

    console.timeEnd("total analysis time");
    board.unsuspendUpdate();
}

function clearAnalysis() {
    board.suspendUpdate();
    board.removeObject(triangles);
    board.removeObject(angles);
    board.removeObject(convex_hull);

    for (let id in board.objects) {
        const obj = board.objects[id];

        if (!obj.getAttribute("userCreated")) continue;

        if (obj.elType === "point") {
            obj.setAttribute({
                color: obj.getAttribute("fixed") ? "black" : "red",
            });
        } else if (obj.elType === "segment") {
            obj.setAttribute({ color: "#0072B2" });
        }
    }

    points = [];
    segments = [];
    triangles = [];
    angles = [];
    convex_hull = undefined;
    board.unsuspendUpdate();
}
