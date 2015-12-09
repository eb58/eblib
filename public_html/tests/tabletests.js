var opts = {
   head: ["Paket", '', "Datum", "Name", "Fälligkeit", "Auftragspaket", "Frage des AG", "Produkt", "Bearbeiter", "Eingang", "DTA Nummern"],
   data: basketTestdata
};
var grid;
$().ready(function () {
   grid = $('#grid').table(opts);
      grid.adjustHeader();
});
$(window).on('resize', function(){
      var win = $(this); //this = window
      if (win.height() >= 820) { /* ... */ }
      if (win.width() >= 1280) { /* ... */ }
      //alert('resize');
      grid.adjustHeader();
})