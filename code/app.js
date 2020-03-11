//global module
var MODULE = (function () {
  var app = {};
  // use the custom module namespace 'app' for all variables and functions you need to access through other scripts
  app.views = new Array();
  app.activeNavItem = null;
  app.currentView = null;
  app.currentViewID = 0;
  app.currentViewName = '';
  app.prevViewId = 0;
  app.currentNavId = 0;
  app.navItems = new Array();

  app.backEnabled = false;
  app.optionEnabled = false;
  app.fullAdVisible = false;

  app.optionButtonAction = '';

  app.backButton = document.getElementById("bar-back");
  app.actionButton = document.getElementById("bar-action");
  app.optionsButton = document.getElementById("bar-options");

  // button input
  app.keyCallback = {
    dUp: function () { navVertical(false); },
    dDown: function () { navVertical(true); },
    dLeft: function () { navHorizontal(false); },
    dRight: function () { navHorizontal(true); },
    softLeft: function () { goBack(); },
    softRight: function () { executeOption(); },
    enter: function () { execute(); },
    menu: function () { },
    back: function () { goBack(); },
    quit: function () { },
    other: function () { }
  };

  // startup
  window.addEventListener("load", function () {
    var viewRoot = document.getElementById("views");
    app.views = viewRoot.querySelectorAll('.view');
    // load first view
    showView(0);
    initView();
  });

  // vertical navigation in increments of 10
  function navVertical(forward) {
    if (!app.isInputFocused() && !app.fullAdVisible) {
      app.updateNavItems();
      // jump to tabIndex
      var next = app.currentNavId;
      next += forward ? 10 : -10;
      if (next > getNavTabIndex(app.navItems.length - 1)) {
        // if larger than last index
        next = next % 10;
        // try to stay in same column
        if (app.navItems[next]) {
          focusActiveButton(app.navItems[next]);
        } else {
          focusActiveButton(app.navItems[0]);
        }
      } else if (next < 0) {
        // if smaller than 0
        var lastTab = getNavTabIndex(app.navItems.length - 1);
        var rowIndex = parseInt(Math.floor(lastTab * 0.1) * 10);
        // try to stay in same column
        var columnIndex = (next + 10) % 10;
        next = rowIndex + columnIndex;
        for (var i = 0; i < app.navItems.length; i++) {
          if (getNavTabIndex(i) == next) {
            focusActiveButton(app.navItems[i]);
            break;
          }
        }
      } else {
        var found = false;
        for (var i = 0; i < app.navItems.length; i++) {
          if (getNavTabIndex(i) == next) {
            focusActiveButton(app.navItems[i]);
            found = true;
            break;
          }
        }
        if (!found) {
          // nothing found, try start of next row
          var round = Math.floor(next / 10) * 10;
          for (var i = 0; i < app.navItems.length; i++) {
            if (getNavTabIndex(i) == round) {
              focusActiveButton(app.navItems[i]);
              found = true;
              break;
            }
          }
        }
      }
    }
  };

  // horizontal navigation in increments of 1
  function navHorizontal(forward) {
    if (!app.isInputFocused() && !app.fullAdVisible) {
      app.updateNavItems();
      // jump to array index for continuous horizontal navigation
      var currentTabIndex = app.currentNavId;
      for (var i = 0; i < app.navItems.length; i++) {
        if (getNavTabIndex(i) == currentTabIndex) {
          var next = i;
          next += forward ? 1 : -1;
          if (next >= app.navItems.length) {
            next = 0;
          } else if (next < 0) {
            next = app.navItems.length - 1;
          }
          focusActiveButton(app.navItems[next]);
          break;
        }
      }
    }
  };

  function getNavTabIndex(i) {
    return parseInt(app.navItems[i].getAttribute('tabIndex'));
  };

  function focusActiveButton(element) {
    app.activeNavItem = element;
    app.currentNavId = parseInt(app.activeNavItem.getAttribute('tabIndex'));

    // scroll to top
    if (app.currentNavId == 0) {
      try {
        app.currentView.scrollTo(0, 0);
      } catch (e) { }
    } else {
      // smooth scrolling into view
      app.activeNavItem.scrollIntoView({ behavior: "smooth" });
    }

    app.activeNavItem.focus();
    // update softkeys
    softkeyBar();
  };

  app.getActiveNavItemIndex = function () {
    for (var i = 0; i < app.navItems.length; i++) {
      var found = false;
      if (app.activeNavItem) {
        if (app.activeNavItem.getAttribute('id') == app.navItems[i].getAttribute('id')) {
          found = true;
          break;
        }
      }
    }
    if (found) {
      return i;
    } else {
      return 0;
    }
  }

  // decide, what the enter button does, based on the active element
  function execute() {
    if (!app.fullAdVisible) {
      if (!app.isInputFocused()) { /* NOT in some input field */
        if (app.activeNavItem.getAttribute('data-gotToViewId')) {
          showView(app.activeNavItem.getAttribute('data-gotToViewId'));
          initView();
        } else if (app.activeNavItem.getAttribute('data-gotToViewName')) {
          showViewByName(app.activeNavItem.getAttribute('data-gotToViewName'));
          initView();
        } else if (app.activeNavItem.getAttribute('data-href')) {
          openURL(app.activeNavItem.getAttribute('data-href'));
        } else if (app.activeNavItem.getAttribute('data-function')) {
          var call = app.activeNavItem.getAttribute('data-function');
          switch (call) {
            case 'mailto':
              location.href = 'mailto:' + app.activeNavItem.innerHTML;
              break;
            case 'quit':
              window.close();
              break;
            case 'changeColor':
              app.activeNavItem.style.backgroundColor = 'green';
              console.log('changing color');
              break;
          }
        } else if (app.activeNavItem.tagName.toLowerCase() == 'legend') {
          // select input field next to the legend
          app.activeNavItem.nextElementSibling.focus();
        } else {
          console.log('nothing to execute');
        }
      } else { /* in some input field */
        if (app.currentViewName == 'viewInputs') { /* do this in the inputs view */
          app.updateInputs();
        }
        // return to legend when input confirmed to avoid triggering the input again
        app.activeNavItem.focus();
      }
      // update soft keys
      softkeyBar();
    }
  };

  function goBack() {
    if (!app.isInputFocused() && !app.fullAdVisible && app.backEnabled) {
      showView(app.prevViewId);
      initView();
    }
  };

  // decide, what the 'soft key right' does
  function executeOption() {
    if (!app.fullAdVisible) {
      if (app.optionButtonAction == 'clear') { /* clear input */
        if (app.activeNavItem.tagName.toLowerCase() == 'legend') { /* clear sibling if focused element is a legend */
          app.activeNavItem.nextElementSibling.value = '';
        } else { /* otherwise clear element itself */
          app.activeNavItem.value = '';
        }
      } else if (app.optionButtonAction == 'something') {
        console.log('option action triggered');
      }
    }
  }

  app.isInputFocused = function () {
    var activeTag = document.activeElement.tagName.toLowerCase();
    var isInput = false;
    // the focus switches to the 'body' element for system ui overlays
    if (activeTag == 'input' || activeTag == 'select' || activeTag == 'text' || activeTag == 'textarea' || activeTag == 'body' || activeTag == 'html') {
      isInput = true;
    }
    return isInput;
  };

  // use the index to navigate to the view
  function showView(index) {
    app.prevViewId = app.currentViewID;
    // switch active view
    for (let i = 0; i < app.views.length; i++) {
      app.views[i].classList.remove('active');
    }
    app.currentView = app.views[index];
    app.currentView.classList.add('active');
    app.currentViewID = index;
    app.currentViewName = app.currentView.getAttribute("id");
  }

  // use the view's name
  function showViewByName(name) {
    app.prevViewId = app.currentViewID;
    var viewIndex = 0;
    // switch active view
    for (let i = 0; i < app.views.length; i++) {
      app.views[i].classList.remove('active');
      // search for name
      if (name == app.views[i].id) {
        viewIndex = i;
      }
    }
    app.currentView = app.views[viewIndex];
    app.currentView.classList.add('active');
    app.currentViewID = viewIndex;
    app.currentViewName = name;
  }

  function openURL(url) {
    var external = url.includes('http');
    if (external) {
      window.open(url, '_blank');
    } else {
      window.location.assign(url);
    }
  }

  function initView() {
    app.currentView.scrollTo(0, 0);
    // enable options button
    // enable back button
    if (app.currentViewName != 'viewMenu') {
      app.backEnabled = true;
      app.optionEnabled = true;
    } else {
      app.backEnabled = false;
      app.optionEnabled = false;
    }

    // focus first menu entry
    if (app.currentView.querySelector(".navItem")) {
      app.updateNavItems();
      focusActiveButton(app.navItems[0]);
    }
  };

  // fill navigation array for current view
  app.updateNavItems = function (index) {
    app.navItems = app.currentView.querySelectorAll('.navItem');
  }

  // set soft keys
  function softkeyBar() {
    if (app.backEnabled) {
      app.backButton.innerHTML = "Back";
    } else {
      app.backButton.innerHTML = "";
    }
    app.actionButton.innerHTML = "SELECT";
    if (app.isInputFocused()) {
      app.optionsButton.innerHTML = "Clear";
      app.optionButtonAction = 'clear';
    } else if (app.optionEnabled) {
      app.optionsButton.innerHTML = "Option";
      app.optionButtonAction = 'something';
    } else {
      app.optionsButton.innerHTML = "";
      app.optionButtonAction = '';
    }
  };

  return app;
}());

