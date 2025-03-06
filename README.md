# GuardianLink Web Stack  app version 0.1

## Instructions on how to setup the environment  

### This is a mock website for end of course project, it is not intended to be used in a live environment.  

**Author:** Katch 2025  

#### List of changes  
- 4 Mar 25: Katch - App added to GitHub.

### Instructions are for Linux OS

1. Install mysql database server; Start the server (service). Make sure mysql uses `mysql_native_password` authentication method
2. Setup mysql database before setting up the web server
   1. Login: `mysql -u root -p`
   2. Create DB: `CREATE DATABASE guardian_link;`
   3. ```sql
      -- Create mysql server user
      FLUSH PRIVILEGES;
      CREATE USER 'admin'@'localhost' IDENTIFIED BY 'odZX4xHt';
      GRANT ALL PRIVILEGES ON guardian_link.* TO 'admin'@'localhost';
      FLUSH PRIVILEGES;
      ```
   4. Logout, log back in as admin: `mysql -u admin -p`
   5. Select DB: `USE guardian_link`
   6. ```sql
      -- Create table 'users'
      CREATE TABLE users (
         id INT NOT NULL AUTO_INCREMENT,
         forename VARCHAR(50),
         surname VARCHAR(50),
         email VARCHAR(100) NOT NULL UNIQUE,
         password VARCHAR(255) NOT NULL,
         user_type VARCHAR(5) NOT NULL,
         concerns MEDIUMTEXT,
         available INT,
         background_check VARCHAR(3),
         resume VARCHAR(3),
         org_name VARCHAR(100),
         PRIMARY KEY (id)) ENGINE innoDB;
      ```
   7. ```sql
      -- Create table 'communication'
      CREATE TABLE communication (
         id INT NOT NULL AUTO_INCREMENT,
         email_from VARCHAR(100) NOT NULL,
         email_to VARCHAR(100) NOT NULL,
         message MEDIUMTEXT NOT NULL,
         pass_reset VARCHAR(3),
         PRIMARY KEY (id)) ENGINE innoDB;
      ```
   8. ```sql
      -- Create admin user for the web server
      -- Password for admin user is AEB'9h!" can be changed (Bcrypt Generator with cost factor 12
      INSERT INTO users(email, password, user_type)
      VALUES('admin@guardianlink.com', '$2a$12$y7cXa9yrSAPEPCmTxYvV0.i44RsqMM.IQdr9ArjcwqpVRU9I7X.HC', 'admin');
      ```
3. Install nodejs (if compiling from source, it must include npm)
4. Change to prefered folder & clone project: `git clone https://github.com/katch922/GuardianLink.git`
5. Change to login module folder: `cd GuardianLink/modules/login`
6. Make sure you can use npm rootless (without sudo). Follow wiki based on your distro
7. Install nodejs modules: `npm i`
8. Start web server: `npm run dev`
9. Open in browser: `localhost:3000`