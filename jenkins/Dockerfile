# เริ่มต้นจาก Image Jenkins ที่เราต้องการ
FROM jenkins/jenkins:jdk21

USER root

# Install Docker CLI and Node.js with non-interactive gpg keyring
ENV DEBIAN_FRONTEND=noninteractive
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends apt-transport-https ca-certificates curl gnupg lsb-release; \
    install -m 0755 -d /etc/apt/keyrings; \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --batch --yes --dearmor -o /etc/apt/keyrings/docker.gpg; \
    chmod a+r /etc/apt/keyrings/docker.gpg; \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list; \
    apt-get update; \
    apt-get install -y --no-install-recommends docker-ce-cli; \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -; \
    apt-get install -y --no-install-recommends nodejs; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

# สร้าง entrypoint script เพื่อแก้สิทธิ์ docker socket ตอน runtime
RUN echo '#!/bin/bash\n\
DOCKER_SOCK="/var/run/docker.sock"\n\
if [ -S "$DOCKER_SOCK" ]; then\n\
    DOCKER_GID=$(stat -c "%g" $DOCKER_SOCK)\n\
    if ! getent group $DOCKER_GID > /dev/null 2>&1; then\n\
        groupadd -g $DOCKER_GID docker\n\
    fi\n\
    usermod -aG $DOCKER_GID jenkins\n\
fi\n\
exec /usr/bin/tini -- /usr/local/bin/jenkins.sh "$@"' > /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.sh

USER jenkins

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]