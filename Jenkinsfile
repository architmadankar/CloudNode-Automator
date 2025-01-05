// Requirements:
// https://plugins.jenkins.io/pipeline-aws/ - AWS Credentials
// https://plugins.jenkins.io/docker-plugin/
pipeline {
    agent any
    environment {
        DOCKER_IMAGE_NAME = 'swordx/archit-node-app'  // Docker image name
        ECS_CLUSTER_NAME = 'architx'        // AWS ECS cluster name
        ECS_SERVICE_NAME = 'MyService'        // ECS service name
        ECS_TASK_DEFINITION = 'MyTask' // ECS task definition name
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
                    sh 'docker build -t ${DOCKER_IMAGE_NAME} .'
                }
            }
        }
        stage('Test Application') {
            steps {
                script {
                    sh 'docker run -d -p 3000:3000 --name test-node-app ${DOCKER_IMAGE_NAME}'
                    sh 'sleep 3'
                    sh 'curl localhost:3000 || exit 1'
                    sh 'docker stop test-node-app && docker rm test-node-app'
                }
            }
        }
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    // Login to Docker Hub
                    sh 'docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD'

                    // Push the image to Docker Hub
                    sh 'docker push ${DOCKER_IMAGE_NAME}'

                    // Logout from Docker Hub
                    sh 'docker logout'
                }
            }
        }
        stage('Deploy to AWS ECS') {
            steps {
                withAWS(credentials: 'AWS-Archit', region: 'ap-south-1') {
                    script {
                        // Assuming AWS CLI is configured with appropriate credentials
                        sh '''
                        # Update ECS task definition
                        aws ecs register-task-definition \
                            --family ${ECS_TASK_DEFINITION} \
                            --container-definitions "[{
                                \\"name\\": \\"node-app\\",
                                \\"image\\": \\"${DOCKER_IMAGE_NAME}\\",
                                \\"essential\\": true,
                                \\"memory\\": 512,
                                \\"cpu\\": 256,
                                \\"portMappings\\": [{
                                    \\"containerPort\\": 3000,
                                    \\"hostPort\\": 3000
                                }]
                            }]" \
                            --region ap-south-1

                        # Update ECS service to use the latest task definition
                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER_NAME} \
                            --service ${ECS_SERVICE_NAME} \
                            --force-new-deployment \
                            --region ap-south-1
                        '''
                    }
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
