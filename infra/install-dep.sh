#!/bin/bash

INSTALL_DIR=/opt/www
APP_NAME=mdislam.com
rm -rf ${INSTALL_DIR}/${APP_NAME}
mkdir -p ${INSTALL_DIR}

apt update
apt install -y python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv nginx
git clone https://github.com/mdnahian/${APP_NAME}.git ${INSTALL_DIR}/${APP_NAME}
rm -rf ${INSTALL_DIR}/venv/${APP_NAME}
mkdir -p ${INSTALL_DIR}/venv
python3 -m venv ${INSTALL_DIR}/venv/${APP_NAME}
${INSTALL_DIR}/venv/${APP_NAME}/bin/pip install wheel
${INSTALL_DIR}/venv/${APP_NAME}/bin/pip install -r ${INSTALL_DIR}/${APP_NAME}/web/requirements.txt

mkdir -p /var/log/uwsgi
mv ${INSTALL_DIR}/${APP_NAME}/web/rest.service /etc/systemd/system/mdislam.service
chown -R www-data:www-data /var/log/uwsgi
chown -R www-data:www-data ${INSTALL_DIR}
systemctl restart mdislam
systemctl enable mdislam

mv  ${INSTALL_DIR}/${APP_NAME}/web/rest.nginx /etc/nginx/sites-available/mdislam.com
ln -sf /etc/nginx/sites-available/mdislam.com /etc/nginx/sites-enabled
nginx -t
systemctl daemon-reload
systemctl restart nginx
ufw allow 'Nginx Full'

