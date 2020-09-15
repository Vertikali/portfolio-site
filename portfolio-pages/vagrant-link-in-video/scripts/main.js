// Главный файл для подключение файлов

////////////////////////////////////////////////////////
// Аполлон-16. Автострада места посадки

include("scripts/data-base.js");
include("scripts/functions.js");
include("scripts/link-map.js");
include("scripts/canvas.js");
include("scripts/video-player.js");
include("scripts/IO.js");

// Подключение файлов
function include(url)
{
    let script = document.createElement('script');
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
}

////////////////////////////////////////////////////////