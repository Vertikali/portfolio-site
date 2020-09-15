// Полотно для рисования ссылок

////////////////////////////////////////////////////////

// Подключить полотно и контекст полотна
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

// Нарисовать окружность круга
function drawCircle(x, y, r, c, b)
{
    for (var i=0; i<b; i++)
    {
        context.strokeStyle = c;			// задание стиля чертежа
        context.beginPath();
        context.arc(x, y, r-i, 0, Math.PI*2, false);
        context.stroke();					// заполнить весь чертёж
        context.closePath();				// объявление конец чертежа
    }
}

// Нарисовать периметр прямоугольника
function drawRectangle(x, y, w, h, c, b)
{
    for (var i=0; i<b; i++)
    {
        context.strokeStyle = c;			// задание стиля чертежа
        context.beginPath();
        context.strokeRect(x+i, y+i, w-(i*2), h-(i*2));
        context.stroke();					// заполнить весь чертёж
        context.closePath();				// объявление конец чертежа
    }
}

// Очистить полотно
function clearCanvas()
{
    context.clearRect(0, 0, canvas.width, canvas.height);
}

////////////////////////////////////////////////////////