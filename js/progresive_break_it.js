
const WALL_THICKNESS = 20;
const PADDLE_WIDTH = 100;
const PADDLE_SPEED = 16;
const PUCK_SPEED = 5;
const PADDLE_HITS_FOR_NEW_LEVEL = 5;
const SCORE_BOARD_HEIGHT = 50;
const ARROW_KEY_LEFT = 37;
const ARROW_KEY_RIGHT = 39;
const SPACE_KEY = 32;

var canvas, stage, paddle, puck, board, scoreTxt, livesTxt, messageTxt, messageInterval;
var leftWall, rightWall, ceiling, floor;
var leftKeyDown = false; 
var rightKeyDown = false;
var bricks = []; 
var paddleHits = 0; var 
combo = 0;

var levels = [ {color:'#705000', points:1}, {color:'#743fab', points:2}, {color:'#4f5e04', points:3}, {color:'#1b5b97', points:4}, {color:'#c6c43b', points:5}, {color:'#1a6d68', points:6}, {color:'#aa7223', points:7}, {color:'#743fab', points:8}, {color:'#4f5e04', points:9}, {color:'#1b5b97', points:10}, {color:'#c6c43b', points:11}, {color:'#1a6d68', points:12}
];

var lives = 5; var score = 0; var level = 0;
var gameRunning = true;

var pbIt = {
		opt:{
			canvasId:"canvas"
		},
		buildWalls:function(){
			var wall = new createjs.Shape(); 
			wall.graphics.beginFill('#333'); 
			wall.graphics.drawRect(0, 0, WALL_THICKNESS, canvas.height); 
			stage.addChild(wall); 
			wall = new createjs.Shape(); 
			wall.graphics.beginFill('#333'); 
			wall.graphics.drawRect(0, 0, WALL_THICKNESS, canvas.height); 
			wall.x = canvas.width - WALL_THICKNESS; 
			stage.addChild(wall); 
			wall = new createjs.Shape(); 
			wall.graphics.beginFill('#333'); 
			wall.graphics.drawRect(0, 0, canvas.width, WALL_THICKNESS); 
			stage.addChild(wall); 
			leftWall = WALL_THICKNESS; 
			rightWall = canvas.width - WALL_THICKNESS; 
			ceiling = WALL_THICKNESS;
		},
		buildMessageBoard:function(){
			board = new createjs.Shape(); 
			board.graphics.beginFill('#333'); 
			board.graphics.drawRect(0, 0, canvas.width, SCORE_BOARD_HEIGHT); 
			board.y = canvas.height - SCORE_BOARD_HEIGHT;
			stage.addChild(board); 
			livesTxt = new createjs.Text('lives: ' + lives, '20px Times', '#fff'); 
			livesTxt.y = board.y + 10; 
			livesTxt.x = WALL_THICKNESS; 
			stage.addChild(livesTxt); 
			scoreTxt = new createjs.Text('score: ' + score, '20px Times', '#fff'); 
			scoreTxt.textAlign = "right"; 
			scoreTxt.y = board.y + 10; 
			scoreTxt.x = canvas.width - WALL_THICKNESS; 
			stage.addChild(scoreTxt); 
			messageTxt = new createjs.Text('press spacebar to pause', '18px Times','#fff'); 
			messageTxt.textAlign = 'center'; 
			messageTxt.y = board.y + 10; 
			messageTxt.x = canvas.width / 2; 
			stage.addChild(messageTxt);
		},
		buildPaddle:function(){
			paddle = new createjs.Shape(); 
			paddle.width = PADDLE_WIDTH; 
			paddle.height = 20; 
			paddle.graphics.beginFill('#3e6dc0').drawRect(0, 0, paddle.width, paddle.height);
			paddle.nextX = 0; 
			paddle.x = 20; 
			paddle.y = canvas.height - paddle.height - SCORE_BOARD_HEIGHT; 
			stage.addChild(paddle);
		},
		buildPuck:function(){
			puck = new createjs.Shape(); 
			puck.graphics.beginFill('#FFFFFF').drawRect(0, 0, 10, 10); 
			puck.width = 10; 
			puck.height = 10; 
			puck.x = canvas.width - 100; 
			puck.y = 160; 
			puck.velX = PUCK_SPEED; 
			puck.velY = PUCK_SPEED; 
			puck.isAlive = true; 
			stage.addChildAt(puck, 0);
		},
		setControls:function(){
			window.onkeydown = pbIt.handleKeyDown; 
			window.onkeyup = pbIt.handleKeyUp;
		},
		handleKeyDown:function(e){
			switch(e.keyCode){
			case ARROW_KEY_LEFT: 
				leftKeyDown = true; 
				break;
			case ARROW_KEY_RIGHT: 
				rightKeyDown = 
					true; break;
			}
		},
		handleKeyUp:function(e){
			switch(e.keyCode){
			case ARROW_KEY_LEFT:
				leftKeyDown = false;
				break; 
			case ARROW_KEY_RIGHT:
				rightKeyDown = false;
				break; 
			case SPACE_KEY:
				if (gameRunning) { 
					createjs.Ticker.setPaused(createjs.Ticker.getPaused() ? false: true);
						} else {
						pbIt.resetGame(); 
				}
				break;
			}
		},
		newLevel:function(){
			var i, brick, freeLifeTxt; 
			var data = levels[level]; 
			var xPos = WALL_THICKNESS; 
			var yPos = WALL_THICKNESS; 
			var freeLife = Math.round(Math.random() * 20); 
			paddleHits = 0; 
			pbIt.shiftBricksDown();
			for (i = 0; i < 20; i++) { 
				brick = new createjs.Shape(); 
				brick.graphics.beginFill(i == freeLife ? '#009900' : data.color); 
				brick.graphics.drawRect(0, 0, 76, 20); 
				brick.graphics.endFill(); 
				brick.width = 76; 
				brick.height = 20; 
				brick.x = xPos; 
				brick.y = yPos; 
				brick.points = data.points; 
				brick.freeLife = false; 
				bricks.push(brick); 
				stage.addChild(brick); 
				if (i == freeLife) {
					freeLifeTxt = new createjs.Text('1UP', '12px Times', '#fff'); 
					freeLifeTxt.x = brick.x + (brick.width / 2); 
					freeLifeTxt.y = brick.y + 4; 
					freeLifeTxt.width = brick.width;
					freeLifeTxt.textAlign = 'center'; 
					brick.freeLife = freeLifeTxt; 
					stage.addChild(freeLifeTxt);
				} 
				xPos += 76; 
					if (xPos > (brick.width * 10)) {
						xPos = WALL_THICKNESS;
						yPos += brick.height;
					}
				} 
				level++; 
				if (level == levels.length) {
					level--;
				}
		},
		shiftBricksDown:function(){
			var i, brick; 
			var shiftHeight = 80; 
			var len = bricks.length; 
			for (i = 0; i < len; i++){
				brick = bricks[i]; 
				brick.y += shiftHeight;
				if (brick.freeLife) { 
					brick.freeLife.y += shiftHeight;
				}
			}
		},
		newGame:function(){
			pbIt.buildWalls();
			pbIt.buildMessageBoard();
			pbIt.buildPaddle();
			pbIt.buildPuck();
			pbIt.setControls();
			pbIt.newLevel();
			pbIt.newLevel();
		},
		update:function(){
			pbIt.updatePaddle(); 
			pbIt.updatePuck(); 
			pbIt.checkPaddle(); 
			pbIt.checkBricks();
		},
		runGame:function(){
			pbIt.update();
			pbIt.render(); 
			pbIt.evalPuck(); 
			pbIt.evalGame();
		},
		startGame:function(){
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick",function(e){
				if (!e.paused) { 
					pbIt.runGame();
					stage.update();
				} 
			});	
		},
		removeBricks:function(){
			var i, brick; 
			for (i = 0; i < bricks.length; i++) {
				brick = bricks[i]; 
				if (brick.freeLife) {
					stage.removeChild(brick.freeLife); 
				}
				stage.removeChild(brick);
			} 
			bricks = [];
		},
		checkBricks:function(){
			if(!puck.isAlive){
				return;
			} 
			var i, brick;
			for (i = 0; i < bricks.length; i++){
				brick = bricks[i]; 
				if (puck.nextY >= brick.y && puck.nextY <= (brick.y + brick.height) && puck.nextX >= brick.x && puck.nextX <= (brick.x + brick.width)){
					score += brick.points; 
					combo++;
				}
				if (brick.freeLife) { 
					lives++;
					createjs.Tween.get(brick.freeLife) .to({alpha:0, y:brick.freeLife.y - 100}, 1000) .call(function () {
						stage.removeChild(this); 
						});
				} 
				if (combo > 4) {
					score += (combo * 10); 
					var comboTxt = new createjs.Text('COMBO X' + (combo * 10),'14px Times', '#FF0000'); 
					comboTxt.x = brick.x; comboTxt.y = brick.y; 
					comboTxt.regX = brick.width / 2; 
					comboTxt.regY = brick.height / 2; 
					comboTxt.alpha = 0; 
					stage.addChild(comboTxt); 
					createjs.Tween.get(comboTxt).to({alpha:1, scaleX:2, scaleY:2, y:comboTxt.y - 60}, 1000) .call(function () {
						stage.removeChild(this); 
					});
				}
				stage.removeChild(brick); 
				bricks.splice(i, 1); 
				puck.velY *= -1; 
				break;
			}
		},
		render:function(){
			paddle.x = paddle.nextX; 
			puck.x = puck.nextX; 
			puck.y = puck.nextY;
			livesTxt.text = "lives: " + lives; 
			scoreTxt.text = "score: " + score;
		},
		evalPuck:function(){
			//if(puck.y > paddle.y && puck.isAlive && puck.nextY > (paddle.y – paddle.height) && puck.nextX >= paddle.x && puck.nextX <=(paddle.x + paddle.width)){
			if(puck.y > paddle.y && puck.isAlive ){
			puck.isAlive = false;
			} 
			if (puck.y > canvas.height + 200) {	
				puck.y = bricks[0].y + bricks[0].height + 40; 
				puck.x = canvas.width / 2; 
				puck.velX *= -1; 
				puck.isAlive = true;
				combo = 0; 
				lives--;
			}
		},
		evalGame:function(){
			if (lives < 0 || bricks[0].y > board.y) { 
				pbIt.gameOver();
			} if (paddleHits == PADDLE_HITS_FOR_NEW_LEVEL) {
				pbIt.newLevel();
			}
		},
		gameOver:function(){
			
			createjs.Ticker.setPaused(true); 
			gameRunning = false; 
			messageTxt.text = "press spacebar to play"; 
			puck.visible = false; 
			paddle.visible = false; 
			stage.update(); 
			messageInterval = setInterval(function(){
				messageTxt.visible = messageTxt.visible ? false : true;
				stage.update(); }, 1000);
			
		},
		resetGame:function(){
			clearInterval(messageInterval); 
			level = 0; 
			score = 0; 
			lives = 5; 
			paddleHits = 0; 
			puck.y = 160; 
			puck.velY = PUCK_SPEED; 
			puck.visible = true;
			paddle.visible = true; 
			messageTxt.visible = true; 
			gameRunning = true; 
			messageTxt.text = "press spacebar to pause"; 
			stage.update();
			pbIt.removeBricks(); 
			pbIt.newLevel(); 
			pbIt.newLevel(); 
			createjs.Ticker.setPaused(false);
		},
		checkPaddle:function(){
			if (puck.velY > 0 ) { 
				puck.nextY = paddle.y - puck.height; 
				combo = 0; 
				paddleHits++; 
				puck.velY *= -1;
			}
		},
		updatePuck:function(){
			var nextX = puck.x + puck.velX; 
			var nextY = puck.y + puck.velY; 
			if (nextX < leftWall) {
				nextX = leftWall; puck.velX *= -1;
			} else if (nextX > (rightWall - puck.width)) {
				nextX = rightWall - puck.width;
				puck.velX *= -1;
			} if (nextY < (ceiling)) {
				nextY = ceiling; 
				puck.velY *= -1;
			} 
			puck.nextX = nextX; 
			puck.nextY = nextY;
		},
		updatePaddle:function(){
			var nextX = paddle.x; 
			if (leftKeyDown) {
				nextX = paddle.x - PADDLE_SPEED; 
				if (nextX < leftWall) {
					nextX = leftWall;
				}
			} else if (rightKeyDown) {
				nextX = paddle.x + PADDLE_SPEED;
				if (nextX > rightWall - paddle.width){
					nextX = rightWall - paddle.width;
				}
			}
			paddle.nextX = nextX;
		},
		init:function(){
			canvas = document.getElementById(pbIt.opt.canvasId); 
			stage = new createjs.Stage(canvas); 
			pbIt.newGame(); 
			pbIt.startGame();
		}
};