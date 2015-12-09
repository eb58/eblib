(function ($) {
   $.fn.table = function (opts) {
      var tableHeadRow = _.map(opts.head, function (o) {
         return '<th>' + o.trim() + '</th>'
      });
      var tableHead = _.reduce(tableHeadRow, function (h, d) {
         return h + d;
      }, '');
      var tableBody = ''
      $.each(opts.data, function (idx, data) {
         tableBody += '<tr>';
         $.each(data, function (idx, o) {
            tableBody += '<td>' + o.trim() + '</td>'
         });
         tableBody += '</tr>\n';
      });

      var tableTemplate = _.template(
         "<table id='head' border='1'>\n\
            <thead><tr><%= head %></tr></thead>\n\
         </table>\n\
         <div style='position: relative; overflow: auto; width: 100%; max-height: 300px;'>\n\
            <table id='data' border='1'>\n\
               <tbody><%= body %></tbody>\n\
            </table>\n\
         </div>"
         );
      this.replaceWith(tableTemplate({head: tableHead, body: tableBody}));
      this.test = function test() {
         console.log('test', opts);
      };
      this.adjustHeader = function () {
         console.log('>>>adjustHeader');
         for (var i = 1; i <= opts.head.length; i++) {
            var w = $('#data tr:nth-child(' + i + ') td:nth-child(' + i + ')').width();
            $('#head th:nth-child(' + i + ')').width(w);
         }
      };

      return this;
   };
}(jQuery));