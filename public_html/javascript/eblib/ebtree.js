/* global _,jQuery */ /* jshint multistr: true */
(function ($) {
  "use strict";
  $.fn.ebtree = function (treeItems, opts) {
    const treeid = this[0].id;
    var self = this;

    var defopts = {
      onClickItem: function (evt) {
        const item = utilsTree.itemById(evt.target.id);
        console.log('onClickItem', item);

      },
      onCheckItem: function (evt) {
        const item = utilsTree.itemById(evt.target.id)
        console.log('onCheckItem', item);
      },
      onDeleteItem: function (evt) {
        const item = utilsTree.itemById(evt.target.id)
        console.log('onDeleteItem', item);
        utilsTree.delItem(item.id)
      },
    };

    var myopts = _.extend({}, defopts, opts || {});

    const internals = {
      delItem: function (treeItems, itemId) {
        if (treeItems) {
          var idx = _.findIndex(treeItems, function (o) {
            return o.id === itemId;
          });
          if (idx >= 0) {
            treeItems.splice(idx, 1);
            myopts.onDeleteItem && myopts.onDeleteItem(itemId);
          } else {
            treeItems.forEach(function (item) {
              internals.delItem(item.subitems, itemId);
            });
          }
        }
      },
      itemById: function (treeItems, id) {
        if (!treeItems)
          return null;
        for (var i = 0, len = treeItems.length; i < len; i++) {
          if (treeItems[i]) {
            if (treeItems[i].id === id)
              return treeItems[i];
            var x = internals.itemById(treeItems[i].subitems, id);
            if (x)
              return x;
          }
        }
        return null;
      },
      traverse: function (treeItems, f, g) {
        if (!treeItems)
          return;
        for (var i = 0, len = treeItems.length; i < len; i++) {
          if (treeItems[i]) {
            f && f(treeItems[i])
            internals.traverse(treeItems[i].subitems, f, g);
            g && g(treeItems[i])
          }
        }
      },
    }

    var utils = {
      gencount: 0,
      generateId: function () {
        return 'itemid-' + Math.floor(Math.random() * 10000) + '-' + new Date().getTime() + '-' + this.gencount++;
      },
      initItem: function (item) {
        item.subitems = item.subitems || [];
        return item;
      },
      createSubitem: function (item) {
        item.subitems = item.subitems || [];
        var newItem = {};
        newItem.parent = item;
        return utils.initItem(newItem);
      },
      selectSubitems: function (item, isChecked) {
        internals.traverse(item.subitems, function (subitem) {
          console.log('selectSubitems subitem', isChecked, subitem)
          $('#checkbox-' + subitem.id).prop('checked', isChecked)
        })
      },
    };

    var utilsTree = {
      itemById: function (id) {
        return internals.itemById(treeItems, id);
      },
      traverse: function (f, g) {
        internals.traverse(treeItems, f, g);
        return this;
      },
      delItem: function (id) {
        internals.delItem(treeItems, id);
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
      collapseAll: function (b) {
        utilsTree.traverse(function (item) {
          item.isCollapsed = b;
        })
        init()
      },
      getSelectedItems: function () {
        const selected = [];
        $('#' + treeid + ' input[type=checkbox]:checked').each(function (idx, elem) {
          selected.push(elem)
        })
        return selected.map(function (elem) {
          return utilsTree.itemById(elem.id.replace('checkbox-', ''));
        }).filter(function (item) {
          return item.data;
        }).map(function (item) {
          return item.data;
        })
      }
    };

    var renderTree = {
      renderListItem: function (item) {
        item.subitems.forEach(function (subitem) {
          subitem.parent = item;
        })
        item.id = item.id || utils.generateId()
        const actions = item.actions ? item.actions.reduce(function (acc, action) {
          return acc += action.renderer(item)
        }, '') : '';
        const arrow = item.subitems && item.subitems.length ?
                '<i class="fa fa-caret-' + (item.isCollapsed ? 'right' : 'down') + ' fa-1x" id="caret-' + item.id + '"/>' :
                '<span>&nbsp;</span>';
        var rsubitems = renderTree.renderItems(item.subitems, item.isCollapsed);
        return _.template('\
              <li id=<%=id%> >\n\
                  <%=arrow%>\n\
                  <%=actions%>\n\
                  <%=label%>\n\
                  <%=subitems%>\n\
              </li>\n\
            ')({
          id: item.id,
          arrow: arrow,
          actions: actions,
          label: (item.label || item.id) + '',
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
      $('#' + treeid + ' .ebtree').detach();
      const x = '\
              <div class="ebtree">' +
              renderTree.renderItems(treeItems, false) +
              '</div>'
      $('#' + treeid).html(x);
    };

    var init = function () {
      redraw();
      // init actions
      // $('#' + treeid).off().on('click', myopts.onClickItem)
      $('#' + treeid + ' input[type=checkbox]').each(function (idx, elem) {
        $(elem).on('click', function (evt) {
          evt.stopPropagation();
          const checked = evt.target.checked;
          const id = evt.target.id.replace('checkbox-', '');
          const clickedItem = utilsTree.itemById(id)
          utils.selectSubitems(clickedItem, checked)
        })
      })
      $('#' + treeid + ' .fa-caret-down, #' + treeid + ' .fa-caret-right').off().on('click', function (evt) {
        var item = utilsTree.itemById(evt.target.parentElement.id);
        item.isCollapsed = !item.isCollapsed;
        if (item.isCollapsed) {
          $('#' + item.id + '>ul').hide()
          $('#caret-' + item.id).first().removeClass('fa-caret-down').addClass('fa-caret-right');
        } else {
          $('#' + item.id + '>ul').show()
          $('#caret-' + item.id).removeClass('fa-caret-right').addClass('fa-caret-down');
        }
        evt.stopPropagation();
      })
      // init actions for 
      utilsTree.traverse(function (item) {
        item.actions && item.actions.forEach(function (action) {
          console.log('Action handler registration', item, action);
          $('#' + action.prefix + '-' + item.id).on('click', function (evt) {
            action.action && action.action(item)
            evt.stopPropagation();
          })
        })
      })
      return self;
    }

    init(false);

    this.id = treeid;


    var api = {
      getSelectedItems: utilsTree.getSelectedItems,
      collapseAll: utilsTree.collapseAll,
      traverse: utilsTree.traverse,
      itemById: utilsTree.itemById,
      setFocus: utilsTree.setFocus,
      createSubitem: utils.createSubitem,
      init: init,
      availableActions: availableActions,
    };
    return _.extend(this, api);
  };

})(jQuery);