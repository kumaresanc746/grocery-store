pipeline {
    agent any

    environment {
        DOCKER_IMAGE_PREFIX = 'kumaresan05'
        KUBERNETES_NAMESPACE = 'default'
    }

    stages {

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        sh 'echo "Frontend is static files, no dependencies to install"'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'echo "Frontend build complete"'
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        sh """
                        docker build -t ${DOCKER_IMAGE_PREFIX}/grocery-backend:${BUILD_NUMBER} backend
                        docker tag ${DOCKER_IMAGE_PREFIX}/grocery-backend:${BUILD_NUMBER} ${DOCKER_IMAGE_PREFIX}/grocery-backend:latest
                        """
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        sh """
                        docker build -t ${DOCKER_IMAGE_PREFIX}/grocery-frontend:${BUILD_NUMBER} frontend
                        docker tag ${DOCKER_IMAGE_PREFIX}/grocery-frontend:${BUILD_NUMBER} ${DOCKER_IMAGE_PREFIX}/grocery-frontend:latest
                        """
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh 'echo "Tests would run here"'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                    docker push ${DOCKER_IMAGE_PREFIX}/grocery-backend:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE_PREFIX}/grocery-backend:latest
                    docker push ${DOCKER_IMAGE_PREFIX}/grocery-frontend:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE_PREFIX}/grocery-frontend:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl apply -f k8s/
                kubectl rollout status deployment/backend
                kubectl rollout status deployment/frontend
                """
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
        }
    }
}
