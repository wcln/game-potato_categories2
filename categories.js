/**
 * BCLearningNetwork.com
 * Categories Quiz Game
 * @author Colin Bernard (colinjbernard@hotmail.com)
 * June 2017
 */


//// VARIABLES /////

var mute = false;
var FPS = 24;
var gameStarted;

var IMAGE_WIDTH = 200; 
var IMAGE_HEIGHT = 140;

var CATEGORY_IMAGE_WIDTH = 100;
var CATEGORY_IMAGE_HEIGHT = 70;

var STAGE_WIDTH, STAGE_HEIGHT;

var questionCounter;
var score;

/*
 * Called by body onload
 */
function init() {
	STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

	setupManifest(); // preloadJS
	startPreload();

	score = 0; // reset game score
	questionCounter = 0;
	stage.update();
}

function update(event) {
	if (gameStarted) {
		for (var cat of categories) {
			if (ndgmr.checkRectCollision(cat, questions[questionCounter]) != null) {
				cat.scaleX = (CATEGORY_IMAGE_WIDTH / cat.image.width) * 1.2;
				cat.scaleY = (CATEGORY_IMAGE_HEIGHT / cat.image.height) * 1.2;
				cat.alpha = 0.5;
				questions[questionCounter].alpha = 0.5;
				break;
			} else {
				cat.scaleX = CATEGORY_IMAGE_WIDTH / cat.image.width;
				cat.scaleY = CATEGORY_IMAGE_HEIGHT / cat.image.height;
				cat.alpha = 1.0;
				questions[questionCounter].alpha = 1.0;
			}
		}
	}

	stage.update(event);
}

/*
 * Displays the end game screen and score.
 */
function endGame() {
	gameStarted = false;

	var scoreText = new createjs.Text("Score: " + score + "/" + questions.length, "40px Sans", "black");
	scoreText.x = STAGE_WIDTH/2 - scoreText.getMeasuredWidth()/2;
	scoreText.y = STAGE_HEIGHT/2 - 20;

	createjs.Tween.get(scoreText).wait(1000).call(function() {
		stage.addChild(endScreen);
		stage.addChild(scoreText);
		stage.on("stagemousedown", function() {
			location.reload();
		})
	});
}

function initGraphics() {

	// animation stuff
	checkMark.regX = checkMark.image.width/2;
	checkMark.regY = checkMark.image.height/2;
	xMark.regX = xMark.image.width/2;
	xMark.regY = xMark.image.height/2;
	checkMark.x = STAGE_WIDTH/2;
	checkMark.y = STAGE_HEIGHT/2;
	xMark.x = STAGE_WIDTH/2;
	xMark.y = STAGE_HEIGHT/2;

	// render the 2 categories to the screen
	categories[0].scaleX = CATEGORY_IMAGE_WIDTH / categories[0].image.width;
	categories[1].scaleX = CATEGORY_IMAGE_WIDTH / categories[1].image.width;
	categories[0].scaleY = CATEGORY_IMAGE_HEIGHT / categories[0].image.height;
	categories[1].scaleY = CATEGORY_IMAGE_HEIGHT / categories[1].image.height;
	categories[0].regX = categories[0].getBounds().width/2;
	categories[1].regX = categories[1].getBounds().width/2;
	categories[0].regY = categories[0].getBounds().height/2;
	categories[1].regY = categories[1].getBounds().height/2;
	categories[0].x = STAGE_WIDTH/2 - categories[0].getBounds().width * categories[0].scaleX - 70;
	categories[1].x = STAGE_WIDTH/2 + categories[1].getBounds().width * categories[1].scaleX + 70;
	categories[0].y = STAGE_HEIGHT - categories[0].image.height * categories[0].scaleY + 20;
	categories[1].y = STAGE_HEIGHT - categories[1].image.height * categories[1].scaleY + 20;
	stage.addChild(categories[0]); 
	stage.addChild(categories[1]);

	renderQuestion(0); // render the first question

	gameStarted = true;
}

function renderQuestion(index) {
	questions[index].scaleX = IMAGE_WIDTH / questions[index].image.width;
	questions[index].scaleY = IMAGE_HEIGHT / questions[index].image.height;

	questions[index].regX = questions[index].image.width/2;
	questions[index].regY = questions[index].image.height/2;

	questions[index].x = STAGE_WIDTH/2;
	questions[index].y = STAGE_HEIGHT/2 - 50;

	questions[index].cursor = "pointer";

	// add listeners
	questions[index].on("pressmove", function(event) {
		imageClickHandler(event);
	});
	questions[index].on("click", function(event) {
		imageDropHandler(event);
	});
	questions[index].on("rollover", function(event) {
		this.scaleX = this.scaleX * 1.1;
		this.scaleY = this.scaleY * 1.1;
	});
	questions[index].on("rollout", function(event) {
		this.scaleX = IMAGE_WIDTH / this.image.width;
		this.scaleY = IMAGE_HEIGHT / this.image.height;
	});

	if (questionCounter === 0) {
		stage.addChild(questions[index]);
	} else {
		createjs.Tween.get(questions[index]).wait(1200).call(function() {
			stage.addChild(questions[index]);
		}); 
	}
}

function imageClickHandler(event) {
	event.target.x = event.stageX;
	event.target.y = event.stageY;
}

function imageDropHandler(event) {
	var guess = -1;
	if (ndgmr.checkRectCollision(categories[0], event.target) != null) {
		guess = 1;
	} else if (ndgmr.checkRectCollision(categories[1], event.target) != null) {
		guess = 2;
	} else {
		event.target.x = STAGE_WIDTH/2;
		event.target.y = STAGE_HEIGHT/2 - 50;
		return;
	}

	if (guess !== -1) {
		playSound("click");
		if (parseInt(answers.charAt(questionCounter)) === guess) {
			correctAnimation();
			score++;
		} else {
			wrongAnimation();
		}

		// move to next question
		stage.removeChild(event.target);
		questionCounter++;

		// check for end of game
		if (questionCounter === questions.length) {
			endGame();
		} else {
			renderQuestion(questionCounter);
		}
	}
}

function wrongAnimation() {
	xMark.alpha = 0;
	stage.addChild(xMark);
	createjs.Tween.get(xMark).to({alpha:1}, 200).to({alpha:0}, 1000).call(function(){stage.removeChild(xMark)});
}

function correctAnimation() {
	checkMark.alpha = 0;
	stage.addChild(checkMark);
	createjs.Tween.get(checkMark).to({alpha:1}, 200).to({alpha:0}, 1000).call(function(){stage.removeChild(checkMark)});
}



////////////////////////////////////////////////// PRE LOAD JS FUNCTIONS

// bitmap variables
var questions = [];
var categories = [];
var background, endscreen;
var checkMark, xMark;

var PATH_TO_SUB_FOLDER = "images/question_images/" + SUB_FOLDER + "/";

function setupManifest() {
	manifest = [
		{
			src: "sounds/click.mp3",
			id: "click"
		},
		{
			src: PATH_TO_SUB_FOLDER + "category1.jpg",
			id: "category1"
		},
		{
			src: PATH_TO_SUB_FOLDER + "category2.jpg",
			id: "category2"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question1.jpg",
			id: "question1"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question2.jpg",
			id: "question2"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question3.jpg",
			id: "question3"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question4.jpg",
			id: "question4"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question5.jpg",
			id: "question5"
		},
		{
			src: "images/checkmark.png",
			id: "checkmark"
		},
		{
			src: "images/xmark.png",
			id: "xmark"
		},
		{
			src: "images/background.png",
			id: "background"
		},
		{
			src: "images/endscreen.png",
			id: "endscreen"
		}
	];
}

function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);          
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
	console.log("A file has loaded of type: " + event.item.type);
    // create bitmaps of images
   	if (event.item.id.includes("category")) {
   		categories.push(new createjs.Bitmap(event.result));
   	} else if (event.item.id.includes("question")) {
   		questions.push(new createjs.Bitmap(event.result));
   	} else if (event.item.id == "checkmark") {
   		checkMark = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "xmark") {
   		xMark = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "background") {
   		background = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "endscreen") {
   		endScreen = new createjs.Bitmap(event.result);
   	}
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {
    /*progressText.text = (preload.progress*100|0) + " % Loaded";
    progressText.x = STAGE_WIDTH/2 - progressText.getMeasuredWidth() / 2;
    stage.update();*/
}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
    console.log("Finished Loading Assets");

    // ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", update); // call update function


	stage.addChild(background);
    stage.update();
    initGraphics();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS