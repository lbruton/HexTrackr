FROM node:18-bullseye

# Install development tools and utilities
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    tree \
    jq \
    postgresql-client \
    redis-tools \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create developer user with same UID as host user (avoids permission issues)
ARG USER_ID=1000
ARG GROUP_ID=1000
RUN groupadd -g $GROUP_ID developer && \
    useradd -u $USER_ID -g $GROUP_ID -m -s /bin/bash developer && \
    echo "developer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install global Node.js development tools
RUN npm install -g \
    nodemon \
    pm2 \
    typescript \
    ts-node \
    @types/node \
    eslint \
    prettier \
    serve

# Install Python tools for scripts
RUN pip3 install \
    requests \
    psycopg2-binary \
    redis \
    python-dotenv

# Set up workspace
WORKDIR /workspace
RUN chown -R developer:developer /workspace

# Switch to developer user
USER developer

# Create development aliases and shortcuts
RUN echo 'alias ll="ls -la"' >> ~/.bashrc && \
    echo 'alias la="ls -A"' >> ~/.bashrc && \
    echo 'alias l="ls -CF"' >> ~/.bashrc && \
    echo 'alias ..="cd .."' >> ~/.bashrc && \
    echo 'alias ...="cd ../.."' >> ~/.bashrc && \
    echo 'alias grep="grep --color=auto"' >> ~/.bashrc && \
    echo 'alias tree="tree -C"' >> ~/.bashrc && \
    echo 'export PS1="\[\033[01;32m\]\u@stacktrackr-dev\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "' >> ~/.bashrc

# Create helpful development scripts
RUN mkdir -p /home/developer/bin

# API development helper
RUN cat > /home/developer/bin/start-api << 'EOF'
#!/bin/bash
cd /workspace/agents/lab/serverless-plugin/docker-serverless/api
npm install
npm run dev
EOF

# Web server helper
RUN cat > /home/developer/bin/start-web << 'EOF'
#!/bin/bash
cd /workspace
python3 -m http.server 3000
EOF

# Database helper
RUN cat > /home/developer/bin/db-connect << 'EOF'
#!/bin/bash
psql -h postgres -U stacktrackr -d stacktrackr_prices
EOF

# Redis helper  
RUN cat > /home/developer/bin/redis-connect << 'EOF'
#!/bin/bash
redis-cli -h redis
EOF

# Make scripts executable
RUN chmod +x /home/developer/bin/*

# Add bin to PATH
RUN echo 'export PATH="/home/developer/bin:$PATH"' >> ~/.bashrc

# Set up Node.js environment
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Default command
CMD ["/bin/bash"]
