const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const db = require('./config/db.js');
const fs = require('fs');
const csurf = require('csurf');

let onlineUsers = []; //array to keep track of socket connections/users
let chatMessages = [];

if (process.env.NODE_ENV != 'production') {
    app.use(require('./build'));
}

// db.initialiseDb();

const multer = require('multer');
var diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/uploads');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + file.originalname);
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});


const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
    secret: 'a really hard to guess secret',
    maxAge: 1000 * 60 * 60 //cookie lasts an hour
}));

app.use(csurf());

app.use(function(req, res, next) { //csrf protection
    res.cookie('t', req.csrfToken());
    next();
});

app.use('/', express.static(`${__dirname}/public`));
app.use('/uploads', express.static(`${__dirname}/uploads`));

//Routes
app.post('/registerUser', (req, res) => {
    db.checkRecordExists('*', 'users', 'email = $1', [req.body.email.toLowerCase()]).then((emailExists) => {
        if (emailExists) {
            res.json({
                error: true,
                errorMessage: 'Email already exists'
            });
        } else {
            db.insertUser(req.body.firstName, req.body.lastName, req.body.email.toLowerCase(), req.body.password).then((results) => {
                req.session.user = results.rows[0];
                res.json({success: true});
            }).catch((err) => {
                console.log(err);
                res.json({
                    error: true,
                    errorMessage: 'Something went wrong, please try again'
                });
            });
        }
    }).catch((err) => {
        console.log(err);
        res.json({
            error: true,
            errorMessage: 'Something went wrong, please try again'
        });
    });
});

app.post('/authenticateUser', (req, res) => {
    db.authenticateUser(req.body.email.toLowerCase(), req.body.password).then((result) => {
        req.session.user = result;
        res.json({success: true});
    }).catch((err) => {
        console.log(err);
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.get('/welcome', (req, res) => {
    if (!req.session.user) {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/');
    }
});

app.get('/', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/welcome');
    }
});

app.get('/user', (req, res) => {
    if (req.query.id) {
        if (req.query.id == req.session.user.id) {
            res.json({
                redirect: true
            });
        } else {
            db.getUserById(req.query.id).then((data) => {
                res.json({
                    id: data.id,
                    firstName: data['first_name'],
                    lastName: data['last_name'],
                    email: data['email'],
                    imageUrl: data['image_url'],
                    bio: data.bio
                });
            }).catch((err) => {
                res.json({
                    error: true,
                    errorMessage: err
                });
            });
        }
    } else {
        res.json({
            id: req.session.user.id,
            firstName: req.session.user['first_name'],
            lastName: req.session.user['last_name'],
            email: req.session.user['email'],
            imageUrl: req.session.user['image_url'],
            bio: req.session.user.bio
        });
    }
});

app.get('/users', (req, res) => {
    if(req.query.q) {
        db.searchUsers(req.query.q).then((results) => {
            res.json({
                success: true,
                data: results
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    } else {
        db.getUsers().then((results) => {
            res.json({
                success: true,
                data: results
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    }
});

app.post('/uploadProfileImage', uploader.single('file'), (req, res) => {
    if (req.file) {
        db.uploadProfileImage(req.file.filename, req.session.user.id).then((result) => {
            req.session.user['image_url'] != null && fs.unlink(__dirname + req.session.user['image_url'], (err) => {
                if(err) {
                    console.log("unlink failed", err);
                } else {
                    console.log("old image deleted");
                }
            });

            req.session.user['image_url'] = result['image_url'];
            res.json({
                success: true,
                imageUrl: result['image_url']
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    } else {
        res.json({
            error: true,
            errorMessage: 'Upload of profile image failed'
        });
    }
});

app.post('/deleteProfileImage', (req, res) => {
    db.deleteProfileImage(req.session.user.id).then(()=> {
        fs.unlink(__dirname + req.session.user['image_url'], (err) => { //delete image from server drive
            if(err) {
                console.log("unlink failed", err);
            } else {
                console.log("image deleted");
            }
        });

        req.session.user['image_url'] = null;
        res.json({
            success: true,
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.post('/bio', (req, res) => {
    db.updateBio(req.body.bio, req.session.user.id).then((result) => {
        req.session.user.bio = result.bio;
        res.json({
            success: true,
            bio: result.bio
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.get('/friendStatus/:id', (req, res) => {
    db.getFriendStatus(req.params.id, req.session.user.id, req.body.friendStatus).then((result) => {
        let recipient;
        if (result['recipient_id'] == req.session.user.id) {
            recipient = true;
        } else {
            recipient = false;
        }
        res.json({
            success: true,
            friendStatus: result.status,
            recipient: recipient
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.post('/makeFriendRequest/:id', (req, res) => {
    db.makeFriendRequest(req.params.id, req.session.user.id, req.body.friendStatus).then((result) => {
        res.json({
            success: true,
            friendStatus: result,
            recipient: false
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.post('/cancelFriendRequest/:id', (req, res) => {
    db.cancelFriendRequest(req.params.id, req.session.user.id).then((result) => {
        res.json({
            success: true,
            friendStatus: result
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.post('/acceptFriendRequest/:id', (req, res) => {
    db.acceptFriendRequest(req.session.user.id, req.params.id).then((result) => {
        res.json({
            success: true,
            friendStatus: result
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.post('/unfriend/:id', (req, res) => {
    db.unfriend(req.params.id, req.session.user.id).then((result) => {
        res.json({
            success: true,
            friendStatus: result
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.get('/getReceivedFriendRequests', (req, res) => {
    db.getReceivedFriendRequests(req.session.user.id).then((results) => {
        res.json({
            success: true,
            data: results
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.get('/getSentFriendRequests', (req, res) => {
    db.getSentFriendRequests(req.session.user.id).then((results) => {
        res.json({
            success: true,
            data: results
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.get('/getFriends', (req, res) => {
    db.getFriends(req.session.user.id).then((results) => {
        res.json({
            success: true,
            data: results
        });
    }).catch((err) => {
        res.json({
            error: true,
            errorMessage: err
        });
    });
});

app.get('/logOut', (req, res) => {
    req.session.user = null;
    res.redirect('/welcome');
});

app.get('/connected/:socketId', (req) => { //keep track of online users
    if (req.session.user) { //only add to array if user logged in
        for (let i = 0; i < onlineUsers.length; i++) { //do not add existing connection to array
            if (onlineUsers[i]['socketId'] == req.params.socketId) {
                return;
            }
        }

        io.sockets.sockets[req.params.socketId] && onlineUsers.push({
            socketId: req.params.socketId,
            userId: req.session.user.id
        });
        io.sockets.emit('updateCurrentOnlineUsers');
    } else {
        return;
    }
});

app.get('/onlineNow', (req, res) => { //list users currently online
    console.log(onlineUsers);
    let onlineUserIds = [];
    for (let i = 0; i < onlineUsers.length; i++) {
        onlineUserIds.push(onlineUsers[i].userId);
    }
    onlineUserIds = onlineUserIds.filter((onlineUserId) => {return onlineUserId != req.session.user.id;});

    if (onlineUserIds.length > 0) {
        db.getUsersByIds(onlineUserIds).then((results) => {
            res.json({
                onlineUserProfiles: results
            });
        });
    } else {
        res.json({
            onlineUserProfiles: false
        });
    }

});

app.get('/chatMessages', (req, res) => {
    res.json({
        chatMessages: chatMessages.slice(Math.max(chatMessages.length - 10, 0)) //restrict chat to last ten messages only
    });
});

app.get('*', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/welcome');
    }
    res.sendFile(__dirname + '/index.html');
});

server.listen(8080, () => {
    console.log("listening");
});

io.on('connection', (socket) => {
    console.log(`socket with the id ${socket.id} is now connected`);

    socket.on('disconnect', () => {
        console.log(`socket with the id ${socket.id} is now disconnected`);
        if (onlineUsers) {
            for (let i = onlineUsers.length - 1; i >= 0; i--) { //remove user from onlineUsers array on disconnect
                if(onlineUsers[i]['socketId'] == socket.id) {
                    onlineUsers.splice(i, 1);
                }
            }
        }
        io.sockets.emit('updateCurrentOnlineUsers');
    });

    socket.on('chat', (messageData) => {
        chatMessages.push(messageData);
        io.sockets.emit('updateChat', chatMessages.slice(Math.max(chatMessages.length - 10, 0))); //signal to update chat on new message
    });
});
