#!/bin/bash
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3.6
export VIRTUALENVWRAPPER_VIRTUALENV=/usr/local/bin/virtualenv
source /usr/local/bin/virtualenvwrapper.sh

workon $(workon)
python setup.py build_ext --inplace main.py
rm -rf build
rm main.c
rm main.py
rm setup.py
rm -- "$0"