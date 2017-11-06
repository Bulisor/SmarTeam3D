var Control = (function () {
    function Control() {
        
    }
    Control.prototype.keyUp = function (key) {
        switch (key) {
            case 39:
                Control.moveLeft = false;
                break;
            case 40:
                Control.moveForward = false;
                break;
            case 37:
                Control.moveRight = false;
                break;
            case 38:
                Control.moveBackward = false;
                break;
        }
    };

    Control.prototype.keyDown = function (key) {
        switch (key) {
            case 39:
                Control.moveLeft = true;
                break;
            case 40:
                Control.moveForward = true;
                break;
            case 37:
                Control.moveRight = true;
                break;
            case 38:
                Control.moveBackward = true;
                break;
        }
    };
    Control.moveForward = false;
    Control.moveBackward = false;
    Control.moveLeft = false;
    Control.moveRight = false; 
    return Control;
})(); 