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

    const num_points = points.length;
    const num_segments = segments.length;

    let points_x = [];
    let points_y = [];

    for (let i = 0; i < num_points; i++) {
        points_x.push(points[i].coords.usrCoords[1]);
        points_y.push(points[i].coords.usrCoords[2]);
    }

    let segments_flat = [];

    for (let i = 0; i < num_segments; i++) {
        let p1, p2;
        for (let j = 0; j < num_points; j++) {
            if (segments[i].point1 === points[j]) p1 = j;
            if (segments[i].point2 === points[j]) p2 = j;
        }
        segments_flat.push(p1, p2);
    }

    points_x = new Float64Array(points_x);
    points_y = new Float64Array(points_y);
    segments_flat = new Int32Array(segments_flat);

    const points_x_ptr = Module._malloc(
        points_x.length * points_x.BYTES_PER_ELEMENT
    );
    const points_y_ptr = Module._malloc(
        points_y.length * points_y.BYTES_PER_ELEMENT
    );
    const segments_flat_ptr = Module._malloc(
        segments_flat.length * segments_flat.BYTES_PER_ELEMENT
    );

    Module.HEAPF64.set(points_x, points_x_ptr / points_x.BYTES_PER_ELEMENT);
    Module.HEAPF64.set(points_y, points_y_ptr / points_y.BYTES_PER_ELEMENT);
    Module.HEAP32.set(
        segments_flat,
        segments_flat_ptr / segments_flat.BYTES_PER_ELEMENT
    );

    Module._analyze(
        num_points,
        points_x_ptr,
        points_y_ptr,
        num_segments,
        segments_flat_ptr
    );

    Module._free(points_x_ptr);
    Module._free(points_y_ptr);
    Module._free(segments_flat_ptr);

    convex_hull = createConvexHull(points);

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
