(function (app) {
    const listLength = 10; /* list items */

    window.addEventListener("load", function () {
        var listContainer = document.getElementById('generatedList');
        populateList(listContainer);
    })

    function populateList(container) {
        for (let i = 0; i < listLength; i++) {
            var entry = document.createElement("div");
            entry.className = 'navItem';
            entry.tabIndex = i * 10;
            entry.setAttribute('data-function', 'changeColor');

            var headline = document.createElement("h3");
            headline.innerText = 'Headline ' + i;
            entry.appendChild(headline);

            var content = document.createElement("span");
            content.innerText = 'tabIndex: ' + entry.tabIndex;
            entry.appendChild(content);

            container.appendChild(entry);
        }
    }

    return app;
}(MODULE));