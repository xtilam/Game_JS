var config = {
    speed: 53,
    preyColor: 'red',
    snakeColor: 'green',
    screenWidth: 30,
    screenHeight: 30,
    lengthOfSnake: 5,
    DOMInitScreen: document
}

var screen = {
    findScreen: function () { return (this.screen = document.querySelector('#screen')) },
    setSize: function (width, height) {
        this.width = width;
        this.height = height;
        this.screen.innerHTML = '';
        for (let y = 0; y < height; ++y) {
            let yDOM = document.createElement('tr');
            this.screen.append(yDOM);
            for (let x = 0; x < width; ++x) {
                yDOM.append(document.createElement('td'));
            }
        }
    },
    draw: function (maps, color) {
        let parent = this;
        maps.forEach(pos => {
            // console.log('tr:nth-child(' + (pos.y + 1) + ') > td:nth-child(' + (pos.x + 1) + ')');
            let posDOM = this.screen.querySelector('tr:nth-child(' + (pos.y + 1) + ') > td:nth-child(' + (pos.x + 1) + ')');
            posDOM.style.backgroundColor = color;
        })
    },
    refresh: function () {
        this.screen.querySelectorAll('td').forEach(pixelDOM => {
            pixelDOM.setAttribute('style', '')
        })
    },
    delete: function (pos) {
        let posDOM = this.screen.querySelector('tr:nth-child(' + (pos.y + 1) + ') > td:nth-child(' + (pos.x + 1) + ')');
        posDOM.setAttribute('style', '');
    }
}
var move = {
    init: function (parentDOM) {
        let move = this;

        parentDOM.addEventListener('keydown', function (evt) {

            switch (evt.code) {
                case 'ArrowDown':
                    key = { key: 'down' }; break;
                case 'ArrowUp':
                    key = { key: 'up' }; break;
                case 'ArrowLeft':
                    key = { key: 'left' }; break;
                case 'ArrowRight':
                    key = { key: 'right' }; break;
                default:
                    key = undefined;
            }

            if (key) {
                move.events.forEach(method => {
                    method(key);
                });
            }
        })
    },

    addEventListener: function (evt) {
        if (!Array.isArray(this.events)) { this.events = [] }
        if (typeof evt === 'function') {
            this.events.push(evt);
            return true;
        }
        return false;
    },

    removeAllEvent() {
        this.events = [];
    }
}
var snake = {
    init: function (screen, width, color) {
        this.screen = screen;
        this.color = color ? color : 'green';
        this.width = (width = Number.parseInt(width)) > 0 ? width : 3;

        this.x = parseInt(screen.width / 2);
        this.y = parseInt(screen.height / 2 - width / 2);
        this.direction = [];
        console.debug(this.x, this.y)

        this.dots = [];
        this.preys = [];

        //init preys
        let count = 0;
        for (let y = 0; y < this.screen.height; ++y) {
            let cross = this.screen.width * y;
            for (let x = 0; x < this.screen.width; ++x) {
                this.preys[count++] = cross + x;
            }
        }
        delete count;

        //draw snake center screen
        for (let i = 0; i < width; ++i) {
            let x = this.x;
            let y = this.y + i;
            this.dots.push({ x: x, y: y });
            this.removePosPrey({ x: x, y: y });
        }

        this.drawAll();

        this.newPrey();

        this.scoreDOM = document.querySelector('#score');

        this.score = 0;
    },
    drawAll: function (pos) {
        this.screen.refresh();
        this.screen.draw(this.dots, this.color);
    },
    start: function () {
        this.stop();
        this.init(this.screen, this.width, this.color);
        let parent = this;

        let sendKey = function (evt) {
            if (moveEqual[parent.direction[parent.direction.length - 1]] != moveEqual[evt.key] && parent.direction.length <= 3) {
                parent.direction.push(evt.key);
            }
        }


        let moveEqual = { left: 1, right: 1, up: 0, down: 0 };

        let snakeMove = function () {
            let topDot = parent.dots[0];
            if (parent.direction.length > 1) {
                parent.direction.shift();
            }
            switch (parent.direction[0]) {
                case 'up':
                    topDot = ({ x: topDot.x, y: topDot.y - 1 }); break;
                case 'right':
                    topDot = ({ x: topDot.x + 1, y: topDot.y }); break;
                case 'down':
                    topDot = ({ x: topDot.x, y: topDot.y + 1 }); break;
                case 'left':
                    topDot = ({ x: topDot.x - 1, y: topDot.y }); break;
                default:
                    return;
            }
            let wall = topDot.x >= parent.screen.width ? 2 : topDot.x < 0 ? 4 : topDot.y >= parent.screen.height ? 3 : topDot.y < 0 ? 1 : undefined;
            
            if(wall){
                switch (wall){
                    case 1: topDot.y = parent.screen.height - 1; break;
                    case 2: topDot.x = 0; break;
                    case 3: topDot.y = 0; break;
                    case 4: topDot.x = parent.screen.width - 1; break;
                }
            }
            let isBiteYourself = parent.dots.find((dot) => {
                if (dot.x === topDot.x && dot.y === topDot.y) { return true; };
            });
            if (!isBiteYourself) {
                parent.dots.unshift(topDot);
                parent.screen.draw([parent.dots[0]], parent.color);
                parent.removePosPrey(topDot);
                if (parent.prey.x == topDot.x && parent.prey.y == topDot.y) {
                    parent.newPrey();
                    ++parent.score;
                    parent.scoreDOM.innerHTML = parent.score;
                } else {
                    let pos = parent.dots.pop();
                    parent.screen.delete(pos);
                    let value = pos.x + pos.y * parent.screen.width;
                    parent.preys.push(value);
                }
            } else {
                alert('Your score: ' + parent.score + (parent.preys.length == 0 ? ' (highest score)!!' : ''));
                parent.lostGame();
            }
        };

        move.removeAllEvent();
        move.addEventListener(evt => {
            if (evt.key != 'down') {
                move.removeAllEvent();
                console.log(event.move);
                this.direction = [evt.key];
                move.addEventListener(sendKey);
                console.log(event.move);
                parent.game = setInterval(snakeMove, config.speed);
                console.log(parent.game);
            }
        })
    },
    stop: function () {
        clearInterval(this.game);
    },
    newPrey: function () {
        let pos = this.preys[parseInt(Math.random() * this.preys.length)];
        this.prey = {};
        this.prey.y = parseInt(pos / this.screen.width);
        this.prey.x = pos - this.prey.y * this.screen.width
        // console.debug(this.prey,pos, this.preys);
        this.screen.draw([this.prey], config.preyColor);
    },
    removePosPrey: function (pos) {
        let value = pos.x + this.screen.width * pos.y;
        let index = this.preys.findIndex((x) => { return x == value });
        // console.debug(value, pos, this.screen.width, this.screen.height, index ,this.preys[index], '=')
        this.preys.splice(index, 1);
    },
    lostGame: function () {
        this.stop();
        move.removeAllEvent();
    }
}

move.init(config.DOMInitScreen)
screen.findScreen();
screen.setSize(config.screenWidth, config.screenHeight);
snake.init(screen, config.lengthOfSnake, config.snakeColor);
snake.start()
