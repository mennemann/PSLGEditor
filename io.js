function importPSLG() {
  let input = document.createElement("input");
  input.type = "file";
  input.click();

  input.onchange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      let text;

      if (file.name.endsWith(".json.xz")) {
        text = await new Response(
          new xzwasm.XzReadableStream(file.stream()),
        ).text();
      } else if (file.name.endsWith(".json")) {
        text = await file.text();
      } else {
        throw new Error("wrong file ending");
      }

      let content = JSON.parse(text);

      clearBoard();
      board.suspendUpdate();

      const points = [];

      for (let i = 0; i < content.num_points; i++) {
          points.push(
              createPoint(
                  { usrCoords: [1, content.points_x[i], content.points_y[i]] },
                  true
              )
          );
      }

      for (let i = 0; i < content.region_boundary.length; i++) {
          createSegment(
              points[content.region_boundary[i]],
              points[
                  content.region_boundary[
                      (i + 1) % content.region_boundary.length
                  ]
              ]
          );
      }

      for (let i = 0; i < content.additional_constraints.length; i++) {
          createSegment(
              points[content.additional_constraints[i][0]],
              points[content.additional_constraints[i][1]]
          );
      }

      board.unsuspendUpdate();

      autoZoom();
      if (document.getElementById("autoanalyze").checked) {
          if (points.length > 30) {
              document.getElementById("autoanalyze").click();
          } else {
              analyzeBoard();
          }
      }
    } catch (error) {
      alert(
        "Error reading file. Read the section about importing and exporting for further information",
      );
      console.log(error);
    }
  };
}

function exportPSLG() {
  alert("this feature will be implemented soon");
}
