window.onload = function() {

    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value; // Отображаем значение ползунка по умолчанию
    var slider2 = document.getElementById("myRange2");
    var output2 = document.getElementById("demo2");
    output2.innerHTML = slider2.value; // однократно передаёт значение от ползунка к индикатору

    // Обновляем текущее значение ползунка (каждый раз, когда вы перетаскиваете ручку ползунка)
    slider.oninput = function() {
    output.innerHTML = this.value;
    console.clear();
    console.log('output1='+this.value);
    }

    slider2.oninput = function() {
    output2.innerHTML = this.value;
    console.clear();
    console.log('output2='+this.value);
    }
 };

