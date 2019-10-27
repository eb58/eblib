/* global _,jQuery */ /* jshint multistr: true */
(function ($) {
  "use strict";
  $.fn.ebtree = function (opts, treeItems) {
    var treeid = this[0].id;
    var self = this;

    var defopts = {
      onclick: function (id) {
        console.log(id);
        setFocus(id);
      }
    };

    var myopts = _.extend({}, defopts, opts);

    var utils = {
      gencount: 0,
      generateId: function () {
        return 'itemid-' + Math.floor(Math.random() * 10000000) + '-' + new Date().getTime() + '-' + this.gencount++;
      },
      initLabel: function (item) {
//        if (!item.label)
//          return;
      },
      initInputFields: function (item) {
        if (!item.inputFields)
          return;
        item.inputFields = item.inputFields.map(function (inputField) {
          var res = _.extend({}, inputField);
          return res;
        })
      },
      initItem: function (item) {
        item.subitems = item.subitems || [];
        utils.initLabel(item);
        utils.initInputFields(item);
        return item;
      },
      createSubitem: function (item) {
        item.subitems = item.subitems || [];
        var newItem = {};
        newItem.parent = item;
        newItem.NN = item.subitems.length + 1;
        return utils.initItem(newItem);
      }
    };

    var utilsTree = {
      internals: {
        _delItem: function (treeItems, itemId) {
          if (treeItems) {
            var idx = _.findIndex(treeItems, function (o) {
              return o.id === itemId;
            });
            if (idx >= 0) {
              treeItems.splice(idx, 1);
              opts.onDeleteItem && opts.onDeleteItem(itemId);
            } else {
              treeItems.forEach(function (item) {
                utilsTree.internals._delItem(item.subitems, itemId);
              });
            }
          }
        },
        _itemById: function (treeItems, id) {
          if (!treeItems)
            return null;
          for (var i = 0, len = treeItems.length; i < len; i++) {
            if (treeItems[i]) {
              if (treeItems[i].id === id)
                return treeItems[i];
              var x = utilsTree.internals._itemById(treeItems[i].subitems, id);
              if (x)
                return x;
            }
          }
          return null;
        },
        _traverse: function (treeItems, f, g) {
          if (!treeItems)
            return;
          for (var i = 0, len = treeItems.length; i < len; i++) {
            if (treeItems[i]) {
              f && f(treeItems[i])
              utilsTree.internals._traverse(treeItems[i].subitems, f, g);
              g && g(treeItems[i])
            }
          }
        },
      },
      itemById: function (id) {
        return utilsTree.internals._itemById(treeItems, id);
      },
      traverse: function (f, g) {
        utilsTree.internals._traverse(treeItems, f, g);
        return this;
      },
      addSubitem: function (id) { // add Subitem to node with id
        var item = utilsTree.itemById(id);
        console.log('addSubitem to node with id', id, ' label', item.label, item);
        item.subitems = item.subitems || [];

        if (item.subitems.length >= item.cardinality) {
          console.log('max of subitems reached!');
          return;
        }
        item.subitems.push(utils.createSubitem(item));
      },
      delItem: function (itemId) {
        utilsTree.internals._delItem(treeItems, itemId);
      },
      delLastSubitem: function (itemId) {
        var item = utilsTree.itemById(itemId);
        if (item && item.subitems && item.subitems.length) {
          var lastItem = item.subitems[item.subitems.length - 1];
          utilsTree.internals._delItem(treeItems, lastItem.id);
        }
      },
      setFocus: function (id) {
        utilsTree.traverse(function (item) {
          if (item.id === id) {
            $('#' + item.id).addClass('focus');
          } else {
            $('#' + item.id).removeClass('focus');
          }
        })
      },
    };

    var renderTree = {
      renderListItem: function (item) {
        item.subitems.forEach(function (subitem) {
          subitem.parent = item;
        })
        var rsubitems = renderTree.renderItems(item.subitems, item.isCollapsed);
        item.id = item.id || utils.generateId()
        return _.template('\
              <li id=<%=id%> >\n\
                  <%=arrow%>\n\
                  <%=label%>\n\
                  <%=subitems%>\n\
              </li>\n\
            ')({
          id: item.id,
          arrow: item.subitems && item.subitems.length ? '<i class="fa fa-caret-' + (item.isCollapsed ? 'right' : 'down') + ' fa-lg"/>' : '<span>&nbsp;</span>',
          label: '<a>' + (item.label || item.id) + '</a>', 
          subitems: rsubitems
        });
      },
      renderItems: function (items, bCollapsed) {
        return items && items.length ? '<ul style="display:' + (bCollapsed ? 'none' : 'block') + '">\n' + items.reduce(function (acc, item) {
          utils.initItem(item);
          item.init && item.init();
          var ritem = renderTree.renderListItem(item);
          return acc + ritem;
        }, '') + '\n</ul>' : '';
      }
    }

    var redraw = function () {
      $('#' + treeid).html('<div class="ebtree">' + renderTree.renderItems(treeItems, false) + '</div>');
    };

    var init = function init() {
      $('#' + treeid + ' .ebtree').remove();
      redraw();
      // init actions
      $('#' + treeid).off().on('click', myopts.onClickItem)
      $('#' + treeid + ' .fa-caret-down, #' + treeid + ' .fa-caret-right').off().on('click', function (evt) {
        var item = utilsTree.itemById(evt.target.parentElement.id);
        item.isCollapsed = !item.isCollapsed;
        if (item.isCollapsed) {
          $('#' + evt.target.parentElement.id + ' ul').hide()
          $('#' + evt.target.parentElement.id + '>i:first').removeClass('fa-caret-down').addClass('fa-caret-right');
        } else {
          $('#' + evt.target.parentElement.id + ' ul').show()
          $('#' + evt.target.parentElement.id + '>i:first').removeClass('fa-caret-right').addClass('fa-caret-down');
        }
        evt.stopPropagation();
      })
      $('#' + treeid + ' i.fa-plus').off().on('click', function (ev) {
        utilsTree.addSubitem(ev.target.parentElement.id)
        ev.stopPropagation();
        init();
      })
      $('#' + treeid + ' i.fa-trash').off().on('click', function (ev) {
        utilsTree.delItem(ev.target.parentElement.id);
        ev.stopPropagation();
        init();
      });
      return self;
    }

    init();

    this.id = treeid;
    var api = {
      traverse: utilsTree.traverse,
      itemById: utilsTree.itemById,
      setFocus: utilsTree.setFocus,
      createSubitem: utils.createSubitem,
      init: init,
    };
    return _.extend(this, api);
  };
})(jQuery);