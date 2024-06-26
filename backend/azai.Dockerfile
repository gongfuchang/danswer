FROM python:3.11.8-slim-bookworm

# Default DANSWER_VERSION, typically overriden during builds by GitHub Actions.
ARG DANSWER_VERSION=0.3-dev
ENV DANSWER_VERSION=${DANSWER_VERSION}
RUN echo "DANSWER_VERSION: ${DANSWER_VERSION}"

# Install system dependencies
# cmake needed for psycopg (postgres)
# libpq-dev needed for psycopg (postgres)
# curl included just for users' convenience
# zip for Vespa step futher down
# ca-certificates for HTTPS
#RUN sed -i 's#deb.debian.org/debian$#mirrors.tuna.tsinghua.edu.cn/debian#' /etc/apt/sources.list.d/debian.sources
RUN apt-get update && \
    apt-get install -y cmake curl zip ca-certificates pkg-config libhdf5-dev libhdf5-serial-dev libgnutls30=3.7.9-2+deb12u2 && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Install Python dependencies
# Remove py which is pulled in by retry, py is not needed and is a CVE
COPY ./requirements/default.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
RUN pip uninstall -y py
RUN playwright install chromium && playwright install-deps chromium
RUN ln -s /usr/local/bin/supervisord /usr/bin/supervisord

COPY ./requirements/local-whls/zhipuai-2.0.1-py3-none-any.whl /tmp/
RUN pip install /tmp/zhipuai-2.0.1-py3-none-any.whl
# Cleanup for CVEs and size reduction
# https://github.com/tornadoweb/tornado/issues/3107
# xserver-common and xvfb included by playwright installation but not needed after
# perl-base is part of the base Python Debian image but not needed for Danswer functionality
# perl-base could only be removed with --allow-remove-essential
RUN apt-get remove -y --allow-remove-essential perl-base xserver-common xvfb cmake libldap-2.5-0 libldap-2.5-0 && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* && \
    rm /usr/local/lib/python3.11/site-packages/tornado/test/test.key

# Set up application files
WORKDIR /app
COPY ./danswer /app/danswer
COPY ./shared_models /app/shared_models
COPY ./alembic /app/alembic
COPY ./alembic.ini /app/alembic.ini
COPY supervisord.conf /usr/etc/supervisord.conf

ENV PYTHONPATH /app

# Default command which does nothing
# This container is used by api server and background which specify their own CMD
CMD ["tail", "-f", "/dev/null"]
