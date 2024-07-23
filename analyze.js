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

// center black : fixed point
//  center red : movable
//  full blue: highlighted
//  rim green: part of triangle
//  rim red: not part of triangle

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

let triangles = [];
let angles = [];

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

  triangles = [];
  angles = [];
}
