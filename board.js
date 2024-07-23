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
    color: "#00FF00",
  });
  highlighted_point = point;
}

function unhighlightPoint() {
  if (highlighted_point == undefined) return;
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

function handleDown(e) {
  let coords = getMouseCoords(e);
  let objs = board.getAllUnderMouse(e);

  let segmentHandle = undefined;
  let pointHandle = undefined;

  for (let i in objs) {
    if (objs[i].elType === "segment" && segmentHandle == undefined)
      segmentHandle = objs[i];
    if (objs[i].elType === "point" && pointHandle == undefined)
      pointHandle = objs[i];
  }

  let keep_highlight = false;

  if (e.button === 0) {
    // left click
    if (pointHandle == undefined && segmentHandle == undefined) {
      // clicking empty space
      if (highlighted_point == undefined) createPoint(coords);
    } else if (pointHandle != undefined) {
      // clicking a point
      if (highlighted_point == undefined) {
        highlightPoint(pointHandle);
        keep_highlight = true;
      } else if (highlighted_point != pointHandle) {
        createSegment(highlighted_point, pointHandle);
      }
    } else if (segmentHandle != undefined) {
      // clicking segment (split)
      let p1 = segmentHandle.point1;
      let p2 = segmentHandle.point2;
      board.removeObject(segmentHandle);
      let p3 = createPoint(coords);
      createSegment(p1, p3);
      createSegment(p2, p3);
    }
  } else if (e.button === 2) {
    // right click
    if (pointHandle) {
      board.removeObject(pointHandle);
    } else if (segmentHandle) {
      board.removeObject(segmentHandle);
    }
  }

  if (!keep_highlight) unhighlightPoint();

  analyzeBoard();
}

board.on("down", handleDown);

board.on("move", (e) => {
  if (e.pressure != 0) unhighlightPoint();
});

///////////////////////////////////////////////////////////////////

function toggle_highlighted_point_fixed() {
  if (highlighted_point == undefined) return;

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
      moveBoundingBox(0, -step);
      break;
    case "ArrowDown":
      moveBoundingBox(0, step);
      break;
    case "ArrowLeft":
      moveBoundingBox(-step, 0);
      break;
    case "ArrowRight":
      moveBoundingBox(step, 0);
      break;
    case "f":
      toggle_highlighted_point_fixed();
    default:
      break;
  }
};
