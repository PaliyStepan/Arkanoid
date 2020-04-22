
const KEYS = {
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32
};

let game = {
    running: true,
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    score: 0,
    rows: 5 ,
    cols: 10,
    width: 1280,
    height: 720,
    title: null,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    sounds: {
        bump: null,
        lost: null,
        won: null,
    },
    initCanvasSize() {
        let realWidth = window.innerWidth * window.devicePixelRatio;
        let realHeight = window.innerHeight * window.devicePixelRatio;
        let maxHeight = this.height;
        let maxWidth = this.width;
        this.height = Math.min(Math.floor(maxWidth * realHeight / realWidth), maxHeight);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },
    init() {
        this.canvas = document.getElementById('mycanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initCanvasSize();
        this.setTextFont();
        this.setEvents();
    },
    setTextFont() {
        this.ctx.font = '28px Arial';
        this.ctx.fillStyle = '#FFFFFF';
    },
    setEvents() {
        window.addEventListener('keydown', e => {
            if (e.keyCode === KEYS.SPACE){
                this.platform.fire();
            } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
                this.platform.start(e.keyCode);
            }
        });
        window.addEventListener('keyup', e => {
            this.platform.stop();
        });
        window.addEventListener('click', e => {
            if (e.target.classList.contains('jsBtnFire')){
                this.platform.fire();
            } else if (e.target.classList.contains('jsBtnLeft')) {
                this.platform.start(37);
            } else if (e.target.classList.contains('jsBtnRight')) {
                this.platform.start(39);
            }
        });
    },
    preload(callback) {
        let loaded = 0;
        let required = Object.keys(this.sprites).length;
        required += Object.keys(this.sounds).length;

        let onResourceLoad = () => {
            ++loaded;
            if (loaded >= required) {
                callback();
            }
        };

        this.preloadSprites(onResourceLoad);
        this.preloadAudio(onResourceLoad);
    },
    preloadSprites(onResourceLoad) {
        for (let key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = 'images/games/arkanoid/' + key + '.png';
            this.sprites[key].addEventListener('load', onResourceLoad);
        }
    },
    preloadAudio(onResourceLoad) {
        for (let key in this.sounds) {
            this.sounds[key] = new Audio('other/games/arkanoid/' + key + '.mp3');
            this.sounds[key].addEventListener('canplaythrough', onResourceLoad, {once: true});
        }
    },
    create() {
        this.ball.x = this.width / 2 - 20;
        this.ball.y = this.height - 85;
        this.platform.x = this.width / 2 - 125;
        this.platform.y = this.height - 45;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    active: true,
                    width: 111,
                    height: 39,
                    x: 113 * col + 70,
                    y: 42 * row + 90 
                });
            }
        }
    },
    update() {
        this.collideBlocks();
        this.collidePlatform();
        this.ball.collideWorldBounds();
        this.platform.collideWorldBounds();
        this.platform.move();
        this.ball.move();
    },
    addScore() {
        ++this.score;

        if (this.score >= this.blocks.length) {
            this.end('Вы победили');
            this.ball.width = 0;
            this.ball.height = 0;
            game.sounds.won.play();
        }
    },
    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active && this.ball.collide(block)) {
                this.ball.bumpBlock(block);
                this.addScore();
                this.sounds.bump.play();
            }
        }
    },
    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform);
            this.sounds.bump.play();
        }
    },
    run() {
        if (this.running) {
            window.requestAnimationFrame(() => {
                this.update();
                this.render();
                this.run();
            });
        }
    },
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.ball, this.ball.frame * this.ball.width, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
        this.ctx.fillText('Score: ' + this.score, 70, 45);
    },
    renderBlocks() {
        for (let block of this.blocks) {
            if (block.active) {
                this.ctx.drawImage(this.sprites.block, block.x, block.y);
            }
        }
    },
    start: function() {
        this.init();
        this.preload(() => {
            this.create();
            this.run();
        });
    },
    end(message) {
        this.running = false;
        this.title = document.querySelector('.end-game__text');
		this.title.innerHTML = message;

		var endGameBlock = document.querySelector('.jsEndGameBlock');
		endGameBlock.classList.add('active');

		var restartGame = document.querySelector('.jsRestartGame');
		restartGame.addEventListener( 'click' , () => window.location.reload());

    },
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};


game.ball = {
    dx: 0,
    dy: 0,
    frame: 0,
    velocity: 10,
    x: game.width / 2 - 20,
    y: game.height - 85,
    width: 40,
    height: 40,
    start() {
        this.dy = -this.velocity;
        this.dx = game.random(-this.velocity, this.velocity);
    },
    animate() {
        setInterval(() => {
            ++this.frame;
            if (this.frame > 3) {
                this.frame = 0;
            }
        }, 100);
    },
    move() {
        if (this.dy) {
            this.y += this.dy;
        }
        if (this.dx) {
            this.x += this.dx;
        }
    },
    collide(element) {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        if (x + this.width > element.x &&
            x  < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height) {
                return true;
            }
        return false;
    },
    collideWorldBounds() {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        let ballLeft = x;
        let ballRight = ballLeft + this.width;
        let ballTop = y;
        let ballBottom = ballTop + this.height;

        let worldLeft = 0;
        let worldRight = game.width;
        let worldTop = 0;
        let worldBottom = game.height;

        if (ballLeft < worldLeft) {
            this.x = 0;
            this.dx = this.velocity;
            game.sounds.bump.play();
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width;
            this.dx = -this.velocity;
            game.sounds.bump.play();
        } else if (ballTop < worldTop) {
            this.y = 0;
            this.dy = this.velocity;
            game.sounds.bump.play();
        } else if (ballTop - this.height > worldBottom) {
            game.end('Вы проиграли');
            game.sounds.lost.play();
        }
    },
    bumpBlock(block) {
        this.dy *= -1;
        block.active = false;
    },
    bumpPlatform(platform) {
        if (platform.dx) {
            this.x += platform.dx;
        }

        if (this.dy > 0) {
            this.dy = -this.velocity;
            let touchX = this.x + this.width / 2;
            this.dx = this.velocity * platform.getTouchOffset(touchX);
        }
    }
};


game.platform = {
    velocity: 15,
    dx: 0,
    x: game.width / 2 - 125,
    y: game.height - 45,
    width: 251,
    height: 41,
    ball: game.ball,
    fire() {
        if (this.ball) {
            this.ball.start();
            this.ball = null;
        }
    },
    start(direction) {
        if (direction === KEYS.LEFT) {
            this.dx = -this.velocity;
        } else if (direction === KEYS.RIGHT) {
            this.dx = this.velocity;
        }
    },
    stop() {
        this.dx = 0;
    },
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball) {
                this.ball.x += this.dx;
            }
        }
    },
    getTouchOffset(x) {
        let diff = (this.x + this.width) - x;
        let offset = this.width - diff;
        let result = 2 * offset / this.width;
        return result - 1;
    },
    collideWorldBounds() {
        let x = this.x + this.dx;
        let platformLeft = x;
        let platformRight = platformLeft + this.width;
        let worldLeft = 0;
        let worldRight = game.width;

        if (platformLeft < worldLeft || platformRight > worldRight) {
            this.dx = 0;
        }
    }
};


window.addEventListener('load', () => {
    game.start();
});


if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
	document.querySelector('body').classList.add('body_mobile');
}

