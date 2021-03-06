// Create our 'main' state that will contain the game
var mainState = {
    canvasWidth: 800,
    canvasHeight: 600,

    landerStartX: 350,
    landerStartY: 100,

    lunarGravity: 100,
    thrustUpAmount: 10,
    thrustSidewaysAmount: 5,
    maxLandingVelocity: 100,

    preload: function() {
        game.load.image('lander', 'assets/lander.png'); 
    },

    create: function() {
        game.input.keyboard.onDownCallback = function(e) {};

        // Change the background color of the game to blue
        game.stage.backgroundColor = '#000000';

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Initialize the lander
        this.initializeLander();

        // Call the 'thrustUp' function when the spacekey is hit
        this.cursors = game.input.keyboard.createCursorKeys();

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "Invoices delivered: " + this.score, 
            { font: "30px Arial", fill: "#ffffff" });

        this.gas = 10000;
        this.labelGas = game.add.text(20, 50, "Natural gas left: " + this.gasRemaining(), 
            { font: "30px Arial", fill: "#ffffff" });

        this.labelUnsafeSpeed = game.add.text(0, 0, "", 
            { font: "bold 30px Arial", fill: "#ff0000", boundsAlignH: "right" });

        this.labelGameOver = game.add.text(0, 0, "",
            { font: "bold 30px Arial", fill: "#ff0000", boundsAlignH: "center" });

        this.labelGameOverReason = game.add.text(0, 0, "",
            { font: "bold 30px Arial", fill: "#ff0000", boundsAlignH: "center" });

        this.labelInvoiceDelivered = game.add.text(0, 0, "",
            { font: "bold 30px Arial", fill: "#ff0000", boundsAlignH: "center" });

        this.labelUnsafeSpeed.setTextBounds(0, 20, this.canvasWidth, 70);
        this.labelGameOver.setTextBounds(0, 275, this.canvasWidth, 325);
        this.labelGameOverReason.setTextBounds(0, 325, this.canvasWidth, 375);
        this.labelInvoiceDelivered.setTextBounds(0, 275, this.canvasWidth, 325);

        this.resetTerrain();
    },

    update: function() {
        if (this.lander.body.velocity.y > this.maxLandingVelocity)
        {
            this.setUnsafeLandingSpeed();
        }
        else
        {
            this.clearUnsafeLandingSpeed();
        }

        if (detectOutOfBounds(this.lander, this.canvasWidth, this.canvasHeight) == true)
        {
            this.gameOver("Left the area");
            return;
        }

        if (detectCollision(this.lander, this.terrain) == true)
        {
            if (detectSuccessfulLanding(this.lander, this.platform, this.maxLandingVelocity) == true)
            {
                // console.log("Successful landing");

                this.labelInvoiceDelivered.text = "Invoice delivered!";
                this.game.time.events.add(Phaser.Timer.SECOND * 2, this.clearStatus, this);

                if (this.platform.landed == false)
                {
                    this.increaseScore(1);
                }

                this.platform.landed = true;
            }
            else
            {
                this.gameOver("Crashed");
                return;
            }

            this.lander.body.velocity.y = 0;
            this.lander.y = this.platform.coordinates.y1 - this.lander.height - 1;
        }

        if (this.gas <= 0)
        {
            this.gameOver("Out of gas");
            return;
        }

        this.labelGas.text = "Natural gas left: " + this.gasRemaining();

        this.move();
    },

    initializeLander: function() {
        if (this.lander != null)
        {
            this.lander.destroy();
        }

        // Display the lander at a given position
        this.lander = game.add.sprite(this.landerStartX, this.landerStartY, 'lander');

        // Add physics to the lander
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.lander);

        // Add gravity to the lander to make it fall
        this.lander.body.gravity.y = this.lunarGravity;
    },

    gameOver: function(reason)
    {
        this.labelInvoiceDelivered.text = "";
        this.labelGameOver.text = "Gainesville, we have a problem.";
        this.labelGameOverReason.text = "(" + reason + ")";
        this.lander.body.velocity.y = 0;
        this.lander.body.velocity.x = 0;
        this.game.input.keyboard.onDownCallback = function(e) { this.game.paused = false; this.game.state.start('main'); };
        this.game.paused = true;
    },

    clearStatus: function()
    {
        this.labelInvoiceDelivered.text = "";
    },

    gasRemaining: function()
    {
        return Math.round(this.gas / 100);
    },

    move: function()
    {
        if (this.cursors.up.isDown == true)
        {
            this.thrustUp();
        }

        if (this.cursors.left.isDown == true)
        {
            this.thrustLeft();
        }

        if (this.cursors.right.isDown == true)
        {
            this.thrustRight();
        }
    },

    resetTerrain: function() {
        var lineHeight = 2;

        if (this.terrain != null)
        {
            for (i = 0; i < this.terrain.length; i++)
            {
                drawLine(game, this.terrain[i].x1, this.terrain[i].y1, this.terrain[i].x2, this.terrain[i].y2, lineHeight, 0x000000);
            }
        }

        this.terrain = new Array();

        var platformCoordinates = getPlatformCoordinates(this.canvasWidth, this.canvasHeight, 20, 100, 1);
        var platformStructure = {};
        platformStructure.landed = false;
        platformStructure.coordinates = platformCoordinates[0];
        this.terrain.push(platformCoordinates[0]);
        this.platform = platformStructure;

        var x1, y1, x2, y2;

        x1 = 0;
        y1 = Math.floor(Math.random() * this.canvasHeight) + 0;
        x2 = this.platform.coordinates.x1;
        y2 = this.platform.coordinates.y1;

        this.terrain.push({"x1": x1, "y1": y1, "x2": x2, "y2": y2});

        x1 = this.platform.coordinates.x2;
        y1 = this.platform.coordinates.y2;
        x2 = this.canvasWidth;
        y2 = Math.floor(Math.random() * this.canvasHeight) + 0;

        this.terrain.push({"x1": x1, "y1": y1, "x2": x2, "y2": y2});

        for (i = 0; i < this.terrain.length; i++)
        {
            var lineColor =  0xffffff;

            if (i == 0)
            {
                lineColor = 0xffff00;
            }

            drawLine(game, this.terrain[i].x1, this.terrain[i].y1, this.terrain[i].x2, this.terrain[i].y2, lineHeight, lineColor);
        }
    },

    // Increase the score
    increaseScore: function(increaseAmount) {
        this.score += increaseAmount;
        this.labelScore.text = "Invoices delivered: " + this.score;  
    },

    // Make the lander thrust up
    thrustUp: function() {
        if (this.platform.landed == true)
        {
            this.initializeLander();
            this.resetTerrain();
        }

        // Add a vertical velocity to the lander
        this.lander.body.velocity.y += this.thrustUpAmount * -1;

        this.gas = this.gas - this.thrustUpAmount;
    },

    // Make the lander thrust left
    thrustLeft: function() {
        // Add a vertical velocity to the lander
        this.lander.body.velocity.x += this.thrustSidewaysAmount * -1;

        this.gas = this.gas - this.thrustSidewaysAmount;
    },

    // Make the lander thrust right
    thrustRight: function() {
        // Add a vertical velocity to the lander
        this.lander.body.velocity.x += this.thrustSidewaysAmount;

        this.gas = this.gas - this.thrustSidewaysAmount;
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    // Set unsafe landing speed indicator
    setUnsafeLandingSpeed: function() {
        this.labelUnsafeSpeed.text = "UNSAFE LANDING SPEED ";
    },

    // Set unsafe landing speed indicator
    clearUnsafeLandingSpeed: function() {
        this.labelUnsafeSpeed.text = "";
    }
};

// Initialize Phaser and create a game
var game = new Phaser.Game(mainState.canvasWidth, mainState.canvasHeight);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

// Start the state to actually start the game
game.state.start('main');