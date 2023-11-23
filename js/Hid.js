let keymap = new Array(255).fill(0);

let counter = 0;

var mousePos = { x:0, y:0 };
var lastPos = mousePos;

let _mouseActive = false;
let _kbdActive = false;

const clampVal = (num, min, max) => Math.min(Math.max(num, min), max)

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
        // e.stopImmediatePropagation();
        // e.preventDefault();
        mousePos = getMousePos(e);
        if(lastPos.x === mousePos.x && lastPos.y === mousePos.y){
          theChuck.setInt("_mouseMotion",0);
        } else {
          theChuck.setInt("_mouseMotion",1);
          theChuck.broadcastEvent("_hid");
          theChuck.setInt("_hidMouse",1);
          theChuck.setInt("_cursorX", mousePos.x);
          theChuck.setInt("_cursorY", mousePos.y);
          theChuck.setFloat("_deltaX",e.movementX);
          theChuck.setFloat("_deltaY",e.movementY);
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
        // e.stopImmediatePropagation();
        // e.preventDefault();
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
        // e.stopImmediatePropagation();
        // e.preventDefault();
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
        theChuck.setFloat("_deltaX",clampVal(e.deltaX,-1,1));
        theChuck.setFloat("_deltaY",clampVal(e.deltaY,-1,1));
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
        counter++;
        eventManager(e, 1);
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if(activeHID){
      kbdActive();
      if(_kbdActive){
        keymap[e.keyCode] = 0;
        counter--;
        eventManager(e, 0);
      }
    }
  });

  function eventManager(e, isDown){
    theChuck.broadcastEvent("_hid");
    theChuck.setString("_key", e.key);
    theChuck.setInt("_which", e.which);
    theChuck.setInt("_ascii", e.keyCode);
    theChuck.setInt("_isDown", isDown);
    theChuck.setInt("_isUp", !isDown);
    theChuck.setInt("_hidMultiple", counter);
    theChuck.broadcastEvent("_msg");
  }