pipeline {
  agent any

  environment {
    DOCKERHUB = "kumaresan05"
  }

  stages {

    stage('Checkout') {
      steps {
        git 'https://github.com/kumaresanc746/grocery-store.git'
      }
    }

    stage('Build Images') {
      steps {
        sh '''
        docker build -t $DOCKERHUB/grocery-backend:latest backend
        docker build -t $DOCKERHUB/grocery-frontend:latest frontend
        '''
      }
    }

    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub',
          usernameVariable: 'USER',
          passwordVariable: 'PASS'
        )]) {
          sh '''
          echo $PASS | docker login -u $USER --password-stdin
          docker push $DOCKERHUB/grocery-backend:latest
          docker push $DOCKERHUB/grocery-frontend:latest
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
        kubectl apply -f k8s/
        kubectl rollout status deployment/backend
        kubectl rollout status deployment/frontend
        '''
      }
    }
  }
}
