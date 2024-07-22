const BOARDID = "graph";

const board = JXG.JSXGraph.initBoard(BOARDID, {
  boundingbox: [-10, 10, 10, -10],
  axis: true,
});

//TODO:
//  import/export files
//  add static points
//  add angles

///////////////////////////////////////////////////////////////////

let temp_objects = [];

function analyzeBoard() {
  return;
  const points = [];
  const segments = [];
  for (let id in board.objects) {
    const obj = board.objects[id];

    if (!obj.getAttribute("userCreated")) continue;

    if (obj.elType === "point") {
      points.push(obj);
    } else if (obj.elType === "segment") {
      segments.push(obj);
    }
  }

  console.log(points, points.length);
  console.log(segments, segments.length);
}

///////////////////////////////////////////////////////////////////

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
    color: "red",
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

function handleDown(e) {
  let objType = undefined;
  let coords = getMouseCoords(e);
  let objs = board.getAllUnderMouse(e);
  let handle = undefined;

  for (let i in objs) {
    if (objs[i].elType === "segment" || objs[i].elType === "point") {
      objType = objs[i].elType;
      handle = objs[i];
      break;
    }
  }


  let keep_highlight = false;

  if (e.button === 0) {
    // left click

    if (objType == undefined) {
      if (highlighted_point == undefined)
        board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
          name: "",
          color: "red",
          userCreated: true,
        });
    } else if (objType == "point") {
      if (highlighted_point == undefined) {
        highlightPoint(handle);
        keep_highlight = true;
      } else if (highlighted_point != handle) {
        createSegment(highlighted_point, handle);
      }
    }
  } else if (e.button === 2) {
    board.removeObject(handle);
  }

  if (!keep_highlight) unhighlightPoint();

  analyzeBoard();
}

board.on("down", handleDown);

board.on("move", (e) => {
  if (e.pressure != 0) unhighlightPoint();
});

///////////////////////////////////////////////////////////////////

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
    default:
      break;
  }
};
