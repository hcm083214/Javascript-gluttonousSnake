const snake = (function () {
    let snake;
    let egg;
    let rate = 30;//表示分成多少格子
    let isEnd = false;
    let timer;
    let App;
    let snakeSpeed = 1;

    function snakeConfig(width, height) {
        // 蛇头在第一位，后面的是蛇身,初始化设置
        const snakeInit = [{ left: 2, top: 0, width: 1, height: 1 },
        { left: 1, top: 0, width: 1, height: 1 },
        { left: 0, top: 0, width: 1, height: 1 }];
        snake = snakeInit.map(item => {
            return {
                left: item.left * width,
                top: item.top * height,
                width: item.width * width,
                height: item.height * height,
            }
        })
    }
    function getRandom(rate) {
        return Math.floor(Math.random() * rate)
    }
    function eggConfig({ rate, width, height }) {
        let eggInit = { left: getRandom(rate), top: getRandom(rate), width: 1, height: 1 }
        width = Math.floor(width / rate);
        height = Math.floor(height / rate);
        egg = {
            left: eggInit.left * width,
            top: eggInit.top * height,
            width: eggInit.width * width,
            height: eggInit.height * height,
        }
    }
    /**
     * @description: 根据游戏的宽高和格子数设置蛇和蛋的宽高定位的尺寸
     * @param {*} rate 背景大小的格子数
     * @param {*} width 背景的宽
     * @param {*} height 背景高
     * @return {*}
     */
    function appConfig({ rate, width, height }) {
        let widthAct = Math.floor(width / rate);
        let heightAct = Math.floor(height / rate);
        snakeConfig(widthAct, heightAct);
        eggConfig({ rate, width, height });
    }


    function snakeTemplateCreate(direction) {
        let template = '', transformDeg = 0;
        switch (direction) {
            case 'right':
                transformDeg = 0
                break;
            case 'down':
                transformDeg = 90
                break;
            case 'left':
                transformDeg = 180
                break;
            case 'up':
                transformDeg = -90
                break;
        }
        template = snake.reduce((prev, next, currentIndex) => {
            if (currentIndex === 0) {
                template = prev + `<div class="snake-head snake" 
            style="left:${next.left}px;top:${next.top}px;border-width:${next.width / 2}px;transform: rotate(${transformDeg}deg);"></div>
            `
            } else {
                template = prev + `<div class="snake-body snake" 
            style="left:${next.left}px;top:${next.top}px;width:${next.width}px;height:${next.height}px;transform: rotate(${transformDeg}deg);"></div>`
            }
            return template
        }, '');
        return template;
    }
    function eggDomCreate() {
        const div = document.createElement('div');
        div.innerHTML = `<div class ='egg' style="left:${egg.left}px;top:${egg.top}px;width:${egg.width}px;height:${egg.height}px">`;
        return div.children[0];
    }
    /**
     * @description: 创建 DOM
     * @param {*} app DOM 插入的位置
     * @param {*} snake snake 的数据
     * @param {*} egg egg 的数据
     * @return {*}
     */
    function render(app, direction = 'right') {
        const snakeTemplate = snakeTemplateCreate(direction);
        const eggDom = eggDomCreate();
        app.innerHTML = snakeTemplate;
        app.appendChild(eggDom);
    }

    function snakeEatEgg(xDistance, yDistance) {//在蛇尾部生成一个位置
        let lens = snake.length, finallySnakes;
        const prev = snake[lens - 2];//蛇尾部倒数第二个
        const next = snake[lens - 1];//蛇尾部倒数第一个
        if (prev.top === next.top && prev.left < next.left) {//向左运动
            finallySnakes = { ...next, left: next.left + xDistance }
        } else if (prev.top === next.top && prev.left > next.left) {//向右运动
            finallySnakes = { ...next, left: next.left - xDistance }
        } else if (prev.left === next.left && prev.top > next.top) {//向下运动
            finallySnakes = { ...next, top: next.top - yDistance }
        } else {//向上运动
            finallySnakes = { ...next, top: next.top + yDistance }
        }
        snake.push(finallySnakes);
    }

    /**
     * @description: 判断蛇是否吃到蛋
     * @return {boolean}
     */
    function isArriveEgg() {
        let isArrive = false;
        if (snake[0].left === egg.left && snake[0].top === egg.top) isArrive = true;
        return isArrive
    }
    function isArriveWall(config) {
        // 判断是否撞墙
        if (snake[0].left >= config.width ||
            snake[0].top >= config.height ||
            snake[0].left < 0 ||
            snake[0].top < 0) isEnd = true;
        // 判断是否撞自己
        for (let i = 1; i < snake.length; i++) {
            if (snake[0].left == snake[i].left && snake[0].top == snake[i].top) {
                isEnd = true;
                break;
            }
        }
        return isEnd;
    }
    /**
     * @description: 定义蛇头下一步移动的位置，同时判断是否吃到蛋或者是否撞墙
     * @param {*} xDistance 移动的距离
     * @param {*} direction 移动的方向
     * @return {*}
     */
    function move(config, direction) {
        let snakeHead;
        let xDistance = config.width / config.rate;
        let yDistance = config.height / config.rate;
        if (direction === 'right') {
            snakeHead = { ...snake[0], left: snake[0].left + xDistance, }
        } else if (direction === 'left') {
            snakeHead = { ...snake[0], left: snake[0].left - xDistance, }
        } else if (direction === 'up') {
            snakeHead = { ...snake[0], top: snake[0].top - yDistance, }
        } else if (direction === 'down') {
            snakeHead = { ...snake[0], top: snake[0].top + yDistance, }
        }
        snake.unshift(snakeHead);
        snake.pop();
        // 蛇吃蛋判断
        if (isArriveEgg()) {
            snakeEatEgg(xDistance, yDistance);
            eggConfig(config);
        }
    }

    function autoMove(config, direction) {
        timer = setInterval(() => {
            move(config, direction);
            // 判断是否撞墙
            if (isArriveWall(config)) {
                endGame();
                return
            }
            render(app, direction);
        }, Math.floor(1000 / snakeSpeed));
    }

    function endGameDomCreate() {
        const div = document.createElement('div');
        div.innerHTML = `<div class="cover">
        <div class="content">游戏结束，得分${snake.length - 3}</div>
    </div>`;
        return div.children[0];
    }
    function endGame() {
        timer && clearInterval(timer);
        const endGameDom = endGameDomCreate();
        App.parentNode.appendChild(endGameDom);
        endGameDom.addEventListener('click', () => {
            App.parentNode.removeChild(endGameDom);
            init(App, rate,snakeSpeed);
            isEnd = false;
        });
    }

    /**
     * @description: 通过键盘点击决定蛇移动的方向
     * @param {*} snake
     * @param {*} egg
     * @param {*} config
     * @return {*}
     */
    function initEvent(config) {    
        let direction ;
        document.addEventListener('keydown', (e) => {
            if ((e.key === "ArrowUp" || e.key.toLocaleLowerCase() === "w")) {
                direction != 'down' && (direction = 'up');
            } else if ((e.key === "ArrowDown" || e.key.toLocaleLowerCase() === "s")) {
                direction != 'up' && (direction = 'down');
            } else if ((e.key === "ArrowRight" || e.key.toLocaleLowerCase() === "d")) {
                direction != 'left' && (direction = 'right');
            } else if ((e.key === "ArrowLeft" || e.key.toLocaleLowerCase() === "a")) {
                direction != 'right' && (direction = 'left');
            }
            if (!direction || isEnd) return
            timer && clearInterval(timer);
            autoMove(config, direction);
        })

    }

    function init(app, dot = 30, speed = 1) {
        App = app;
        const { width, height } = app.getBoundingClientRect();
        dot && (rate = dot);
        speed && (snakeSpeed = speed);
        const config = { rate, width, height }// config 保存格子数和蛇能够移动长宽的范围
        appConfig(config);
        render(app);
        initEvent(config);
    }
    return init;
})();