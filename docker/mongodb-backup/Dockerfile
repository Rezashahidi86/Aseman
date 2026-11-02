FROM ubuntu:22.04

ARG DATABASE_TOOLS_VERSION=100.20.0

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ca-certificates curl tar bash findutils coreutils \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /tmp/mongodb-tools \
  && curl -fsSL "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2204-x86_64-${DATABASE_TOOLS_VERSION}.tgz" \
    | tar -xz -C /tmp/mongodb-tools --strip-components=2 \
  && install -m 0755 /tmp/mongodb-tools/mongodump /usr/local/bin/mongodump \
  && install -m 0755 /tmp/mongodb-tools/mongorestore /usr/local/bin/mongorestore \
  && rm -rf /tmp/mongodb-tools

WORKDIR /workspace
