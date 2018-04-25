#!/usr/bin/env bash

export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3.6
export VIRTUALENVWRAPPER_VIRTUALENV=/usr/local/bin/virtualenv
source /usr/local/bin/virtualenvwrapper.sh

workon $(workon)
echo "freezing env"
pip freeze > /home/jovyan/work/requirements.txt
echo "freeze env done"

