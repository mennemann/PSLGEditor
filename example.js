function createExample() {
  clearBoard();

  const p1 = createPoint({ usrCoords: [1, -7, -5] }, false);
  const p2 = createPoint({ usrCoords: [1, -2, -4] }, false);
  const p3 = createPoint({ usrCoords: [1, 8, -8] }, false);
  const p4 = createPoint({ usrCoords: [1, 6, 2] }, false);
  const p5 = createPoint({ usrCoords: [1, -4, 4] }, false);
  const p6 = createPoint({ usrCoords: [1, 2, 6] }, false);
  const p7 = createPoint({ usrCoords: [1, 9, 7] }, false);

  createSegment(p1, p2);
  createSegment(p2, p4);
  createSegment(p2, p5);
  createSegment(p3, p4);
  createSegment(p5, p4);
  createSegment(p6, p4);
  createSegment(p6, p5);
  createSegment(p6, p7);
  createSegment(p4, p7);

  if (document.getElementById("autoanalyze").checked) analyzeBoard();
  autoZoom();
}
