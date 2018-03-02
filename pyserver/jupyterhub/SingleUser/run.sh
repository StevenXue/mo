#!/usr/bin/env bash
jupyter labhub --NotebookApp.allow_origin=* --NotebookApp.token='' &
tensorboard --logdir=/home/jovyan/work/logs
#python -m http.server 6006