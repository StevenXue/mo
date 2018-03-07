#!/usr/bin/env bash
mktmpenv
toggleglobalsitepackages
jupyter labhub --NotebookApp.allow_origin=* --NotebookApp.token='' &
tensorboard --logdir=/home/jovyan/work/logs &
#python -m http.server 6006