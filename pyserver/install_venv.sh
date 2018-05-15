#!/usr/bin/env bash
M_DIR="$1"
REQ_TXT=${M_DIR}/requirements.txt

DEV_ARRAY=(/usr/local/bin/python3 /usr/local/bin/virtualenv /usr/local/bin/virtualenvwrapper.sh)
PROD_ARRAY=(/usr/bin/python3.6 /usr/bin/virtualenv /usr/bin/virtualenvwrapper.sh)

if [ -f ${DEV_ARRAY[0]} ] && [ -f ${DEV_ARRAY[1]} ] && [ -f ${DEV_ARRAY[2]} ];
then
    export VIRTUALENVWRAPPER_PYTHON=${DEV_ARRAY[0]}
    export VIRTUALENVWRAPPER_VIRTUALENV=${DEV_ARRAY[1]}
    source ${DEV_ARRAY[2]}
elif [ -f ${PROD_ARRAY[0]} ] && [ -f ${PROD_ARRAY[1]} ] && [ -f ${PROD_ARRAY[2]} ];
then
    export VIRTUALENVWRAPPER_PYTHON=${PROD_ARRAY[0]}
    export VIRTUALENVWRAPPER_VIRTUALENV=${PROD_ARRAY[1]}
    source ${PROD_ARRAY[2]}
else
    echo "Python Env Error!"
    exit 1
fi


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