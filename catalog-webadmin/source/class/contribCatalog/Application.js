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

qx.Class.define("contribCatalog.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var formItems = new contribCatalog.FormItems();
      var contribService = new contribCatalog.ContribService();

      contribService.addListener("changeIndex", function(e) {
        if (e.getData() !== null) {
           formItems.updateContribIndex(e.getData());
        }
      }, this);

      contribService.addListener("changeContrib", function(e) {
        if (e.getData() !== null) {
           formItems.updateContribFormWith(e.getData());
        }
      }, this);

      formItems.addListener("contribSelected", function(e) {
        contribService.getOne(e.getData());
      }, this);


      formItems.addListener("publish", function(e) {
        contribService.publish(e.getData());
      }, this);

      contribService.addListener("publishSuccess", function(e) {
        contribService.getIndex();
        contribService.getOne(e.getData());
      }, this);

      this.getRoot().add(formItems);
    }
  }
});
