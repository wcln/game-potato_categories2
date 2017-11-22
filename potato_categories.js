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

var IMAGE_WIDTH = 150;
var IMAGE_HEIGHT = 210;

var CATEGORY_IMAGE_WIDTH = 195;
var CATEGORY_IMAGE_HEIGHT = 108;

var STAGE_WIDTH, STAGE_HEIGHT;

var questionCounter;
var score;

var potatoIndex;

var selectedCategory = -1;

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

		// note: selected category logic is required so that both categories can not be selected at the same time (since image will overlap both)
		if (selectedCategory !== -1) {
			if (ndgmr.checkRectCollision(categories[selectedCategory], questions[questionCounter]) == null) {
				selectedCategory = -1;
			}
		} else {
			for (var i = 0; i < categories.length; i++) {
				let cat = categories[i];

				if (ndgmr.checkRectCollision(cat, questions[questionCounter]) != null) {
					cat.scaleX = (CATEGORY_IMAGE_WIDTH / cat.image.width) * 1.2;
					cat.scaleY = (CATEGORY_IMAGE_HEIGHT / cat.image.height) * 1.2;
					//cat.alpha = 0.5;
					questions[questionCounter].alpha = 0.5;
					selectedCategory = i;

					i = categories.length;

					// reset alpha of other categories (fixes but when moving from right to left)
					for (var j = 0; j < categories.length; j++) {
						if (selectedCategory !== j) {
							categories[j].scaleX = CATEGORY_IMAGE_WIDTH / categories[j].image.width;
							categories[j].scaleY = CATEGORY_IMAGE_HEIGHT / categories[j].image.height;
							categories[j].alpha = 1.0;
						}
					}
				} else {
					cat.scaleX = CATEGORY_IMAGE_WIDTH / cat.image.width;
					cat.scaleY = CATEGORY_IMAGE_HEIGHT / cat.image.height;
					//cat.alpha = 1.0;
					questions[questionCounter].alpha = 1.0;
				}
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

	// reset scale and alpha of category images so they dont get "stuck"
	for (var cat of categories) {
		cat.scaleX = CATEGORY_IMAGE_WIDTH / cat.image.width;
		cat.scaleY = CATEGORY_IMAGE_HEIGHT / cat.image.height;
		cat.alpha = 1;
	}

	var scoreText = new createjs.Text("Score: " + score + "/" + questions.length, "40px Sans", "black");
	scoreText.x = STAGE_WIDTH/2 - scoreText.getMeasuredWidth()/2;
	scoreText.y = STAGE_HEIGHT/2 - 40;

	createjs.Tween.get(scoreText).wait(1000).call(function() {
		stage.addChild(endScreen);
		stage.addChild(scoreText);
		stage.on("stagemousedown", function() {
			location.reload();
		})
	});
}

function initGraphics() {

	initMuteUnMuteButtons();

	// animation stuff
	checkMark.regX = checkMark.image.width/2;
	checkMark.regY = checkMark.image.height/2;
	xMark.regX = xMark.image.width/2;
	xMark.regY = xMark.image.height/2;
	checkMark.x = STAGE_WIDTH/2;
	checkMark.y = STAGE_HEIGHT/2;
	xMark.x = STAGE_WIDTH/2;
	xMark.y = STAGE_HEIGHT/2;

	// potato stuff
	potatoIndex = potatoParts.length/2 - 1;
	// init potato
	updatePotato();

	// render the 2 categories to the screen
	categories[0].scaleX = CATEGORY_IMAGE_WIDTH / categories[0].image.width;
	categories[1].scaleX = CATEGORY_IMAGE_WIDTH / categories[1].image.width;
	categories[0].scaleY = CATEGORY_IMAGE_HEIGHT / categories[0].image.height;
	categories[1].scaleY = CATEGORY_IMAGE_HEIGHT / categories[1].image.height;
	categories[0].regX = categories[0].getBounds().width/2;
	categories[1].regX = categories[1].getBounds().width/2;
	categories[0].regY = categories[0].getBounds().height/2;
	categories[1].regY = categories[1].getBounds().height/2;
	categories[0].x = STAGE_WIDTH/4 + 5;
	categories[1].x = STAGE_WIDTH/4 * 3 - 5;
	categories[0].y = STAGE_HEIGHT - categories[0].image.height * categories[0].scaleY + 35;
	categories[1].y = STAGE_HEIGHT - categories[1].image.height * categories[1].scaleY + 35;
	stage.addChild(categories[0]);
	stage.addChild(categories[1]);

	renderQuestion(0); // render the first question


	gameStarted = true;
}

/*
 * Adds the mute and unmute buttons to the stage and defines listeners
 */
function initMuteUnMuteButtons() {
	var hitArea = new createjs.Shape();
	hitArea.graphics.beginFill("#000").drawRect(0, 0, muteButton.image.width, muteButton.image.height);
	muteButton.hitArea = unmuteButton.hitArea = hitArea;

	muteButton.x = unmuteButton.x = STAGE_WIDTH - muteButton.image.width - 5;
	muteButton.y = unmuteButton.y = 145;

	muteButton.cursor = "pointer";
	unmuteButton.cursor = "pointer";

	muteButton.on("click", toggleMute);
	unmuteButton.on("click", toggleMute);

	stage.addChild(muteButton);
}

function updatePotato() {

	// remove parts
	for (var part of potatoParts) {
		stage.removeChild(part);
	}
	stage.removeChild(potatoBody);

	// add correct number of parts
	for (var i = 0; i <= potatoIndex; i++) {
		if (i === 3) {
			stage.addChild(potatoBody);
		}
		stage.addChild(potatoParts[i]);
		if (i === potatoIndex && potatoIndex < 3) {
			stage.addChild(potatoBody);
		}
	}

	// make sure body is still rendered
	if (potatoIndex === -1) {
		stage.addChild(potatoBody);
	}
}

function renderQuestion(index) {
	questions[index].scaleX = IMAGE_WIDTH / questions[index].image.width;
	questions[index].scaleY = IMAGE_HEIGHT / questions[index].image.height;

	questions[index].regX = questions[index].image.width/2;
	questions[index].regY = questions[index].image.height/2;

	questions[index].x = STAGE_WIDTH/4 - 17;
	questions[index].y = STAGE_HEIGHT/2 - 57;

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
	var guess = selectedCategory + 1;

	if (guess !== 0) {
		playSound("click");
		if (parseInt(answers.charAt(questionCounter)) === guess) { // CORRECT

			score++;
			// add a part to potato
			potatoIndex++;
			updatePotato();
			correctAnimation();
		} else { 												// INCORRECT

			// remove a part from potato
			potatoIndex--;
			updatePotato();
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
	} else {
		event.target.x = STAGE_WIDTH/4 - 17;
		event.target.y = STAGE_HEIGHT/2 - 57;
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
var potatoParts = [];
var potatoBody;

var muteButton, unmuteButton;

var PATH_TO_SUB_FOLDER = "versions/" + SUB_FOLDER + "/";

function setupManifest() {
	manifest = [
		{
			src: "sounds/click.mp3",
			id: "click"
		},
		{
			src: PATH_TO_SUB_FOLDER + "category1.png",
			id: "category1"
		},
		{
			src: PATH_TO_SUB_FOLDER + "category2.png",
			id: "category2"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question1.png",
			id: "question1"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question2.png",
			id: "question2"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question3.png",
			id: "question3"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question4.png",
			id: "question4"
		},
		{
			src: PATH_TO_SUB_FOLDER + "question5.png",
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
		},
		{
			src: "images/potato_parts/shoes.png",
			id: "potato0"
		},
		{
			src: "images/potato_parts/arms.png",
			id: "potato1"
		},
		{
			src: "images/potato_parts/ears.png",
			id: "potato2"
		},
		{
			src: "images/potato_parts/eyes.png",
			id: "potato3"
		},
		{
			src: "images/potato_parts/mouth.png",
			id: "potato4"
		},
		{
			src: "images/potato_parts/moustache.png",
			id: "potato5"
		},
		{
			src: "images/potato_parts/nose.png",
			id: "potato6"
		},
		{
			src: "images/potato_parts/glasses.png",
			id: "potato7"
		},
		{
			src: "images/potato_parts/tie.png",
			id: "potato8"
		},
		{
			src: "images/potato_parts/hat.png",
			id: "potato9"
		},
		{
			src: "images/potato_parts/potato.png",
			id: "body"
		},
		{
			src: "images/mute.png",
			id: "mute"
		},
		{
			src: "images/unmute.png",
			id: "unmute"
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
   	} else if (event.item.id.includes("potato")) {
   		var index = event.item.id[event.item.id.length - 1];
   		potatoParts.push(new createjs.Bitmap(event.result));
   	} else if (event.item.id == "body") {
   		potatoBody = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "mute") {
			muteButton = new createjs.Bitmap(event.result);
		} else if (event.item.id == "unmute") {
			unmuteButton = new createjs.Bitmap(event.result);
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
