
var currTime = new Date();
var updateClock = function () {
    //console.log("Updating clock");
    currTime = new Date();
    var clock = document.getElementById("CLOCK");
    clock.innerHTML = currTime.toLocaleTimeString();
//    clock.style.position = "absolute";
//    clock.style.float = "right";
//    clock.style.marginRight = "50px";
//    clock.style.clear = "both";
};