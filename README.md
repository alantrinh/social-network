# Social Network

### Overview

The second last major project at Spiced Academy had us build a social network which built on a lot of things I had learnt thus far. Key functionalities were registering and logging in, uploading/editing of profile data (image, bio), a friend request/approval system, user search, profile viewing,  seeing who was currently online and a chat that updated in real time.

### Details

- The application was built using React
- Postgres was used as the database with bcrypt for hashing/authenticaton of passwords
- socket.io was used to view who was online and to dynamically update the chat
- Upload of images was via the Multer middleware.
- CSRF protection implemented using an instance of the axios module

![Alt text](/public/images/screenshots/profile.png?raw=true "Profile")