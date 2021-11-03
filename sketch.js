const BLOCK_SIZE = 32;

let sizeX = 900;
let sizeY = sizeX / 2;
let speed = 10;
let tab = "menu";
let dbg;
let assets = {};
let gameObjects = [];
let groundY = BLOCK_SIZE * 13;
let session = '';
let username = '';
let canJump = true;
let gravityInterval;
let gravityIntervalTime = 10;
let defGravityIntervalTime = 10;
let onGround = false;

var capturer;
var BreakException = {};

p5.Color.prototype.equals = function(other) {

    // convert @other if it's not a p5.Color
    if (other.constructor !== p5.Color) {
        try {
            other = color(...arguments);
        } catch (e) {
            return false; // if conversion fails return false
        }
    }

    let r1 = this._getRed();
    let g1 = this._getGreen();
    let b1 = this._getBlue();
    let a1 = this._getAlpha();

    let r2 = other._getRed();
    let g2 = other._getGreen();
    let b2 = other._getBlue();
    let a2 = other._getAlpha();

    return r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2;
};

class gameObject {
    objId = "ID";
    x = 0;
    y = 0;
    sizeX = 1;
    sizeY = 1;
	velocityX = 0;
	velocityY = 0;
    image = null;
    onPress = function() {};
    onRelease = function() {};
    viewOnTab = "string";
    options = {};
	visible = true;
	enabled = true;
    intersectsWith(another) {
        return overlaps({x1: this.x, y1: this.y, x2: this.x + this.sizeX, y2: this.y + this.sizeY}, {x1: another.x, y1: another.y, x2: another.x + another.sizeX, y2: another.y + another.sizeY});
    }
    constructor() {

    }
}

class game {
    player;
    playerType = 'cube';
	direction = 1;
    addBlock = function(x, y, id) {
        let obj = new gameObject();
        obj.objId = id;
        obj.x = x * 32;
        obj.y = y * 32;
        obj.sizeX = 32;
        obj.sizeY = 32;
        obj.image = assets.block;
        obj.options.isGameObject = true;
        obj.options.type = 'BLOCK';
        obj.viewOnTab = "game";
        gameObjects.push(obj);
    }
    addBlock1 = function(x, y, id, type) {
        let obj = new gameObject();
        obj.objId = id;
        obj.x = x * 32;
        obj.y = y * 32;
        obj.sizeX = 32;
        obj.sizeY = 32;
        obj.image = assets["block1" + type];
        obj.options.isGameObject = true;
        obj.options.type = 'BLOCK';
        obj.viewOnTab = "game";
        gameObjects.push(obj);
    }
    addSpike = function(x, y, id) {
        let obj = new gameObject();
        obj.objId = id;
        obj.x = x * 32;
        obj.y = y * 32;
        obj.sizeX = 32;
        obj.sizeY = 32;
        obj.image = assets.spike;
        obj.options.isGameObject = true;
        obj.options.type = 'SPIKE';
        obj.viewOnTab = "game";
        gameObjects.push(obj);
    }
    addSpikeRotated1 = function(x, y, id) {
        let obj = new gameObject();
        obj.objId = id;
        obj.x = x * 32;
        obj.y = y * 32;
        obj.sizeX = 32;
        obj.sizeY = 32;
        obj.image = assets.spike1;
        obj.options.isGameObject = true;
        obj.options.type = 'SPIKE';
        obj.viewOnTab = "game";
        gameObjects.push(obj);
    }
    addSpikeRotated2 = function(x, y, id) {
        let obj = new gameObject();
        obj.objId = id;
        obj.x = x * 32;
        obj.y = y * 32;
        obj.sizeX = 32;
        obj.sizeY = 32;
        obj.image = assets.spike2;
        obj.options.isGameObject = true;
        obj.options.type = 'SPIKE';
        obj.viewOnTab = "game";
        gameObjects.push(obj);
    }
    addSpikeRotated3 = function(x, y, id) {
        let obj = new gameObject();
        obj.objId = id;
        obj.x = x * 32;
        obj.y = y * 32;
        obj.sizeX = 32;
        obj.sizeY = 32;
        obj.image = assets.spike3;
        obj.options.isGameObject = true;
        obj.options.type = 'SPIKE';
        obj.viewOnTab = "game";
        gameObjects.push(obj);
    }
	tick = function() {}
    initPlayer = function() {}
    constructor() {

    }
}

let _game = new game();

function loadScript(url, id, callback) {

    let script = document.createElement("script");
    script.type = "text/javascript";
	script.id = id;

    script.onload = function() {
        if(callback != null) callback(id);
    };

    script.src = url;
    document.getElementsByTagName("body")[0].appendChild(script);
}

function preload() {
    assets.play = loadImage("assets/play.png");
    assets.exit = loadImage("assets/exit.png");
    assets.editor = loadImage("assets/editor.png");
    assets.block = loadImage("assets/block.png");
    assets.block1 = loadImage("assets/block1.png");
    assets.block1up = loadImage("assets/block1_up.png");
    assets.block1left = loadImage("assets/block1_left.png");
    assets.block1down = loadImage("assets/block1_down.png");
    assets.block1right = loadImage("assets/block1_right.png");
    assets.block1up = loadImage("assets/block1_upleft.png");
    assets.block1left = loadImage("assets/block1_upright.png");
    assets.block1down = loadImage("assets/block1_downleft.png");
    assets.block1right = loadImage("assets/block1_downright.png");
    assets.spike = loadImage("assets/spike.png");
    assets.spike1 = loadImage("assets/spike1.png");
    assets.spike2 = loadImage("assets/spike2.png");
    assets.spike3 = loadImage("assets/spike3.png");
    assets.cube = loadImage("assets/cube_default.png");
    assets.ship = loadImage("assets/ship_default.png");
}

let flying = false;

function setup() {
    loadScript("/util.js", function() {});
    dbg = createP(`[p5dash debug] canvas size ${sizeX} : ${sizeY}; current tab is ${tab}`);
    dbg.position(5, 100);
    dbg.style('font-size', '19px');
    dbg.style('color', 'white');

    createCanvas(sizeX, sizeY);
	if(enableRecording) {
	capturer = new CCapture( {
	framerate: 30,
	format: 'webm'
} );
	}
	
    if (tab == "menu") {
        let playBtn = new gameObject();
        let playSize = 150;
        playBtn.image = assets.play;
        playBtn.objId = "play";
        playBtn.x = (sizeX / 2) - (playSize / 2);
        playBtn.y = (sizeY / 2) - (playSize / 2);
        playBtn.sizeX = playSize;
        playBtn.sizeY = playSize;
        playBtn.onPress = function() {
            console.log(`${playBtn.objId} press`);
        }
        playBtn.onRelease = function() {
            console.log(`${playBtn.objId} release`);
			let levelId = prompt('Введите Id уровня');
			if(levelId == null) return tab = 'menu';
					if(enableRecording) {
						capturer = new CCapture({
							framerate: 30,
							format: 'webm'
						});
						capturer.start();
					}
            tab = 'game';
            let p = new gameObject();
            p.image = assets.cube;
            p.options.type = "cube";
			p.options.isLocalPlayer = true;
			p.options.gravity = 1;
            p.x = 0;
            p.y = groundY - 128;
            p.sizeX = 32;
            p.sizeY = 32;
            p.objId = "player";
            p.viewOnTab = "game";
            let interval = setInterval(() => {
                if (tab == 'game') {
                    let collision = false;
                    let dogravity = true;
                    try {
                        let cancelDeath = false;
						let intersectsWithSpike = false;
						let intersectsWithBlock = false;
                        gameObjects.filter(x => x.options.isGameObject && x.options.type == 'SPIKE').forEach(function(o) {
                            if (o.options.isGameObject && o.intersectsWith(_game.player) && o.enabled) {
									console.log(Math.floor((_game.player.y / 32) + _game.player.sizeY));
									console.log(Math.floor(o.y / 32));
								if (o.options.type == 'SPIKE' && !cancelDeath) {
									intersectsWithSpike = true;
                                }
                                //collision = true;
                            }
                        });
						gameObjects.filter(x => x.options.isGameObject && x.options.type == 'BLOCK').forEach(function (o) {
							
                            if (o.options.isGameObject && o.intersectsWith(_game.player) && o.enabled) {
								if(o.options.type == 'BLOCK') {
									console.log('start; not killing');
									console.log(o);
									console.log(_game.player);
									console.log('end; not killing');
									cancelDeath = true;
									collision = true;
								}
								if(o.options.type == 'BLOCK' && o.y < _game.player.y) {
									console.log('start; killing');
									console.log(o);
									console.log(_game.player);
									console.log('end; killing');
									intersectsWithBlock = true;
								}
							}
						});
						if(intersectsWithSpike && !cancelDeath || intersectsWithBlock) exitBtn.onRelease();
                    } catch (e) {
                        if (e !== BreakException) throw e;
                    }
					let p = _game.player;
					let b = 1;
					let g = 9.8;
					if(p.velocityX != 0) {
						p.x += p.velocityX;
						p.velocityX += p.velocityX < 0 ? b : -b;
					}
					// if(p.velocityY != 0) {
						// p.velocityY += g * speed / 100.;
						// //p.velocityY += p.velocityY < 0 ? b : -b;
					// }
                    // if ((p.y < groundY) && !collision)  {
						// p.velocityY = 0.;
						// canJump = false;
					// } else {
						// canJump = true;
					// }
					
					if ((!onGround && !collision) || p.velocityY < 0){
						p.velocityY += g * speed / 100.;
						p.y += p.velocityY * speed / 100.;
						canJump = false;
					}else
						canJump = true;
					
					if ((p.y + p.sizeY >= groundY)){
						onGround = true;
						p.y = groundY - p.sizeY;
					}else
						onGround = false;
				
                    p.x+=_game.direction;
					_game.tick();
                }
            }, speed);
            gameObjects.push(p);
            _game.player = p;
			_game.direction = 0;
            loadScript("/levels/" + levelId + ".js", "level", function(id) {
                song = loadSound(songLink, function () {
					_game.direction = 1;
					play();
				});
            });
            let exitBtn = new gameObject();
            exitBtn.image = assets.exit;
            exitBtn.x = 5;
            exitBtn.y = 5;
            exitBtn.sizeX = 64;
            exitBtn.sizeY = 64;
            exitBtn.objId = "exit";
            exitBtn.viewOnTab = "game";
            exitBtn.onRelease = function() {
                clearInterval(interval);
				_game.tick = function () {};
				delete _game.direction;
				_game.direction = 0;
                tab = 'menu';
                for (let i = gameObjects.length; i > 0; i--) {
                    let obj = gameObjects[i];
					if(obj == undefined) {
                        gameObjects.splice(i, 1);
					}
					if(obj != undefined) {
						if (((obj.options != undefined) && ('isGameObject' in obj.options)) || obj.objId == 'player' || obj.objId == 'exit') {
							gameObjects.splice(i, 1);
						}
					}
                }
				if(enableRecording) {
					recording = false;
					capturer.stop();
					capturer.save();
				}
				eval('end()');
				delete song;
				delete name;
				delete author;
				delete songLink;
				var elem = document. getElementById("level"); elem. remove();
            };
            gameObjects.push(exitBtn);
			
			let jumpBtn = new gameObject();
            jumpBtn.image = assets.exit;
            jumpBtn.x = sizeX - 64;
            jumpBtn.y = sizeY - 64;
            jumpBtn.sizeX = 64;
            jumpBtn.sizeY = 64;
            jumpBtn.objId = "exit";
            jumpBtn.viewOnTab = "game";
            jumpBtn.onPress = function() {
                if(_game.player.options.type == 'cube' && canJump) {
					_game.player.velocityY = -50;
				}else if(_game.player.options.type == 'ship') {
					flying = true;
				}
            };
			jumpBtn.onRelease = function () {
				if(_game.player.options.type == 'ship') {
					flying = false;
				}
			};
            gameObjects.push(jumpBtn);
        };
		
		let levelsBtn = new gameObject();
        let lvlsize = 100;
        levelsBtn.image = assets.editor;
        levelsBtn.objId = "editor";
        levelsBtn.x = ((sizeX / 2) - (lvlsize / 2)) + 128 + 15;
        levelsBtn.y = (sizeY / 2) - (lvlsize / 2);
        levelsBtn.sizeX = lvlsize;
        levelsBtn.sizeY = lvlsize;
        levelsBtn.onPress = function() {
            console.log(`${levelsBtn.objId} press`);
        }
		levelsBtn.onRelease = function() {
			let id = prompt('Введите ID уровня, который Вы хотите открыть.');
		};
        levelsBtn.viewOnTab = "menu";
        gameObjects.push(levelsBtn);
		
        playBtn.viewOnTab = "menu";
        gameObjects.push(playBtn);
        tab = "login";
    }
    if (tab == 'login') {
		//tab = 'menu';
        let uname = createInput('example', 'text');
        uname.position(5, 55);

        let pwd = createInput('examplepassword', 'password');
        pwd.position(5, 99);

        let btn = createButton('Login');
        btn.position(5, 143);
        btn.mouseClicked(function() {
            let data = JSON.stringify({
				username: uname.value(),
                password: pwd.value()
            });
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "https://p5dash.darkcoder15.tk/api/login.js");
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    let json = JSON.parse(this.responseText);
                    if (json.result == 'SESSION_OPENED') {
                        username = uname.value();
                        session = json.session;
                        tab = 'menu';
                        uname.remove();
                        pwd.remove();
                        btn.remove();
                    }
                }
            }
            xhr.send(data);
        });
    }
}
let camOffsetX = 0;
let camOffsetY = 0;
let camZoomX = 1;
let camZoomY = 1;

let bgR = 160;
let bgG = 0;
let bgB = 200;

function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
}

function editBg(r, g, b) {
	bgR = r;
	bgG = g;
	bgB = b;
}
let recording = false;
let enableRecording = false;
let __canvas;

function draw() {
    background(bgR, bgG, bgB);
	if(tab == 'game') {
		
		//dbg.value(`[p5dash debug] canvas size ${sizeX} : ${sizeY}; current tab is ${tab}; playing ${name} by ${author}`);
		let p = gameObjects.filter(x => x.objId == 'player')[0];
		if(p.options.type == 'cube') {
			p.image = assets.cube;
		}
		if(p.options.type == 'ship') {
			p.image = assets.ship;
				if(flying) {
					_game.player.velocityY = -3;
				}
		}
	} else {
		dbg.value(`[p5dash debug] canvas size ${sizeX} : ${sizeY}; current tab is ${tab}`);
	}
    gameObjects.forEach(function(o) {
        if (o.viewOnTab == tab) {
            if(o.visible) {
				if('isGameObject' in o.options || o.objId == 'player') {
					image(o.image, (o.x * camZoomX) + camOffsetX, (o.y * camZoomY) + camOffsetY, o.sizeX * camZoomX, o.sizeY * camZoomY);
				} else {
					image(o.image, o.x, o.y, o.sizeX, o.sizeY);
				}
			}
        }
    });
	if(enableRecording && tab == 'game') {
		capturer.capture(document.getElementById('defaultCanvas0'));
	}
}

function mousePressed() {
    handlePress(mouseX, mouseY);
}

function touchStarted() {
    handlePress(mouseX, mouseY);
}

function handlePress(x, y) {
    gameObjects.forEach(function(o) {
        if ((o.x <= x && o.x + o.sizeX >= x) && (o.y <= y && o.y + o.sizeY >= y)) {
            if(o.enabled && o.visible && tab == o.viewOnTab) o.onPress();
        }
    });
}

function mouseReleased() {
    handleRelease(mouseX, mouseY);
}

function touchEnded() {
    handleRelease(mouseX, mouseY);
}

function handleRelease(x, y) {
    gameObjects.forEach(function(o) {
        if ((o.x <= x && o.x + o.sizeX >= x) && (o.y <= y && o.y + o.sizeY >= y)) {
            if(o.enabled && o.visible && tab == o.viewOnTab) o.onRelease();
        }
    });
}