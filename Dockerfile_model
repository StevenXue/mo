FROM python:3

WORKDIR /pyserver

ADD pyserver/server3/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY metric_spec.py /usr/local/lib/python3.6/site-packages/tensorflow/contrib/learn/python/learn/metric_spec.py

ADD pyserver /pyserver


CMD [ "python", "-m", "http.server", "8080" ]