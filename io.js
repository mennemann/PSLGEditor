function importPSLG() {
    let input = document.createElement("input");
    input.type = "file";
    input.click();

    input.onchange = (e) => {
        const file = e.target.files[0];
        file.text().then((text) => {
            console.log(text);
        });
    };
    alert("this feature will be implemented soon");
}

function exportPSLG() {
    alert("this feature will be implemented soon");
}
