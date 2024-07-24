fetch("https://raw.githubusercontent.com/mennemann/PSLGEditor/main/README.md")
  .then((res) => res.text())
  .then((markdown) => {
    const converter = new showdown.Converter();
    document.getElementById("markdown").innerHTML =
      converter.makeHtml(markdown);
  });
