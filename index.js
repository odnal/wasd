const GreateGame = function (name) {
    const canvas = document.getElementById("game");
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let game = { canvas, context };

    console.log(`Game "${name}" initialized.`);
    console.log(game);

    let radius = 69;
    function drawCircle(context, x, y, radius) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.stroke();
    }

    return {
        init() {
            console.log(`game.canvas.width:  ${game.canvas.width}`);
            console.log(`game.canvas.height: ${game.canvas.height}`);

            game.context.font = "48px Iosevka"; // TODO: include font tff in the directory itself to auto host it.
            game.context.textAlign = "center";
            console.log(game.context.font);
            game.context.fillText("WASD", game.canvas.width/2, game.canvas.height/2); // TODO: center WASD within circle.
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
