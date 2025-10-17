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
        PROD_APP_NAME = "flexi-prod"
        PROD_HOST_PORT = "3000"
    }

    parameters {
        choice(name: 'ACTION', choices: ['Build & Deploy', 'Rollback'], description: 'เลือก Action ที่ต้องการ')
        string(name: 'ROLLBACK_TAG', defaultValue: '', description: 'สำหรับ Rollback: ใส่ Image Tag ที่ต้องการ')
        choice(name: 'ROLLBACK_TARGET', choices: ['dev', 'prod'], description: 'เลือก environment สำหรับ Rollback')
    }

    stages {
        // === Stage 1: Checkout ===
        stage('Checkout') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }

        // === Stage 2: Install & Test ===
        stage('Install & Test') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                echo "Running tests inside a consistent Docker environment..."
                script {
                    dir('Flexi-Backend') {
                        docker.image('node:22-alpine').inside {
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

        // === Stage 3: Build & Push Docker Image ===
        stage('Build & Push Docker Image') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                script {
                    dir('Flexi-Backend') {
                        def imageTag = (env.BRANCH_NAME == 'main')
                            ? sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                            : "dev-${env.BUILD_NUMBER}"
                        env.IMAGE_TAG = imageTag

                        docker.withRegistry('https://index.docker.io/v1/', DOCKER_HUB_CREDENTIALS_ID) {
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

        // === Stage 4: Deploy to DEV ===
        stage('Deploy to DEV (Local Docker)') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'dev'
            }
            steps {
                script {
                    dir('Flexi-Backend') {
                        def deployCmd = """
                            echo "Deploying container ${DEV_APP_NAME} from latest image..."
                            docker pull ${DOCKER_REPO}:${env.IMAGE_TAG}
                            docker stop ${DEV_APP_NAME} || true
                            docker rm ${DEV_APP_NAME} || true
                            docker run -d --name ${DEV_APP_NAME} -p ${DEV_HOST_PORT}:3000 ${DOCKER_REPO}:${env.IMAGE_TAG}
                            docker ps --filter name=${DEV_APP_NAME} --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}"
                        """
                        sh deployCmd
                    }
                }
            }
            post {
                success {
                    sendNotificationToN8n('success', 'Deploy to DEV (Local Docker)', env.IMAGE_TAG, env.DEV_APP_NAME, env.DEV_HOST_PORT)
                }
            }
        }

        // === Stage 5: Approval for Production ===
        stage('Approval for Production') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'main'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: "Deploy image tag '${env.IMAGE_TAG}' to PRODUCTION (port ${PROD_HOST_PORT})?"
                }
            }
        }

        // === Stage 6: Deploy to PRODUCTION ===
        stage('Deploy to PRODUCTION (Local Docker)') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'main'
            }
            steps {
                script {
                    dir('Flexi-Backend') {
                        def deployCmd = """
                            echo "Deploying container ${PROD_APP_NAME} from latest image..."
                            docker pull ${DOCKER_REPO}:${env.IMAGE_TAG}
                            docker stop ${PROD_APP_NAME} || true
                            docker rm ${PROD_APP_NAME} || true
                            docker run -d --name ${PROD_APP_NAME} -p ${PROD_HOST_PORT}:3000 ${DOCKER_REPO}:${env.IMAGE_TAG}
                            docker ps --filter name=${PROD_APP_NAME} --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}"
                        """
                        sh deployCmd
                    }
                }
            }
            post {
                success {
                    sendNotificationToN8n('success', 'Deploy to PRODUCTION (Local Docker)', env.IMAGE_TAG, env.PROD_APP_NAME, env.PROD_HOST_PORT)
                }
            }
        }

        // === Stage 7: Rollback ===
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

                    dir('Flexi-Backend') {
                        def deployCmd = """
                            docker pull ${imageToDeploy}
                            docker stop ${targetAppName} || true
                            docker rm ${targetAppName} || true
                            docker run -d --name ${targetAppName} -p ${targetHostPort}:3000 ${imageToDeploy}
                        """
                        sh(deployCmd)
                    }
                }
            }
            post {
                success {
                    sendNotificationToN8n('success', "Rollback ${params.ROLLBACK_TARGET.toUpperCase()}", params.ROLLBACK_TAG, targetAppName, targetHostPort)
                }
            }
        }
    }

    // === Post Actions ===
    post {
        always {
            script {
                if (params.ACTION == 'Build & Deploy') {
                    echo "Cleaning up Docker images on agent..."
                    try {
                        sh """
                            docker image rm -f ${DOCKER_REPO}:${env.IMAGE_TAG} || true
                            docker image rm -f ${DOCKER_REPO}:latest || true
                        """
                    } catch (err) {
                        echo "Could not clean up images, but continuing..."
                    }
                }
            }
        }
        failure {
            sendNotificationToN8n('failed', "Pipeline Failed", 'N/A', 'N/A', 'N/A')
        }
    }
}
