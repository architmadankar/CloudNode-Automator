pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'swordx/node-app'
        AWS_REGION = 'ap-south-1' // Update this to your desired AWS region
        ECS_CLUSTER = 'your-ecs-cluster-name' // Update with your ECS cluster name
        ECS_SERVICE = 'your-ecs-service-name' // Update with your ECS service name
        AWS_ECR_REPO = 'your-aws-ecr-repo-url' // Update with your AWS ECR repository URL
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/architmadankar/devops-task-archit.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE} .'
                }
            }
        }

        stage('Test Application') {
            steps {
                script {
                    sh 'docker run -d -p 3000:3000 --name test-node-app ${DOCKER_IMAGE}'
                    sh 'sleep 3'
                    sh 'curl localhost:3000 || exit 1'
                    sh 'docker stop test-node-app && docker rm test-node-app'
                }
            }
        }

        stage('Push Docker Image to Registry') {
            steps {
                script {
                    // Push to Docker Hub or AWS ECR
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker tag ${DOCKER_IMAGE} ${DOCKER_USERNAME}/sed-node-app:latest'
                        sh 'docker push ${DOCKER_USERNAME}/sed-node-app:latest'
                    }
                    
                    // If pushing to AWS ECR instead of DockerHub
                    /*
                    withCredentials([[$class: 'AmazonWebServicesCredentials', credentialsId: 'aws-credentials']]) {
                        sh 'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ECR_REPO}'
                        sh 'docker tag ${DOCKER_IMAGE}:latest ${AWS_ECR_REPO}/sed-node-app:latest'
                        sh 'docker push ${AWS_ECR_REPO}/sed-node-app:latest'
                    }
                    */
                }
            }
        }

        stage('Deploy to AWS ECS') {
            steps {
                script {
                    // ECS task definition update and deployment to ECS
                    withCredentials([[$class: 'AmazonWebServicesCredentials', credentialsId: 'aws-credentials']]) {
                        // Register new ECS Task Definition with the updated Docker image
                        sh '''aws ecs register-task-definition \
                            --family node-app-task \
                            --container-definitions '[{
                                "name": "node-app",
                                "image": "${AWS_ECR_REPO}/sed-node-app:latest", 
                                "memory": 512,
                                "cpu": 256,
                                "essential": true,
                                "portMappings": [{"containerPort": 3000, "hostPort": 3000}]
                            }]' --region ${AWS_REGION}'''

                        // Update ECS Service to use the new Task Definition
                        sh '''aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE} \
                            --task-definition node-app-task \
                            --region ${AWS_REGION}'''
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
