$(document).ready(function() {
	init();
});

// Globals
var canvas;
var context;
var tileSize = 32;

function init() {
	canvas = $( '#canvas' )[0];
	context = canvas.getContext( "2d" );
	app = anew(orcsWithForks);
	app.start();
}

var orcsWithForks = {
	constructor: function() {
		this.timeNow = new Date().getTime();
		this.timeAtStartOfPrevStep = this.timeNow;
		this.game = anew( game );
		this.renderer = anew( renderer );
	},
	start: function() {
        
		playerSprite = anew( sprite );
		playerSprite.loadImagesFromDirectory( "images/bazil" );
		this.game.addPlayerSprite(playerSprite);
		this.game.generateLevel();
		window.requestBestAnimationFrame( this.step.bind( this ) );
		
	},
	timeSincePrevStep: function() {
		return Math.min( 1, ( this.timeNow - this.timeAtStartOfPrevStep ) / 1000 );	
	},
	step: function() {
		this.timeNow = new Date().getTime();
		
		this.game.timeSincePrevStep = this.game.timeSincePrevStep + this.timeSincePrevStep;
		while ( this.game.timeSincePrevStep > this.game.stepRate ) {
			this.game.timeSincePrevStep = this.game.timeSincePrevStep - this.game.stepRate;
			this.game.step();
		}
		
		this.renderer.timeSincePrevStep = this.renderer.timeSincePrevStep + this.timeSincePrevStep;
		if ( this.renderer.timeSincePrevStep > this.renderer.stepRate ) {
			this.renderer.timeSincePrevStep = this.renderer.timeSincePrevStep - this.renderer.stepRate;
			this.renderer.step();
		}
		
		this.timeAtStartOfPrevStep = this.timeNow;
		window.requestBestAnimationFrame( this.step.bind( this ) );
	}
}

var renderer = {
	constructor: function() {
		this.timeSincePrevStep = 0; 
		this.fps = 30;
		this.stepRate = 1 / this.fps;
	},
	clear: function() {
		context.fillStyle = "#000000";
		context.fillRect( 0, 0, canvas.width, canvas.height );
	},
	draw: function( game ) {
		game.tiles.forEach( function( tile ){			
			tile.draw();
		});
		//this.sprites.forEach(function(tile){			
		//	tile.draw();
		game.playerSprites.forEach( function( playerSprite ) {
			playerSprite.draw();
		});
		//this.items.forEach(function(tile){			
		//	tile.draw();
		//});
	},
	step: function( game ) {
		this.clear();
		this.draw( game );
	}
}

var game = {
	constructor: function() {
		this.score = 0;
		this.tiles = [];
		this.playerSprites = [];
		this.arrowKeyStatuses = { up: false, down: false, left: false, right: false };
		this.timeSincePrevStep = 0;
		this.fps = 10;
		this.stepRate = 1 / this.fps;
		
		window.addEventListener( "keydown", this.handleKeyDown.bind(this), true );
		window.addEventListener( "keyup", this.handleKeyUp.bind(this), true );
	},
	step: function() {
		this.movePlayerSprites();
	},
	addPlayerSprite: function( sprite ) {
		this.playerSprites.push( sprite );
	},
	addToScore: function( points ) {
		this._score += points;
	},
	resetScore: function() {
		this._score = 0;
	},
	handleKeyDown: function( event ) {
		switch ( event.keyCode ) {
			case 38: this.arrowKeyStatuses["up"]    = true; break;
			case 40: this.arrowKeyStatuses["down"]  = true; break;
			case 37: this.arrowKeyStatuses["left"]  = true; break;
			case 39: this.arrowKeyStatuses["right"] = true; break;
		}
	},
	handleKeyUp: function( event ) {
		switch ( event.keyCode ) {
			case 38: this.arrowKeyStatuses["up"]    = false; break;
			case 40: this.arrowKeyStatuses["down"]  = false; break;
			case 37: this.arrowKeyStatuses["left"]  = false; break;
			case 39: this.arrowKeyStatuses["right"] = false; break;
		}
	},
	movePlayerSprites: function( event ) {
		var directions = Object.keys( this.arrowKeyStatuses );
		for ( var direction in directions ) {
			if ( this.arrowKeyStatuses[directions[direction]] ) {
				this.playerSprites.forEach( function( playerSprite ){
					playerSprite.move( directions[direction] );
				});
			}
		}
	},
	generateLevel: function() {
		for ( var x = 0; x < 32; x ++ ) {
			for ( var y = 0; y < 24; y ++ ) {
				var tile = anew( graphicalObject );
				tile.loadImages( "images/tiles/path.png" );
				tile.xPosition = x * tileSize;
				tile.yPosition = y * tileSize;
				this.tiles.push( tile );
			}
		}
	}
};

// Core graphical game object from which Tile, Sprite and Item inherit.
var graphicalObject = {
	constructor: function() {
		this.images = {};
		this.images["front"] = new Image();
		this.image = this.images["front"];
		this.xPosition = 0;
		this.yPosition = 0;
		this.alpha = 1;
	},
	loadImages: function(imagePath) {
		this.images["front"].src = imagePath;
		this.images["front"].onLoad = function () {
			this.image = images["front"];
		}
	},
	draw: function() {
		context.globalAlpha = this.alpha;
		context.drawImage(this.image, this.xPosition, this.yPosition);
		context.globalAlpha = 1;
	}
};

var sprite = anew(graphicalObject, {
	constructor: function() {
		this.images["back"] = new Image();
		this.images["left"] = new Image();
		this.images["right"] = new Image();
	},
	loadImagesFromDirectory: function( directoryName ) {
		var directions = Object.keys(this.images);	
		for ( var direction in directions ) {
			this.images[directions[direction]] = new Image();
			this.images[directions[direction]].src = directoryName + "/" + directions[direction] + ".png";
		}
		this.image = this.images["front"];
	},
	loadImages: function(directoryName) {
		loadImagesFromDirectory();
	},
	move: function( direction ) {
		switch ( direction ) {
			case "up":    this.moveUp();    break;
			case "down":  this.moveDown();  break;
			case "left":  this.moveLeft();  break;
			case "right": this.moveRight(); break;
		};
	},    
	moveUp: function() {
		this.image = this.images["back"];
		this.yPosition -= tileSize;
	},
	moveDown: function() {
		this.image = this.images["front"];
		this.yPosition += tileSize;
	},
	moveLeft: function() {
		this.image = this.images["left"];
		this.xPosition -= tileSize;
	},       
	moveRight: function() {
		this.image = this.images["right"];
		this.xPosition += tileSize;
	}
});

var tile = anew( graphicalObject, {} );
