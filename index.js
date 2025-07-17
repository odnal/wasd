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

const GameTitle = function (name) {

    let alpha = 1.0;
    let dalpha = -1.0;
    const rate = 0.04;

    return {
        fadeIn(dt) {
            const scaled_dt = dt * rate;
            alpha -= dalpha * scaled_dt;
        },
        fadeOut(dt) {
            alpha += dalpha * dt * rate;
            if 
        },
        render(context) { 
            const centerX = context.canvas.width / 2;
            const centerY = context.canvas.height / 2;

            context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            context.font = "48px Iosevka-Bold";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(name, centerX, centerY);
        },
    }
}

const CreateGame = function (name) {
    console.log(`Game "${name}" initialized.`);

    const title = GameTitle(name);
    const radius = 69;
    const speed = 12.34;
    let alpha = 0.8;

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
            // TODO: title.fadeIn()
            const distance = dt * speed;
            for (let key of pressedKeys) {
                switch (key) {
                    case "KeyW":
                        pos.up(distance);
                        title.fadeOut(dt);
                        break;
                    case "KeyS":
                        pos.down(distance);
                        title.fadeOut(dt);
                        break;
                    case "KeyA":
                        pos.left(distance);
                        title.fadeOut(dt);
                        break;
                    case "KeyD":
                        pos.right(distance);
                        title.fadeOut(dt);
                        break;
                    default:
                        console.log(`${key} not supported.`);
                }
            }
        },
        render(context) {
            const width = context.canvas.width;
            const height = context.canvas.height;
            context.clearRect(0, 0, width, height);

            title.render(context);
            drawCircle(context, pos, radius);
        },
        keyDown(event) {
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
    const FRAME_COUNT = 24;

    let start;
    function step(timestamp) {
        if (start === undefined) {
            start = timestamp;
        }
        const dt = (timestamp - start) * 0.06;
        const fps =  FRAME_COUNT / dt;
        //console.log(`Frame Count:   ${FRAME_COUNT}`);
        //console.log(`Elapsed Time: ${dt}`);
        //console.log(`FPS:          ${fps}`);
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
