FROM python:3-alpine

# Alternatively use ADD https:// (which will not be cached by Docker builder)
RUN apk --no-cache add curl \ 
    && echo "Pulling watchdog binary from Github." \
#    && curl -sSL https://github.com/openfaas/faas/releases/download/0.6.15/fwatchdog > /usr/bin/fwatchdog \
    && curl -sSL https://github.com/openfaas-incubator/of-watchdog/releases/download/0.1.0/of-watchdog > /usr/bin/fwatchdog \
    && chmod +x /usr/bin/fwatchdog \
    && apk del curl --no-cache

RUN echo "http://dl-8.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
#RUN apk --no-cache --update-cache add gcc gfortran build-base wget freetype-dev libpng-dev openblas-dev
RUN apk update && apk upgrade && apk add --no-cache alpine-sdk gcc gfortran python python-dev py-pip build-base wget freetype-dev libpng-dev openblas-dev
#RUN apk add --no-cache --update python-dev gfortran py-pip build-base
RUN ln -s /usr/include/locale.h /usr/include/xlocale.h

#ADD https://github.com/scipy/scipy/releases/download/v1.0.0/scipy-1.0.0-cp36-cp36m-manylinux1_x86_64.whl .
#RUN pip install scipy-1.0.0-cp36-cp36m-manylinux1_x86_64.whl
#RUN BLAS=~/src/BLAS/libfblas.a LAPACK=~/src/lapack-3.5.0/liblapack.a pip install numpy
#RUN BLAS=~/src/BLAS/libfblas.a LAPACK=~/src/lapack-3.5.0/liblapack.a pip install scipy

WORKDIR /root/

COPY requirements.txt   .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
COPY index.py           .


COPY function           function

RUN touch ./function/__init__.py

WORKDIR /root/function/
COPY function/requirements.txt	.
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/

WORKDIR /root/

ENV fprocess="python3 index.py"
ENV read_timeout=300
ENV write_timeout=300
ENV exec_timeout=300
ENV write_debug=true

HEALTHCHECK --interval=1s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
