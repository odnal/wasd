class V2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    up(amount) {
        this.y += (-amount);
    }

    down(amount) {
        this.y += amount;
    }

    left(amount) {
        this.x -= amount;
    }

    right(amount) {
        this.x += amount;
    }
}

let keyState = {
    "KeyW": {label: "W", learned: false, alpha: 1.0},
    "KeyA": {label: "A", learned: false, alpha: 1.0},
    "KeyS": {label: "S", learned: false, alpha: 1.0},
    "KeyD": {label: "D", learned: false, alpha: 1.0},
}

const GameTitle = function (name) {

    let dalpha = 0.0;
    const rate = 4.0;

    return {
        update(dt) {
            for (const key in keyState) {
                if (keyState[key].learned && keyState[key].alpha > 0) {
                    keyState[key].alpha += (dalpha * dt) * rate;
                    if (keyState[key].alpha < 0) keyState[key].alpha = 0; // clamp tp 0
                }
            }
        },
        fadeIn() {
            dalpha = 1.0; // increases alpha
        },
        fadeOut() {
            dalpha = -1.0; // decareases alpa
        },
        render(context) { 
            const centerX = context.canvas.width / 2;
            const centerY = context.canvas.height / 2;

            const keys = Object.keys(keyState); // get iterable array of object keys

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const state = keyState[key];

                context.fillStyle = `rgba(255, 255, 255, ${state.alpha})`;
                context.font = "48px Iosevka-Bold";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(
                    state.label, 
                    centerX + (i-1.5) * 30, 
                    centerY
                );
            }
            
        },
    }
}

const CreateGame = function (name) {
    console.log(`Game "${name}" initialized.`);

    const title = GameTitle(name);
    const radius = 69;
    const speed = 1000;
    let alpha = 1;

    let pos = new V2(0, 0);

    let pressedKeys = new Set();
    console.log(pressedKeys);

    function drawCircle(context, pos, radius) {
        context.beginPath();
        context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        context.lineWidth = 3;
        context.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        context.stroke();
    }

    return {
        init(context) {
            pos.x = context.canvas.width/2;
            pos.y = context.canvas.height/2;
        }, 
        update(dt) {
            const distance = dt * speed;
            for (let key of pressedKeys) {
                switch (key) {
                    case "KeyW":
                        pos.up(distance);
                        break;
                    case "KeyS":
                        pos.down(distance);
                        break;
                    case "KeyA":
                        pos.left(distance);
                        break;
                    case "KeyD":
                        pos.right(distance);
                        break;
                    default:
                        console.log(`${key} not supported.`);
                }
            }
            title.update(dt);
        },
        render(context) {
            const width = context.canvas.width;
            const height = context.canvas.height;
            context.clearRect(0, 0, width, height);

            title.render(context);
            drawCircle(context, pos, radius);
        },
        keyDown(event) {
            if (event.code in keyState && !keyState[event.code].learned) {
                keyState[event.code].learned = true;
                title.fadeOut()
            }
            pressedKeys.add(event.code);
        },
        keyUp(event) {
            pressedKeys.delete(event.code);
        }
    };
};


// IIFE - "Immediately Invoked Function Expression"
(() => {

    const canvas = document.getElementById("game");
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create Game Context: DOM context and canvas width/height
    let game = CreateGame("WASD");
    game.init(context)

    let start;
    function step(timestamp) {
        if (start === undefined) {
            start = timestamp;
        }
        const dt = (timestamp - start) * 0.001;
        //console.log(`Elapsed Time: ${dt}`);
        start = timestamp;

        game.update(dt);
        game.render(context);

        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);

    window.addEventListener("keydown", event => {
        game.keyDown(event);
    })

    window.addEventListener("keyup", event => {
        game.keyUp(event);
    })
})();
