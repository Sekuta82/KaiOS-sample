(function (app) {
    const columns = 3; /* grid columns */
    const gridLength = 12; /* grid items */
    var itemWidth;

    window.addEventListener("load", function () {
        var gridContainer = document.getElementById('generatedGrid');
        itemWidth = (100 / columns).toFixed(2);
        populateGrid(gridContainer);
    })

    function populateGrid(container) {
        for (let i = 0; i < gridLength; i++) {
            // calculate tabIndex
            var row = 10 * Math.floor(i / columns);
            var ti = row + i % columns;

            var entry = document.createElement("div");
            entry.className = 'navItem';
            entry.tabIndex = ti;
            entry.style.width = itemWidth + '%';
            entry.setAttribute('data-function', 'changeColor');

            var headline = document.createElement("h3");
            headline.innerText = i;
            entry.appendChild(headline);

            var content = document.createElement("span");
            content.innerText = 'tI: ' + ti;
            entry.appendChild(content);

            container.appendChild(entry);
        }
    }

    return app;
}(MODULE));