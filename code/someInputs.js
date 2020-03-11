(function (app) {
    var select1;
    var select1_value;
    var select2;
    var select2_value;
    var input1;
    var input1_value;

    window.addEventListener("load", function () {
        select1 = document.getElementById('select1');
        select2 = document.getElementById('select2');
        input1 = document.getElementById('input1');
        loadStorage();
        app.updateInputs();
    })

    app.updateInputs = function () {
        select1_value = select1.value;
        select2_value = select2.value;
        input1_value = input1.value;
        updateStorage();
    }

    function loadStorage() {
        select1_value = setSelectByValue(select1, localStorage.getItem('select1'));
        select2_value = setSelectByValue(select2, localStorage.getItem('select2'));
        input1_value = setInput(input1, localStorage.getItem('input1'));
    }

    function updateStorage() {
        localStorage.setItem('select1', select1_value);
        localStorage.setItem('select2', select2_value);
        localStorage.setItem('input1', input1_value);
    }

    function setSelectByValue(element, value) {
        var elementValue;
        if (value == null) {
            elementValue = element.value;
        } else {
            elementValue = value;
        }
        var options = element.getElementsByTagName('OPTION');
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == elementValue) {
                options[i].selected = true;
                return options[i].value;
            }
        }
    }

    function setInput(element, value) {
        var elementValue;
        if (value == null) {
            elementValue = element.value;
        } else {
            elementValue = value;
        }
        element.value = elementValue;
    }

    return app;
}(MODULE));