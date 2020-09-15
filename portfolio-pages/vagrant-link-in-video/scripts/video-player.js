// Видеоплеер

////////////////////////////////////////////////////////

let video;  // ссылка на видеоплеер
var allTime = 0;    // время всей длительности видеозаписи
var pastTime = 0;   // время непосредственного момента видеозаписи

video = document.querySelector('#video-player');    // получение данных от плеера

allTime = video.duration;     // полное время записи в секундах

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