#!/usr/bin/env bash
M_DIR="$1"
REQ_TXT=${M_DIR}/requirements.txt

export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3.6
export VIRTUALENVWRAPPER_VIRTUALENV=/usr/bin/virtualenv
source /usr/bin/virtualenvwrapper.sh

if [ ! -d ${M_DIR} ]; then
    echo "No such directory: $M_DIR"
    exit 1
fi

if [ ! -f ${REQ_TXT} ]; then
    echo "No such file: $REQ_TXT"
    exit 1
fi

# create module env
export WORKON_HOME=${M_DIR}
mkvirtualenv mynewenv
# install packages
pip install -r ${REQ_TXT}