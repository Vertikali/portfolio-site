// Видеоплеер

////////////////////////////////////////////////////////

let video;  // ссылка на видеоплеер
var allTime = 0;    // время всей длительности видеозаписи
var pastTime = 0;   // время непосредственного момента видеозаписи

video = document.querySelector('#video-player');    // получение данных от плеера

allTime = video.duration;     // полное время записи в секундах

video.onloadedmetadata = function() // исполняется лишь один раз - при первой загрузке страницы
{
    allTime = video.duration;     // полное время записи в секундах
    document.querySelector('#all').innerHTML = allTime.toFixed(0);  // показ всей длительности видеозаписи в секундах  
};

////////////////////////////////////////////////////////

// Играть видео
function play(sp)
{
    video.playbackRate = sp;
    video.play();
}

// Громкость видео
function videoVolume()
{
    let vv = this.value;
    video.volume = vv / 100;
}

///////////////////////////////////////////////////////