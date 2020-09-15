// Элементы управленя плеером (кнопка, список, ползунок)

////////////////////////////////////////////////////////

document.querySelector('#volume').oninput = videoVolume;    // ползунок громкости звука

document.querySelector('#all').innerHTML = allTime.toFixed(0);  // показ всей длительности видеозаписи в секундах

////////////////////////////////////////////////////////

let progress;   // ссылка на шкалу времени воспроизведения
progress = document.querySelector('#progress'); // получение данных из элементов графической индикации

video.ontimeupdate = progressUpdate;    // отправление данных в плеер

// Прогресс Обновление
function progressUpdate()
{
    pastTime = video.currentTime;  // время в конкретную секунду воспроизведения
    progress.value = (100 * pastTime) / allTime; // показ времени видео-записи длинной линии в прогресс-баре при воспроизведении
    document.querySelector('#part').innerHTML = pastTime.toFixed(0);   // показ времени воспроизведения в секундах
}

////////////////////////////////////////////////////////

progress.onclick = videoRewind; // отправление данных элементам графической индикации

// Перемотка видео назад
function videoRewind()
{
    let w = this.offsetWidth;   // полная длинна прогресс-бара
    let o = event.offsetX;      // длинна прогресс-бара от левого края до точки клика
    this.value = 100 * o / w;   // присвоение значения длинны линии в прогресс-баре кликом мыши
    video.currentTime = allTime * (o/w); // назначения начала воспроизведения в видеозаписи
}

////////////////////////////////////////////////////////

let speed = 0;  // скорость воспроизведения видео в плеере
let speedChange = 1;    // изменение скорости воспроизведения

// Подключение обработчиков событий к элементам управления
document.querySelector('#play-pause').onclick = playPause;  // кнопка Играть-Пауза
document.querySelector('#menu-speed').oninput = checkingSelectedSpeed;  // список выбора скорости воспроизведения

// Играть-Пауза
function playPause()
{
    if(speed==0)
    {
        speed = 1;
        speed*=speedChange;
        play(speed);
        checkLinkMode(0);
        document.querySelector('#play-pause').innerHTML = "Пауза";
    }
    else
    {
        speed = 0;
        video.pause();
        checkLinkMode(linksActive);
        document.querySelector('#play-pause').innerHTML = "Играть";
    }
}

// Проверка выбранной скорости
function checkingSelectedSpeed()
{
    let sc = this.options[this.selectedIndex].value;    // получение новых данных из списка
    switch(sc)
    {
        case "0": speedChange = 0.25; break;
        case "1": speedChange = 0.5; break;
        case "2": speedChange = 0.75; break;
        case "3": speedChange = 1; break;
        case "4": speedChange = 1.25; break;
        case "5": speedChange = 1.5; break;
        case "6": speedChange = 1.75; break;
        case "7": speedChange = 2; break;
        default: console.log("Ошибка! Не выбрана скрость воспроизведения.")
    }
}

////////////////////////////////////////////////////////

var linksActive = 0;    // переключатель активности гипер-ссылок

document.querySelector('#links').onclick = switchingLinks; // подключение обработчика переключения ссылок

// Переключение ссылок
function switchingLinks()
{
    if(linksActive==0)
    {
        linksActive = 1;
        document.querySelector('#links').innerHTML = "Скрыть";  // замена надписи на кнопке
    }
    else
    {
        linksActive = 0;
        document.querySelector('#links').innerHTML = "Ссылки";  // замена надписи на кнопке
    }
    if(speed==0) { checkLinkMode(linksActive); }
}

////////////////////////////////////////////////////////