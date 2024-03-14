var hslcolor;

$(".handle").mousedown(function() {
    $(this).addClass("pop");
    $(this).parent(".slider").addClass("grad");
});

$(".handle").mouseup(function() {
    $(this).removeClass("pop");
    $(this).parent(".slider").removeClass("grad");
});

$( ".handle" ).draggable({ 
    axis: "x",
    containment: "parent",
    drag: function( event, ui ) {
        var thisOffset = $(this).position().left;
        var angle = (thisOffset/300)*360;
        hslcolor = "hsl("+ angle + ", 100%, 50%)";
        $(this).css("background-color", hslcolor);
        
        $(this).parent(".slider").css("background-color", hslcolor);
    },

    stop: function( event, ui ) 
    {
        $(this).removeClass("pop");
            $(this).parent(".slider").removeClass("grad");
    }
});