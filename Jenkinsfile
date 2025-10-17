def sendNotificationToN8n(String status, String stageName, String imageTag, String containerName, String hostPort) {
    // ใช้ Jenkins HTTP Request Plugin (ต้องติดตั้งก่อน)
    // หรือใช้ Java URLConnection แทน (fallback) ถ้า httpRequest ไม่ได้ติดตั้ง
    // n8n-webhook คือ Jenkins Secret Text Credential ที่เก็บ URL ของ n8n webhook
    // ต้องสร้าง Credential นี้ใน Jenkins ก่อน ใช้งาน
    // โดยใช้ ID ว่า n8n-webhook
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
    // ใช้ agent any เพราะ build จะทำงานบน Jenkins controller (Linux container) อยู่แล้ว
    agent any

    // กัน “เช็คเอาต์ซ้ำซ้อน”
    // ถ้า job เป็นแบบ Pipeline from SCM / Multibranch แนะนำเพิ่ม options { skipDefaultCheckout(true) }
    // เพื่อปิดการ checkout อัตโนมัติก่อนเข้า stages (เพราะเรามี checkout scm อยู่แล้ว)
    options { 
        skipDefaultCheckout(true)   // ถ้าเป็น Pipeline from SCM/Multi-branch
    }

    // กำหนด environment variables
    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'dockerhub-cred'
        DOCKER_REPO = "atomic649/express-docker-app"
        //APP_NAME = "express-docker-app"     
         // กำหนดค่าสำหรับจำลอง DEV environment บน Local
        DEV_APP_NAME              = "flexi-dev"
        DEV_HOST_PORT             = "4001"

        // กำหนดค่าสำหรับจำลอง PROD environment บน Local
        PROD_APP_NAME             = "flexi-prod"
        PROD_HOST_PORT            = "4002"
    }
    // กำหนด input parameters สำหรับเลือก Action (Build & Deploy หรือ Rollback)
    // และกำหนดค่า ROLLBACK_TAG กับ ROLLBACK_TARGET เมื่อเลือก Rollback
    parameters {
        choice(name: 'ACTION', choices: ['Build & Deploy', 'Rollback'], description: 'เลือก Action ที่ต้องการ')
        string(name: 'ROLLBACK_TAG', defaultValue: '', description: 'สำหรับ Rollback: ใส่ Image Tag ที่ต้องการ (เช่น Git Hash หรือ dev-123)')
        choice(name: 'ROLLBACK_TARGET', choices: ['dev', 'prod'], description: 'สำหรับ Rollback: เลือกว่าจะ Rollback ที่ Environment ไหน')
    }

     // กำหนด stages ของ Pipeline
    stages {

        // =================================================================
        // BUILD STAGES: ทำงานเมื่อ ACTION คือ 'Build & Deploy'
        // =================================================================

        // Stage 1: ดึงโค้ดล่าสุดจาก Git
        // ใช้ checkout scm หากใช้ Pipeline from SCM
        // หรือใช้ git url: 'https://github.com/your-username/your-repo.git'
        stage('Checkout') {
            // เงื่อนไข: เมื่อ ACTION คือ 'Build & Deploy' เท่านั้น
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                echo "Checking out code..."
                checkout scm
                
                // Debug: Check what was actually checked out
                echo "=== Post-checkout verification ==="
                sh '''
                    echo "Current directory: $(pwd)"
                    echo "Workspace contents:"
                    ls -la
                    echo ""
                    echo "Flexi-Backend directory contents:"
                    if [ -d "Flexi-Backend" ]; then
                        ls -la Flexi-Backend/
                        echo ""
                        echo "Essential files check:"
                        echo "package.json exists: $(test -f Flexi-Backend/package.json && echo YES || echo NO)"
                        echo "package-lock.json exists: $(test -f Flexi-Backend/package-lock.json && echo YES || echo NO)"
                        echo "src/ directory exists: $(test -d Flexi-Backend/src && echo YES || echo NO)"
                        echo "prisma/ directory exists: $(test -d Flexi-Backend/prisma && echo YES || echo NO)"
                    else
                        echo "ERROR: Flexi-Backend directory does not exist!"
                    fi
                '''
            }
        }

       
          // Stage 2: ติดตั้ง dependencies และ Run test
        // ใช้ Node.js plugin (ต้องติดตั้ง NodeJS plugin ก่อน) ใน Jenkins หรือ Node.js ใน Docker 
        // ถ้ามี package-lock.json ให้ใช้ npm ci แทน npm install จะเร็วและล็อกเวอร์ชันชัดเจนกว่า
       stage('Install & Test') {
            // เงื่อนไข: เมื่อ ACTION คือ 'Build & Deploy' เท่านั้น
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                echo "Running tests inside a consistent Docker environment..."
                echo "Workspace path: ${env.WORKSPACE}"
                echo "Build number: ${env.BUILD_NUMBER}"
                
                script {
                    try {
                        echo "Pulling Docker image node:22-alpine..."
                        sh 'docker pull node:22-alpine'
                        
                        echo "Starting Docker container with workspace mounted..."
                        // Use sh command to run docker directly
                        sh """
                            docker run --rm \
                                -v ${env.WORKSPACE}:/workspace \
                                -w /workspace \
                                node:22-alpine \
                                sh -c '
                                    set -e
                                    
                                    echo "=== Debug: Container Environment ==="
                                    pwd
                                    whoami
                                    echo "Workspace mount verification:"
                                    ls -la
                                    
                                    echo "=== Check if Flexi-Backend exists ==="
                                    if [ ! -d "Flexi-Backend" ]; then
                                        echo "ERROR: Flexi-Backend directory not found!"
                                        echo "Available directories:"
                                        ls -la
                                        exit 1
                                    fi
                                    
                                    echo "=== Entering Flexi-Backend directory ==="
                                    cd Flexi-Backend
                                    pwd
                                    echo "Flexi-Backend contents:"
                                    ls -la
                                    
                                    echo "=== Essential files verification ==="
                                    if [ ! -f package.json ]; then
                                        echo "ERROR: package.json not found in Flexi-Backend!"
                                        echo "This suggests incomplete checkout or mount issue"
                                        echo "Available files:"
                                        ls -la
                                        exit 1
                                    fi
                                    
                                    if [ ! -f package-lock.json ]; then
                                        echo "ERROR: package-lock.json not found in Flexi-Backend!"
                                        echo "Available files:"
                                        ls -la
                                        exit 1
                                    fi
                                    
                                    echo "=== Check Node.js and npm versions ==="
                                    node --version
                                    npm --version
                                    
                                    echo "=== Installing dependencies ==="
                                    echo "Found package.json and package-lock.json, using npm ci"
                                    npm ci --verbose
                                    
                                    echo "=== Generating Prisma clients for testing ==="
                                    npm run prisma:generate:dev
                                    
                                    echo "=== Running tests ==="
                                    npm test
                                '
                        """
                        echo "Docker container execution completed successfully."
                    } catch (Exception e) {
                        echo "Error during Docker execution: ${e.getMessage()}"
                        error "Install & Test stage failed: ${e.getMessage()}"
                    }
                }
            }
        }

// Stage 3: สร้าง Docker Image
        // ใช้ Docker ที่ติดตั้งบน Jenkins agent (ต้องติดตั้ง Docker plugin ก่อน) ใน Jenkins หรือ Docker ใน Docker
        stage('Build & Push Docker Image') {
            when { expression { params.ACTION == 'Build & Deploy' } }
            steps {
                script {
                    def imageTag = (env.BRANCH_NAME == 'main') ? sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim() : "dev-${env.BUILD_NUMBER}"
                    env.IMAGE_TAG = imageTag
                    
                    // [ปรับปรุง] ใช้ docker.withRegistry() เพื่อความปลอดภัยและเรียบง่าย
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_HUB_CREDENTIALS_ID) {
                        echo "Building image: ${DOCKER_REPO}:${env.IMAGE_TAG}"
                        def customImage = docker.build("${DOCKER_REPO}:${env.IMAGE_TAG}", "--target production .")
                        
                        echo "Pushing images to Docker Hub..."
                        customImage.push()
                        // Push 'latest' tag เฉพาะเมื่อเป็น branch main
                        if (env.BRANCH_NAME == 'main') {
                            customImage.push('latest')
                        }
                    }
                }
            }
        }

         // =================================================================
        // DEPLOY STAGES: ทำงานเมื่อ ACTION คือ 'Build & Deploy' ตามแต่ละ Branch
        // =================================================================

        // Stage 6: Deploy ไปยังเครื่อง local
        // ดึง image ล่าสุดจาก Docker Hub มาใช้งาน
        // หยุดและลบ container เก่าที่ชื่อ ${APP_NAME} (ถ้ามี)
        // สร้างและรัน container ใหม่จาก image ล่าสุด
        stage('Deploy to DEV (Local Docker)') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'dev'
            } 
            steps {
                script {
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
            // ส่งข้อมูลไปยัง n8n webhook เมื่อ deploy สำเร็จ
            post {
                success {
                    sendNotificationToN8n('success', 'Deploy to DEV (Local Docker)', env.IMAGE_TAG, env.DEV_APP_NAME, env.DEV_HOST_PORT)
                }
            }
        }

        // Stage 7: รอการอนุมัติ (Approval) ก่อน Deploy ไปยัง Production
        // เงื่อนไข: เมื่อ ACTION คือ 'Build & Deploy' และ branch คือ 'main'
        stage('Approval for Production') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'main'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: "Deploy image tag '${env.IMAGE_TAG}' to PRODUCTION (Local Docker on port ${PROD_HOST_PORT})?"
                }
            }
        }

        // Stage 8: Deploy ไปยังเครื่อง local (Production)
        // ดึง image ล่าสุดจาก Docker Hub มาใช้งาน
        stage('Deploy to PRODUCTION (Local Docker)') {
            when {
                expression { params.ACTION == 'Build & Deploy' }
                branch 'main'
            } 
            steps {
                script {
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
            // ส่งข้อมูลไปยัง n8n webhook เมื่อ deploy สำเร็จ
            post {
                success {
                    sendNotificationToN8n('success', 'Deploy to PRODUCTION (Local Docker)', env.IMAGE_TAG, env.PROD_APP_NAME, env.PROD_HOST_PORT)
                }
            }
        }

        // =================================================================
        // ROLLBACK STAGE: ทำงานเมื่อ ACTION คือ 'Rollback'
        // =================================================================
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
                        docker run -d --name ${targetAppName} -p ${targetHostPort}:3000 ${imageToDeploy}
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

    // กำหนด post actions
    // เช่น การแจ้งเตือนเมื่อ pipeline เสร็จสิ้น
    // สามารถเพิ่มการแจ้งเตือนผ่าน email, Slack, หรืออื่นๆ ได้ตามต้องการ
   post {
        always {
            // ใช้ script block เพื่อให้สามารถใช้เงื่อนไข if ได้
            script {
                if (params.ACTION == 'Build & Deploy') {
                    echo "Cleaning up Docker images on agent..."
                    // ใช้ try-catch เพื่อให้ pipeline ไม่ล้มเหลวหากลบ image ไม่สำเร็จ
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
            // ส่งข้อมูลไปยัง n8n webhook เมื่อ pipeline ล้มเหลว
            sendNotificationToN8n('failed', "Pipeline Failed", 'N/A', 'N/A', 'N/A')
        }
    }
}