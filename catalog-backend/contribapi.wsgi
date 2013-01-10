# Now using python-path option of WSGIDaemonProcess...
#
# @see http://flask.pocoo.org/docs/deploying/mod_wsgi/
# @see http://code.google.com/p/modwsgi/wiki/VirtualEnvironments
# @see http://code.google.com/p/modwsgi/wiki/ConfigurationDirectives#WSGIDaemonProcess

# ... which does the following for us automatically ...
# import os
# import sys
#
# CUR_DIR = os.path.dirname(os.path.abspath(__file__))
# VIRTENV_DIR = '.virtualenvs/'
#
# activate_this = '/Users/rsternagel/' + VIRTENV_DIR + 'qx-catalog-backend/bin/activate_this.py'
# execfile(activate_this, dict(__file__=activate_this))
#
# sys.path.insert(0, CUR_DIR)

from contribapi import app as application
