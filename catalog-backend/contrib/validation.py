#!/usr/bin/env python
# -*- coding: utf-8 -*-
##########################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2013 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Richard Sternagel (rsternagel)
#
##########################################################################

from jsonschema import Draft3Validator


class CatalogEntryValidator(object):
    """Validates catalog entries."""
    def __init__(self):
        self.pattern = {
            "url": (r"^((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)"
                    "(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+"
                    "(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s!()\[\]{}"
                    ";:'\".,?]))$"),
            "semver": (r"^current$|^\d+\.\d+(\.\d+)?(?:-[0-9]+-?)?"
                       "(?:[-a-zA-Z+][-a-zA-Z0-9\.:]*)?$")
        }
        self.pattern["semverOrUrl"] = ("(?:" + self.pattern["semver"] +
                                       ")|(?:" + self.pattern["url"] + ")")

    def schema_v1_0(self, expected_author=""):
        """Catalog entry schema for catalog v1.0. It's possible to enforce
        an author if this will be an UPDATE instead of a CREATE operation
        """
        schema = {
            "$schema": "http://json-schema.org/draft-03/schema#",
            "name": "contribCatalog entry",
            "type": "object",
            "properties": {
                "author": {
                    "type": "string",
                    "required": True,
                },
                "name": {
                    "type": "string",
                    "required": True,
                },
                "category": {
                    "type": "string",
                    "required": True,
                    "enum": [
                        "Themes",
                        "Widgets",
                        "Drawing",
                        "Misc",
                        "Tool",
                        "Backend"
                    ]
                },
                "projecturl": {
                    "type": "string",
                    "required": True,
                    "pattern": self.pattern["url"]
                },
                "downloads": {
                    "type": "array",
                    "required": True,
                    "minItems": 1,
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "minItems": 1,
                            "pattern": self.pattern["semverOrUrl"],
                            "uniqueItems": True
                        },
                    },
                    "uniqueItems": True
                }
            },
            "additionalProperties": False
        }

        # enforce author if given
        if expected_author:
            schema["properties"]["author"]["enum"] = [expected_author]

        return schema

    def validate(self, json, schema):
        """Validates catalog entry via JSON Schema. The expected_author param
        will prevent entry overrides from others than the original author.

        .. seealso:: http://json-schema.org/
        .. seealso:: http://tools.ietf.org/html/draft-zyp-json-schema-03
        .. seealso:: https://github.com/json-schema/json-schema
        """
        errors = []

        validator = Draft3Validator(schema)
        for e in validator.iter_errors(json):
            e.path.reverse()
            errors.append(e.path)

        return errors

if __name__ == "__main__":
    vali = CatalogEntryValidator()
    jsonDict = {"projecturl": "https://github/example/roland",
                "category": "Drawing",
                "downloads": [
                    ["0.2", "http://example.org/alain-0.2.tar.gz"],
                    ["0.3", "http://example.org/alain-0.3.tar.gz"],
                    ["0.4", "http://example.org/alain-0.3.tar.gz"],
                    ["0.5alpha", "http://example.org/alain-0.3.tar.gz"],
                    ["current", "http://example.org/alain-head.tar.gz"]
                ],
                "name": "roland",
                "author": "qooxdoo"}
    print vali.validate(
        jsonDict,
        vali.schema_v1_0(expected_author="qooxdoo")
    )
