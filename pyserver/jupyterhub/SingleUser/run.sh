#!/usr/bin/env bash
mktmpenv
toggleglobalsitepackages
tensorboard --logdir=/home/jovyan/work/logs &
jupyter labhub --NotebookApp.allow_origin=* --NotebookApp.token=''
#python -m http.server 6006