const INIT_VELOCITY = 0.035;
const VELOCITY_INCREASE = 0.00001;
const MAX_VELOCITY = 0.1;
const INIT_X = 50;
const INIT_Y = 50;
const OFFSET = 3;
const SPEED = 0.02;
const MOVEMENT_SPEED = 1.5;

const board = document.querySelector('#board');
const boardRect = board.getBoundingClientRect();

const registerWorker = async () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./worker.js');
    }
};

class Score {
    constructor(el) {
        this.el = el;
    }

    get tally() {
        return +this.el.textContent;
    }

    set tally(value) {
        this.el.textContent = +value;
    }
}

const score1 = new Score(document.querySelector('.score1'));
const score2 = new Score(document.querySelector('.score2'));

class Ball {
    constructor(el) {
        this.el = el;
        this.reset();
    }

    get x() {
        return parseFloat(getComputedStyle(this.el).getPropertyValue('--x'));
    }

    get y() {
        return parseFloat(getComputedStyle(this.el).getPropertyValue('--y'));
    }

    set x(value) {
        this.el.style.setProperty('--x', +value);
    }

    set y(value) {
        this.el.style.setProperty('--y', +value);
    }

    rect() {
        return this.el.getBoundingClientRect();
    }

    reset() {
        this.speed = MOVEMENT_SPEED;
        this.x = INIT_X;
        this.y = INIT_Y;
        this.direction = { x: 0, y: 0 };

        while (
            Math.abs(this.direction.x) <= 0.3 ||
            Math.abs(this.direction.y) >= 0.7
        ) {
            const heading = randomNumberBetween(0, 2 * Math.PI);
            this.direction = {
                x: Math.cos(heading),
                y: Math.sin(heading),
            };
        }

        this.velocity = INIT_VELOCITY;
    }

    update(delta, platforms) {
        this.x += this.direction.x * this.velocity * delta;
        this.y += this.direction.y * this.velocity * delta;
        if (this.velocity < MAX_VELOCITY) {
            this.velocity += VELOCITY_INCREASE;
            this.speed += VELOCITY_INCREASE;
        }

        if (
            this.rect().bottom >= boardRect.bottom - OFFSET ||
            this.rect().top <= boardRect.top + OFFSET
        ) {
            this.direction.y *= -1;
        }

        if (
            this.rect().left <= boardRect.left + OFFSET ||
            this.rect().right >= boardRect.right - OFFSET
        ) {
            this.direction.x *= -1;
            console.log('fuck you');
            console.log(
                'Ball:',
                this.rect().x,
                'Platform:',
                platforms[0].rect().left
            );
        }

        if (
            platforms.some((r) => {
                if (isCollision(r, this.rect())) {
                    console.log(r.el.classList.contains('left'));
                }
                return isCollision(r.rect(), this.rect());
            })
        ) {
            this.direction.x *= -1;
        }

        if (isLose1(platform1.rect(), this.rect())) {
            score2.tally++;
            this.reset();
        }

        if (isLose2(platform2.rect(), this.rect())) {
            score1.tally++;
            this.reset();
        }
    }
}

class Platform {
    constructor(el) {
        this.el = el;
        this.reset();
    }

    rect() {
        return this.el.getBoundingClientRect();
    }

    get position() {
        return parseFloat(
            getComputedStyle(this.el).getPropertyValue('--position')
        );
    }

    set position(value) {
        this.el.style.setProperty('--position', +value);
    }

    update(delta, ball) {
        if (ball < 0 + OFFSET * 3) return;

        const c = 0.915;
        this.position = ball * (randomNumberBetween(0, 1) === 0 ? -c : c);
    }

    reset() {
        this.position = 50;
    }
}

const platform1 = new Platform(document.querySelector('.platform.left'));
const platform2 = new Platform(document.querySelector('.platform.right'));

const ball = new Ball(document.querySelector('.ball'));

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'arrowdown' || e.key.toLowerCase() === 's') {
        if (boardRect.bottom < platform1.rect().bottom + OFFSET * 3) return;
        platform1.position += 1.5;
    } else if (
        e.key.toLowerCase() === 'arrowup' ||
        e.key.toLowerCase() === 'w'
    ) {
        if (boardRect.top > platform1.rect().top - OFFSET * 3) {
            return;
        }

        platform1.position -= 1.5;
    }
});

let lastTime;
function update(time) {
    if (lastTime != null) {
        const delta = time - lastTime;
        ball.update(delta, [platform1, platform2]);
        platform2.update(delta, ball.y);
    }

    lastTime = time;
    requestAnimationFrame(update);
}
requestAnimationFrame(update);

function randomNumberBetween(a, b) {
    return Math.ceil(Math.random() * (b - a)) + a;
}

function isCollision(r1, r2) {
    return (
        r1.left <= r2.right &&
        r1.right >= r2.left &&
        r1.top <= r2.bottom &&
        r1.bottom >= r2.top
    );
}

function isLose1(platformRect, ballRect) {
    return ballRect.x < platformRect.left;
}

function isLose2(platformRect, ballRect) {
    return ballRect.right > platformRect.right;
}
