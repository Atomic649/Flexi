def sendNotificationToN8n(String status, String stageName, String imageTag, String containerName, String hostPort) {
    script {
        withCredentials([string(credentialsId: 'n8n-webhook', variable: 'N8N_WEBHOOK_URL')]) {
            def payload = [
                project  : env.JOB_NAME,
                stage    : stageName,
                status   : status,
                build    : env.BUILD_NUMBER,
                image    : "${env.DOCKER_REPO}:${imageTag}",
                container: containerName,
                url      : "http://localhost:${hostPort}/",
                timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ssXXX")
            ]
            def body = groovy.json.JsonOutput.toJson(payload)
            try {
                httpRequest acceptType: 'APPLICATION_JSON',
                            contentType: 'APPLICATION_JSON',
                            httpMode: 'POST',
                            requestBody: body,
                            url: N8N_WEBHOOK_URL,
                            validResponseCodes: '200:299'
                echo "n8n webhook (${status}) sent successfully."
            } catch (err) {
                echo "Failed to send n8n webhook (${status}): ${err}"
            }
        }
    }
}

pipeline {
    agent any
    options { skipDefaultCheckout(true) }

    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'dockerhub-cred'
        DOCKER_REPO = "atomic649/express-docker-app"

        DEV_APP_NAME  = "flexi-dev"
        DEV_HOST_PORT = "3001"

        PROD_APP_NAME  = "flexi-prod"
        PROD_HOST_PORT = "3000"
    }

    parameters {
        choice(name: 'ACTION', choices: ['Build & Deploy', 'Rollback'], description: 'เลือก Action ที่ต้องการ')
        string(name: 'ROLLBACK_TAG', defaultValue: '', description: 'ใส่ Image Tag ที่ต้องการ rollback')
        choice(name: 'ROLLBACK_TARGET', choices: ['dev', 'prod'], description: 'เลือก environment ที่จะ rollback')
    }

    stages {
        // ============================================================
        // Stage 1: Checkout
        // ============================================================
        stage('Checkout') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }

        // ============================================================
        // Stage 2: Prepare .env file securely from Jenkins credentials
        // ============================================================
        stage('Prepare .env') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                script {
                    dir('Flexi-Backend') {
                        echo "Preparing .env file from Jenkins credentials..."
                        withCredentials([string(credentialsId: 'flexi-env-file', variable: 'ENV_FILE_CONTENT')]) {
                            writeFile file: '.env', text: ENV_FILE_CONTENT
                            echo "✅ .env file created successfully"
                            sh '''
                                echo "Verifying .env file..."
                                if [ -f .env ]; then
                                    echo "File size: $(wc -c < .env) bytes"
                                    echo "Number of lines: $(wc -l < .env)"
                                    echo "Environment variables that will be loaded:"
                                    grep -E "^[A-Z_]+=" .env | cut -d= -f1 | sed 's/^/  - /' || echo "No variables found"
                                else
                                    echo "❌ ERROR: .env file creation failed!"
                                    exit 1
                                fi
                            '''
                        }
                    }
                }
            }
        }

        // ============================================================
        // Stage 3: Install & Test
        // ============================================================
        stage('Install & Test') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                echo "Running tests inside Node.js Docker environment..."
                script {
                    docker.image('node:22-alpine').inside {
                        dir('Flexi-Backend') {
                            sh '''
                                echo "Installing dependencies..."
                                npm install

                                echo "Checking Jest version..."
                                npx jest --version

                                echo "Running tests..."
                                npm test
                            '''
                        }
                    }
                }
            }
        }

        // ============================================================
        // Stage 4: Build & Push Docker Image
        // ============================================================
        stage('Build & Push Docker Image') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                script {
                    def imageTag = (env.BRANCH_NAME == 'main')
                        ? sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        : "dev-${env.BUILD_NUMBER}"
                    env.IMAGE_TAG = imageTag

                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_HUB_CREDENTIALS_ID) {
                        dir('Flexi-Backend') {
                            echo "Building image: ${DOCKER_REPO}:${env.IMAGE_TAG}"
                            def customImage = docker.build("${DOCKER_REPO}:${env.IMAGE_TAG}", "--target production .")

                            echo "Pushing images to Docker Hub..."
                            customImage.push()
                            if (env.BRANCH_NAME == 'main') {
                                customImage.push('latest')
                            }
                        }
                    }
                }
            }
        }

        // ============================================================
        // Stage 5: Deploy to DEV (Local Docker)
        // ============================================================
        stage('Deploy to DEV (Local Docker)') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'dev'
            }
            steps {
                script {
                    def deployCmd = """
                        echo "Deploying ${DEV_APP_NAME}..."
                        docker pull ${DOCKER_REPO}:${env.IMAGE_TAG}
                        docker stop ${DEV_APP_NAME} || true
                        docker rm ${DEV_APP_NAME} || true
                        docker run -d --name ${DEV_APP_NAME} --env-file Flexi-Backend/.env -p ${DEV_HOST_PORT}:3000 ${DOCKER_REPO}:${env.IMAGE_TAG}
                        docker ps --filter name=${DEV_APP_NAME}
                    """
                    sh deployCmd
                }
            }
            post {
                success {
                    sendNotificationToN8n('success', 'Deploy to DEV (Local Docker)', env.IMAGE_TAG, env.DEV_APP_NAME, env.DEV_HOST_PORT)
                }
            }
        }

        // ============================================================
        // Stage 6: Approval & Deploy to PRODUCTION
        // ============================================================
        stage('Approval for Production') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'main'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: "Deploy image tag '${env.IMAGE_TAG}' to PRODUCTION?"
                }
            }
        }

        stage('Deploy to PRODUCTION (Local Docker)') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'main'
            }
            steps {
                script {
                    def deployCmd = """
                        echo "Deploying ${PROD_APP_NAME}..."
                        docker pull ${DOCKER_REPO}:${env.IMAGE_TAG}
                        docker stop ${PROD_APP_NAME} || true
                        docker rm ${PROD_APP_NAME} || true
                        docker run -d --name ${PROD_APP_NAME} --env-file Flexi-Backend/.env -p ${PROD_HOST_PORT}:3000 ${DOCKER_REPO}:${env.IMAGE_TAG}
                        docker ps --filter name=${PROD_APP_NAME}
                    """
                    sh deployCmd
                }
            }
            post {
                success {
                    sendNotificationToN8n('success', 'Deploy to PRODUCTION (Local Docker)', env.IMAGE_TAG, env.PROD_APP_NAME, env.PROD_HOST_PORT)
                }
            }
        }

        // ============================================================
        // Stage 7: Rollback
        // ============================================================
        stage('Execute Rollback') {
            when { expression { params.ACTION == 'Rollback' } }
            steps {
                script {
                    if (params.ROLLBACK_TAG.trim().isEmpty()) {
                        error "เมื่อเลือก Rollback กรุณาระบุ 'ROLLBACK_TAG'"
                    }

                    def targetAppName = (params.ROLLBACK_TARGET == 'dev') ? DEV_APP_NAME : PROD_APP_NAME
                    def targetHostPort = (params.ROLLBACK_TARGET == 'dev') ? DEV_HOST_PORT : PROD_HOST_PORT
                    def imageToDeploy = "${DOCKER_REPO}:${params.ROLLBACK_TAG.trim()}"

                    echo "ROLLING BACK ${params.ROLLBACK_TARGET.toUpperCase()} to image: ${imageToDeploy}"

                    def deployCmd = """
                        docker pull ${imageToDeploy}
                        docker stop ${targetAppName} || true
                        docker rm ${targetAppName} || true
                        docker run -d --name ${targetAppName} --env-file Flexi-Backend/.env -p ${targetHostPort}:3000 ${imageToDeploy}
                    """
                    sh(deployCmd)
                }
            }
            post {
                success {
                    sendNotificationToN8n('success', "Rollback ${params.ROLLBACK_TARGET.toUpperCase()}", params.ROLLBACK_TAG, targetAppName, targetHostPort)
                }
            }
        }
    }

    // ============================================================
    // POST ACTIONS
    // ============================================================
    post {
        always {
            script {
                if (params.ACTION == 'Build & Deploy') {
                    echo "Cleaning up local Docker images..."
                    try {
                        sh """
                            docker image rm -f ${DOCKER_REPO}:${env.IMAGE_TAG} || true
                            docker image rm -f ${DOCKER_REPO}:latest || true
                        """
                    } catch (err) {
                        echo "Cleanup skipped (no image found)."
                    }
                }
            }
        }
        failure {
            sendNotificationToN8n('failed', "Pipeline Failed", 'N/A', 'N/A', 'N/A')
        }
    }
}
