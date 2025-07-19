class V2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(that) {
        this.x += that.x;
        this.y += that.y;
        return this;
    }

    sub(that) {
        this.x -= that.x;
        this.y -= that.y;
        return this;
    }

    scale(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const n = this.len();
        return new V2(this.x / n, this.y / n);
    }

    clone() {
        return new V2(this.x, this.y);
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

function drawCircle(context, playerPos, radius) {
    context.beginPath();
    context.arc(playerPos.x, playerPos.y, radius, 0, 2 * Math.PI);
    context.lineWidth = 3;
    context.strokeStyle = `rgba(255, 255, 255, 1)`;
    context.stroke();
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
        fadeIn() {
            dalpha = 1.0; // increases alpha
        },
        fadeOut() {
            dalpha = -1.0; // decareases alpa
        },
    }
}

const CreateBullet = function(position, velocity) {
    let pos = position.clone();
    const vel = velocity.clone();
    const BULLET_RADIUS = 42;

    return {
        update(dt) {
            pos = pos.add(vel);
        },
        render(context) {
            console.log(`${pos.x}, ${pos.y}`);
            drawCircle(context, pos, BULLET_RADIUS);
        }
    }
}

const CreateGame = function (name) {
    console.log(`Game "${name}" initialized.`);

    const title = GameTitle(name);
    let alpha = 1;
    const radius = 69;
    const PLAYER_SPEED = 1000;
    const BULLET_SPEED = 100;

    let playerPos = new V2(0, 0);
    const bullets = [];

    let pressedKeys = new Set();
    console.log(pressedKeys);

    function movePlayer(dt) {
        const distance = dt * PLAYER_SPEED;
        for (let key of pressedKeys) {
            switch (key) {
                case "KeyW":
                    playerPos.up(distance);
                    break;
                case "KeyS":
                    playerPos.down(distance);
                    break;
                case "KeyA":
                    playerPos.left(distance);
                    break;
                case "KeyD":
                    playerPos.right(distance);
                    break;
                default:
                    ;
            }
        }
    }

    function shootBullets(dt) {
        for (let bullet of bullets) {
            bullet.update(dt);
        }
    }

    return {
        init(context) {
            playerPos.x = context.canvas.width/2;
            playerPos.y = context.canvas.height/2;
        }, 
        update(dt) {
            movePlayer(dt);
            title.update(dt);
            shootBullets(dt);
        },
        render(context) {
            const width = context.canvas.width;
            const height = context.canvas.height;
            context.clearRect(0, 0, width, height);

            title.render(context);
            drawCircle(context, playerPos, radius);
            for (let bullet of bullets) {
                bullet.render(context);
            }
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
        },
        mouseDown(event) {
            const mousePos = new V2(event.screenX, event.screenY);
            const bulletVel = mousePos
                                .sub(playerPos)
                                .normalize()
                                .scale(BULLET_SPEED);
            console.log(`x: (${mousePos.x}) y: (${mousePos.y})`);

            bullets.push(CreateBullet(playerPos, bulletVel));
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

    window.addEventListener("mousedown", event => {
        game.mouseDown(event);
    })
})();
