let keymap = new Array(255).fill(0);

let counter = 0;

var mousePos = { x:0, y:0 };
var lastPos = mousePos;

let _mouseActive = false;
let _kbdActive = false;

async function kbdActive() {
  const x = await theChuck.getInt("_kbdActive");
  _kbdActive = x == 1;
}

async function mouseActive() {
  const x = await theChuck.getInt("_mouseActive");
  _mouseActive = x == 1;
}

function getMousePos(mouseEvent) {
    return {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    };
  }

  document.addEventListener("mousemove", function (e) {
    if(activeHID){
      mouseActive();
      if(_mouseActive){
        e.stopImmediatePropagation();
        e.preventDefault();
        mousePos = getMousePos(e);
        if(lastPos.x === mousePos.x && lastPos.y === mousePos.y){
          theChuck.setInt("_mouseMotion",0);
        } else {
          theChuck.setInt("_mouseMotion",1);
          theChuck.broadcastEvent("_hid");
          theChuck.setInt("_hidMouse",1);
          theChuck.setInt("_cursorX", mousePos.x);
          theChuck.setInt("_cursorY", mousePos.y);
          theChuck.setFloat("_scaledCursorX", mousePos.x/document.documentElement.clientWidth);
          theChuck.setFloat("_scaledCursorY", mousePos.y/document.documentElement.clientHeight);
          theChuck.broadcastEvent("_msg");
        }
        lastPos = mousePos;
      }
    }
  }, true); 

  document.addEventListener("mousedown", function (e) {
    if(activeHID){
      mouseActive();
      if(_mouseActive){
        e.stopImmediatePropagation();
        e.preventDefault();
        if(lastPos.x === mousePos.x && lastPos.y === mousePos.y){
          theChuck.setInt("_mouseMotion",0);
        } else {
          theChuck.setInt("_mouseMotion",1);
        }

        theChuck.setInt("_isMouseDown",1);
        theChuck.broadcastEvent("_hid");
        theChuck.setInt("_hidMouse",1);
        theChuck.setInt("_which", e.which);
        theChuck.broadcastEvent("_msg");
      }
    }
  }, true); 

  document.addEventListener("mouseup", function (e) {
    if(activeHID){
      mouseActive();
      if(_mouseActive){
        e.stopImmediatePropagation();
        e.preventDefault();
        if(lastPos.x === mousePos.x && lastPos.y === mousePos.y){
          theChuck.setInt("_mouseMotion",0);
        } else {
          theChuck.setInt("_mouseMotion",1);
        }
        theChuck.setInt("_isMouseUp",1);
        theChuck.broadcastEvent("_hid");
        theChuck.setInt("_hidMouse",1);
        theChuck.setInt("_which", e.which);
        theChuck.broadcastEvent("_msg");
      }
    }
  }, true); 

  document.addEventListener("wheel", function (e) {
    if(activeHID){
      mouseActive();
      if(_mouseActive){
        if(lastPos.x === mousePos.x && lastPos.y === mousePos.y){
          theChuck.setInt("_mouseMotion",0);
        } else {
          theChuck.setInt("_mouseMotion",1);
        }
        theChuck.setInt("_isScroll",1);
        theChuck.setFloat("_deltaX",e.deltaX);
        theChuck.setFloat("_deltaY",e.deltaY);
        theChuck.broadcastEvent("_hid");
        theChuck.broadcastEvent("_msg");
      }
    }
  }, true); 

  window.addEventListener("keydown", (e) => {
    if(activeHID){
      kbdActive();
      if (keymap[e.keyCode] === 0){
        keymap[e.keyCode] = 1;
        eventManager(e);
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if(activeHID){
      kbdActive();
      if(_kbdActive){
        e.stopPropagation();
        keymap[e.keyCode] = 0;
        theChuck.broadcastEvent("_hid");
        theChuck.setInt("_isDown", 0);
        theChuck.setString("_key", e.key);
        theChuck.setInt("_which", e.which);
        theChuck.setInt("_ascii", e.keyCode);
        theChuck.broadcastEvent("_msg");
      }
    }
  });

  function eventManager(e){
    if(activeHID){
      e.stopPropagation();
      theChuck.broadcastEvent("_hid");
      keymap.forEach((t, index) => {
        if(t === 1){
          theChuck.setString("_key", e.key);
          theChuck.setInt("_which", e.which);
          theChuck.setInt("_ascii", index);
          counter++;
        }
      })
      theChuck.setInt("_isDown", 1);
      theChuck.setInt("_hidMultiple", counter);
      counter = 0;
      theChuck.broadcastEvent("_msg");
    }
  }