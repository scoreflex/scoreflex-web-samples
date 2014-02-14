var Game = {};

Game.Common = {
  listenEvent: function(element, eventType, handler) {
    if(element.addEventListener) {
      element.addEventListener(eventType, handler, false);
    }
    else if(element.attachEvent) {
      element.attachEvent( "on" + eventType, handler);
    }
  },
  unlistenEvent: function(element, eventType, handler) {
    if(element.removeEventListener) {
      element.removeEventListener(eventType, handler, false);
    }
    else if(element.attachEvent) {
      element.detachEvent( "on" + eventType, handler);
    }
  }
};