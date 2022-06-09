export function detectSwipe(node) {
    console.log('node', node)
    console.log('node id', node?.id)
    // Swipe Up / Down / Left / Right
    var initialX = null;
    var initialY = null;
    var initialTime = null;

    var finalX = null;
    var finalY = null;
    var finalTime = null;

    var diffX;
    var diffY;
    var duration = 0;
    var speedX;
    var speedY;

    var minSpeed = 0.1;
    function touchstart(e) {


        initialTime = e.timeStamp;

        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
    }
    function touchend(e) {

        console.log(e)

        if (diffX === null || diffY === null) {
            return;
        }
        finalTime = e.timeStamp;

        duration = finalTime - initialTime;
        console.log('initialTime', initialTime)
        console.log('finalTime', finalTime)
        console.log('duration', duration)

        speedX = Math.abs(diffX / duration);
        speedY = Math.abs(diffY / duration);

        //finalX = e.touches[0].clientX;
        //finalY = e.touches[0].clientY;

        console.log('diffX', diffX)
        console.log('diffY', diffY)

        if (Math.abs(diffX) > Math.abs(diffY) && speedX > minSpeed) {// sliding horizontally
            if (diffX > 0) {
                // swiped left
                node.dispatchEvent(new CustomEvent("swipeleft", {
                    bubbles: false
                }));
            } else {
                // swiped right
                node.dispatchEvent(new CustomEvent("swiperight", {
                    bubbles: false
                }));
            }
        } else if (speedY > minSpeed) {// sliding vertically
            if (diffY > 0) {
                // swiped up
                node.dispatchEvent(new CustomEvent("swipeup", {
                    bubbles: false
                }));
            } else {
                // swiped down
                node.dispatchEvent(new CustomEvent("swipedown", {
                    bubbles: false
                }));
            }
        }
        diffX = null
        diffY = null



    }
    function touchmove(e) {



        if (initialX === null || initialY === null) {
            return;
        }

        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;

        diffX = initialX - currentX;
        diffY = initialY - currentY;

        initialX = null;
        initialY = null;
    }



    document.addEventListener("touchmove", touchmove, { capture: true });
    document.addEventListener("touchend", touchend, { capture: true });
    document.addEventListener("touchstart", touchstart, { capture: true });

    return {
        destroy() {
            document.removeEventListener("touchmove", touchmove, { capture: true });
            document.removeEventListener("touchend", touchend, { capture: true });
            document.removeEventListener("touchstart", touchstart, { capture: true });

        }
    };

}