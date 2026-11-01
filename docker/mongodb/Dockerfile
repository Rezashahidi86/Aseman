FROM mongo:9.0.4

COPY docker/mongodb/entrypoint.sh /usr/local/bin/aseman-mongo-entrypoint.sh
RUN chmod 755 /usr/local/bin/aseman-mongo-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/aseman-mongo-entrypoint.sh"]
