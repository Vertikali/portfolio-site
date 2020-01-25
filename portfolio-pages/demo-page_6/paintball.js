var canvas = document.getElementById('canvas');	//получение ссылки на холст
var ctx = canvas.getContext("2d");	// возвращает контекст рисования на холсте
////////////////////////////////////////////////////////////////
// АКТИВЫ

var assets = [];
assets[0] = // тропический лес
{
    scene: [67,154,35],
    ball:
    {
        carcass: 0,                                                         // номер слоя для в физич. модели
        color: [200, 0, 0],                                                 // основной цвет rgb
        layers: [[10, 15, 20, -200], [ -2, -2, -3, 0], [ -7, -7, -15, 200]] // слои для физич. и визуаль. моделей
    },
    paddle: [[-270, 0, 10, 50], [25, 50, 100], [200, -110, -250, 120], 3, 'right'],
    blocks:
    {
        map: [[-288, -75, 15, 280], [-215, -5, 10, 110], [-60, -175, 15, 60], [-30, 190, 20, 30], [-20, 0, 15, 100], [100, 140, 20, 150], [150, -145, 10, 130], [240, 65, 15, 280]], // карта расположения блоков
        common: [[154,154,35], [-110, -110, -255, -110], 3]                                          // общие параметры блоков
    },
    hole: [[250, -120, 50, 50], [10, 10, 10], [-250, 120, 200, -110], 3]
};

assets[1] = // кратер вулкана
{
    scene: [255,181,0],
    ball:
    {
        carcass: 0,                                                         // номер слоя для в физич. модели
        color: [173,6,0],                                                 // основной цвет rgb
        layers: [[10, 15, 20, -200], [ 2, 2, -3, 0], [ 7, 7, -15, 200]] // слои для физич. и визуаль. моделей
    },
    paddle: [[0, 170, 50, 10], [25, 50, 100], [-250, 120, 200, -110], 3, 'up'],
    blocks:
    {
        map: [[-290, -10, 50, 400], [-240, -10, 40, 200], [17, -190, 185, 30], [80, -50, 50, 50], [117, 90, 75, 30], [257, -15, 15, 180], [290, -15, 50, 380]], // карта расположения блоков
        common: [[119,0,0], [-200, 50, 200, -100], 5]                                          // общие параметры блоков
    },
    hole: [[-235, -170, 50, 50], [25, 50, 100], [-110, -110, -250, -90], 3]
};

assets[2] = // дно океана
{
    scene: [0,183,177],
    ball:
    {
        carcass: 0,                                                         // номер слоя для в физич. модели
        color: [49,0,0],                                                 // основной цвет rgb
        layers: [[10, 15, 20, -80], [ -1, -2, -2, 0], [ -1, -5, -8, 20]] // слои для физич. и визуаль. моделей
    },
    paddle: [[0, -170, 50, 10], [25, 50, 100], [200, -110, -250, 120], 3, 'down'],
    blocks:
    {
        map: [[-270, 115, 90, 130], [0, 195, 610, 30], [-110, -20, 100, 30], [-30, -30, 50, 40], [100, 15, 130, 30], [-70, 85, 180, 70], [95, 105, 150, 50], [270, 15, 70, 90], [250, 120, 150, 120]], // карта расположения блоков
        common: [[0,97,64], [200, -100, -200, 50], 5]                                          // общие параметры блоков
    },
    hole: [[150, 155, 50, 50], [255,228,0], [-511, -511, -511, -511], 5]
};

assets[3] = // льды арктики
{
    scene: [230,230,230],
    ball:
    {
        carcass: 0,                                                         // номер слоя для в физич. модели
        color: [200, 0, 0],                                                 // основной цвет rgb
        layers: [[10, 15, 20, -200], [ -2, -2, -3, 0], [ -7, -7, -15, 200]] // слои для физич. и визуаль. моделей
    },
    paddle: [[270, 0, 10, 50], [25, 50, 100], [200, -110, -250, 120], 3, 'left'],
    blocks:
    {
        map: [[-90, 0, 55, 45], [-30, -160, 65, 45], [170, 170, 65, 45], [-230, 30, 55, 55], [-120, 170, 65, 45], [80, -150, 85, 45], [-200, -120, 45, 85], [0, 110, 85, 85]], // карта расположения блоков
        common: [[250,250,250], [200, -110, -250, 120], 3]                                          // общие параметры блоков
    },
    hole: [[-150, 0, 50, 50], [10, 10, 10], [-250, 120, 200, -110], 3]
};
////////////////////////////////////////////////////////////////
// ИГРОВОЙ ЦИКЛ

// общие переменные:
var assetNumber = 0;            // номер актива
var attemptCounter = 0;         // счётчик попыток
var victoryCounter = 0;         // счётчик побед
var gameStatus = 'start';       // статус игры: 'menu', 'start', 'play', 'stop', 'exit'
var episodeStatus = 'absent';   // статус эпизода: 'play', 'victory', 'stop'
var episode;                    // ссылка на эпизод игры
var nextEpisode = false;        // переключить ли на следующий эпизод
var timerId;                    // ссылка на таймер игры

var cam = new Camera(600, 400);
cam.calculateScreensDifference();
var menu = new Menu();
var drawFrame = Main;
timerId = setInterval(drawFrame, 1000/30);	// смена кадров
////////////////////////////////////////////////////////////////
// ГЛАВНАЯ ФУНКЦИЯ

function Main()
{
    switch(gameStatus)
    {
        case 'menu':
            menu.showResult();
            setTimeout(menu.buttonTranslationon, 600);
            menu.executeSelectedon();
        break;
        case 'start':
            episode = new Scene(cam, assets[assetNumber].scene, assets[assetNumber].ball, assets[assetNumber].paddle, assets[assetNumber].blocks, assets[assetNumber].hole);	// создать сцену эпизода
            gameStatus = 'play';   // играть
            attemptCounter++; // ещё попытка
        break;
        case 'play':
            var episodeStatus = episode.play();
            switch(episodeStatus)
            {
                case 'play': gameStatus = 'play'; break;
                case 'victory': victoryCounter++; gameStatus = 'stop'; nextEpisode = true; break;
                case 'stop': gameStatus = 'stop'; nextEpisode = false; break;
                default: console.log('Error. Episode status not defined');
            }
        break;
        case 'stop':
            delete episode; // удалить уровень
            gameStatus = 'menu';
        break;
        case 'exit':
            clearInterval(timerId); // оставновить всю игру
            menu.showEnd();
        break;
        default: console.log('Error. Game status not defined');
    }
}
////////////////////////////////////////////////////////////////
// ОБЩИЕ БЛОКИ УПРАВЛЕНИЯ ИГРЫ



// меню игры
function Menu()
{
    var menuCommands = 'withhold'; // команды в меню: 'withhold', 'repeat', 'next', 'exit'

    function draw()			    // объявление функции рисования фона меню
    {
        ctx.beginPath();        // закрашивание фона
        ctx.rect(cam.convertX(-200), cam.convertY(-100), cam.convert(400), cam.convert(200));
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();        // рисование рамки фона
        ctx.rect(cam.convertX(-200), cam.convertY(-100), cam.convert(400), cam.convert(200));
        ctx.strokeStyle = '#c7c5c5';
        ctx.stroke();
        ctx.closePath();
    }

    this.showResult = function()   // показать результат
    {
        draw();
        
        ctx.fillStyle = "#00F";
        ctx.font = "italic 16pt Arial";
        ctx.fillText("эпизод / кол-во эпизодов:", cam.convertX(-160), cam.convertY(-55));
        ctx.fillText("побед / попыток:", cam.convertX(-160), cam.convertY(-25));

        ctx.fillStyle = "#ff0000";
        ctx.font = "16pt Arial";
        ctx.fillText((assetNumber+1)+"/"+assets.length, cam.convertX(110), cam.convertY(-55));
        ctx.fillText(victoryCounter+"/"+attemptCounter, cam.convertX(110), cam.convertY(-25));

        ctx.fillStyle = "#333333";
        ctx.font = "20pt Arial";
        ctx.fillText("◄  повтор", cam.convertX(-170), cam.convertY(20));
        ctx.fillText("выход Esc", cam.convertX(-70), cam.convertY(60));

        if(nextEpisode == false)
        {
            ctx.fillStyle = "#c7c5c5";
            ctx.font = "20pt Arial";
            ctx.fillText("следующий  ►", cam.convertX(-14), cam.convertY(20));
        }
        else
        {
            if(assetNumber+1<assets.length)
            {
                ctx.fillStyle = "#333333";
                ctx.font = "20pt Arial";
                ctx.fillText("следующий  ►", cam.convertX(-14), cam.convertY(20));
            }
            else
            {
                ctx.fillStyle = "#ffd303";
                ctx.font = "bold italic 21pt Arial";
                ctx.fillText("вы выиграли", cam.convertX(-16), cam.convertY(20));
                ctx.strokeStyle = "#ff0000";
                ctx.font = "bold italic 21pt Arial";
                ctx.strokeText("вы выиграли", cam.convertX(-16), cam.convertY(20));
            }
        }

    };

    this.buttonTranslationon = function()// перевод кнопок
    {
        if((buttons.left && buttons.right && buttons.esc) || (!buttons.left && !buttons.right && !buttons.esc)){ menuCommands = 'withhold'; }
        if(buttons.left && !buttons.right && !buttons.esc){ menuCommands = 'repeat'; }
        if(!buttons.left && buttons.right && !buttons.esc){ menuCommands = 'next'; }
        if(!buttons.left && !buttons.right && buttons.esc){ menuCommands = 'exit'; }
    };

    this.executeSelectedon = function() // исполнить выбранное
    {
        switch(menuCommands)
        {
            case 'repeat': gameStatus = 'start'; break;
            case 'next':
                if(assetNumber+1<assets.length)
                {
                    if(nextEpisode==true)
                    {
                        assetNumber++;
                        gameStatus = 'start';
                    }
                }
                else
                { console.log('All episodes completed'); }  // все эпизоды завершены
            break;
            case 'withhold': gameStatus = 'menu'; break;
            case 'exit': gameStatus = 'exit'; break;
        }
    };

    this.showEnd = function()
    {
        draw();
            ctx.fillStyle = '#000';
            ctx.font = "bold 50pt Arial";
            ctx.fillText("конец", cam.convertX(-95), cam.convertY(15));
    };
}

// инициализация сцены игры
function Scene(cam, fond, b, p, m, h)
{
    var status = 'play'; // статус эпизода: 'play', 'victory', 'stop'
    this.ball = initializationBall(b);
    this.paddle = initializationPaddle(p[0], p[1], p[2], p[3], p[4]);
    this.blocks = initializationBlocks(m);
    this.hole = initializationHole(h[0], h[1], h[2], h[3]);
    this.controllerPaddle = new initializationControllerPaddle();
    this.fond = fond;

    this.play = function()			// объявление функции рисования кадра
    {
        var result = simulatePhysicsAll(cam, this.controllerPaddle, this.ball, this.paddle, this.blocks, this.hole);
        rendering(cam, this.fond, this.ball, this.paddle, this.blocks, this.hole);
        if(result==='in_hole') status = 'victory';
        if(result==='off_screen') status = 'stop';
        if(buttons.esc===true) status = 'stop';
        return status;
    };
}
////////////////////////////////////////////////////////////////
// ИНИЦИАЛИЗАЦИЯ ПРЕДМЕТОВ СЦЕНЫ

function initializationBall(mod)  // начальные параметры мяча
{
    var bls = new Circle(mod.carcass, mod.color, mod.layers);
    bls.speedX = 0;                                 // скорость перемещения по горизонтали
    bls.speedY = 0;                                 // скорость перемещения по вертикали
    bls.colWalls = collisionWalls;                  // привязка столкновения со стенками экрана
    bls.move = movement;                            // привязка перемещения мяча
    bls.colBlock = collisionBlock;                  // привязка столкновения с блоками
    bls.wearOnPad = wearOnPaddle;                   // привязка перемещения мяча на заслонке
    bls.throwFromPad = throwFromPaddle;             // привязка броска мяча с заслонки
    bls.checkHol = checkHole;                       // привязка проверки попадания мяча в лунку
    bls.mode = 'start';                             // назначения режима Старт
    return bls;
}

function initializationPaddle(pos, c, f, i, v)  // начальные параметры заслонки
{
    var padPosX = pos[0];	                        // позиция заслонки по горизонтали
    var padPosY = pos[1];	                        // позиция заслонки по вертикали
    var padWidth = pos[2];				            // заслонка по ширине
    var padHeight = pos[3];				            // заслонка по высоте


    var pad = new Rectangle(padPosX, padPosY, padWidth, padHeight, c, f, i);
    pad.vector = v;  					        // сторона заслонки для появления мяча
    pad.speedX = 0;				                // скорость перемещения по горизонтали
    pad.speedY = 0;				                // скорость перемещения по вертикали
    pad.colWalls = collisionWalls;              // привязка столкновения со стенами экрана
    pad.move = movement;                        // првязка перемещения заслонки
    pad.colBlock = collisionBlock;              // привязка столкновения с блоками
    return pad;
}

function initializationBlocks(blocks)        // начальные параметры блоков
{
    var blks = [];
    for(var i=0; i<blocks.map.length; i++)
    {
        blks[i] = new Rectangle(blocks.map[i][0], blocks.map[i][1], blocks.map[i][2], blocks.map[i][3], blocks.common[0], blocks.common[1], blocks.common[2]);
    }
    return blks;
}

function initializationHole(pos, c, f, i)  // начальные параметры заслонки
{
    var padPosX = pos[0];	                        // позиция заслонки по горизонтали
    var padPosY = pos[1];	                        // позиция заслонки по вертикали
    var padWidth = pos[2];				            // заслонка по ширине
    var padHeight = pos[3];				            // заслонка по высоте

    var ho = new Rectangle(padPosX, padPosY, padWidth, padHeight, c, f, i);
    return ho;
}

function initializationControllerPaddle()  // начальные параметры контроллера заслонки
{
    this.confirmationX = false;
    this.confirmationY = false;

    this.checkDirectionButtons = function(buttons, p, speed)	// проверить кнопки направления
    {
        if((buttons.left && buttons.right) || (!buttons.left && !buttons.right)){ p.speedX = 0; }
        if(buttons.left && !buttons.right){ p.speedX = (speed * -1); }
        if(!buttons.left && buttons.right){ p.speedX = Math.abs(speed); }

        if((buttons.up && buttons.down) || (!buttons.up && !buttons.down)){ p.speedY = 0; }
        if(buttons.up && !buttons.down){ p.speedY = (speed * -1); }
        if(!buttons.up && buttons.down){ p.speedY = Math.abs(speed); }
    };

    this.assignDirections = function(p) // назначить направление
    {
        if((p.vector==='up') || (p.vector==='down'))
        {
            this.confirmationX = true;
            this.confirmationY = false;
        }

        if((p.vector==='left') || (p.vector==='right'))
        {
            this.confirmationX = false;
            this.confirmationY = true;
        }
        if(p.vector==='all')
        {
            this.confirmationX = true;
            this.confirmationY = true;
        }
        if(p.vector==='nowhere')
        {
            this.confirmationX = false;
            this.confirmationY = false;
        }
    };
}
////////////////////////////////////////////////////////////////
// ОБЩИЕ БЛОКИ ЭПИЗОДА

function simulatePhysicsAll(cam, controllerPaddle, ball, paddle, blocks, hole)  // симулировать физику всех
{
    var result;
    controllerPaddle.checkDirectionButtons(buttons, paddle, 15);
    controllerPaddle.assignDirections(paddle);
    simulatePhysicsPaddle(cam, paddle, blocks, controllerPaddle);
    result = controllerBall(cam, ball, 11, paddle, blocks, hole);
    return result;
}

function controllerBall(cam, bl, speed, pa, blks, h)     // контроллер мяча
{
    var result = 'on_screen';
    switch(bl.mode)
    {
        case 'start':           // start - старт игры
            setBall(bl);
            bl.mode = 'on_paddle';
        break;
        case 'on_paddle':       // on_paddle - на заслонке
            pa.findPosContour();
            bl.wearOnPad(pa);
        if(buttons.space === true) bl.mode = 'throw';
        break;
        case 'throw':           // throw - бросок
            bl.throwFromPad(pa, speed);
            bl.mode = 'free_movement';
        break;
        case 'free_movement':   // free_movement - свободное движение
            var res = simulatePhysicsBall(cam, bl, pa, blks);
            if(res==true) result = 'off_screen';    // проверка вылета мяча за экран
            h.findPosContour();
            if(bl.checkHol(h)===true) bl.mode = 'in_hole';   // проверка попадания мяча в квадратную лунку
        break;
        case 'in_hole':         // in_hole - в лунке
            result = 'in_hole';
        break;
    }
    return result;
}

function simulatePhysicsPaddle(cam, paddle, blks, controller)                    // симулировать физику заслонки
{
    // 'springy'-'пружинящий', 'cling'-'цепляющийся', 'crossing'-'пересекающий'
    paddle.findPosContour();
    var incidentP = paddle.colWalls(cam, 'cling');
    for (var j=0; j<blks.length; j++)
    {
        blks[j].findPosContour();
        paddle.colBlock(blks[j], 'cling');
    }
    paddle.move(controller.confirmationX, controller.confirmationY);
    return incidentP;
}

function simulatePhysicsBall(cam, bl, pa, blks)  // симулировать физику мяча
{
    // 'springy'-'пружинящий', 'cling'-'цепляющийся', 'crossing'-'пересекающий'
    bl.findPosContour();
    var incidentB = bl.colWalls(cam, 'crossing');
    for (var j=0; j<blks.length; j++)
    {
        blks[j].findPosContour();
        bl.colBlock(blks[j], 'springy');
    }
    pa.findPosContour();
    bl.colBlock(pa, 'springy');
    bl.move(true, true);
    return incidentB;
}
////////////////////////////////////////////////////////////////
// УПРАВЛЕНИЕ КЛАВИАТУРОЙ

// передача события "keydown" клавиатуры обработчику keyDownHandler
document.addEventListener("keydown", keyDownHandler, false);

// передача события "keyup" клавиатуры обработчику keyUpHandler
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e)				// обработчик нажатия клавиш
{
    if(e.keyCode === 27) buttons.esc = true;
    if(e.keyCode === 32) buttons.space = true;
    if(e.keyCode === 37) buttons.left = true;
    if(e.keyCode === 38) buttons.up = true;
    if(e.keyCode === 39) buttons.right = true;
    if(e.keyCode === 40) buttons.down = true;
}

function keyUpHandler(e)				// обработчик отпускания клавиш
{
    if(e.keyCode === 27) buttons.esc = false;
    if(e.keyCode === 32) buttons.space = false;
    if(e.keyCode === 37) buttons.left = false;
    if(e.keyCode === 38) buttons.up = false;
    if(e.keyCode === 39) buttons.right = false;
    if(e.keyCode === 40) buttons.down = false;
}

// начальные параметры не нажатых клавиш
var buttons = 
{
    esc: false,             // сбежать
    space: false,           // пробел
    left: false,            // влево
    up: false,              // вверх
    right: false,           // вправо
    down: false             // вниз
};
//////////////////////////////////////////////////////////////////
// ЛОГИКА

function setBall(b) // установить мяч
{
    b.buildByModel();
}

function wearOnPaddle(p)	// перенос заслонкой мяча
{
    switch(p.vector)	// выбор расположения относительно заслонки
    {
        case 'left':
            this.posX = p.left - this.radius;
            this.posY = p.up + ((p.down - p.up) / 2);
        break;
        case 'right':
            this.posX = p.right + this.radius;
            this.posY = p.up + ((p.down - p.up) / 2);
        break;
        case 'up':
            this.posX = p.left + ((p.right - p.left) / 2);
            this.posY = p.up - this.radius;
        break;
        case 'down':
            this.posX = p.left + ((p.right - p.left) / 2);
            this.posY = p.down + this.radius;
        break;
        case 'all':
            this.posX = p.left + ((p.right - p.left) / 2);
            this.posY = p.up + ((p.down - p.up) / 2);
        break;
    }
}

function throwFromPaddle(p, speed) // бросок мяча с заслонки
{
    switch(p.vector)	// выбор расположения относительно заслонки
    {
        case 'left':
            this.speedX = speed * -1;
            this.speedY = p.speedY;
        break;
        case 'right':
            this.speedX = Math.abs(speed);
            this.speedY = p.speedY;
        break;
        case 'up':
            this.speedX = p.speedX;
            this.speedY = speed * -1;
        break;
        case 'down':
            this.speedX = p.speedX;
            this.speedY = Math.abs(speed);
        break;
        case 'all':
            this.speedX = p.speedX;
            this.speedY = p.speedY;
        break;
    }
}

function checkHole(h)	// проверка попадания мяча в квадратную лунку
{
    // проверка по горизонтали
    if((h.left < this.posX) && (this.posX < h.right))
    {
        // проверка по вертикали
        if((h.up < this.posY) && (this.posY < h.down)) return true;
    }
    else return false;
}
//////////////////////////////////////////////////////////////////
// ФИЗИКА

function movement(confirmationX, confirmationY) // объявление функции движения и остановки
{
    if(confirmationX) this.posX += this.speedX;
    if(confirmationY) this.posY += this.speedY;
}

function collisionBlock(rect, dir)   // функция столкновения мяча (заслонки) с блоком
{
    // проверка совпадения низа мяча (заслонки) с верхом блока и верха мяча (заслонки) над блоком
    if((this.down > rect.up) && (this.up < rect.up))
    {
        // проверка по горизонтали совпадения оси мяча (заслонки) с блоком
        if((rect.left < this.posX) && (this.posX < rect.right))
        {
            if(this.speedY === Math.abs(this.speedY)){ this.speedY = toReact(dir, this.speedY, false); return; }
        }
    }
    
    // проверка совпадения верха мяча (заслонки) с низом блока и низа мяча под блоком
    if((this.up < rect.down) && (this.down > rect.down))
    {
        // проверка по горизонтали совпадения оси мяча (заслонки) с блоком
        if((rect.left < this.posX) && (this.posX < rect.right))
        {
            if(this.speedY !== Math.abs(this.speedY)){ this.speedY = toReact(dir, this.speedY, true); return; }
        }
    }
    
    // проверка совпадения правого края мяча (заслонки) с левой стороной блока и левой (заслонки) края мяча левее блока
    if((this.right > rect.left) && (this.left < rect.left))
    {
        // проверка по вертикали совпадения оси мяча (заслонки) с блоком
        if((rect.up < this.posY) && (this.posY < rect.down))
        {
            if(this.speedX === Math.abs(this.speedX)){ this.speedX = toReact(dir, this.speedX, false); return; }
        }
    }
    
    // проверка совпадения левого края мяча (заслонки) с правой стороной блока и правого края мяча (заслонки) правее блока
    if((this.left < rect.right) && (this.right > rect.right))
    {
        // проверка по вертикали совпадения оси мяча (заслонки) с блококом
        if((rect.up < this.posY) && (this.posY < rect.down))
        {
            if(this.speedX!==Math.abs(this.speedX)){ this.speedX = toReact(dir, this.speedX, true); return; }
        }
    }
}

function collisionWalls(cam, direct)   // объявление функции столкновения со стенками
{
    var incident = false;
    if((this.speedX < 0) && (this.left < -cam.axisX))  // левая граница
    { this.speedX = toReact(direct, this.speedX, true); incident = true; }
    
    if((0 < this.speedX) && (cam.axisX < this.right))  // правая граница
    { this.speedX = toReact(direct, this.speedX, false); incident = true; }
    
    if((this.speedY < 0) && (this.up < -cam.axisY))    // верхняя граница
    { this.speedY = toReact(direct, this.speedY, true); incident = true; }
    
    if((0 < this.speedY) && (cam.axisY < this.down))  // нижняя граница
    { this.speedY = toReact(direct, this.speedY, false); incident = true; }
    return incident;
}

function toReact(property, speed, direction)    // реагировать
{
    switch(property)
    {
        case 'springy': // 'пружинящий'
            if(direction) speed = Math.abs(speed);
            else speed = (speed * -1);
        break;
        case 'cling':   // 'цепляющийся'
            speed = 0;
        break;
        case 'crossing':    // 'пересекающий'
            return speed;
    }
    return speed;
}
////////////////////////////////////////////////////////////////
// ОТОБРАЖЕНИЕ

function rendering(cam, fond, ball, paddle, blocks, hole)         // визуализация эпизода игры
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    backgroundCanvas();
    cam.background(fond);
    hole.draw(cam);
    ball.draw(cam);
    draws(cam, blocks);
    paddle.draw(cam);
    showControlButtons();
}

function showControlButtons() // показать в эпизоде игры кнопки управления
{
    ctx.fillStyle = '#000';
    ctx.font = "bold 20pt Arial";
    ctx.strokeStyle = '#fff';
    ctx.fillText("◄   ▲   ▼   ►   пробел   Esc", cam.convertX(-199), cam.convertY(185));
    ctx.strokeText("◄   ▲   ▼   ►   пробел   Esc", cam.convertX(-199), cam.convertY(185));
}

function Camera(width, height)      // камера
{
    this.width =  width;
    this.height = height;
    this.axisX = width/2;
    this.axisY = height/2;
    this.axisCanX = canvas.width/2;
    this.axisCanY = canvas.height/2;
    this.screensDifference = 1;

    this.calculateScreensDifference = function()    // рассчитать разницу экранов
    {
        if((canvas.width/canvas.height)>(this.width/this.height)) this.screensDifference = canvas.height/this.height;
        else this.screensDifference = canvas.width/this.width;
    };

    this.convertX = function(x) { return this.axisCanX + (x * this.screensDifference); };
    this.convertY = function(y) { return this.axisCanY + (y * this.screensDifference); };
    this.convert = function(w) { return w * this.screensDifference; };

    this.background = function(color)               // объявление функции фона игры
    {
        ctx.beginPath();
        ctx.rect(this.axisCanX-(this.axisX * this.screensDifference), this.axisCanY-(this.axisY * this.screensDifference), this.width * this.screensDifference, this.height * this.screensDifference);
        ctx.fillStyle = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
        ctx.fill();
        ctx.closePath();
    };
}

function draws(cam, b)   // рисования массивов фигур
{
    for (var i=0; i<b.length; i++)
    {
        b[i].draw(cam);
    }
}

function backgroundCanvas()				    // объявление функции фона игры
{
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.closePath();
}
//////////////////////////////////////////////////////////////////
// ПРЕДМЕТЫ

function Circle(carcass, color, layers)     // круг
{
    this.posX = 0;                  // позиция по горизонтали
    this.posY = 0;                  // позиция по вертикали
    this.radius = 0;                // радиус круга
    this.left = 0;                  // левый край
    this.right = 0;                 // правый край
    this.up = 0;                    // верхний край
    this.down = 0;                  // нижний край
    this.model = {};                // модель мяча
    this.model.carcass = carcass;   // номер слоя для в физич. модели
    this.model.color = color;       // основной цвет rgb
    this.model.layers = layers;     // слои для физич. и визуаль. моделей

    var n = 6, m = 3;
    this.layers = [];
    for (var i = 0; i < m; i++)
    {
        this.layers[i] = [];
        for (var j = 0; j < n; j++)
        {
            this.layers[i][j] = 0;
        }
    }

    function huesConversion(lightCorrection, oldColor) // преобразование оттенков
    {
        var newColor;
        if(oldColor>0) newColor = oldColor + ((256-oldColor) / (256/lightCorrection));
        if(oldColor===0) newColor = oldColor;
        if(oldColor<0) newColor = oldColor / (256/lightCorrection);
        return newColor;
    }

    this.buildByModel = function()    // построить по модели
    {
        this.posX = this.model.layers[this.model.carcass][0];
        this.posY = this.model.layers[this.model.carcass][1];
        this.radius = this.model.layers[this.model.carcass][2];
        for(var i=0; i<3; i++)
        {
            for (var j=0; j<3; j++) // смещение верхних слоёв относительно нижнего слоя
            {
                if(i>0) this.layers[i][j] = this.model.layers[i][j] + this.model.layers[0][j];
                else this.layers[i][j] = this.model.layers[0][j];
            }
            for (var j=3; j<6; j++) // конвертация новых оттенков по корреции и основному цвету
            {
                this.layers[i][j] = huesConversion(this.model.layers[i][3], this.model.color[j-3]);
            }
        }
    };

    this.rebuildByModel = function()    // перестроить по модели
    {
        this.layers[this.model.carcass][0] = this.posX;
        this.layers[this.model.carcass][1] = this.posY;
        this.layers[this.model.carcass][2] = this.radius;
        for(var i=0; i<3; i++)
        {
            for (var j=0; j<3; j++) // смещение верхних слоёв относительно нижнего слоя
            {
                if(i>0) this.layers[i][j] = this.model.layers[i][j] + this.layers[0][j];
            }
        }
    };

    this.draw = function(cam)			// объявление функции рисования мяча
    {
        this.rebuildByModel();
        for(var i=0; i<3; i++)
        {
            ctx.beginPath();
            ctx.arc(cam.convertX(this.layers[i][0]), cam.convertY(this.layers[i][1]), Math.abs(cam.convert(this.layers[i][2])), 0, Math.PI*2, false);
            ctx.fillStyle = 'rgb('+this.layers[i][3]+','+this.layers[i][4]+','+this.layers[i][5]+')';
            ctx.fill();
            ctx.closePath();
        }
    };

    this.findPosContour = function()      // найти положение контура
    {
        this.left = this.posX - this.radius;
        this.right = this.posX + this.radius;
        this.up = this.posY - this.radius;
        this.down = this.posY + this.radius;
    };
}

function Rectangle(x, y, w, h, c, f, t)   // прямоугольник позиционируемый по своему центру
{
    this.posX = x; 				// позиция по горизонтали
    this.posY = y; 				// позиция по вертикали
    this.width = w;				// ширина
    this.height = h;			// высота
    this.left = 0;              // левый край
    this.right = 0;             // правый край
    this.up = 0;                // верхний край
    this.down = 0;              // нижний край
    this.color = c;             // цвет
    this.factors = f;           // факторы оттенков
    this.indent = t;            // отступ центрального фрагрмента от краёв
    this.side = [];             // стороны для слоёв-фрагментнов фигуры

    this.layers = [];	// слои-фраграгменты для фигуры
    if(this.width > this.height)    // горизонтальный формат
    {
        this.layers[0] = ['Rect', 'up'];
        this.layers[1] = ['Rect', 'down'];
        this.layers[2] = ['Tria', 'left'];
        this.layers[3] = ['Tria', 'right'];
    }
    else    // вертикальный формат
    {
        this.layers[0] = ['Rect', 'left'];
        this.layers[1] = ['Rect', 'right'];
        this.layers[2] = ['Tria', 'up'];
        this.layers[3] = ['Tria', 'down'];
    }

    this.draw = function(cam)			    // объявление функции рисовать заслонку
    {
        this.findSides();
        for(var i=0; i<4; i++)  // преобразование в фрагменты
        {
            var model = makeForm(this.layers[i][0], this.side[this.layers[i][1]][0], this.side[this.layers[i][1]][1], this.side[this.layers[i][1]][2], this.side[this.layers[i][1]][3]);
            var color = setHues(this.layers[i][1], this.factors, this.color);
            
            if(this.layers[i][1]==='left' || this.layers[i][1]==='right') swapCoordinates(model);

            if(this.layers[i][0]==='Rect')  drawRectangle(model[0], model[1], model[2], model[3], color[0], color[1], color[2]);
            if(this.layers[i][0]==='Tria')  drawTriangle(model[0], model[1], model[2], model[3], model[4], model[5], color[0], color[1], color[2]);
        }

        // верхний слой
        drawRectangle(this.left+this.indent, this.up+this.indent, this.width-(this.indent*2), this.height-(this.indent*2), huesConversion(0, this.color[0]), huesConversion(0, this.color[1]), huesConversion(0, this.color[2]));
    };

    this.findSides = function()      // найти стороны для будущих фрагментов
    {
        this.findPosContour();
        this.side['up'] = [this.left, this.up, this.width, this.height];
        this.side['down'] = [this.right, this.down, -this.width, -this.height];
        this.side['left'] = [this.down, this.left, -this.height, this.width]; 
        this.side['right'] = [this.up, this.right, this.height, -this.width];
    };

    this.findPosContour = function()      // найти положение контура
    {
        this.left = this.posX - (this.width/2);
        this.right = this.posX + (this.width/2);
        this.up = this.posY - (this.height/2);
        this.down = this.posY + (this.height/2);
    };
    
    function makeForm(form, pos0, pos1, width, height)	// сделать форму
    {
        var mas = [];
        if(form=='Rect')
        {
            mas[0] = pos0;
            mas[1] = pos1;
            mas[2] = width;
            mas[3] = height/2;
        }
        if(form=='Tria')
        {
            mas[0] = pos0;
            mas[1] = pos1;
            mas[2] = pos0+width;
            mas[3] = pos1;
            mas[4] = pos0+(width/2);
            if(height<0) mas[5] = pos1-(Math.abs(width/2));
            else mas[5] = pos1+(Math.abs(width/2));
        }
        return mas;
    }

    function swapCoordinates(t) // поменять координаты горизонтали и вертикали местами
    {
        var temporary;
        for(var l=0; l<t.length; l+=2)
        {
            temporary = t[l];
            t[l] = t[l+1];
            t[l+1] = temporary;
        }
    }

    function setHues(layer, factors, oldColor)  // установить оттенки
    {
        var newColor = [];
        for (var i=0; i<3; i++)
        {
            if(layer=='up') newColor[i] = huesConversion(factors[0], oldColor[i]);
            if(layer=='right') newColor[i] = huesConversion(factors[1], oldColor[i]);
            if(layer=='down') newColor[i] = huesConversion(factors[2], oldColor[i]);
            if(layer=='left') newColor[i] = huesConversion(factors[3], oldColor[i]);
        }
        return newColor;
    }

    function huesConversion(lightCorrection, oldColor) // преобразование оттенков
    {
        var newColor;
        if(oldColor>0) newColor = oldColor + ((256-oldColor) / (256/lightCorrection));
        if(oldColor===0) newColor = oldColor;
        if(oldColor<0) newColor = oldColor / (256/lightCorrection);
        return newColor;
    }

    function drawRectangle(x, y, w, h, red, green, blue)  // рисовать прямоугольник
    {
        ctx.beginPath();
        ctx.rect(cam.convertX(x), cam.convertY(y), cam.convert(w), cam.convert(h));
        ctx.fillStyle = 'rgb('+red+','+green+','+blue+')';
        ctx.fill();
        ctx.closePath();
    }

    function drawTriangle(x0, y0, x1, y1, x2, y2, red, green, blue) // рисовать треугольник
    {
        ctx.beginPath();
        ctx.moveTo(cam.convertX(x0), cam.convertY(y0));
        ctx.lineTo(cam.convertX(x1), cam.convertY(y1));
        ctx.lineTo(cam.convertX(x2), cam.convertY(y2));
        ctx.fillStyle = 'rgb('+red+','+green+','+blue+')';
        ctx.fill();
        ctx.closePath();
    }
}
//////////////////////////////////////////////////////////////////