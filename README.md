# GuardianLink Web Stack  app version 0.1

## Instructions on how to setup the environment  

### This is a mock website for end of course project, it is not intended to be used in a live environment.  

**Author:** Katch 2025  

#### List of changes  
- 4 Mar 25: Katch - App added to GitHub.

### Instructions are for Linux OS

1. Install mysql database server; Start the server (service)
2. Setup mysql database before setting up the web server
   1. Login: `mysql -u root -p`
   2. Create DB: `CREATE DATABASE guardian_link;`
   3. Switch DB: `USE guardian_link;`
   4. ```sql
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
   5. ```sql
      -- Create table 'communication'
      CREATE TABLE communication (
         id INT NOT NULL AUTO_INCREMENT,
         email_from VARCHAR(100) NOT NULL,
         email_to VARCHAR(100) NOT NULL,
         message MEDIUMTEXT NOT NULL,
         pass_reset VARCHAR(3),
         PRIMARY KEY (id)) ENGINE innoDB;
      ```
   6. Install nodejs (if compiling from source, it must include npm)
   7. Change to prefered folder & clone project: `git clone https://github.com/katch922/GuardianLink.git`
   8. Change to login module folder: `cd GuardianLink/modules/login`
   9. Make sure you can use npm rootless (without sudo). Follow wiki based on your distro
   10. Install nodejs modules: `npm i`
   11. ```sql
      -- Create admin user for the project
      INSERT INTO users(email, password, user_type)
      VALUES('admin@guardianlink.com', '$2a$12$4GNHuiG0MxAmfL/AUztPxOmrzrP0usL1MQmFapMtaKobcFB5LVe5a', 'admin');
      ```
   12. 