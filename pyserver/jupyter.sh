#!/usr/bin/env bash
cd user_directory
python3 -m notebook --no-browser --NotebookApp.allow_origin="*" --NotebookApp.disable_check_xsrf=True --NotebookApp.token='' --NotebookApp.iopub_data_rate_limit=10000000000 --ip='0.0.0.0'
