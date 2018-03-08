#!/usr/bin/env bash
#mktmpenv
#toggleglobalsitepackages
pipenv run tensorboard --logdir=/home/jovyan/work/logs &
pipenv run jupyter labhub --NotebookApp.allow_origin=* --NotebookApp.token=''
#python -m http.server 6006