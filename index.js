const GreateGame = function (name) {
    const canvas = document.getElementById("game");
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = { canvas, context };

    console.log(`Game "${name}" initialized.`);
    console.log(game);

    const radius = 69;
    const centerX = game.canvas.width/2;
    const centerY = game.canvas.height/2;

    function drawCircle(context, x, y, radius) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.lineWidth = 3;
        context.strokeStyle = `rgba(255, 255, 255, 0.8)`;
        context.stroke();
    }

    return {
        init() {
            console.log(`game.canvas.width:  ${game.canvas.width}`);
            console.log(`game.canvas.height: ${game.canvas.height}`);

            game.context.fillStyle = `rgba(255, 255, 255, 0.8)`;
            game.context.font = "48px Iosevka-Bold";
            game.context.textAlign = "center";
            game.context.textBaseline = "middle";
            game.context.fillText(name, centerX, centerY);
        },
        update() {
            let x = game.canvas.width / 2;
            let y = game.canvas.height / 2;
            drawCircle(game.context, x, y, radius);
        },
    };
};


// IIFE - "Immediately Invoked Function Expression"
(() => {
    // Create Game Context: DOM context and canvas width/height
    let game = GreateGame("WASF");
    game.init();
    game.update();

    // TODO: game loop

})();
