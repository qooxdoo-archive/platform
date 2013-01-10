/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

/**
 * Shameless copy of fce.Util parts.
 */
qx.Class.define("contribCatalog.Util", {

  statics :
  {
    /**
     * Stringifies a map and does a little pretty-printing.
     *
     * @param data {Map} Map to be serialized
     * @return {String} Formatted JSON representation of the data
     */
    getFormattedJson : function(data)
    {
      var temp = {};
      // sort the map by key names. May or may not work depending on JS engine.
      var sortedKeys = Object.keys(data).sort();
      for (var i=0,l=sortedKeys.length; i<l; i++) {
        var key = sortedKeys[i];
        //convert non-primitive values that were serialized to allow editing back into objects
        if (data[key] === "null" || /^(?:\{|\[)".*(?:\}|\])$/.test(data[key])) {
          temp[key] = qx.lang.Json.parse(data[key]);
        } else {
          temp[key] = data[key];
        }
      }

      // this is far from beautiful - but it works for now (part I)
      var formatArray = function (k, v) {
        return (Array.isArray(v) && v.length === 2) ? JSON.stringify(v) : v;
      };

      // this is far from beautiful - but it works for now (part II)
      var removeMarks = function(str) {
        return str.replace(/\\"/g, '"').replace(/"\[/g, "[").replace(/\]"/g, "]").replace(/","/g, '", "');
      };

      return removeMarks(qx.lang.Json.stringify(temp, formatArray, 2));
    }
  }
});
