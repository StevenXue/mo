#!/usr/bin/env bash
gunicorn -b 0.0.0.0:5000 --worker-class eventlet -w 1 --reload --log-level=DEBUG -t 600 run:app
