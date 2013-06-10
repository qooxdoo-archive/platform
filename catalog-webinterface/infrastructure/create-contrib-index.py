#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2013 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Richard Sternagel (rsternagel)
#
################################################################################

##
# Creates contrib index for contrib.qooxdoo.org
##

import codecs
import json
import os
import sys

from random import choice

CATALOG_PATH = "../../../contrib-catalog.git"
IDX_FILENAME = "../website/contribindex.json"
CATEGORIES = ["theme", "widget", "drawing", "", "tool", "backend"]

# @type [""]
manifests = []

# @type [{}]
index = []

# collect all trunk or master manifests
for dirname, dirnames, filenames in os.walk(CATALOG_PATH):
    for filename in filenames:
        abspath = os.path.join(dirname, filename)
        if ("trunk/" in abspath or "master/" in abspath) and abspath.endswith("Manifest.json"):
           manifests.append(abspath)

if not manifests:
  print "No manifests collected. Check CATALOG_PATH: " + CATALOG_PATH
  sys.exit(1)

# collect and tailor their data
for filepath in manifests:
    manifest = json.load(codecs.open(filepath, encoding="utf8"))
    entry = {}
    if "info" in manifest:
        data = manifest["info"]
        data["qooxdoo-versions"] = ["master" if vers=="trunk" else vers for vers in data["qooxdoo-versions"]]
        try:
            entry["name"] = data["name"]
            entry["description"] = data["description"]
            entry["summary"] = data["summary"]
            entry["category"] = choice(CATEGORIES)  # random categories to test with
            entry["authors"] = data["authors"]
            entry["homepage"] = data["homepage"]
            entry["qxversions"] = data["qooxdoo-versions"]
            entry["license"] = data["license"]
        except KeyError:
            pass

    # add to index
    index.append(entry)

# write index to disc
raw_json = json.dumps(index)
idx_file = codecs.open(IDX_FILENAME, "w", "utf8")
idx_file.write(raw_json)
idx_file.close()

# print success message
print 'Done. Written index for ' + str(len(index)) + ' contribs into "' + IDX_FILENAME + '".'
