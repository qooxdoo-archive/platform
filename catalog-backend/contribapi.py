# -*- coding: utf-8 -*-
################################################################################
#
# qooxdoo - the new era of web development
#
# http://qooxdoo.org
#
# Copyright:
# 2006-2013 1&1 Internet AG, Germany, http://www.1und1.de
#
# License:
# LGPL: http://www.gnu.org/licenses/lgpl.html
# EPL: http://www.eclipse.org/org/documents/epl-v10.php
# See the LICENSE file in the project"s top-level directory for details.
#
# Authors:
#    * Richard Sternagel (rsternagel)
#
################################################################################

from flask import Flask
from flask import request
from flask import jsonify
from flask import json
from flask import make_response

import codecs
import os

app = Flask(__name__)

# write stacktraces to apache error log
# TODO: wrap with condition cause this "must never be used on production machines"
app.debug = True

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
CONTRIB_DIR = "catalog"
ABS_CONTRIB_DIR = CUR_DIR + "/" + CONTRIB_DIR

class RestApi(object):
    """Main entry point for REST-Requests.
    """

    @app.route("/catalog/", methods=["GET"])
    def get_contribs_index():
        """Gets contribs index
        """
        filenames = os.listdir(ABS_CONTRIB_DIR)
        RESOURCE = "catalog"
        index = {}

        for name in [name[:-5] for name in filenames]:
            index[name] = request.url_root + RESOURCE + "/" + name

        return jsonify(index)

    @app.route("/catalog/<contrib_name>", methods=["GET", "PUT"])
    def process_contrib_detail(contrib_name):
        """Gets/Adds/Updates a contribition identified by <contrib_name>.

        .. seealso:: http://flask.pocoo.org/docs/api/#incoming-request-data
        """
        if request.method == "GET":
            contrib_file = codecs.open(ABS_CONTRIB_DIR+"/"+contrib_name+".json", encoding="utf8")
            return jsonify(json.load(contrib_file))

        if request.method == "PUT" and request.json:
            contrib_file = codecs.open(ABS_CONTRIB_DIR+"/"+contrib_name+".json", "w", "utf8")
            rawJson = json.dumps(request.json)
            contrib_file.write(rawJson);
            return jsonify(request.json), 201

if __name__ == "__main__":
    app.run()
