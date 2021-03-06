# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

### base-notebook/Dockerfile

# Ubuntu 16.04 (xenial) from 2017-07-23
# https://github.com/docker-library/official-images/commit/0ea9b38b835ffb656c497783321632ec7f87b60c
FROM ubuntu@sha256:84c334414e2bfdcae99509a6add166bbb4fa4041dc3fa6af08046a66fed3005f

LABEL maintainer="Jupyter Project <jupyter@googlegroups.com>"

USER root

# Fix apt-get update network error
RUN echo "nameserver 8.8.8.8" | tee /etc/resolv.conf > /dev/null

# Install all OS dependencies for notebook server that starts but lacks all
# features (e.g., download as all possible file formats)
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get -yq dist-upgrade \
 && apt-get install -yq --no-install-recommends \
    wget \
    bzip2 \
    ca-certificates \
    sudo \
    locales \
    fonts-liberation \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen

# Install Tini
RUN wget --quiet https://github.com/krallin/tini/releases/download/v0.10.0/tini && \
    echo "1361527f39190a7338a0b434bd8c88ff7233ce7b9a4876f3315c22fce7eca1b0 *tini" | sha256sum -c - && \
    mv tini /usr/local/bin/tini && \
    chmod +x /usr/local/bin/tini

# Configure environment
ENV LOCAL_DIR=/user/local \
    SHELL=/bin/bash \
    NB_USER=jovyan \
    NB_UID=1000 \
    NB_GID=100 \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8
ENV PATH=$LOCAL_DIR/bin:$PATH \
    HOME=/home/$NB_USER
# add python path to bash
RUN /bin/bash -c "export PATH=$LOCAL_DIR/bin:\$PATH"


ADD fix-permissions /usr/local/bin/fix-permissions
# Create jovyan user with UID=1000 and in the 'users' group
# and make sure these dirs are writable by the `users` group.
RUN useradd -m -s /bin/bash -N -u $NB_UID $NB_USER && \
    mkdir -p $LOCAL_DIR && \
    chown $NB_USER:$NB_GID $LOCAL_DIR && \
    chmod g+w /etc/passwd /etc/group && \
    fix-permissions $HOME && \
    fix-permissions $LOCAL_DIR

# install python3
RUN apt-get update
RUN apt-get install -y software-properties-common vim
#RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys F06FC659
RUN add-apt-repository ppa:jonathonf/python-3.6
RUN apt-get update

RUN apt-get install -y build-essential python3.6 python3.6-dev python3-pip python3.6-venv
RUN apt-get install -y git

# update pip
RUN python3.6 -m pip install pip --upgrade
RUN python3.6 -m pip install wheel
#RUN sudo pip3 install virtualenv virtualenv-clone pew
RUN pip3 install pipenv virtualenvwrapper

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install -y build-essential

USER $NB_UID

# Setup work directory for backward-compatibility
RUN mkdir /home/$NB_USER/work && \
    fix-permissions /home/$NB_USER
ENV WORK=/home/$NB_USER/work
#ENV WORKON_HOME=/home/$NB_USER/work/.virtualenvs
WORKDIR $HOME

# make pip and python command using python3
RUN /bin/bash -c "alias python=python3.6"
RUN /bin/bash -c "alias pip=pip3"


RUN fix-permissions $LOCAL_DIR && \
    fix-permissions /home/$NB_USER
# path dockerfile
ENV PATH=$PATH:$HOME/.local/bin
# path in container
RUN /bin/bash -c "export PATH=\$PATH:$HOME/.local/bin"

# Change pipenv index url
COPY --chown=jovyan:users Pipfile $HOME/

RUN pipenv install

#RUN cat Pipfile

#RUN pipenv install && pipenv shell
# Install Jupyter Notebook and Hub
RUN pipenv install \
    'notebook==5.2.*' \
    'jupyterhub==0.8.*' \
    'jupyterlab==0.31.*'
RUN pipenv run jupyter labextension install @jupyterlab/hub-extension@^0.8.0 && \
#    npm cache clean && \
    rm -rf $LOCAL_DIR/share/jupyter/lab/staging && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    fix-permissions $LOCAL_DIR && \
    fix-permissions /home/$NB_USER

USER root

EXPOSE 8888
#WORKDIR $HOME

# Configure container startup
ENTRYPOINT ["tini", "--"]
CMD ["start-notebook.sh"]

# Add local files as late as possible to avoid cache busting
COPY start.sh /usr/local/bin/
COPY start-notebook.sh /usr/local/bin/
COPY start-singleuser.sh /usr/local/bin/
COPY jupyter_notebook_config.py /etc/jupyter/
RUN fix-permissions /etc/jupyter/

### minimal-notebook/Dockerfile

# Switch back to jovyan to avoid accidental container runs as root
USER $NB_UID

USER root

# Install all OS dependencies for fully functional notebook server
RUN apt-get update && apt-get install -yq --no-install-recommends \
    build-essential \
    emacs \
    git \
    inkscape \
    jed \
    libsm6 \
    libxext-dev \
    libxrender1 \
    lmodern \
    pandoc \
    python-dev \
    texlive-fonts-extra \
    texlive-fonts-recommended \
    texlive-generic-recommended \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-xetex \
    vim \
    unzip \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Switch back to jovyan to avoid accidental container runs as root
USER $NB_UID

### scipy-notebook/Dockerfile

USER root

# libav-tools for matplotlib anim
RUN apt-get update && \
    apt-get install -y --no-install-recommends libav-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER $NB_UID

# Install Python 3 packages
# Remove pyqt and qt pulled in for matplotlib since we're only ever going to
# use notebook-friendly backends in these images
RUN pipenv install \
    'ipywidgets==7.1.*' \
    'pandas==0.19.*' \
    'numexpr==2.6.*' \
    'matplotlib==2.0.*' \
    'scipy==0.19.*' \
    'seaborn==0.7.*' \
    'scikit-learn==0.18.*' \
    'scikit-image==0.12.*' \
    'sympy==1.0.*' \
    'cython==0.25.*' \
    'patsy==0.4.*' \
    'statsmodels==0.8.*' \
    'cloudpickle==0.2.*' \
    'dill==0.2.*' \
    'numba==0.31.*' \
    'bokeh==0.12.*' \
    'sqlalchemy==1.1.*' \
    'h5py==2.6.*' \
    'vincent==0.4.*' \
    'beautifulsoup4==4.5.*' \
    'protobuf==3.*' \
    'xlrd==1.1.*'
    # Activate ipywidgets extension in the environment that runs the notebook server
RUN pipenv run jupyter nbextension enable --py widgetsnbextension --sys-prefix && \
    # Also activate ipywidgets extension for JupyterLab
    pipenv run jupyter labextension install @jupyter-widgets/jupyterlab-manager@^0.33.1
#    npm cache clean && \
RUN rm -rf $LOCAL_DIR/share/jupyter/lab/staging && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    rm -rf /home/$NB_USER/.node-gyp && \
    fix-permissions $LOCAL_DIR && \
    fix-permissions /home/$NB_USER

# Install facets which does not have a pip or conda package at the moment
RUN cd /tmp && \
    git clone https://github.com/PAIR-code/facets.git && \
    cd $HOME && \
    pipenv run jupyter nbextension install /tmp/facets/facets-dist/ --sys-prefix && \
    rm -rf /tmp/facets && \
    fix-permissions $LOCAL_DIR && \
    fix-permissions /home/$NB_USER

WORKDIR $HOME

# Import matplotlib the first time to build the font cache.
ENV XDG_CACHE_HOME /home/$NB_USER/.cache/
RUN MPLBACKEND=Agg pipenv run python -c "import matplotlib.pyplot" && \
    fix-permissions /home/$NB_USER

USER $NB_UID

### tensorflow-notebook/Dockerfile

# Install Tensorflow
RUN pipenv install \
    'tensorflow==1.3.*' \
    'keras==2.0.*' && \
    fix-permissions $LOCAL_DIR && \
    fix-permissions /home/$NB_USER

### my notebook

USER $NB_UID

RUN cat Pipfile
RUN pipenv install tensorflow==1.6.* keras==2.1.* notebook==5.4.*
RUN pipenv install opencv-python
#RUN pipenv install jupyterlab==0.31.0
#RUN pipenv run jupyter serverextension enable --py jupyterlab --sys-prefix

# for interactive shell
RUN echo 'alias python=python3.6' >> ~/.bashrc
RUN echo 'alias pip=pip3' >> ~/.bashrc
RUN echo 'export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3.6' >> ~/.bashrc
RUN echo 'export VIRTUALENVWRAPPER_VIRTUALENV=/usr/local/bin/virtualenv' >> ~/.bashrc
RUN echo 'source /usr/local/bin/virtualenvwrapper.sh' >> ~/.bashrc

USER root

RUN apt-get update && apt-get install -yq graphviz tzdata
RUN ln -sf /usr/share/zoneinfo/Etc/UTC  /etc/localtime
RUN echo "Asia/Shanghai" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata
RUN echo -e "`/sbin/ip route|awk '/default/ { print $3 }'`\thost.docker.internal" | tee -a /etc/hosts > /dev/null
#RUN echo '172.17.0.1    host.docker.internal' >> /etc/hosts

#RUN /bin/bash -c "export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3.6"
#RUN /bin/bash -c "export VIRTUALENVWRAPPER_VIRTUALENV=/usr/local/bin/virtualenv"
#RUN /bin/bash -c "source /usr/local/bin/virtualenvwrapper.sh"
#RUN source ~/.bashrc
USER $NB_UID

ADD --chown=jovyan:users run.sh /home/jovyan
ADD --chown=jovyan:users add_venv.sh /home/jovyan
ADD --chown=jovyan:users remove_venv.sh /home/jovyan
ADD --chown=jovyan:users freeze_venv.sh /home/jovyan
ADD --chown=jovyan:users modules /home/jovyan/modules
ADD --chown=jovyan:users dataset /home/jovyan/dataset
ADD --chown=jovyan:users pip.conf /home/jovyan/.pip/pip.conf
CMD ['bash', '/home/jovyan/run.sh']