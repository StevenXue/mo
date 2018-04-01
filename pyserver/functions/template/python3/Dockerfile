FROM continuumio/anaconda3

# Alternatively use ADD https:// (which will not be cached by Docker builder)
RUN echo "Pulling watchdog binary from Github." \
    && curl -sSL https://github.com/openfaas/faas/releases/download/0.7.7/fwatchdog > /usr/bin/fwatchdog \
    && chmod +x /usr/bin/fwatchdog

#RUN echo "http://dl-8.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
#RUN apk --no-cache --update-cache add gcc gfortran build-base wget freetype-dev libpng-dev openblas-dev
#RUN apk update && apk upgrade && apk add --no-cache alpine-sdk gcc gfortran python-dev build-base wget freetype-dev libpng-dev openblas-dev
#RUN apk update && apk upgrade && apk add --no-cache jpeg-dev
#RUN apk update && apk upgrade && apk add --no-cache libc6-compat
#RUN apk add --no-cache --update python-dev gfortran py-pip build-base
#RUN ln -s /usr/include/locale.h /usr/include/xlocale.h

#ADD https://github.com/scipy/scipy/releases/download/v1.0.0/scipy-1.0.0-cp36-cp36m-manylinux1_x86_64.whl .
#RUN pip install scipy-1.0.0-cp36-cp36m-manylinux1_x86_64.whl
#RUN BLAS=~/src/BLAS/libfblas.a LAPACK=~/src/lapack-3.5.0/liblapack.a pip install numpy
#RUN BLAS=~/src/BLAS/libfblas.a LAPACK=~/src/lapack-3.5.0/liblapack.a pip install scipy

RUN conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
RUN conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
RUN conda config --set show_channel_urls yes

WORKDIR /root/

COPY requirements.txt   .
RUN while read requirement; do conda install --yes $requirement || pip install $requirement -i https://mirrors.ustc.edu.cn/pypi/web/simple; done < requirements.txt
COPY index.py           .

ENV fprocess="python3 index.py"
ENV read_timeout=300
ENV write_timeout=300
ENV upstream_timeout=300
ENV exec_timeout=300
ENV hard_timeout=300
ENV write_debug=true

COPY function           function

RUN touch ./function/__init__.py

WORKDIR /root/function/
COPY function/requirements.txt	.
RUN while read requirement; do conda install --yes $requirement || pip install $requirement -i https://mirrors.ustc.edu.cn/pypi/web/simple; done < requirements.txt


WORKDIR /root/

HEALTHCHECK --interval=1s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
