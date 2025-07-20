class V2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(that) {
        return new V2(this.x + that.x, this.y + that.y) ;
    }

    sub(that) {
        return new V2(this.x - that.x, this.y - that.y) ;
    }

    scale(s) {
        return new V2(this.x * s, this.y * s)
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    polar(mag, dir) {
        return new V2(mag * Math.cos(dir), mag * Math.sin(dir));
    }

    normalize() {
        const n = this.len();
        return new V2(this.x / n, this.y / n);
    }

    // Keeping because it is useful to see and object cloned syntactically.
    clone() {
        return new V2(this.x, this.y);
    }
}

let keyState = {
    "KeyW": {label: "W", direction: Object.freeze(new V2(0, -1)), learned: false, alpha: 1.0},
    "KeyA": {label: "A", direction: Object.freeze(new V2(-1, 0)), learned: false, alpha: 1.0},
    "KeyS": {label: "S", direction: Object.freeze(new V2(0, 1)),  learned: false, alpha: 1.0},
    "KeyD": {label: "D", direction: Object.freeze(new V2(1, 0)),  learned: false, alpha: 1.0},
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
    let bulletPos = position.clone();
    const vel = velocity.clone();
    const bulletRadius = 42;
    let lifetime = 1.0;

    return {
        update(dt) {
            bulletPos = bulletPos.add(vel);
            lifetime -= dt*2.0;
        },
        render(context) {
            drawCircle(context, bulletPos, bulletRadius);
        },
        getLifetime() {
            return lifetime;
        },
        setLifetime(val) {
            lifetime = val;
        },
        getPos() {
            return bulletPos;
        },
        getRadi() {
            return bulletRadius;
        }
    }
}

const CreateEnemy = function(position) {
    let enempyPos = position.clone();
    const enemyRadius = 69;
    const enemySpeed = 1;
    let ded = false;
    return {
        update(dt, playerPos) {
            let vel = playerPos.sub(enempyPos)
                            .scale(enemySpeed * dt);
            enempyPos = enempyPos.add(vel);
        },
        render(context) {
            drawCircle(context, enempyPos, enemyRadius);
        },
        getKilled() {
            return ded;
        },
        setKilled() {
            ded = true;
        },
        getPos() {
            return enempyPos;
        },
        getRadi() {
            return enemyRadius;
        }
    }
}

const CreateGame = function (name) {
    console.log(`Game "${name}" initialized.`);
    const title = GameTitle(name);
    const playerSpeed = 1000;
    const bulletSpeed = 100;
    let enemySpawnRate = 1.0;
    let enemySpawnCoolDown = enemySpawnRate;
    let alpha = 1;
    const radius = 69;
    let pressedKeys = new Set();

    let playerPos = new V2(0, 0);
    let bullets = [];
    let enemies = [];

    function movePlayer(dt) {
        let vel = new V2(0, 0);
        for (let key of pressedKeys) {
            if (key in keyState) {
                vel = vel.add(keyState[key].direction);
            }
        }
        if (vel.len() > 0) {
            vel = vel.normalize().scale(dt * playerSpeed);
            playerPos = playerPos.add(vel);
        }
    }

    function shootBullets(dt) {
        for (let bullet of bullets) {
            bullet.update(dt);
        }
    }

    function spawnEnemy(dt) {
        enemySpawnCoolDown -= dt;
        if (enemies.length >= 0) {
            let dir = Math.random() * 2 * Math.PI;
            let playerRefPos = playerPos.clone();
            let spawnDis = 2000;
            let polarPos = playerRefPos.add(playerRefPos.polar(spawnDis, dir));
            if (enemySpawnCoolDown <= 0.0) {
                enemies.push(CreateEnemy(polarPos));
                enemySpawnCoolDown = enemySpawnRate;
                enemySpawnRate = Math.max(0.01, enemySpawnCoolDown - 0.01);
            }
            //console.log(`enemies.length: ${enemies.length}`);
            //console.log(`enemySpawnCoolDown: ${enemySpawnCoolDown}`);
        }
        for (let enemy of enemies) {
            enemy.update(dt, playerPos);
        }
    }

    function killedEnemy() {
        for (let enemy of enemies) {
            for (let bullet of bullets) {
                if (!enemy.getKilled() && enemy.getPos().sub(bullet.getPos()).len()
                                        <= enemy.getRadi() + bullet.getRadi()) 
                {
                    enemy.setKilled(true);
                    bullet.setLifetime(0);
                }
            }
        }
    }

    function filterDeadEnemies(enemies) {
        let aliveEnemies = [];
        for (let enemy of enemies) {
            if (!enemy.getKilled()) {
                aliveEnemies.push(enemy);
            }
        }
        return aliveEnemies;
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
            spawnEnemy(dt);
            killedEnemy();
            enemies = filterDeadEnemies(enemies);
        },
        render(context) {
            const width = context.canvas.width;
            const height = context.canvas.height;
            context.clearRect(0, 0, width, height);

            title.render(context);
            drawCircle(context, playerPos, radius);
            for (let bullet of bullets) {
                if (bullet.getLifetime() > 0.0) {
                    bullet.render(context);
                }
            }

            for (let enemy of enemies) {
                enemy.render(context);
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
            const mousePos = new V2(event.offsetX, event.offsetY);
            const bulletVel = mousePos
                                .sub(playerPos)
                                .normalize()
                                .scale(bulletSpeed);
            bullets.push(CreateBullet(playerPos, bulletVel));
        },
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
