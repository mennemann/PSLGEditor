function createTriangle(p1, p2, p3) {
  for (let id in board.objects) {
    const obj = board.objects[id];
    if (obj.elType === "polygon") {
      if (obj.vertices.length != 4) continue;

      if (
        (obj.vertices[0] == p1 &&
          obj.vertices[1] == p2 &&
          obj.vertices[2] == p3) ||
        (obj.vertices[0] == p1 &&
          obj.vertices[1] == p3 &&
          obj.vertices[2] == p2) ||
        (obj.vertices[0] == p2 &&
          obj.vertices[1] == p1 &&
          obj.vertices[2] == p3) ||
        (obj.vertices[0] == p2 &&
          obj.vertices[1] == p3 &&
          obj.vertices[2] == p1) ||
        (obj.vertices[0] == p3 &&
          obj.vertices[1] == p1 &&
          obj.vertices[2] == p2) ||
        (obj.vertices[0] == p3 &&
          obj.vertices[1] == p2 &&
          obj.vertices[2] == p1)
      )
        return;
    }
  }

  p1.setAttribute({ color: "green" });
  p2.setAttribute({ color: "green" });
  p3.setAttribute({ color: "green" });

  return board.create("polygon", [p1, p2, p3]);
}

function create_smallest_angle(anchor, p1, p2) {
  let a = board.create("angle", [p1, anchor, p2]);

  if (a.Value() > Math.PI) {
    board.removeObject(a);
    a = board.create("angle", [p2, anchor, p1]);
  }

  a.setAttribute({
    name: () => {
      return ((a.Value() * 180) / Math.PI).toFixed(1) + "°";
    },
    color: () => {
      return a.Value() > Math.PI / 2 ? "red" : "#00FF00";
    },
  });

  return a;
}

function exists_edge(p1, p2, edges) {
  for (let i in edges) {
    if (
      (edges[i].point1 == p1 && edges[i].point2 == p2) ||
      (edges[i].point1 == p2 && edges[i].point2 == p1)
    )
      return true;
  }
  return false;
}

function doSegmentsIntersect(l1, l2) {
  const [, Ax, Ay] = l1.point1.coords.usrCoords;
  const [, Bx, By] = l1.point2.coords.usrCoords;
  const [, Cx, Cy] = l2.point1.coords.usrCoords;
  const [, Dx, Dy] = l2.point2.coords.usrCoords;

  // Function to check orientation of the triplet (p, q, r)
  function orientation(px, py, qx, qy, rx, ry) {
    let val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);
    if (val === 0) return 0; // collinear
    return val > 0 ? 1 : 2; // clock or counterclockwise
  }

  // Function to check if point q lies on segment pr
  function onSegment(px, py, qx, qy, rx, ry) {
    if (
      qx <= Math.max(px, rx) &&
      qx >= Math.min(px, rx) &&
      qy <= Math.max(py, ry) &&
      qy >= Math.min(py, ry)
    )
      return true;
    return false;
  }

  // Function to check if the segments share an endpoint
  function sharesEndpoint(Ax, Ay, Bx, By, Cx, Cy, Dx, Dy) {
    return (
      (Ax === Cx && Ay === Cy) ||
      (Ax === Dx && Ay === Dy) ||
      (Bx === Cx && By === Cy) ||
      (Bx === Dx && By === Dy)
    );
  }

  // Find the four orientations needed for the general and special cases
  let o1 = orientation(Ax, Ay, Bx, By, Cx, Cy);
  let o2 = orientation(Ax, Ay, Bx, By, Dx, Dy);
  let o3 = orientation(Cx, Cy, Dx, Dy, Ax, Ay);
  let o4 = orientation(Cx, Cy, Dx, Dy, Bx, By);

  // Check if segments share an endpoint
  if (sharesEndpoint(Ax, Ay, Bx, By, Cx, Cy, Dx, Dy)) {
    return false;
  }

  // General case
  if (o1 !== o2 && o3 !== o4) return true;

  // Special cases
  // A, B, C are collinear and C lies on segment AB
  if (o1 === 0 && onSegment(Ax, Ay, Cx, Cy, Bx, By)) return true;
  // A, B, D are collinear and D lies on segment AB
  if (o2 === 0 && onSegment(Ax, Ay, Dx, Dy, Bx, By)) return true;
  // C, D, A are collinear and A lies on segment CD
  if (o3 === 0 && onSegment(Cx, Cy, Ax, Ay, Dx, Dy)) return true;
  // C, D, B are collinear and B lies on segment CD
  if (o4 === 0 && onSegment(Cx, Cy, Bx, By, Dx, Dy)) return true;

  // Doesn't fall in any of the above cases
  return false;
}

function isPointInTriangle(triangle, point) {
  const [, x1, y1] = triangle.vertices[0].coords.usrCoords;
  const [, x2, y2] = triangle.vertices[1].coords.usrCoords;
  const [, x3, y3] = triangle.vertices[2].coords.usrCoords;
  const [, x, y] = point.coords.usrCoords;

  const denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
  const u = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
  const v = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
  const w = 1 - u - v;

  return 0 < u && u < 1 && 0 < v && v < 1 && 0 < w && w < 1;
}

let triangles = [];
let angles = [];
let intersecting_segments = [];

function analyzeBoard() {
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

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      let intersect = doSegmentsIntersect(segments[i], segments[j]);
      if (intersect) intersecting_segments.push(segments[i], segments[j]);

      segments[i].setAttribute({
        color:
          intersect || intersecting_segments.includes(segments[i])
            ? "red"
            : "green",
      });

      segments[j].setAttribute({
        color:
          intersect || intersecting_segments.includes(segments[j])
            ? "red"
            : "green",
      });
    }
  }

  for (let i in points) {
    for (let j in points) {
      if (i === j) continue;
      for (let k in points) {
        if (i === k || j === k) continue;
        if (
          !(
            exists_edge(points[i], points[j], segments) &&
            exists_edge(points[i], points[k], segments) &&
            exists_edge(points[j], points[k], segments)
          )
        )
          continue;

        let obj = createTriangle(points[i], points[j], points[k]);
        if (obj) triangles.push(obj);
      }
    }
  }

  triangles = triangles.filter((triangle) => {
    for (let i in points) {
      if (isPointInTriangle(triangle, points[i])) {
        board.removeObject(triangle);
        return false;
      }
    }
    return true;
  });

  for (let i in triangles) {
    let triangle = triangles[i];

    angles.push(
      create_smallest_angle(
        triangle.vertices[0],
        triangle.vertices[1],
        triangle.vertices[2],
      ),
    );
    angles.push(
      create_smallest_angle(
        triangle.vertices[1],
        triangle.vertices[0],
        triangle.vertices[2],
      ),
    );
    angles.push(
      create_smallest_angle(
        triangle.vertices[2],
        triangle.vertices[1],
        triangle.vertices[0],
      ),
    );
  }

  if (highlighted_point) highlightPoint(highlighted_point);
}

function clearAnalysis() {
  triangles.forEach((obj) => {
    obj.vertices.forEach((p) => {
      p.setAttribute({ color: p.getAttribute("fixed") ? "black" : "red" });
    });
    board.removeObject(obj);
  });

  angles.forEach((obj) => {
    board.removeObject(obj);
  });

  intersecting_segments.forEach((obj) => {
    obj.setAttribute({ color: "green" });
  });

  triangles = [];
  angles = [];
  intersecting_segments = [];
}
