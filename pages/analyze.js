let triangles = [];
let angles = [];
let intersecting_segments = [];
let convex_hull = undefined;

function analyzeBoard() {
    
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

    triangles = [];
    angles = [];
    intersecting_segments = [];
    convex_hull = undefined;
    board.unsuspendUpdate();
}
