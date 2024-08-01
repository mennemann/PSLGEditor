const BOARDID = "graph";

const board = JXG.JSXGraph.initBoard(BOARDID, {
    boundingbox: [-10, 10, 10, -10],
    axis: true,
});

function getMouseCoords(e) {
    var pos = board.getMousePosition(e);
    return new JXG.Coords(JXG.COORDS_BY_SCREEN, pos, board);
}

let highlighted_point = undefined;

function highlightPoint(point) {
    point.setAttribute({
        strokeColor: "blue",
    });
    highlighted_point = point;
}

function unhighlightPoint() {
    if (highlighted_point === undefined) return;
    highlighted_point.setAttribute({
        color: highlighted_point.getAttribute("fixed") ? "black" : "red",
    });
    highlighted_point = undefined;
}

function createSegment(p1, p2) {
    for (let id in board.objects) {
        const obj = board.objects[id];
        if (obj.elementClass === JXG.OBJECT_CLASS_LINE) {
            if (
                (obj.point1 === p1 && obj.point2 === p2) ||
                (obj.point1 === p2 && obj.point2 === p1)
            )
                return;
        }
    }

    board.create("segment", [p1, p2], {
        userCreated: true,
    });
}

function createPoint(coords, fixed = false) {
    return board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
        name: "",
        color: fixed ? "black" : "red",
        userCreated: true,
        fixed: fixed,
    });
}

function projectPointOnSegment(L, P) {
    const AP = {
        x: P.usrCoords[1] - L.point1.X(),
        y: P.usrCoords[2] - L.point1.Y(),
    };
    const AB = {
        x: L.point2.X() - L.point1.X(),
        y: L.point2.Y() - L.point1.Y(),
    };

    const AB_AP = AB.x * AP.x + AB.y * AP.y;
    const AB_AB = AB.x * AB.x + AB.y * AB.y;

    let t = AB_AB === 0 ? 0 : AB_AP / AB_AB;
    let clamped = t < 0 || t > 1;
    t = Math.max(0, Math.min(1, t));

    return {
        usrCoords: [1, L.point1.X() + t * AB.x, L.point1.Y() + t * AB.y],
        clamped: clamped,
    };
}

function handleDown(e) {
    clearAnalysis();
    let coords = getMouseCoords(e);
    let objs = board.getAllUnderMouse(e);

    let segmentHandle = undefined;
    let pointHandle = undefined;

    for (let i in objs) {
        if (objs[i].elType === "segment" && segmentHandle === undefined)
            segmentHandle = objs[i];
        if (objs[i].elType === "point" && pointHandle === undefined)
            pointHandle = objs[i];
    }

    let keep_highlight = false;

    if (e.button === 0) {
        // left click
        if (pointHandle === undefined && segmentHandle === undefined) {
            // clicking empty space
            if (highlighted_point === undefined) createPoint(coords);
        } else if (pointHandle != undefined) {
            // clicking a point
            if (highlighted_point === undefined) {
                highlightPoint(pointHandle);
                keep_highlight = true;
            } else if (highlighted_point != pointHandle) {
                createSegment(highlighted_point, pointHandle);
            }
        } else if (segmentHandle != undefined) {
            // clicking segment
            let p1 = segmentHandle.point1;
            let p2 = segmentHandle.point2;
            if (!p1.getAttribute("fixed") && !p2.getAttribute("fixed")) {
                p1.setAttribute({ fixed: true });
                segmentHandle.on("up", (e) => {
                    p1.setAttribute({ fixed: false });
                });
            }
            if (highlighted_point === undefined) {
                let p3 = createPoint(
                    projectPointOnSegment(segmentHandle, coords)
                );
                board.removeObject(segmentHandle);
                createSegment(p1, p3);
                createSegment(p2, p3);
            } else {
                p3 = projectPointOnSegment(
                    segmentHandle,
                    highlighted_point.coords
                );
                if (!p3.clamped) {
                    p3 = createPoint(p3);
                    createSegment(p3, highlighted_point);
                    board.removeObject(segmentHandle);
                    createSegment(p1, p3);
                    createSegment(p2, p3);
                }
            }
        }
    } else if (e.button === 2) {
        // right click
        if (pointHandle) {
            if (!pointHandle.getAttribute("fixed"))
                board.removeObject(pointHandle);
        } else if (segmentHandle) {
            board.removeObject(segmentHandle);
        }
    }

    if (!keep_highlight) unhighlightPoint();
}

board.on("down", handleDown);

board.on("move", (e) => {
    if (e.pressure != 0) unhighlightPoint();
});

board.on("up", () => {
    if (document.getElementById("autoanalyze").checked) analyzeBoard();
});

///////////////////////////////////////////////////////////////////

function toggle_highlighted_point_fixed() {
    if (highlighted_point === undefined) return;

    let is_fixed = highlighted_point.getAttribute("fixed");
    highlighted_point.setAttribute({
        fixed: !is_fixed,
    });
    unhighlightPoint();
}

function moveBoundingBox(dx, dy) {
    var boundingBox = board.getBoundingBox();
    var xRange = boundingBox[2] - boundingBox[0];
    var yRange = boundingBox[1] - boundingBox[3];

    board.setBoundingBox([
        boundingBox[0] + dx * xRange,
        boundingBox[1] - dy * yRange,
        boundingBox[2] + dx * xRange,
        boundingBox[3] - dy * yRange,
    ]);
}

function zoomBoundingBox(scale) {
    var boundingBox = board.getBoundingBox();
    var xRange = boundingBox[2] - boundingBox[0];
    var yRange = boundingBox[1] - boundingBox[3];

    board.setBoundingBox([
        boundingBox[0] + xRange * scale,
        boundingBox[1] - yRange * scale,
        boundingBox[2] - xRange * scale,
        boundingBox[3] + yRange * scale,
    ]);
}

document.onkeydown = function (e) {
    let scale = 0.1;
    let step = 0.1;

    switch (e.key) {
        case "+":
            zoomBoundingBox(scale);
            break;
        case "-":
            zoomBoundingBox(-scale);
            break;
        case "ArrowUp":
            e.preventDefault();
            moveBoundingBox(0, -step);
            break;
        case "ArrowDown":
            e.preventDefault();
            moveBoundingBox(0, step);
            break;
        case "ArrowLeft":
            e.preventDefault();
            moveBoundingBox(-step, 0);
            break;
        case "ArrowRight":
            e.preventDefault();
            moveBoundingBox(step, 0);
            break;
        case "f":
            toggle_highlighted_point_fixed();
        default:
            break;
    }
};

function autoZoom() {
  let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];

  let i = 0;

  for (let id in board.objects)
    if (board.objects[id].elType === "point") {
      if (!board.objects[id].getAttribute("userCreated")) continue;
      i++;

      let x = board.objects[id].X();
      let y = board.objects[id].Y();
      minX = Math.min(x, minX);
      maxX = Math.max(x, maxX);
      minY = Math.min(y, minY);
      maxY = Math.max(y, maxY);
    }

  if (i >= 2) {
    board.setBoundingBox([minX, maxY, maxX, minY]);
    zoomBoundingBox(-0.1);
  }
}


function clearBoard() {
    clearAnalysis();
    board.suspendUpdate();
    board.removeObject(board.objectsList.filter(e => (e.elType === "point" || e.eltype === "segement") && e.getAttribute("userCreated")))
    board.unsuspendUpdate();
}