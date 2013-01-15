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

    this.__loggedInUser = arguments[0];
    this.__createView();
  },

  members : {
    __loggedInUser : null,
    __formEntry : null,
    __publishButton : null,
    __contribArea : null,
    __contribBox : null,
    __authorField : null,
    __nameField : null,
    __urlField : null,
    __categoryBox : null,
    __versionBox : null,
    __downloadsVersionField : null,
    __downloadsUrlField : null,
    __formEntryController : null,
    __categoryBoxController : null,
    __versionBoxController : null,
    __contribBoxController : null,

    __createView : function()
    {
      var grid = new qx.ui.layout.Grid(20, 5);
      // grid.setColumnFlex(0, 1);
      // grid.setColumnFlex(1, 1);
      grid.setColumnWidth(0, 520);
      grid.setColumnWidth(1, 520);
      this.setLayout(grid);
      this.setPadding(10);

      var groupBoxSelection = new qx.ui.groupbox.GroupBox("Add new or edit (your own) existing contrib:");
      groupBoxSelection.setLayout(new qx.ui.layout.Canvas());
      this.add(groupBoxSelection, {row: 0, column: 0});

      var groupBoxEntry = new qx.ui.groupbox.GroupBox("Publish a new/updated contribCatalog entry:");
      groupBoxEntry.setLayout(new qx.ui.layout.Canvas());
      this.add(groupBoxEntry, {row: 1, column: 0});

      var groupBoxStoreState = new qx.ui.groupbox.GroupBox("Currently stored contribCatalog entry:");
      groupBoxStoreState.getChildControl("frame").setLayout(new qx.ui.layout.VBox(), {flex:1});
      this.add(groupBoxStoreState, {row: 0, column: 1, rowSpan: 2});

      var formSelection = new qx.ui.form.Form();
      this.__formEntry = new qx.ui.form.Form();

      this.__createContribSelectionFields(formSelection);
      this.__createEntryFields(this.__formEntry);
      this.__createDownloadFields(this.__formEntry);

      this.__formEntryController = new qx.data.controller.Form(null, this.__formEntry);
      var formModel = this.__formEntryController.createModel();

      this.__publishButton = new qx.ui.form.Button("Publish");
      this.__formEntry.addButton(this.__publishButton);

      this.__publishButton.addListener("execute", function() {
        if (this.__formEntry.validate()) {

          // if adding a new contrib current version should be provided first
          if (this.__contribBox.getSelection()[0].getLabel().indexOf("New") === 0 &&
              this.__downloadsVersionField.getValue() !== "current") {
            alert("Please add an archive location for the 'current' version first.\n"+
                  "This version is already prepopulated in the drop-down list 'Add/Edit ...'.\n"+
                  "An appropriated value would be an URL pointing to the tip of your main branch as archive file.");
          } else {
            this.fireDataEvent("publish", formModel);
          }
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
      this.__contribArea.setHeight(400);
      groupBoxStoreState.add(this.__contribArea);
    },

    updateContribFormWith : function(contribModel) {
        var obj = qx.util.Serializer.toNativeObject(contribModel);
        var formattedJson = contribCatalog.Util.getFormattedJson(obj);
        this.__contribArea.setValue(formattedJson);

        contribModel.bind("author", this.__authorField, "value");
        contribModel.bind("name", this.__nameField, "value");
        contribModel.bind("projecturl", this.__urlField, "value");
        this.__setReadOnlyAndDisableFor(this.__authorField, true);
        this.__setReadOnlyAndDisableFor(this.__nameField, true);

        this.__categoryBoxController.setSelection(new qx.data.Array([contribModel.getCategory()]));

        this.__updateAvailableVersions(obj.downloads, this.__versionBoxController);

        this.__contribBoxController.setSelection(new qx.data.Array([contribModel.getName()]));

        // publish is only allowed if user=author
        if (this.__loggedInUser === this.__authorField.getValue()) {
          this.__setEnableFor(this.__publishButton, true);
        } else {
          this.__setEnableFor(this.__publishButton, false);
        }
    },

    updateContribIndex : function(qxModel) {
      var index = qx.util.Serializer.toNativeObject(qxModel);
      var allContribNames = Object.keys(index).sort();
      var defaultEntry = "New contrib... (or select existing)";

      allContribNames.unshift(defaultEntry);
      this.__contribBoxController.setModel(new qx.data.Array(allContribNames));
    },

    __createEntryFields : function(form)
    {
      // author
      this.__authorField = new qx.ui.form.TextField();
      this.__authorField.setWidth(400);
      this.__authorField.setRequired(true);
      this.__setReadOnlyAndDisableFor(this.__authorField, true);
      form.add(this.__authorField, "author");

      // name
      this.__nameField = new qx.ui.form.TextField();
      this.__nameField.setPlaceholder("{myProject}");
      this.__nameField.setRequired(true);
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

      var versionModel = new qx.data.Array(["New version... (or select existing)", "current"]);
      this.__versionBoxController = new qx.data.controller.List(versionModel, this.__versionBox);

      this.__versionBox.addListener("changeSelection", function() {
        if (this.__versionBox.getSelection().length === 0) { return; }

        var curSelectedVersion = this.__versionBox.getSelection()[0].getLabel();
        if (curSelectedVersion.indexOf("New") === 0) {
          this.__setReadOnlyAndDisableFor(this.__downloadsVersionField, false);
          this.__downloadsVersionField.resetValue();
          this.__downloadsUrlField.resetValue();
        } else {
          this.__downloadsVersionField.setValue(curSelectedVersion);
          this.__setReadOnlyAndDisableFor(this.__downloadsVersionField, true);
        }
      }, this);

      form.add(this.__versionBox, "Add/Edit ...");

      // version
      this.__downloadsVersionField = new qx.ui.form.TextField();
      this.__downloadsVersionField.setRequired(true);
      this.__downloadsVersionField.setValue("current");

      form.add(this.__downloadsVersionField, "version",
               qx.util.Validate.regExp(/^current|\d+\.\d+(\.\d+)?(?:-\d+-?)?(?:[-a-zA-Z+][-a-zA-Z0-9\.:]*)?$/,
                                       "doesn't adhere to http://semver.org or isn't 'current'."));

      // url
      this.__downloadsUrlField = new qx.ui.form.TextField();
      this.__downloadsUrlField.setPlaceholder("e.g. https://github.com/{myUser}/{myProject}/archive/master.tar.gz");
      this.__downloadsUrlField.setRequired(true);
      form.add(this.__downloadsUrlField, "url", qx.util.Validate.url());
    },

    __createContribSelectionFields: function(form)
    {
      // existing contribs
      this.__contribBox = new qx.ui.form.SelectBox();
      this.__contribBox.setRequired(true);
      this.__contribBox.setWidth(400);
      this.__contribBoxController = new qx.data.controller.List(null, this.__contribBox);
      form.add(this.__contribBox, "contrib");

      this.__contribBox.addListener("changeSelection", function() {
        if (this.__contribBox.getSelection().length === 0) { return; }

        var curSelectedContrib = this.__contribBox.getSelection()[0].getLabel();
        if (curSelectedContrib.indexOf("New") === 0) {
          this.__contribArea.resetValue();
          this.__setReadOnlyAndDisableFor(this.__contribArea, false);
          this.__authorField.setValue(this.__loggedInUser);
          this.__nameField.resetValue();
          this.__setReadOnlyAndDisableFor(this.__nameField, false);
          this.__urlField.resetValue();
          this.__categoryBox.resetSelection();
          this.__updateAvailableVersions(null, this.__versionBoxController);
          this.__setEnableFor(this.__publishButton, true);
        } else {
          this.fireDataEvent("contribSelected", curSelectedContrib);
          this.__setReadOnlyAndDisableFor(this.__contribArea, true);
        }
      }, this);
    },

    __setReadOnlyAndDisableFor: function(widget, readOnly)
    {
      if (readOnly === true) {
        widget.setReadOnly(true);
        // enable copy/paste from readonly textarea
        if (widget instanceof qx.ui.form.TextArea) {
          widget.addState("disabled");
        } else {
          widget.setEnabled(false);
        }
      } else {
        widget.setReadOnly(false);
        // enable copy/paste from readonly textarea
        if (widget instanceof qx.ui.form.TextArea) {
          widget.removeState("disabled");
        } else {
          widget.setEnabled(false);
        }
      }
    },

    __setEnableFor: function(widget, value)
    {
      if (value === true) {
        widget.setEnabled(true);
      } else {
        widget.setEnabled(false);
      }
    },

    __updateAvailableVersions: function(allDownloads, selectBoxController)
    {
      var versionKeys = ["New version... (or select existing)", "current"];

      if (allDownloads !== null) {
        allDownloads.forEach(function(obj) {
          if (obj[0] !== "current") {
            versionKeys.push(obj[0]);
          }
        }, this);
      }

      selectBoxController.setModel(new qx.data.Array(versionKeys));
      if (allDownloads === null) {
        // set current as default version, to get that version first
        selectBoxController.setSelection(new qx.data.Array(["current"]));
      }
    }
  }
});
