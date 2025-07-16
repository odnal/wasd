class V2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(that) {
        return new V2(this.x + that.x, this.y + that.y);
    }

    up(that) {
        this.y += (-that);
    }

    down(that) {
        this.y += that;
    }

    left(that) {
        this.x -= that;
    }

    right(that) {
        this.x += that;
    }
}

const GameTitle = function (name) {
    let alpha = 1.0; // NOTE: let an update function modify this value for the opacity of the title

    return {
        render(context) { 
            const centerX = context.canvas.width / 2;
            const centerY = context.canvas.height / 2;

            context.fillStyle = `rgba(255, 255, 255, 0.8)`;
            context.font = "48px Iosevka-Bold";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(name, centerX, centerY);
        },
    }
}

const CreateGame = function (name) {
    console.log(`Game "${name}" initialized.`);

    const title = GameTitle();
    const radius = 69;
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
            for (let key of pressedKeys) {
                switch (key) {
                    case "KeyW":
                        console.log(pos);
                        pos.up(dt);
                        break;
                    case "KeyS":
                        pos.down(dt);
                        break;
                    case "KeyA":
                        pos.left(dt);
                        break;
                    case "KeyD":
                        pos.right(dt);
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

            GameTitle(name).render(context);
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

    let start;
    function step(timestamp) {
        if (start === undefined) {
            start = timestamp;
        }
        const dt = (timestamp - start) * 0.5;
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
