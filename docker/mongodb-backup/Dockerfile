FROM mongo:9.0.4

RUN command -v mongodump \
  && command -v mongorestore \
  && command -v openssl \
  && mongodump --version \
  && mongorestore --version \
  && openssl version

WORKDIR /workspace
