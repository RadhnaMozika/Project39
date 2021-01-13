var player, playerAnimation;
var ground, groundImg, ground2;

var walkingBot, spinningImages, triangeImages;
var flyingBot, roundImages, squareImages;
var laser, laserImg;
var walkingBotsGroup, flyingBotsGroup, lasersGroup;

var immunity, immunityObj, immunityObjImg,  immunityTimer, immunityRecImg;
var higher, higherObj, higherImg, higherTimer, jumpLimit;
var immunityGroup, higherGroup;

var PLAY = 1, END = 0, START = 2;
var gameState = 2;

var bgEnd, imgStart;

var score = 0;


function preload(){
    //loading the images and animation for the game

    playerAnimation = loadAnimation("images/player_1.png", "images/player_2.png", "images/player_3.png", 
    "images/player_4.png", "images/player_5.png","images/player_6.png", "images/player_7.png", 
    "images/player_8.png", "images/player_9.png", "images/player_10.png");
    
    groundImg = loadImage("images/ground.png");

    //walking robot animations
    spinningImages = loadAnimation("images/spinningBot_01.png", "images/spinningBot_02.png", "images/spinningBot_03.png", 
    "images/spinningBot_04.png", "images/spinningBot_05.png", "images/spinningBot_06.png", "images/spinningBot_07.png",
    "images/spinningBot_08.png");
    triangleImages = loadAnimation("images/triangleBot_01.png", "images/triangleBot_02.png", "images/triangleBot_03.png");

    //flying robot animations
    roundImages = loadAnimation("images/roundBot1.png", "images/roundBot2.png");
    squareImages = loadAnimation("images/squareBot_01.png", "images/squareBot_02.png", "images/squareBot_03.png", "images/squareBot_04.png");

    //laser images
    laserImage = loadImage("images/laser.png");

    //power up images
    immunityObjImg = loadImage("images/immunityBottle.png"); 
    immunityRecImg = loadImage("images/shield.png");
    higherImg = loadImage("images/up.png");

    bgEnd = loadImage("images/bg.png");
    imgStart = loadImage("images/bg2.jpg");
}


function setup(){
    createCanvas(1100, 400);

    //creating the grounds
    ground = createSprite(width/2, height-55, width, 10);

    ground2 = createSprite(width, height-150, width+width, 20);
    ground2.addImage(groundImg);
    ground2.scale = 1.2;
    
    //creating player
    playerAnimation.frameDelay = 1;
    player = createSprite(350, 300, 30, 30);
    player.addAnimation("running", playerAnimation);
    player.scale = 0.3 ;

    
    //creating groups
    walkingBotsGroup = new Group();
    flyingBotsGroup = new Group();
    lasersGroup = new Group();

    immunityGroup = new Group();
    higherGroup = new Group();

    //setting value
    score = 0;
    immunityTimer = 0;
    higherTimer = 0;
}


function draw(){

    //gameState "Start" instructions :
    if(gameState === 2){
        background(0);

        image(imgStart, 600, 20, 550, 350);
        
        textSize(40);
        fill("#A0D83E");
        textFont("Garamond");
        text("PRESS SPACE TO START!", 320, 200);
    }

    //making gameState change when space key is pressed
    if(keyDown("space") && gameState === 2){
        gameState = 1;
    }

    if(gameState === 1){
        background("#204631");

        player.collide(ground);
        player.x = ground.x;    

        //setting game camera position as player's position
        camera.position.y = player.y - 70;  
        camera.position.x = player.x;

        //increasing score
        score = score + Math.round(getFrameRate() / 60);

        //adding game adaptivity
        ground2.velocityX = -(12 + 10 * score / 800);
        walkingBotsGroup.setVelocityXEach(ground2.velocityX);
        flyingBotsGroup.setVelocityXEach(ground2.velocityX+2)

       //resetting background
       if(ground2.x<0)
            ground2.x = width;;

        // player can only jump when below the jump limit;
        jumpLimit = 100;
        if(keyDown("space") && player.y>jumpLimit){
            player.velocityY = -14;
        }

        //adding gravity
        player.velocityY = player.velocityY + 2;

        //spawning obstacle robots and power ups
        spawnWalkingBots();
        spawnFlyingBots();
        powerUp();

        drawSprites();

        //displaying score
        textSize(20);
        fill("#A0D83E")
        textFont("Garamond");
        text("SCORE = "+score, width-150, camera.y-height/2+25);

        //making immunity true if player touches it
        if(player.isTouching(immunityGroup)){
            immunity = true;
            immunityGroup.destroyEach();
            immunityTimer = 1000;
        }

        //decreasing immunity timer and displaying image
        if(immunityTimer !== 0){
            immunityTimer--;
            image(immunityRecImg, 5, camera.y-height/2+5, 30, 30);
            text(" = "+Math.round(immunityTimer/100), 40, camera.y-height/2+25)
        }

        //making immunity false if timer is 0
        if(immunityTimer < 1)
            immunity = false;
        
        //making higher power up true if player touches it;
        if(player.isTouching(higherGroup)){
            higher = true;
            higherGroup.destroyEach();
            higherTimer = 1000;
        }

        //descreasing the timer and displaying image;
        if(higherTimer !== 0){
            higherTimer--;
            image(higherImg, 5, camera.y-height/2+5, 30, 30);
            text(" = "+Math.round(higherTimer/100), 40, camera.y-height/2+25);
            jumpLimit = -75;
            if(keyDown("space") && player.y>jumpLimit){
                player.velocityY = -14;
            }
        } 

        //making higher false if timer is up
        if(higherTimer < 1){
            jumplimit = 50;
            higher = false;
            if(keyDown("space") && player.y>jumpLimit){
                player.velocityY = -14;
            }
        }

        //shooting the laser if player touches any robots
        if(player.isTouching(walkingBotsGroup) || player.isTouching(flyingBotsGroup)){
            shootLaser(player.y);
            walkingBotsGroup.setVelocityYEach(-15);
            //walkingBotsGroup.setVelocityYEach(walkingBotsGroup.setVelocityYEach(-5)+1);
            flyingBotsGroup.setVelocityYEach(-5);

        }
            
    }

    //game if over is laser touches player
    if(player.isTouching(lasersGroup) && immunity === false){
        gameState = 0;
    }
    else if(player.isTouching(lasersGroup) && immunity === true){
    }
       
    if(gameState === 0){

        //destroying all game obstacles and setting lifetime of new ones to 1
        walkingBotsGroup.destroyEach();
        flyingBotsGroup.destroyEach();
        lasersGroup.destroyEach();
        
        flyingBotsGroup.setLifetimeEach(1);
        walkingBotsGroup.setLifetimeEach(1);

        background(bgEnd);

        //text
        fill("#A0D83E")
        textFont("Garamond");
        textSize(65)
        text("GAME OVER!", 345, 200);
        textSize(18)
        text("RELOAD TO PLAY AGAIN   |   ", 370, 350);
        text("SCORE = "+score, 620, 350);
        camera.position.y = height/2;
    }
}


function spawnWalkingBots(){
    //creating new robots if frame count is divisible by 90
    if(frameCount % 90 === 0){
        walkingBot = createSprite(width+20, height-95, 50, 70);
        walkingBot.collide(ground);
        walkingBot.velocityX = ground2.velocityX;
        walkingBot.lifetime = 200;
       
        //setting image according to random number
        var rand = Math.round(random(1,2));
        if(rand === 1){
            walkingBot.addAnimation("rolling", triangleImages);
            walkingBot.scale = 0.32;
            walkingBot.setCollider("rectangle", 0, 0, 100, 100);
        }
        else if(rand === 2){
            walkingBot.addAnimation("turning_head", spinningImages);
            walkingBot.scale = 0.45;
            walkingBot.y = height-125;
            walkingBot.setCollider("rectangle", 0, 0, 100, 100);
        }

        //adding all robots to group
        walkingBotsGroup.add(walkingBot);
    }
}


function spawnFlyingBots(){
    //creating new robots if frame count is divisible by 120
    if(frameCount % 120 === 0){
        flyingBot = createSprite(width+20, 50, 50, 70);
        flyingBot.velocityX = ground2.velocityX + 2;
        flyingBot.lifetime = 100;

        //setting img according to random number
        var rand2 = Math.round(random(1,2));
        if(rand2 === 1){
            flyingBot.addAnimation("round", roundImages);
            flyingBot.scale = 0.25;
            flyingBot.setCollider("rectangle", 0, 0, 100, 100);
        }
        else if(rand2 === 2){
            flyingBot.addAnimation("square", squareImages);
            
            flyingBot.scale = 0.6;
            flyingBot.setCollider("rectangle", 0, 0, 100, 100);
        }

        //setting y position according to random number
        flyingBot.y = Math.round(random(0, 100));

        flyingBotsGroup.add(flyingBot);
    }
}

//function takes a "pos" value to shoot the laser around
function shootLaser(pos){
    laser = createSprite(width+60, player.y, 15, 5);
    laser.velocityX = -20;
    laser.lifetime = 60;

    laser.addImage("red", laserImage);
    laser.scale = 0.1;
    laser.setCollider("rectangle", 0, 0, 20, 20);
      
    //laser beams are shot randomly 5 pixels above and below the given position
    laser.y = Math.round(random(pos-5, pos+5));
    lasersGroup.add(laser);
}

function powerUp(){
    if(frameCount % 1020 === 0){
        var randomNumber = Math.round(random(1, 2));
        if(randomNumber === 1){
            immunityObj = createSprite(width-10, 200, 25, 20);
            immunityObj.velocityX = -14;
            immunityObj.lifetime = 210;

            immunityObj.addImage(immunityObjImg);
            immunityObj.scale = 0.6;

            immunityGroup.add(immunityObj);           
        }
    
        else if(randomNumber === 2){
            higherObj = createSprite(width-10, 200, 25, 20);
            higherObj.velocityX = -14;
            higherObj.lifetime = 210;

            higherObj.addImage(higherImg);
            higherObj.scale = 0.2;

            higherGroup.add(higherObj);   
        }

    }
}


