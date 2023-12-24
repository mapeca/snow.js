import { Snow } from './snow.js';
(() => {
    let snow: Snow;

    function checkPlayerMode() {
        let snowContainer = snow.getSnowContainer();
        let ok = true;
        if (!snowContainer) {
            console.error("snow.js: Snow container not found");
            return;
        }


        let actualDate = new Date();
        // checking if the user is in player mode (url: .../video)
        if (window.location.href.includes("/video")) {
            // if the user is in player mode, the snow will be disabled
            if (snow.isEnabled()) {
                console.log("snow.js: User is in player mode, the snow will be disabled.")
                snow.stop();
            }
        } else {
            if (!snow.isEnabled()) {
                console.log("snow.js: User is not in player mode, the snow will be enabled.")
                try {
                    snow.start();
                } catch (error) {
                    ok = false;
                    console.error("snow.js: " + error);
                }
            }

        }
        if (isSnowTime() && ok) {
            setTimeout(checkPlayerMode, 250);
        } else {
            snow.stop();
        }
    }

    // if runtime is before jan 3rd and later than dec 10, the snow will run
    function isSnowTime() {
        let actualDate = new Date();
        if (
            (actualDate.getMonth() == 11 && actualDate.getDate() > 14) ||
            (actualDate.getMonth() == 0 && actualDate.getDate() < 6)) {
            return true;
        }
        return false;
    }

    if (isSnowTime()) {
        console.log("snow.js: It's snow time! (until 05/01)");
        snow = new Snow(30, false);
        snow.setup(["assets/snow/svg/snowflake1.svg"]);
        checkPlayerMode();
    } else {
        console.log("snow.js: It's not snow time! snow time is between 15/12 and 05/01");
    }


})();