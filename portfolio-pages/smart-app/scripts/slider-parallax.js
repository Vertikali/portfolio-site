/* Настройка стиля параллакс в Слайдер */
$(document).ready(function() 
{ 
    // Движение фона от мышки
    $( document ).on( 'mousemove', function( e ) 
    {
        var  amountMovedX = 0;
        var amountMovedY = 10 * ( (e.pageY - 1) / $( window ).height() );
        $( '#move-bg' ).css( 'background-position', amountMovedX + 'px ' + amountMovedY + 'px' );
    } );

    // Движение картинки от мышки
    $( document ).on( 'mousemove', function( e ) 
    {
        var amountMovedX = 0;
        var amountMovedY = 75 - 30 * ( (e.pageY + 1) / $( window ).height() );
        $( '#move-object' ).css( {'margin-left': '-' + amountMovedX + 'px', 'margin-top' : '-' + amountMovedY + 'px' });
    } );
});