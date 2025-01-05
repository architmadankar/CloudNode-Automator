pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'           // AWS region where your Elastic Beanstalk environment is hosted
        REPOSITORY_NAME = 'devops-app'         // Your Docker repository name on Docker Hub
        IMAGE_TAG = 'latest'               // Docker image tag
        DOCKER_REGISTRY = 'docker.io'      // Docker Hub registry URL - https://plugins.jenkins.io/docker-plugin/
        AWS_EB_APP_NAME = 'archit-devops-app'    // Your Elastic Beanstalk application name
        AWS_EB_ENV_NAME = 'archit-devops-app-env'     // Your Elastic Beanstalk environment name
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')  // Jenkins AWS credentials - https://plugins.jenkins.io/aws-credentials/
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key') // Jenkins AWS credentials 
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    // Pulling the source code from GitHub repository
                    git 'https://github.com/architmadankar/devops-task-archit.git'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Building the Docker image
                    sh 'docker build -t $DOCKER_REGISTRY/$REPOSITORY_NAME:$IMAGE_TAG .'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'docker run -d -p 3000:3000 --name test-node-app $DOCKER_USERNAME/$REPOSITORY_NAME:$IMAGE_TAG'
                    sh 'sleep 3'
                    sh 'curl localhost:3000 || exit 1'
                    sh 'docker stop test-node-app && docker rm test-node-app'
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    // Logging in to Docker Hub
                    sh "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD"
                    
                    // Pushing the Docker image to Docker Hub
                    sh 'docker push $DOCKER_REGISTRY/$REPOSITORY_NAME:$IMAGE_TAG'

                    // Logging out from Docker Hub
                    sh 'docker logout'
                }
            }
        }

        stage('Deploy to AWS Elastic Beanstalk') {
            steps {
                script {
                    // Assuming you have a Dockerrun.aws.json file in your repo to configure Elastic Beanstalk
                    sh 'aws elasticbeanstalk create-application-version --application-name $AWS_EB_APP_NAME --version-label $IMAGE_TAG --source-bundle S3Bucket=$AWS_S3_BUCKET,S3Key=docker/$IMAGE_TAG.tar'
                    
                    // Update Elastic Beanstalk environment to deploy the new version
                    sh 'aws elasticbeanstalk update-environment --environment-name $AWS_EB_ENV_NAME --version-label $IMAGE_TAG'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'There was an issue with the pipeline.'
        }
    }
}
