/* global _ */
var dlgAttr = function (opts) {
  $('#dlgAttr').remove();

  var dlg = $("\
      <div id='dlgAttr'>\n\
        <div id=docimg></div>\n\
        <div id=docatt></div>\n\
      </div>");


  var defopts = {
    open: function ( ) {
    },
    title: 'Attribute',
    width: 850, height: 550,
    closeText: 'Schlie\u00dfen',
    buttons: {
      '\u00dcbernehmen': function () {
        $(this).dialog("close");
      },
      'Abbrechen': function () {
        $(this).dialog("close");
      }
    }
  };
  var myopts = $.extend({}, defopts, opts);
  dlg.dialog(myopts);
};


var dlgUpload = function (opts) {
  var formData = new FormData();

  var formatBytes = function (bytes, decimals) {
    if (bytes === 0)
      return '0 Byte';
    var k = 1000; // or 1024 for binary
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(decimals || 2)) + ' ' + sizes[i]).replace('.', ',');
  };

  var renderer = {
    date: function (data) {
      return new Date(data).toLocaleString();
    },
    size: function (data) {
      return formatBytes(data);
    },
    edit: function (data, row) {
      return "<span id='editdoc" + row[4] + "' class='ui-icon ui-icon-pencil'></span>";
    },
    trash: function (data, row) {
      return "<span id='deldoc" + row[4] + "' class='ui-icon ui-icon-trash'></span>";
    }
  };

  var tblopts = {
    flags: {filter: false, pagelenctrl: false, config: false},
    columns: [
      {name: "Name ", css: "width:200px"},
      {name: "Größe", css: "width:80px", render: renderer.size},
      {name: "Datum", css: "width:110px", render: renderer.date},
      {name: "Typ  ", css: "width:*"},
      {name: "     ", css: "width:15px", render: renderer.edit},
//      {name: "     ", css: "width:15px", render: renderer.trash}
    ]
  };
  $('#dlgUpload').remove();
  var dlg = $("\
    <div id='dlgUpload'>\n\
        <div id='grid'></div>\n\
        <input type='file' id='fileinputX' multiple='multiple' style='display:none;' />\n\
        <button type='button' id='fileinput'>Dateien auswählen</button>\n\
    </div>");

  var styling = function () {
    $('#dlgUpload table').width('100%');
    $('#dlgUpload').css('background-color', '#eeeee0');
    $('#dlgUpload .ctrl').remove();
    $('#dlgUpload th, #dlgUpload td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px');
    $('#dlgUpload .ui-icon-pencil').on('click', function (event) {
      console.log(event.target.id);
      dlgAttr();
    });
  };

  var defopts = {
    open: function ( ) {
      $('#dlgUpload #grid').ebtable(tblopts, []);
      styling();
      $('#dlgUpload #fileinput').button().click(function () {
        $("#fileinputX").click();
      });
      $("#dlgUpload #fileinputX").on('change', function (event) {
        var tblData = _.reduce(this.files, function (acc, o, idx) {
          return acc.push([o.name, o.size, o.lastModified, o.type, idx]), acc;
        }, []);
        $('#dlgUpload #grid').ebtable(tblopts, tblData);
        styling();
      });

    },
    title: 'Unterlagen hinzufügen',
    width: 800, height: 450,
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      '\u00dcbernehmen': function () {
//        var url = 'localhost/dsdsd';
//        var xhr = new XMLHttpRequest();
//        xhr.open("POST", url, true);
//        xhr.onreadystatechange = function () {
//          if (xhr.readyState == 4 && xhr.status == 200) {
//            // Every thing ok, file uploaded
//            console.log(xhr.responseText); // handle response.
//          }
//        };
//        fd.append("upload_file", $('#fileinputX').prop('files')[0]);
//        xhr.send(fd);
        $.ajax({
          url: 'localhost/dsdsd',
          data: formData,
          method: 'POST',
          // THIS MUST BE DONE FOR FILE UPLOADING
          contentType: false,
          processData: false,
          success: function () {},
          error: function () {}
        });
//        $(this).dialog("close");
      },
      'Abbrechen': function () {
        $(this).dialog("close");
      }
    }
  };
  var myopts = $.extend({}, defopts, opts);
  dlg.dialog(myopts);
};