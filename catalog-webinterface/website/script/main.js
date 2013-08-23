/*global List */
q.ready(function() {
    'use strict';

    var IDX_URL = 'json/contribindex.json';

    var displayContribs = function(data) {
      var listInit = true;

      var contribsTemplate = q.template.get("contribs-template", {
        contribs: data,
        amount: data.length
      })[0].innerHTML;

      q('#loading').hide();
      q('#contribs').append(contribsTemplate).find('.search').show();

      var list = new List('contribs', {
        valueNames: [
          'ctb-name',
          'ctb-description',
          'ctb-category',
          'ctb-authors',
          'ctb-versions',
          'ctb-qxversions',
          'ctb-license'
        ],
        indexAsync: true
      });

      // replace 'name lastname' with user id if possible
      q('.ctb-author').forEach(function(item) {
        var splitted = item.innerHTML.split(" (");
        if (splitted.length === 2) {
          if (item.textContent) {
            item.textContent = splitted[1].substring(0, splitted[1].length-1);
          } else {
            item.innerHTML = splitted[1].substring(0, splitted[1].length-1);
          }
          item.title = splitted[0];
        }
      });

      list.on('updated', function () {
        if (listInit) {
          listInit = false;
        }

        if (list.matchingItems.length > 0) {
          q('.table thead').show();
          q('#search-notfound').hide();
        } else if (list.matchingItems.length === 0) {
          q('.table thead').hide();
          q('#search-notfound').show();
        }
      });
    };

    var xhr = q.io.xhr(IDX_URL);

    xhr.on('load', function(callback, xhr) {
      if (xhr.status === 200 && xhr.responseText) {
        callback(JSON.parse(xhr.responseText));
      } else {
        q('#loading p').setAttribute("text", 'Failed to load contribs list :(');
      }
    }.bind(this, displayContribs));

    xhr.on('error', function() {
      q('#loading p').setAttribute("text", 'Failed to load contribs list :(');
    });

    xhr.send();
});
