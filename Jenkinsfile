pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code..."
                checkout scm // ดึงโค้ดจาก repository ที่เชื่อมต่อกับ Jenkins Job
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                // คำสั่งสำหรับการ build เช่น การ compile โค้ด
            }
        }
    }
}