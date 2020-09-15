// Функции расчёта соотношений

////////////////////////////////////////////////////////

// Проверить режим ссылки
function checkLinkMode(m)
{
    if(m!=0)
    {
        let linkMap = {};
        let linkCanvas = {};
        removeLinks();  // удалить гипер-ссылки с экрана
        clearCanvas();  // очистить плотно от изображений ссылок
        for(let i= 0; i<links.length; i++)
        {
            if(links[i]!=undefined)
            {
                let j = links[i].markers.length-1;
                if((links[i].markers[0].t <= pastTime) && (pastTime <= links[i].markers[j].t))
                {
                    generateLinks(links[i], linkMap, linkCanvas, pastTime);    // Сгенерировать ссылки
                    addLink(linkMap);  // добавить гипер-ссылку на экран
                    drawShape(linkCanvas, 3);   // нарисовать фигуру
                }
            }
        }
    }
    else
    {
        removeLinks();  // удалить гипер-ссылки с экрана
        clearCanvas();  // очистить плотно от изображений ссылок
    }
}

////////////////////////////////////////////////////////

// Сгенерировать ссылки
function generateLinks(linkDB, linkMap, linkCanvas, t)
{
    let link ={};
    
    findMarker(t, linkDB, link);
    assignLinkToLayers(link, linkMap, linkCanvas);
}

////////////////////////////////////////////////////////

function findMarker(t, linkDB, link)    // найти маркер
{
    link.shape = linkDB.shape;
    link.alt = linkDB.alt;
    link.href = linkDB.href;
    link.target = linkDB.target;
    link.coords = "";
    link.color = linkDB.color;
    link.p = [];

    let referMarkers = [];  // Индексы маркеров для поиска перебором l0___l1___l2
    let result = findAmongMarkers(linkDB.markers, referMarkers, t);
    if( result==0)
    {
        let k = getTimeFactor(linkDB.markers[referMarkers[0]].t, linkDB.markers[referMarkers[2]].t, t);
        getMidpointCoordinates(linkDB.markers[referMarkers[0]].p, linkDB.markers[referMarkers[2]].p, link.p, k);
        for( let i=0; i<linkDB.markers[referMarkers[0]].p.length; i++)
        {
            link.p[i] = Math.round(link.p[i]);
        }
    }
    else
    {
        for( let i=0; i<linkDB.markers[referMarkers[1]].p.length; i++)
        {
            link.p[i] = linkDB.markers[referMarkers[1]].p[i];
        }
    }
}

////////////////////////////////////////////////////////

function assignLinkToLayers(link, linkMap, linkCanvas)  // назначить ссылку на слои
{
    linkMap.shape = link.shape;
    linkMap.alt = link.alt;
    linkMap.href = link.href;
    linkMap.target = link.target;
    linkMap.coords = "";

    switch(linkMap.shape)
    {
        case "circle": linkMap.coords = ""+(link.p[0])+", "+(link.p[1])+", "+(link.p[2])+""; break;
        case "rect": linkMap.coords = ""+(link.p[0]-(link.p[2]/2))+", "+(link.p[1]-(link.p[3]/2))+", "+(link.p[0]+(link.p[2]/2))+", "+(link.p[1]+(link.p[3]/2))+""; break;
        default: console.log('Ошибка. Не выбрана форма ссылки для слоя link-map.');
    }

    linkCanvas.s = link.shape;
    linkCanvas.c = link.color;
    linkCanvas.p = [];
    for( let i=0; i<link.p.length; i++)
    {
        linkCanvas.p[i] = link.p[i];
    }
}

////////////////////////////////////////////////////////

function findAmongMarkers(markers, rm, t)	// найди среди маркеров
{
    t = (Math.round(t*10)/10); // округление до десятых долей секунды
    rm[0] = 0;
    rm[1] = 0;
    rm[2] = markers.length-1;

    let scan = 1;
    let result = 0;
    while(scan)
    {
        switch(true)
        {
            case t<markers[rm[1]].t:	// проверить участок l0___l1
                rm[2] = rm[1];
            break;
            case t==markers[rm[1]].t:   // ссылка совпала с меткой l1
                scan = 0;
            return result = 1;
            case markers[rm[1]].t<t:	// проверить участок l1___l2
                rm[0] = rm[1];
            break;
            default:
                console.log('Ошибка! Переменная t не совпала ни с одном из вариантов контрольных меток.');
                scan = 0;
        }

        let d = parseInt((rm[2]-rm[0])/2);
        if(!d)  // маркеры кончились
        {
            scan = 0;
            result = 0;
        }
        else    // есть не проверенные маркеры
        {
            rm[1] = d + rm[0];
        }
    }

    return result;  // 0 - точного совпадения нет (искать между rm[0] и rm[2]), 1 - совпало с одним из маркеров (индекс в rm[1])
}
////////////////////////////////////////////////////////

// Получить коэффициент времени
function getTimeFactor(t1, t2, t)
{
    let AM, MB;     // A___M_____B
    if(checkWhoIsBigger(t1, t2)>=0)// t1___t_____t2
    {
        AB = t2 - t1;
        AM = t - t1;
        MB = t2 - t;
    }
    else    // t2___t_____t1
    {
        AB = t1 - t2;
        AM = t - t2;
        MB = t1 - t;
    }

    let coefficient = {};
    coefficient.direct = AM / MB;   // прямой коэффициент
    coefficient.inverse = MB / AM;	// обратный коэффициент

    return coefficient;  // получаем коэффициент по времени
}

// Получить координаты средней точки
function getMidpointCoordinates(a, b, c, k)
{
    for( let i=0; i<a.length; i++)
    {
        c[i] = applyCoefficient(a[i], b[i], k.direct); // применить один из коэффициентов
    }
}

// Проверь, кто больше
function checkWhoIsBigger(a, b)
{
    let c = 0;
    if(a<b) c=1;
    if(a>b) c=-1;

    return c;
}

// Применить коэффициент
// для координат: a - меньшая, b - большая, k - коэффициент
function applyCoefficient(a, b, k)
{
    return (a+(k*b))/(1+k);
}

////////////////////////////////////////////////////////

// Нарисовать фигуру
function drawShape(l, b)
{
    switch(l.s)
    {
        case "circle": drawCircle(l.p[0], l.p[1], l.p[2], l.c, b); break;
        case "rect": drawRectangle(l.p[0]-(l.p[2]/2), l.p[1]-(l.p[3]/2), l.p[2], l.p[3], l.c, b); break;
        default: console.log('Ошибка! Не выбрано какую фигуру рисовать.');
    }
}

////////////////////////////////////////////////////////