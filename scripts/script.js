window.addEventListener('load', function() {
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 720;
let enemies = [];
let bullets = [];
let explosions = [];
let score = 0;
let gameover = false;

class InputHandler {
    constructor() {
        this.keys = [];
        // Listen for keystrokes, if arrow keys or space, add them to array
        window.addEventListener('keydown', e => {
            if ((e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight')
                && this.keys.indexOf(e.key) === -1) {
                
                this.keys.push(e.key);
            }
            if (e.key === ' ' && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
        });
        // remove from array on keyup
        window.addEventListener('keyup', e => {
            if (e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight') {

                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
            if (e.key === ' ') {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}

class Player {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 200;
        this.height = 200;
        this.x = 0;
        this.y = this.gameHeight - this.height;
        this.image = document.getElementById('playerImage');
        this.frameX = 0;
        this.frameY = 0;
        this.speed = 0;
        this.vy = 0;
        this.weight = 1;
        this.canShoot = true;
        this.bulletCount = 6;
    }
    draw(context) {
        context.drawImage(this.image, this.frameX * this.width,
                          this.frameY * this.height, this.width, this.height,
                          this.x, this.y, this.width, this.height);
    }
    update(input, enemies, bullets) {
        // collision detection
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < enemy.width/3 + this.width/2) {
                gameover = true;
            }
        });

        // horizontal movement
        this.x += this.speed;
        if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
            this.vy -= 30;
        } else if (input.keys.indexOf('ArrowLeft') > -1) {
            this.speed = -5;
        } else if (input.keys.indexOf('ArrowRight') > -1) {
            this.speed = 5;
        } else {
            this.speed = 0;
        }
        if (this.x < 0) this.x = 0;
        else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

        // vertical movement
        this.y += this.vy;
        
        if (!this.onGround()) {
            this.vy += this.weight;
        } else {
            this.vy = 0;
        }

        if (input.keys.indexOf(' ') > -1 && this.canShoot && this.bulletCount > 0) {
            bullets.push(new Bullet(canvas.width, canvas.height, this));
            this.bulletCount--;
            this.canShoot = false;
            
            setTimeout(() => {
                this.canShoot = true;
            }, 300);
        }

        if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
    }

    onGround() {
        return this.y >= this.gameHeight - this.height;
    }
}

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 1920;
            this.height = 1080;
            this.speed = 10;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, canvas.width, canvas.height);
            context.drawImage(this.image, this.x + canvas.width, this.y, canvas.width, canvas.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - canvas.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight, speed) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.frameY = 0;
            this.speed = speed;
            this.markedForDeletion = false;
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.width,
                this.frameY * this.height, this.width, this.height,
                this.x, this.y, this.width, this.height);
        }
        update() {
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
            this.x += this.speed;
        }
    }

    class Bullet {
        constructor(gameWidth, gameHeight, player) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 10;
            this.height = 10;
            this.x = player.x + player.width;
            this.y = player.y + 38;
            this.image = document.getElementById('bulletImage');
            this.speed = 12;
            this.interval = 100;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height)
        }

        update() {
            this.x += this.speed;
        }
    }



    function handleEnemies(deltaTime){
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height, enemySpeed));
            enemyTimer = 0;
            randomEnemyInterval = Math.random() * 3000 + 200;

        } else {
            enemyTimer += deltaTime;
        }
            
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update();
        })

        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function handleBullets() {
        bullets.forEach((bullet, index) => {
            bullet.draw(ctx);
            bullet.update();
    
            if (bullet.x > canvas.width) {
                bullets.splice(index, 1);
            }
    
            enemies.forEach((enemy, enemyIndex) => {
                const dx = enemy.x - bullet.x;
                const dy = enemy.y - bullet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < enemy.width/4) {
                    const explosion = {
                        x: bullet.x,
                        y: bullet.y,
                        width: 50,
                        height: 50,
                        timer: 0,
                        maxTimer: 30
                    };
                    explosions.push(explosion);
    
                    bullets.splice(index, 1);
                    enemy.markedForDeletion = true;
                    score++;
                }
            });
        });
    }
    

    const explosionImage = new Image();
    explosionImage.src = 'https://davidjpeters.github.io/JOTPK/imgs/1x/explosion.png';

    function handleExplosions() {
        explosions.forEach((explosion, index) => {
            ctx.drawImage(
                explosionImage,
                0, 0,
                190, 180,
                explosion.x - explosion.width/2, 
                explosion.y - explosion.height/2, 
                explosion.width, 
                explosion.height
            );
    
            explosion.timer++;
    
            if (explosion.timer > explosion.maxTimer) {
                explosions.splice(index, 1);
            }
        });
    }

    function speedUpEnemies(score) {
        enemySpeed = -score/10 - 4;
    }

    function increaseEnemySpawnRate() {
        enemyInterval = 1500 - (score/10) * 180;
    }

    function displayStatusText(context, player) {
        context.fillStyle = 'black';
        context.font = '40pt helvitca';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = '#d6e069';
        context.fillText('Score: ' + score, 22, 52);

        if (gameover) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, try again', canvas.width/2, 200);
            context.fillStyle = '#d6e069';
            context.fillText('GAME OVER, try again', canvas.width/2 + 2, 202);
        }

        context.fillStyle = 'black';
        context.font = '30pt helvetica';
        context.fillText('Bullets: ' + player.bulletCount, 20, 100);
        context.fillStyle = '#d6e069';
        context.fillText('Bullets: ' + player.bulletCount, 22, 102);
    }

    const titleImage = new Image();
    titleImage.src = 'https://davidjpeters.github.io/JOTPK/imgs/1x/JOTPK.png';
    let showTitle = true;
    let titleStartTime = null;

    function drawTitle() {
        ctx.drawImage(titleImage, 220, 280, 320, 240);
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);


    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1500;
    let randomEnemyInterval = Math.random() * 3000 + 500;
    let enemySpeed = -4;

    function animate(timeStamp) {
       
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, enemies, bullets);
        handleEnemies(deltaTime);
        handleBullets();
        handleExplosions();
        displayStatusText(ctx, player);
        speedUpEnemies(score);
        increaseEnemySpawnRate();

        if (showTitle) {
            if (!titleStartTime) titleStartTime = timeStamp;
            drawTitle();
            if (timeStamp - titleStartTime > 2000) {
                showTitle = false;
            }
        }

        if (!gameover) requestAnimationFrame(animate);

    }
    animate(0);
});