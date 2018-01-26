# Build as jupyterhub/singleuser
# Run with the DockerSpawner in JupyterHub

ARG BASE_IMAGE=jupyter/base-notebook
FROM $BASE_IMAGE
#MAINTAINER Project Jupyter <jupyter@googlegroups.com>

ARG JUPYTERHUB_VERSION=master
# install pinned jupyterhub and ensure notebook is installed
RUN pip install jupyterhub==$JUPYTERHUB_VERSION && \
    pip install notebook

RUN pip install jupyterlab==0.31.0 && jupyter serverextension enable --py jupyterlab --sys-prefix

RUN jupyter labextension install @jupyterlab/hub-extension
ADD jupyterhub_config.py .
#ADD modules ./modules
CMD ['jupyter', 'labhub']
