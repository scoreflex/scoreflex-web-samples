/** based on jQuery "ready" event **/
(function() {
  var onready = function() {
    Game.Gameplay();
  };

  var completed = function() {
    detach();
    onready();
  };

  var detach = function() {
    if (document.addEventListener) {
      document.removeEventListener("DOMContentLoaded", completed, false);
      window.removeEventListener("load", completed, false);
    } else {
      document.detachEvent("onreadystatechange", completed);
      window.detachEvent("onload", completed);
    }
  };

  var attach = function() {
    //-- we are late, document is already loaded
    if (document.readyState === "complete") {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      setTimeout(complete, 0);
    }
    //-- Standards-based browsers support DOMContentLoaded
    else if (document.addEventListener) {
      // Use the handy event callback
      document.addEventListener("DOMContentLoaded", completed, false);

      // A fallback to window.onload, that will always work
      window.addEventListener("load", completed, false);
    }
    //-- If IE event model is used
    else {
      // Ensure firing before onload, maybe late but safe also for iframes
      document.attachEvent("onreadystatechange", completed);

      // A fallback to window.onload, that will always work
      window.attachEvent("onload", completed);
    }
  };
  attach();
})();