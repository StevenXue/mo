FROM python:3

WORKDIR /pyserver

ADD pyserver/server3/requirements.txt .
RUN pip install -r requirements.txt

RUN apt-get update -y
RUN apt-get install openssh-server -y
RUN mkdir /var/run/sshd
RUN chmod 0755 /var/run/sshd

COPY id_rsa.pub /root/.ssh/authorized_keys

ADD pyserver /pyserver

#VOLUME pyserver/user_directory
CMD [ "/usr/sbin/sshd", "-D" ]
#CMD [ "python", "-m", "http.server", "8080" ]