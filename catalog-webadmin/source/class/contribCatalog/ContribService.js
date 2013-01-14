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

qx.Class.define("contribCatalog.ContribService",
{
  extend : qx.core.Object,

  properties : {
    contrib : {
      nullable: true,
      event: "changeContrib"
    },
    index : {
      nullable: true,
      event: "changeIndex"
    }
  },

  events : {
    "publishSuccess" : "qx.event.type.Event"
  },

  statics :
  {
    BASE_URL: "http://qooxdoo.devel/contrib/catalog/"
  },

  construct : function() {
    this.base(arguments);

    this.__indexStore = new qx.data.store.Json(contribCatalog.ContribService.BASE_URL);
    this.__indexStore.bind("model", this, "index");
  },

  members :
  {
    __indexStore : null,
    __contribStore : null,

    getOne : function(contribName, forceReload)
    {
      var BASE_URL = contribCatalog.ContribService.BASE_URL,
          prevFetchUrl = (this.__contribStore !== null) ? this.__contribStore.getUrl() : '',
          nextFetchUrl = BASE_URL+contribName;

      if (this.__contribStore === null) {
        this.__contribStore = new qx.data.store.Json(nextFetchUrl);
        this.__contribStore.bind("model", this, "contrib");
      } else {
        if (nextFetchUrl === prevFetchUrl) {
          this.__contribStore.reload();
        } else {
          this.__contribStore.setUrl(nextFetchUrl);
        }
      }
    },

    getIndex : function(forceReload)
    {
      this.__indexStore.reload();
    },

    publish : function(formModel)
    {
      var BASE_URL = contribCatalog.ContribService.BASE_URL;
      var data = this.__tailorDataObjectFrom(formModel);

      // console.log(data);

      var req = new qx.io.request.Xhr(BASE_URL+formModel.getName(), "PUT");
      req.setRequestHeader("Content-Type", "application/json");
      req.setAccept("application/json");
      req.setRequestData(JSON.stringify(data));

      req.addListener("success", function(e) {
        var resp = e.getTarget();
        if (resp.getStatus() === 201) {
          this.fireDataEvent("publishSuccess", resp.getResponse().name);
        } else {
          // this.fireEvent("publishFailure");
        }
      }, this);

      req.send();
    },

    __tailorDataObjectFrom : function(model) {
      var dataObj = {};
      dataObj.name = model.getName();
      dataObj.projecturl = model.getProjecturl();
      dataObj.category = model.getCategory();

      var found = false;
      dataObj.downloads = qx.util.Serializer.toNativeObject(this.getContrib().getDownloads()) || {};
      dataObj.downloads.forEach(function(elem, i, arr) {
        // version edit
        if (arr[i][0] === model.getVersion()) {
          arr[i][1] = model.getUrl();
          found = true;
        }
      });
      // version create
      if (found === false) {
        dataObj.downloads.push([model.getVersion(), model.getUrl()]);
      }
      dataObj.downloads.sort();

      return dataObj;
    }
  }
});

