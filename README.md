# AWS CodeBuild, CodeDeploy and CodePipeline on EC2 instance with BitBucket.
In this section, We are going to create CI/CD pipeline using AWS CodeDeploy and CodePipeline on EC2 instance. Before, going into the further process make sure your git repo is set up with appsec.yml file properly as I have done.

## **Setup EC2 Instace:**
**1. Launch EC2 instance:** Here I am going to use Ubuntu, so next all the commands will be according to the ubuntu.

**2. SSH into your instance:** You can use any method, I am going to use "EC2 Instance Connect".

**3. Update, upgrade and Install git, htop and wget:**

Update:
    
    sudo apt update

Upgrade:

    sudo apt upgrade -y

Install git, htop and wget:

    sudo apt install -y git htop wget

**4. Installing Node:**

Download NVM Script:

    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

Running either of the above commands downloads a script and runs it. The script clones the nvm repository to ~/.nvm, and attempts to add the source lines from the snippet below to the correct profile file (~/.bash_profile, ~/.zshrc, ~/.profile, or ~/.bashrc).

Copy & Paste Following Line (Each Line Saparately):

    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

Verify nvm:

    nvm --version

install Node:

    nvm install --lts

Verify NodeJS:

    node --version

Verify NPM:

    npm --version


**6. PM2 set up:**

    npm i -g pm2

**7. Making Available node, pm2 and npm to root:**

Node:

    sudo ln -s "$(which node)" /sbin/node

npm:

    sudo ln -s "$(which npm)" /sbin/npm

pm2:

    sudo ln -s "$(which pm2)" /sbin/pm2

**8. Running app with sudo:**
Running app.js with pm2 with custom name:

    sudo pm2 start app.js --name=test-node

Save the app, otherwise pm2 will forget running app on next boot:

    sudo pm2 save

Start PM2 on system boot:

    sudo pm2 startup

**9. Install AWS CodeDeploy Agent:**

installing Dependencies:

    sudo apt install ruby-full

install Agetnt file: [Refer this AWS Document](https://docs.aws.amazon.com/codedeploy/latest/userguide/resource-kit.html#resource-kit-bucket-names)

    wget https://bucket-name.s3.region-identifier.amazonaws.com/latest/install
    wget https://aws-codedeploy-ap-south-1.s3.ap-south-1.amazonaws.com/latest/install #In my case, instance is in ap-south-1 region.

chmod:

    chmod +x ./install

install latest versrion of Agent:

    sudo ./install auto

Start agent:

    sudo service codedeploy-agent start

Restart Agent:

    sudo service codedeploy-agent restart

## **[IMPORTANT] buildspec.yml, appsec.yml, after_install.sh and application_start.sh:**

- Here we have to create `buildspec.yml` file for Code Build. Which will create build and store it to S3 from that Code Deploy can Retrive.
  `buildspec.yml`
	```
	version: 0.2

	phases:
	  install:
		runtime-versions:
		  nodejs: 20.x
	  pre_build:
		commands:
		  - echo "Installing dependancies."
		  - npm ci
	  build:
		commands:
		  - echo "Build Project."
		  - npm run build
	  post_build:
		commands:
		  - echo "All Done Now."
	artifacts:
	  files:
		- '**/*'
	  baseDirectory: 'dist'
	```
 - phases runs command to create build then artifacts store the content from `dist` directory to s3 bucket of project.
 - Reference for build: https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html
 
	`appspec.yml`
	```
	version: 0.0
	os: linux
	files:
	  - source: /
		destination: /var/www/html/E-COMMERCE
	hooks:
	AfterInstall:
		- location: scripts/install.sh
		  timeout: 900
		  runas: root
	```
    - This appspec file use by `CodeDeploy` to run commands on our EC2.
    - This file clone our code to `destination` location and run the following script as `root` user.
    - In case of artifact from codebuild, then it will be automatically copy to the `destination` directory from S3. (make sure both CodeDeploy and CodeBuild artifects are in the same S3.)
## **IAM Roles SetUp:**

**CodeDeploy Role for EC2 instace:**

Create Role --> AWS Servives --> EC2 --> "AmazonEC2RoleforAWSCodeDeploy" --> Create Role.

**IAM Role for CodeDeploy:**

Create Role --> AWS Servives --> CodeDeploy --> "AWSCodeDeployRole" --> Create Role.

**Attach EC2 Role to instance:**

Action --> Security --> Modify IAM Role --> Attach created role for EC2.

    sudo service codedeploy-agent restart #better to restart agent after attaching the role.

## **CodeBuild SetUp:**
Go to CodeBuild --> Create Project --> Project Name --> Source: BitBucket --> 
- Provisonal Model: On-Demand
- Environemnt Image: Managed Image
- Compute: EC2
- OS: Ubuntu
- Rest Default.
- Service role: Create new or Choose existing.
--> Buildspec: Use buildspec file --> Artifacts: type S3 --> bucket name --> Artifacts packaging: zip --> Turn off cloudwatch logs --> create project.

### Let's assume that your build needs to connect to the database in order to create build or run migration and **your rds is private** then how you can you connect it to your rds cause it is temporary server.
- In this case, we will go to the `additional settings`
- Before you move on let's discuss few things, as we discussed it is temporary server so we cannot assign them public IP and use subnet with internet gateway.
- we have to create new private subnet and route table for it. --> create NAT Gateway --> select subnet --> Connectivity type: public --> Allocate Elastic IP --> create.
- then go to the route table --> edit route --> Target: nat-gateway --> destination: 0.0.0.0/0 --> save.
- on `codebuild` select VPC --> subnet that is used by NAT gateway --> security group: it is better to choose security group of EC2 which is connecting to the RDS.

## **CodeDeploy SetUp:**

**Create Application:**
Go to CodeDeploy --> Create Application --> Name --> Compute Platfrom: EC2/On-Premise --> Create

**Create Deployment Group:**
Create Deployment Group --> Group Name --> Service Role: attach Codedeploy Role --> Deployment Type: In place --> AWS EC2 instance: set key and name --> Agent Configuration: leave default --> Deployment Settings: OneAtTime
--> Disable Load Balancer --> create group.

**Menual Deployment for testing: (Optional but recommened for successful pipeline execution:)**
Create Deployment --> Revision Type: My app is stored in GitHub --> GitHub Token Name: your-username --> Connect To GitHub (Connect your git account to AWS CodeDeploy suit --> Repo name: nishant-p-7span/test-node --> Commit ID: ![image](https://github.com/nishant-p-7span/test-node/assets/160576245/452348e5-f6d6-47fc-b5c0-841f42112cca) Click there and Copy the Full Commit ID from URL --> Deployment Behaviour: Override the Content --> Deplpoy 

If this Deployment Succeded then Good to Go for Pipeline otherwise try to solve issues that is occuring. (Codepipeline Has only 100 minutes are free for free tier users so, use it carefully)

## **CodePipeline SetUp:**

Create New Pipeline --> Pipeline Name --> Execution mode: Superseded --> Create service Role --> Source Provider: Bitbucket, Connect it then select repo and branch, Output artifact format codepipeline default Select No filter --> 
Build Stage: Select CodeBuild, Select project, Build type: single build --> Deploy Stage: Select CodeDeploy, application and deployment Group. --> Create Pipeline.

# Now Done, if you make chages to the git repo then automatically trigger the pipeline and deploy it.

# NPM hangs problem on t2.micro.

We will Solve this issue by Allocating our ebs storage as memory, so it will increase our RAM.

first make sure you are log in as root ( so our swap file be stay persistant on the reboots ).

```sudo su``` #if you are log in as ubuntu user.

Copy Paste the following commands.
    ```
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap  /swapfile
    swapon /swapfile
    swapon  --show
    free -h

    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    ```

**wildcard string for nginx config to add in location**
```try_files $uri $uri/ /index.html?$query_string;```

**If you have static build in /home/ubuntu then you might get permission error.**
- Reason is that `nginx` access the files with `www-data` user group and `/home/ubuntu` is not included in this group.
- By adding it, nginx can able to run the build.
- add www-data to username group.
  ```gpasswd -a www-data username```
- make sure that username group can enter all directories along the path.
  ```chmod g+x /username && chmod g+x /username/test && chmod g+x /username/test/static```
- Restart nginx.
  ```sudo nginx -s reload```

# New `appspec.yml` update.
- By default `appspec.yml` file create folder and files with root user and group with limited permissions.
- We usually run all files in ubuntu user, so root user can stay secure. So we need to add `permissions` section in appspec with required permissions, like this.
    ```
    version: 0.0
    os: linux
    files:
    - source: /
        destination: /home/ubuntu/projectname
    # ubuntu user permission for data inside projectname.    
    permissions:
    - object: /home/ubuntu/projectname
        owner: ubuntu
        group: ubuntu
        mode: 777 #this give full permissions to files and folders.

    hooks:
    AfterInstall:
        - location: scripts/install.sh
        timeout: 950
        runas: ubuntu
    ```
