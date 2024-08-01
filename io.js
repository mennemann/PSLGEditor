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

      console.log(file.name, text, content);
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
