function getPlatformCoordinates(canvasWidth, canvasHeight, platformWidth, maxYCoordinateValue, numberOfPlatforms)
{
    // Randomize platform positions while taking maxYCoordinateValue into account
    // Also make sure that no platforms are "above" each other -- each should occupy its own "column"
    // Take numberOfPlatforms argument into account?

    var platforms = new Array();

    var width = 100;
    var paddingY = 250;
    
    while (platforms.length < numberOfPlatforms)
    {
        var x1 = Math.floor(Math.random() * (canvasWidth - width));
        var y1 = Math.floor((Math.random() * (canvasHeight - paddingY)) + paddingY);
        
        var x2 = x1 + width;
        
        var overlap = false;
        
        // check to ensure that this platform is not above or below any existing platform
        for (p = 0; p < platforms.length; p++)
        {
            if ((platforms[p].x1 < x1 && x1 < platforms[p].x2) 
                || (platforms[p].x1 < x2 && x2 < platforms[p].x2))
            {
                overlap = true;
                break;
            }
        }
        
        if (overlap)
            continue;
        
        var platform = {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y1};
        platforms.push(platform);
    }

    return platforms;
}

function drawLine(game, x1, y1, x2, y2, lineHeight, color)
{
    var line = game.add.graphics(0, 0);
    line.lineStyle(lineHeight, color, 1);
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
}

function detectSuccessfulLanding(lander, platform, maxVelocity)
{
    var landerX1 = Math.round(lander.x);
    var landerY1 = Math.round(lander.y);
    var landerX2 = Math.round(lander.x + lander.width);
    var landerY2 = Math.round(lander.y + lander.height);

    var platformX1 = Math.round(platform.coordinates.x1);
    var platformY1 = Math.round(platform.coordinates.y1);
    var platformX2 = Math.round(platform.coordinates.x2);
    var platformY2 = Math.round(platform.coordinates.y2);

    var landerUL = "(" + landerX1 + ", " + landerY1 + ")";
    var landerLR = "(" + landerX2 + ", " + landerY2 + ")";
    var platformUL = "(" + platformX1 + ", " + platformY1 + ")";
    var platformLR = "(" + platformX2 + ", " + platformY2 + ")";

    if (lander.body.velocity.y <= maxVelocity && landerY2 == platformY1 && landerX1 >= platformX1 && landerX2 <= platformX2)
    {
        // console.log("Successful landing");
        return true;
    }

    // console.log("Failed landing: [Velocity: " + Math.round(lander.body.velocity.y) + " (max: " + maxVelocity + ")] [Lander: " + landerUL + ", " + landerLR + "] vs [Platform: " + platformUL + ", " + platformLR + "]");
    return false;
}

function detectCollision(lander, platform)
{
    var landerX1 = Math.round(lander.x);
    var landerY1 = Math.round(lander.y);
    var landerX2 = Math.round(lander.x + lander.width);
    var landerY2 = Math.round(lander.y + lander.height);

    var platformX1 = Math.round(platform.coordinates.x1);
    var platformY1 = Math.round(platform.coordinates.y1);
    var platformX2 = Math.round(platform.coordinates.x2);
    var platformY2 = Math.round(platform.coordinates.y2);

    var landerUL = "(" + landerX1 + ", " + landerY1 + ")";
    var landerLR = "(" + landerX2 + ", " + landerY2 + ")";
    var platformUL = "(" + platformX1 + ", " + platformY1 + ")";
    var platformLR = "(" + platformX2 + ", " + platformY2 + ")";

    // console.log("detectCollision: [Lander: " + landerUL + ", " + landerLR + "] vs [Platform: " + platformUL + ", " + platformLR + "]");

    var collision = false;

    // 1. Check rectangle top
    if (lineIntersect(platformX1, platformY1, platformX2, platformY2, landerX1, landerY1, landerX2, landerY1)) collision = true;

    // 2. Check rectangle bottom
    if (lineIntersect(platformX1, platformY1, platformX2, platformY2, landerX1, landerY2, landerX2, landerY2 - 1)) collision = true;

    // 3. Check rectangle left side
    if (lineIntersect(platformX1, platformY1, platformX2, platformY2, landerX1, landerY1, landerX1, landerY2)) collision = true;

    // 4. Check rectangle right side
    if (lineIntersect(platformX1, platformY1, platformX2, platformY2, landerX2, landerY1, landerX2, landerY2)) collision = true;

    if (collision == true)
    {
        // console.log("Collision");
        return true;
    }

    return false;
}

function detectOutOfBounds(lander, canvasWidth, canvasHeight)
{
    if (lander.x < 0 || lander.x + lander.width > canvasWidth || lander.y < 0 || lander.y + lander.height > canvasHeight)
    {
        return true;
    }

    return false;
}

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}