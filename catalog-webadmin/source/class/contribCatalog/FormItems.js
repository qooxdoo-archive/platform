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

qx.Class.define("contribCatalog.FormItems", {
  extend : qx.ui.container.Composite,

  events :
  {
    "publish"           : "qx.event.type.Data",
    "contribSelected"   : "qx.event.type.Data"
  },

  construct : function() {
    this.base(arguments);

    this.__createView();
  },

  members : {
    __formEntry: null,
    __contribArea : null,
    __contribSelectBox : null,
    __nameField : null,
    __urlField : null,
    __categoryBox : null,
    __versionBox : null,
    __downloadsVersionField : null,
    __downloadsUrlField : null,
    __formEntryController : null,
    __categoryBoxController : null,

    __createView : function()
    {
      var grid = new qx.ui.layout.Grid(20, 5);
      // grid.setColumnFlex(0, 1);
      // grid.setColumnFlex(1, 1);
      grid.setColumnWidth(0, 520);
      grid.setColumnWidth(1, 520);
      this.setLayout(grid);
      this.setPadding(10);

      var groupBoxSelection = new qx.ui.groupbox.GroupBox("Add new or edit existing contrib:");
      groupBoxSelection.setLayout(new qx.ui.layout.Canvas());
      this.add(groupBoxSelection, {row: 0, column: 0});

      var groupBoxEntry = new qx.ui.groupbox.GroupBox("Publish a new/updated contribCatalog entry:");
      groupBoxEntry.setLayout(new qx.ui.layout.Canvas());
      this.add(groupBoxEntry, {row: 1, column: 0});

      var groupBoxStoreState = new qx.ui.groupbox.GroupBox("Currently stored contribCatalog entry:");
      groupBoxStoreState.setLayout(new qx.ui.layout.Canvas());
      this.add(groupBoxStoreState, {row: 0, column: 1, rowSpan: 2});

      var formSelection = new qx.ui.form.Form();
      this.__formEntry = new qx.ui.form.Form();

      this.__createContribSelectionFields(formSelection);
      this.__createEntryFields(this.__formEntry);
      this.__createDownloadFields(this.__formEntry);

      this.__formEntryController = new qx.data.controller.Form(null, this.__formEntry);
      var formModel = this.__formEntryController.createModel();

      var publishButton = new qx.ui.form.Button("Publish");
      this.__formEntry.addButton(publishButton);

      publishButton.addListener("execute", function() {
        if (this.__formEntry.validate()) {

          // TODO: isn't working yet
          if (this.__contribSelectBox.getSelection()[0].getLabel().indexOf("New") === 0
              && this.__downloadsVersionField.getValue() !== "current") {
            alert("Please add a archive location for the current version first (i.e. master/trunk/tip ...)");
          }

          this.fireDataEvent("publish", formModel);
        }
      }, this);

      var renderedFormSelection = new qx.ui.form.renderer.Single(formSelection);
      var renderedFormEntry = new qx.ui.form.renderer.Single(this.__formEntry);
      groupBoxSelection.add(renderedFormSelection);
      groupBoxEntry.add(renderedFormEntry);

      // display all contribs
      this.__contribArea = new qx.ui.form.TextArea();
      this.__setReadOnlyAndDisableFor(this.__contribArea, true);
      this.__contribArea.setWidth(450);
      this.__contribArea.setHeight(300);
      groupBoxStoreState.add(this.__contribArea);
    },

    updateContribFormWith : function(contribModel) {
        var obj = qx.util.Serializer.toNativeObject(contribModel);
        var formattedJson = contribCatalog.Util.getFormattedJson(obj);
        this.__contribArea.setValue(formattedJson);

        contribModel.bind("name", this.__nameField, "value");
        contribModel.bind("projecturl", this.__urlField, "value");
        this.__setReadOnlyAndDisableFor(this.__nameField, true);

        this.__categoryBoxController.setSelection(new qx.data.Array([contribModel.getCategory()]));

        this.__updateAvailableVersions(obj.downloads, this.__versionBox);
    },

    updateContribIndex : function(qxModel) {
        var index = qx.util.Serializer.toNativeObject(qxModel);
        var versionKeys = Object.keys(index).sort();
        versionKeys.unshift("New contrib... (or select existing)");

        this.__contribSelectBox.removeAll();
        versionKeys.forEach(function(obj) {
          this.__contribSelectBox.add(new qx.ui.form.ListItem(obj));
        }, this);
    },

    __createEntryFields : function(form)
    {
      // name
      this.__nameField = new qx.ui.form.TextField();
      this.__nameField.setPlaceholder("{myProject}");
      this.__nameField.setRequired(true);
      this.__nameField.setWidth(400);
      form.add(this.__nameField, "name");

      // url
      this.__urlField = new qx.ui.form.TextField();
      this.__urlField.setPlaceholder("e.g. https://github.com/{myUser}/{myProject}");
      this.__urlField.setRequired(true);
      form.add(this.__urlField, "project-url", qx.util.Validate.url());

      // categories
      var categoryModel = new qx.data.Array(["Themes", "Widgets", "Drawing", "Misc", "Tool", "Backend"]);
      this.__categoryBox = new qx.ui.form.SelectBox();
      this.__categoryBox.setRequired(true);
      this.__categoryBoxController = new qx.data.controller.List(categoryModel, this.__categoryBox);
      form.add(this.__categoryBox, "category");
    },

    __createDownloadFields : function(form)
    {
      form.addGroupHeader("downloads");

      // version select box
      this.__versionBox = new qx.ui.form.SelectBox();

      ["New version... (or select existing)", "current"].forEach(function(obj) {
        var item = new qx.ui.form.ListItem(obj);
        item.setModel(obj);
        this.__versionBox.add(item);
      }, this);

      this.__versionBox.addListener("changeSelection", function() {
        if (this.__versionBox.getSelection().length === 0) { return; }

        var selectedItem = this.__versionBox.getSelection()[0].getLabel();
        if (selectedItem.indexOf("New") === 0) {
          this.__setReadOnlyAndDisableFor(this.__downloadsVersionField, false);
          this.__downloadsVersionField.resetValue();
          this.__downloadsUrlField.resetValue();
        } else {
          this.__downloadsVersionField.setValue(selectedItem);
          this.__setReadOnlyAndDisableFor(this.__downloadsVersionField, true);
        }
      }, this);

      form.add(this.__versionBox, "Add/Edit ...");

      // version
      this.__downloadsVersionField = new qx.ui.form.TextField();
      this.__downloadsVersionField.setRequired(true);
      form.add(this.__downloadsVersionField, "version");

      // url
      this.__downloadsUrlField = new qx.ui.form.TextField();
      this.__downloadsUrlField.setPlaceholder("https://github.com/{myUser}/{myProject}/archive/master.tar.gz");
      this.__downloadsUrlField.setRequired(true);
      form.add(this.__downloadsUrlField, "url", qx.util.Validate.url());
    },

    __createContribSelectionFields: function(form)
    {
      // existing contribs
      this.__contribSelectBox = new qx.ui.form.SelectBox();
      this.__contribSelectBox.setRequired(true);
      this.__contribSelectBox.setWidth(400);
      form.add(this.__contribSelectBox, "contrib");

      this.__contribSelectBox.addListener("changeSelection", function() {
        if (this.__contribSelectBox.getSelection().length === 0) { return; }

        var selectedItem = this.__contribSelectBox.getSelection()[0].getLabel();
        if (selectedItem.indexOf("New") === 0) {
          this.__formEntry.reset();
          this.__contribArea.resetValue();
          this.__setReadOnlyAndDisableFor(this.__contribArea, false);
        } else {
          this.fireDataEvent("contribSelected", selectedItem);
          this.__setReadOnlyAndDisableFor(this.__contribArea, true);
        }
      }, this);
    },

    __setReadOnlyAndDisableFor: function(widget, readOnly)
    {
      if (readOnly === true) {
        widget.setReadOnly(true);
        widget.addState("disabled");
      } else {
        widget.setReadOnly(false);
        widget.removeState("disabled");
      }
    },

    __updateAvailableVersions: function(allDownloads, selectBox)
    {
      var versionKeys = [];

      if (allDownloads !== null) {
        allDownloads.forEach(function(obj) {
          versionKeys.push(obj[0]);
        }, this);

        if (versionKeys.indexOf("current") === -1) {
          versionKeys.unshift("current");
        }
      } else {
        versionKeys.unshift("current");
      }

      versionKeys.unshift("New version... (or select existing)");

      selectBox.removeAll();
      versionKeys.forEach(function(obj) {
        selectBox.add(new qx.ui.form.ListItem(obj));
      }, this);
    }
  }
});
