/* Программу Калькулятор написал Веселов Валерий. Это моя первая самостоятельная работа и демонстрация моих возможностей. 07.11.2019Чт */

// функция-обёртка скрывающая локальные переменные от глобальных
function main()
{
////////////////////////////////////////////////////////////////////////////////////////////////////
    // объявить единицы
    var key = {}; // код клавиши после сортировки
    var modePresentation = 'Start' // режим представления для переключения Start, Calculation, Tuning
    var modeCalculation = 'Simple'; // режим вычисления Simple, Engineering

    // подключение всех функций
    var CPU = new Processor(); // исполнитель
    var taskList = new List(); // список задач

    var events = new Keyboard(); //клавиатура
    events.bindCalculations(); // привязать обработчик расчётов

    var display = new Screen(); // экран
    display.changeOption(modePresentation, modeCalculation); // дисплей сменить: Simple - Простой, Engineering - Инженерный
    display.show(); // показать дисплей

    var design = new DesignStyle(); // объект для смены дизайна
    var style = 3; // стиль дизайна
    design.changeStyle(style); // сменить стиль дизайна: 1,2,3
////////////////////////////////////////////////////////////////////////////////////////////////////
    // привязать страницу DOM к программе
    function Keyboard()
    {
        var buttons = document.querySelectorAll('td'); // связывание с клавишами DOM страницы
    
        // привязка обработчиков к событиям клавиатуры калькулятора
        this.bindCalculations = function()
        {
            for (var i = 0; i < buttons.length; i++){ buttons[i].addEventListener('click', function(){ processCalculations(this.innerHTML); }); }
        };
    }

    // процесс расчётов
    function processCalculations(button)
    {
        key = sortCode(button); // сортировать код
        changeMode(key.mode, key.code); // сменить режим
        display.show(); // показать на дисплее
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
    // сменить режим
    function changeMode(mode, code)
    {
        if(modePresentation==='Start') modePresentation = 'Calculation';
        if(mode==='Tuning') // включить/выключить режим настроек
        {
            if(modePresentation!=='Tuning') modePresentation = 'Tuning';
            else modePresentation = 'Calculation';
        }

        if(mode==='Reset') // режим сброс решений
        {
            CPU.clearTask();
            CPU.resolved = true;
            taskList.clearList();
            taskList.resolved = true;
            modePresentation = 'Start';
        }
        
        if(modePresentation==='Calculation')
        {
            if(key.mode==='Number'||key.mode==='Arithmetic')
            {
                CPU.updateData(key.mode, key.code); // обновить данные
                CPU.interpretTask(); // интерпретировать задачу
                if(CPU.task.length!==0) taskList.updateList(CPU.resolved, CPU.task); // добавить задачу в список задач
            }
        }
        
        if(modePresentation==='Tuning') // режим настроек
        {
            if(mode==='Number') design.changeStyle(code); // сменить стиль
            if(mode==='Arithmetic'&& code==='=')
            {
                if(modeCalculation==='Simple') modeCalculation = 'Engineering';
                else modeCalculation = 'Simple';
            }
        }

        display.changeOption(modePresentation, modeCalculation); // сменить дисплей
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
    // отсортировать код
    function sortCode(s)
    {
        var t = null;
        if(s==='C') t = 'Reset';
        if(s==='☼') t = 'Tuning';
        if(s==='+'||s==='-'||s==='*'||s==='/'||s==='=') t = 'Arithmetic'; // +, -, ×, ÷, =
        if(s==='±'||s==='.'||s==='0'||s==='1'||s==='2'||s==='3'||s==='4'||s==='5'||s==='6'||s==='7'||s==='8'||s==='9') t = 'Number';
        return {mode: t, code: s};
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
    // конструктор операнда и арифметического оператора
    function Lexeme()
    {
        this.type = ' ';
        this.sign = ' ';
        this.number = '0';
        this.push = function(c) // задвинуть в лексему
        {
            if(this.type==='Number')
            {
                if(c.length===1)
                {
                    if(c==='±')
                    {
                        if(this.sign!=='-') this.sign = '-';
                        else this.sign = ' ';
                    }
                    if(c==='.'||c==='0'||c==='1'||c==='2'||c==='3'||c==='4'||c==='5'||c==='6'||c==='7'||c==='8'||c==='9')
                    {
                        if(this.number==='0' && c!=='.')
                        {
                            this.number = c;
                            return;
                        }
                        if(this.number.indexOf('.')!==-1 && c==='.') return;
                        if(this.number.length<12) this.number = this.number + c;
                    }
                }
            }
            if(this.type==='Arithmetic')
            {
                if(c==='+'||c==='-'||c==='*'||c==='/'||c==='=') this.sign = c;
            }
        };
        this.clear = function() // очистить лексему
        {
            this.type = ' ';
            this.sign = ' ';
            this.number = '0';
        };
        this.get = function() // получить от лексемы
        {
            if(this.type==='Number') return this.sign + this.number;
            if(this.type==='Arithmetic') return this.sign;
        };
        this.set = function(n) // присвоить лексеме
        {
            if(this.type==='Number')
            {
                var str = String(n);
                if(str[0]==='-')
                {
                    this.sign = '-';
                    this.number = str.slice(1);
                }
                else
                {
                    this.sign = ' ';
                    this.number = str;
                }
            }
        };
        this.copy = function(arr) // копировать лексемы
        {
            this.type = arr.type.slice(0);
            this.sign = arr.sign.slice(0);
            this.number = arr.number.slice(0);
        };
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
    // конструктор исполнителя
    function Processor()
    {
        // "решённая" задача - имеет true с последним обновлением существующей задачи, в прочих случаях false
        this.resolved = true;
        this.task = []; // задача
        this.updateData = function(mode, code) // обновить данные
        {
            if(mode==='Number'||mode==='Arithmetic')
            {
                this.checkCompletionTask(); // проверить завершение задачи
                this.interpretTask(mode, code); // интерпретировать задачу
                this.waitForSignal(); // ждать сигнала исполнения
            }
        };
        
        // проверить завершение задачи
        this.checkCompletionTask = function()
        {
            if(this.resolved)
            {
                this.clearTask();
                this.resolved = false; // "решённая" задача: false = нерешённая, true = решённая
            }
        };

        // интерпретировать задачу
        this.interpretTask = function(mode, code)
        {
            var l = this.task.length;
            if(l%2===0 && code==='-'){ this.addLexeme('Number', '±'); return; }
            if(l%2==0 && mode=='Number'){ this.addLexeme('Number', code); return; }
            if((l%2)===1 && mode==='Arithmetic'){ this.addLexeme('Arithmetic', code); return; }
            if((l%2)===1 && mode==='Number'){ this.updateLexeme('Number', code); return; }
        };

        // очистить задачу
        this.clearTask = function()
        {
            var sw = this.task.length;
            for(var d=0; d<sw; d++)
            {
                this.task.shift();
            }
        };

        // добавить лексему
        this.addLexeme = function(mode, code)
        {
            var len = this.task.length;
            this.task[len] = new Lexeme(); // создать новое слово
            this.task[len].type = mode;
            this.task[len].push(code);
        };

        // обновить лексему
        this.updateLexeme = function(mode, code)
        {
            if(mode==='Number'||mode==='Arithmetic')
            {
                var len1 = this.task.length;
                if(this.task[len1-1].type === mode) this.task[len1-1].push(code);
                else this.addLexeme(mode, code);
            }
        };

        // ждать сигнала исполнения
        this.waitForSignal = function()
        {
            var l2 = this.task.length;
            // Выполнение арифметических вычислений в режиме доставки Engineering
            if(modeCalculation==='Engineering' && this.task[l2-1].get()==='=')
            {
                this.ALU();
                this.resolved = true; // "решённая" задача: false = нерешённая, true = решённая
            }
            
            // Выполнение арифметических вычислений в режиме доставки Simple
            if(modeCalculation==='Simple' && l2>3 && this.task[l2-1].type==='Arithmetic')
            {
                if(this.task[l2-1].get()!=='=') this.task[l2-1].push('=');
                this.ALU();
                this.resolved = true; // "решённая" задача: false = нерешённая, true = решённая
            }
        };
////////////////////////////////////////////////////////////////////////////////////////////////////
        // Арифметическое Логическое Устройство
        this.ALU = function()
        {
            if(this.task.length-1===0) return console.log('ALU. Список операций пуст.');
            var expr = this.selectTask();
            var result = this.executeOperation(expr);
            this.saveResult(result);
        };

        // выборка арифметического выражения из списка операций
        this.selectTask = function()
        {
            var mas = [];
            var j = 0;
            for(var i=this.task.length-2; i>-1; i--) // 5, 4, 3 ...
            {
                if(this.task[i].type==='Number')
                { mas[j] = '(' + this.task[i].get() + ')'; }
                else
                { mas[j] = this.task[i].get(); }
                j+=1; // 0=5, 1=4, 2=3 ...
            }
            return mas;
        };

        // исполнение операции
        this.executeOperation = function(mas)
        {
            if(mas.length===0) return console.log('ALU. Арифметическое выражение не получено.');
            var logos =' ';
            for(var i=mas.length-1; i>-1; i--) // 0=5, 1=4, 2=3 ...
            { logos = logos + mas[i]; }
            return eval(logos);
        };

        // сохранить результат
        this.saveResult = function(result)
        {
            var lengt = this.task.length;
            this.task[lengt] = new Lexeme();
            this.task[lengt].type = 'Number';
            this.task[lengt].set(result);
        };
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
    // конструктор списка
    function List()
    {
        this.list = []; // список задач
        // "решённая" задача - имеет true перед открытием новой задачи, в прочих случаях false
        this.resolved = true;

        // обновить список задач
        this.updateList = function(res, task)
        {
            if(this.resolved)
            {
                this.pushTask(this.list.length, task); // добавить новую задачу
                this.resolved = res;
            }
            else
            {
                this.pushTask(this.list.length-1, task); // обновить задачу
                this.resolved = res;
            }
        };

        // добавить новую задачу в список задач
        this.pushTask = function(p, t)
        {
            if( this.list.length-1 < p) // при добавлении новой задачи в список
            {
                this.list[p] = [];
                this.list[p][0] = new Lexeme();
                this.list[p][0].copy(t[0]);
            }

            if(this.list[p].length !== t.length) // при разной длине зазач
            {
                // добавляет не достающие (1-2шт.) лексемы в задачу
                while(this.list[p].length < t.length)
                {
                    var z = this.list[p].length;
                    this.list[p][z] = new Lexeme();
                    this.list[p][z].copy(t[z]);
                }
            }
            else
            {
                // при одинаковой длине задач обновление последней из лексем
                this.list[p][t.length-1].copy(t[t.length-1]);
            }
        };

        // очистить весь список задач
        this.clearList = function()
        {
            var sws = this.list.length;
            for(var i=sws-1; i>-1; i--){ this.list.pop(); } // проход по списку задач
        };
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
    function Screen() // конструктор экран
    {
        this.indicator = document.getElementById('scoreboard'); // связывание с индикатором DOM страницы
        this.charactersOnScreen; // символы на экране
        this.variant; // вариант

        this.changeOption = function(presentation, calculation) // сменить подачу
        {
            if(presentation==='Start') this.variant = 'Start';
            if(presentation==='Calculation')
            {
                if(calculation==='Simple') this.variant = 'Simple';
                if(calculation==='Engineering') this.variant = 'Engineering';
            }
            if(presentation==='Tuning') this.variant = 'Tuning';
        };

        this.show = function() // показать
        {
            switch(this.variant)
            {
                case 'Start': this.formInStart(); break;
                case 'Simple': this.formInSimple(); break;
                case 'Engineering': this.formInEngineering(); break;
                case 'Tuning': this.formInTuning(); break;
            }
            this.outputTheForm();
        };

        this.formInStart = function() // форма показа на старте
        {
            this.charactersOnScreen ='';
            this.charactersOnScreen = '<p>_</p>';
        };

        this.formInSimple = function() // форма в простом виде
        {
            this.charactersOnScreen ='';
            for(var i=0; i<taskList.list.length; i++) // проход по списку задач
            {
                for(var j=0; j<taskList.list[i].length; j++) // проход по задаче
                {
                    // добавление каждой лексемы раздельно
                    this.charactersOnScreen = this.charactersOnScreen+'<p>'+taskList.list[i][j].get()+'</p>';
                }
            }
        };

        this.formInEngineering = function() // форма в инженерном виде
        {
            this.charactersOnScreen ='';
            var expression;
            for(var i=0; i<taskList.list.length; i++) // проход по списку задач
            {
                expression = ''; // выражение
                for(var j=0; j<taskList.list[i].length; j++) // проход по задаче
                { expression = expression+' '+taskList.list[i][j].get(); } // добавление лексем в одно выражение
                this.charactersOnScreen = this.charactersOnScreen+'<p>'+expression+'</p>'; // добавление каждого выражения отдельно
            }
        };

        this.formInTuning = function() // форма вида в настройке
        {

            //this.charactersOnScreen = '';
            this.charactersOnScreen = '<p>'+'1,2,3 стиль'+'</p>'+'<p>'+'= простой/инженер'+'</p>'+'<p>'+'☼ возврат'+'</p>';
        };
        
        this.outputTheForm = function() // выход формы
        {
            this.indicator.innerHTML = this.charactersOnScreen; // добавление списка на дисплей
            this.indicator.scrollTop = this.indicator.scrollHeight; // прокрутка индикатора вниз
        };
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
    // стиль дизайна
    function DesignStyle() // styleInput
    {
        this.o = document.getElementById("scoreboard");
        this.s = document.getElementById("keyboard");
        this.k = document.getElementsByClassName("key");
        this.style;

        this.changeStyle = function(code) // сменить стиль
        {
            this.removeStyle();
            this.style = Number(code);
            switch(this.style)
            {
                case 1: this.style=1; break;
                case 2: this.style=2; break;
                case 3: this.style=3; break;
                default: this.style=1;
            }
            this.addStyle();
        };

        this.removeStyle = function() // удалить стиль
        {
            switch(this.style)
            {
                case 1: // девичий
                    this.o.classList.remove("styleBackgroundScore1");
                    this.o.classList.remove("styleBorderScore1");
                    this.s.classList.remove("styleBackgroundKeys1");
                    for(var i=0; i<this.k.length; i++)
                    {
                        this.k[i].classList.remove("styleBorderKeys1");
                        this.k[i].classList.remove("styleTextKeys1");
                    }
                break;
                case 2: // морской
                this.o.classList.remove("styleBackgroundScore2");
                this.o.classList.remove("styleBorderScore2");
                this.s.classList.remove("styleBackgroundKeys2");
                for(var i=0; i<this.k.length; i++)
                {
                    this.k[i].classList.remove("styleBorderKeys2");
                    this.k[i].classList.remove("styleTextKeys2");
                }
                break;
                case 3: // древесный
                this.o.classList.remove("styleBackgroundScore3");
                this.o.classList.remove("styleBorderScore3");
                this.s.classList.remove("styleBackgroundKeys3");
                for(var i=0; i<this.k.length; i++)
                {
                    this.k[i].classList.remove("styleBorderKeys3");
                    this.k[i].classList.remove("styleTextKeys3");
                }
                break;
            }
        };
        
        this.addStyle = function() // добавить стиль
        {
            switch(this.style)
            {
                case 1: // девичий
                    this.o.classList.add("styleBackgroundScore1", "styleBorderScore1");
                    this.s.classList.add("styleBackgroundKeys1");
                    for(var i=0; i<this.k.length; i++)
                    {
                        this.k[i].classList.add("styleBorderKeys1", "styleTextKeys1");
                    }
                break;
                case 2: // морской
                    this.o.classList.add("styleBackgroundScore2", "styleBorderScore2");
                    this.s.classList.add("styleBackgroundKeys2");
                    for(var i=0; i<this.k.length; i++)
                    {
                        this.k[i].classList.add("styleBorderKeys2", "styleTextKeys2");
                    }
                break;
                case 3: // древесный
                    this.o.classList.add("styleBackgroundScore3", "styleBorderScore3");
                    this.s.classList.add("styleBackgroundKeys3");
                    for(var i=0; i<this.k.length; i++)
                    {
                        this.k[i].classList.add("styleBorderKeys3", "styleTextKeys3");
                    }
                break;
            }
        };
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
}
main(); // исполнить функцию-обёртку, то есть всю программу