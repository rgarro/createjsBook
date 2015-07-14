var stage;
var shapes = [];
var slots = [];
var score = 0;
var queue;
var sound;

function loadComplete() {
	stage.enableMouseOver();
    buildShapes();
    setBlocks();
    //startGame();
	}

function init(){
    queue = new createjs.LoadQueue();
	queue.installPlugin(createjs.Sound);
	queue.addEventListener("complete", loadComplete); queue.loadManifest(
		[
			{id:"woosh", src:"sounds/woosh.mp3"},
			{id:"chime", src:"sounds/chime.mp3"}
		]);
}

function buildShapes(){
    var colors = ['blue','red','green','yellow'];
    var i , shape, slot;
    for(i=0;i<colors.length;i++){
        slot = new createjs.Shape();
        slot.graphics.beginStroke(colors[i]);
        slot.graphics.beginFill('#FFF');
        slot.graphics.drawRect(0,0,100,100);
        slot.regX = slot.regY = 50;
        slot.key = i;
        slot.y = 80;
        slot.x = (i*130)+100;
        stage.addChild(slot);
        slots.push(slot);
        shape = new createjs.Shape();
        shape.graphics.beginFill(colors[i]);
        shape.graphics.drawRect(0,0,100,100);
        shape.regX = shape.regY = 50;
        shape.key = i;
        shapes.push(shape);
    }
}

function setBlocks(){
    var i,shape,r;
    var l = shapes.length;
    for(i=0;i<l;i++){
        r = Math.floor(Math.random() * shapes.length);
        shape = shapes[r];
        shape.homeY = 320;
        shape.homeX = (i * 130) + 100;
        shape.x = shape.homeX;
        shape.y = shape.homeY;
        shape.addEventListener("mousedown",startDrag);
        stage.addChild(shape);
        shapes.splice(r,1);
    }
}

function startDrag(e){
    var shape = e.target;
    var slot = slots[shape.key];
    stage.setChildIndex(shape,stage.getNumChildren()-1);
     sound = createjs.Sound.play('woosh',createjs.Sound.INTERRUPT_NONE,3 * 1000);
    stage.addEventListener("stagemousemove",function(e){
        shape.x = e.stageX;
        shape.y = e.stageY;
    });
    stage.addEventListener("stagemouseup",function(e){
        stage.removeAllEventListeners();
        var pt = slot.globalToLocal(stage.mouseX,stage.mouseY);
        if(shape.hitTest(pt.x,pt.y)){
            shape.removeEventListener("mousedown",startDrag);
            score++;

            createjs.Tween.get(shape).to({x:slot.x,y:slot.y},200,createjs.Ease.quadOut).call(checkGame);
        }else{
            createjs.Tween.get(shape).to({x:shape.homeX,y:shape.homeY.y},200,createjs.Ease.quadOut).call(checkGame);
        }
    });
}

function checkGame(){
    if(score == 4){
         sound = createjs.Sound.play('chime',createjs.Sound.INTERRUPT_NONE,3 * 1000);
        alert("You Won!");
    }
}
