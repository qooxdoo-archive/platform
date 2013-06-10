Readme
======
This is a short introduction what is needed to get the backend running.

Requirememts
------------
  - webserver with WSGI
  - Python >= 2.6
  - virtualenv

Setup
-----
File Permissions:
  Remember that the catalog/ dir should be readable and writable
  for the webserver/WSGI user (as long as a file storage is used for the contributions).

Webserver config (Apache example):
  <VirtualHost *:80>
      ServerName qooxdoo.devel
      DocumentRoot /Users/{myUser}/workspace
      ErrorLog /Users/{myUser}/workspace/contrib-platform.git/catalog-backend/logs/apache_error.log
      CustomLog /Users/{myUser}/workspace/contrib-platform.git/catalog-backend/logs/apache_access.log combined

      WSGIDaemonProcess qx-catalog-backend \
        python-path=/Users/{myUser}/workspace/contrib-platform.git/catalog-backend:/Users/{myUser}/.virtualenvs/qx-catalog-backend/lib/python2.7/site-packages
      WSGIScriptAlias /contrib /Users/{myUser}/workspace/contrib-platform.git/catalog-backend/contribapi.wsgi

      <Directory /Users/{myUser}/workspace/contrib-platform.git/catalog-backend>
         WSGIProcessGroup qx-catalog-backend
         WSGIApplicationGroup %{GLOBAL}
         Order deny,allow
         Deny from all
         Allow from 127.0.0.0/255.0.0.0 ::1/128
      </Directory>
  </VirtualHost>

Python dependencies (via virtualenv):
  $ mkdir ~/.virtualenvs
  $ cd ~/.virtualenvs
  $ virtualenv --no-site-packages --distribute qx-catalog-backend
  $ source qx-catalog-backend/bin/activate
  $ cd path/to/git-clone
  $ pip install -r requirements.txt
  $ deactivate
  hack ... hack ... hack
  $ touch contribapi.wsgi     # triggers reload of WSGI app
  hack ... hack ... hack
  ...

