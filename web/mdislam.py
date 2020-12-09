#!/opt/www/venv/mdislam.com/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/opt/www/mdislam.com/")

from rest.app import app as application
application.secret_key = 'mdislam'
