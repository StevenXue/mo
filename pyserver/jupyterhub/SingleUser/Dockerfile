# Build as jupyterhub/singleuser
# Run with the DockerSpawner in JupyterHub

ARG BASE_IMAGE=jupyter/base-notebook
FROM $BASE_IMAGE

USER root
RUN apt-get update && apt-get install -y curl

USER jovyan
#MAINTAINER Project Jupyter <jupyter@googlegroups.com>
ARG JUPYTERHUB_VERSION=master
# install pinned jupyterhub and ensure notebook is installed
RUN pip install jupyterhub==$JUPYTERHUB_VERSION && \
    pip install notebook

RUN pip install jupyterlab==0.31.0 && jupyter serverextension enable --py jupyterlab --sys-prefix

RUN jupyter labextension install @jupyterlab/hub-extension
RUN pip install tensorflow -U
RUN pip install virtualenvwrapper
#RUN apt-get install curl
ADD run.sh .
#ADD modules ./modules
CMD ['bash', '/home/jovyan/run.sh']
