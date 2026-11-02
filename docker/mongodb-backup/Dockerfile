FROM ubuntu:22.04

ARG DATABASE_TOOLS_VERSION=100.20.0

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ca-certificates curl bash findutils coreutils openssl \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2204-x86_64-${DATABASE_TOOLS_VERSION}.deb" \
    -o /tmp/mongodb-database-tools.deb \
  && apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends /tmp/mongodb-database-tools.deb \
  && rm -f /tmp/mongodb-database-tools.deb \
  && rm -rf /var/lib/apt/lists/*

RUN mongodump --version && mongorestore --version

WORKDIR /workspace
