const fs = require('fs');
const postgresLogin = require('./postgres_login.json');
const spicedPg = require('spiced-pg');
const db = spicedPg(process.env.DATABASE_URL || `postgres:${postgresLogin.user}:${postgresLogin.pw}@localhost:5432/socialnetwork`);
const initialiseDbSql = fs.readFileSync(__dirname + "/initialise_db.sql").toString();
const bcrypt = require('bcryptjs');

function initialiseDb() {
    db.query(initialiseDbSql).then(() => {
        console.log("created table");
    }).catch((err) => {
        console.log(err);
    });
}

function checkRecordExists(column, table, condition, userInput){
    let q = `SELECT ${column} FROM ${table} WHERE ${condition};`;
    return db.query(q, userInput).then((results) => {
        if (results.rows[0]) {
            return true;
        } else {
            return false;
        }
    }).catch((err) => {
        console.log(err);
    });
}

function insertUser(firstName, lastName, email, password) {
    return new Promise((resolve, reject) => {
        hashPassword(password).then((passwordHash) => {
            db.query(`INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email;`, [firstName, lastName, email, passwordHash]).then((results) => {
                resolve(results);
            }).catch((err) => {
                reject(err);
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

function getUserById(id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM users WHERE id = $1;`, [id]).then((results) => {
            if(results.rows[0]) {
                resolve(results.rows[0]);
            } else {
                reject(`No user with ID '${id}' exists`);
            }
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getUsersByIds(ids) {
    return new Promise((resolve, reject) => {
        let q;
        const args = [];

        for (let i = 0; i < ids.length; i++) {
            if (i == 0) {
                q = 'SELECT * FROM users WHERE id = $1';
            } else {
                q += ` OR id =$${i+1}`;
            }
            args.push(ids[i]);
        }

        q += ';';
        db.query(q, args).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM users ORDER BY id;`).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function searchUsers(searchTerm) {
    let searchTerms = searchTerm.split(" ");
    return new Promise((resolve, reject) => {
        if (searchTerms.length == 1) {
            const searchTerm1 = searchTerms[0] + '%';
            db.query(`SELECT id, first_name, last_name, image_url FROM users WHERE first_name ILIKE $1 OR last_name ILIKE $1 ORDER BY first_name;`, [searchTerm1]).then((results) => {
                resolve(results.rows);
            }).catch((err) => {
                console.log(err);
                reject('Something went wrong, please try again');
            });
        } else {
            const searchTerm1 = searchTerms[0] + '%';
            const searchTerm2 = searchTerms[1] + '%';
            db.query(`SELECT id, first_name, last_name, image_url FROM users WHERE (first_name ILIKE $1 AND last_name ILIKE $2) OR (first_name ILIKE $2 AND last_name Ilike $1) ORDER BY first_name;`, [searchTerm1, searchTerm2]).then((results) => {
                resolve(results.rows);
            }).catch((err) => {
                console.log(err);
                reject('Something went wrong, please try again');
            });
        }
    });
}

function hashPassword(plainTextPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(enteredPassword, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(enteredPassword, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err);
            }
            resolve(doesMatch);
        });
    });
}

function authenticateUser(email, password) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * from users WHERE email = $1;`, [email]).then((results) => {
            if (results.rows[0] == undefined) {
                reject('Email does not exist, please try again');
            } else {
                checkPassword(password, results.rows[0]["password_hash"]).then((matches) => {
                    if (matches) {
                        resolve(results.rows[0]);
                    } else {
                        reject('Incorrect password, please try again');
                    }
                }).catch((err) => {
                    console.log(err);
                    reject('Something went wrong, please try again');
                });
            }
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function uploadProfileImage(imageURL, id) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE users SET image_url = $1 WHERE id = $2 RETURNING image_url;`, ['/uploads/' + imageURL, id]).then((results) => {
            if (results.rows[0] == undefined) {
                reject('id does not exist, please try again');
            } else {
                resolve(results.rows[0]);
            }
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function deleteProfileImage(id) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE users SET image_url = null WHERE id = $1;`, [id]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function updateBio(bio, id) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE users SET bio = $1 WHERE id = $2 RETURNING bio;`, [bio, id]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getFriendStatus(viewedUserId, currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM friend_requests WHERE (recipient_id = $1 AND sender_id = $2) OR (recipient_id = $2 AND sender_id = $1);`, [viewedUserId, currentUserId]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function makeFriendRequest(recipientId, senderId, friendStatus) {
    return new Promise((resolve, reject) => {
        if (friendStatus == null) {
            db.query(`INSERT INTO friend_requests (recipient_id, sender_id, status, updated_at) VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP) RETURNING status;`, [recipientId, senderId]).then((results) => {
                resolve(results.rows[0].status);
            }).catch((err) => {
                console.log(err);
                reject('Something went wrong, please try again');
            });
        } else {
            db.query(`UPDATE friend_requests SET status = 'pending', recipient_id = $1, sender_id = $2, updated_at = CURRENT_TIMESTAMP WHERE (recipient_id = $1 AND sender_id = $2) OR (recipient_id = $2 AND sender_id = $1) RETURNING status;`, [recipientId, senderId]).then((results) => {
                resolve(results.rows[0].status);
            }).catch((err) => {
                console.log(err);
                reject('Something went wrong, please try again');
            });
        }
    });
}

function cancelFriendRequest(recipientId, senderId) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE friend_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE recipient_id = $1 AND sender_id = $2 RETURNING status;`,[recipientId, senderId]).then((results) => {
            resolve(results.rows[0].status);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function acceptFriendRequest(recipientId, senderId) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE friend_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE recipient_id = $1 AND sender_id = $2 RETURNING status;`, [recipientId, senderId]).then((results) => {
            resolve(results.rows[0].status);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function unfriend(viewedUserId, currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE friend_requests SET status = 'unfriended', updated_at = CURRENT_TIMESTAMP WHERE (recipient_id = $1 AND sender_id = $2) OR (recipient_id = $2 AND sender_id = $1) RETURNING status;`, [viewedUserId, currentUserId]).then((results) => {
            resolve(results.rows[0].status);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getReceivedFriendRequests(currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM users INNER JOIN friend_requests ON users.id = friend_requests.sender_id WHERE friend_requests.recipient_id = $1 AND friend_requests.status = 'pending';`, [currentUserId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getSentFriendRequests(currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM users INNER JOIN friend_requests ON users.id = friend_requests.recipient_id WHERE friend_requests.sender_id = $1 AND friend_requests.status = 'pending';`, [currentUserId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getFriends(currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM users JOIN (SELECT recipient_id AS friends_id FROM friend_requests WHERE sender_id = $1 AND status = 'accepted' UNION SELECT sender_id as friends_id FROM friend_requests WHERE recipient_id = $1 AND status = 'accepted') AS friends ON users.id = friends.friends_id;`, [currentUserId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

module.exports.initialiseDb = initialiseDb;
module.exports.checkRecordExists = checkRecordExists;
module.exports.insertUser = insertUser;
module.exports.authenticateUser = authenticateUser;
module.exports.getUserById = getUserById;
module.exports.getUsersByIds = getUsersByIds;
module.exports.getUsers = getUsers;
module.exports.searchUsers = searchUsers;
module.exports.uploadProfileImage = uploadProfileImage;
module.exports.deleteProfileImage = deleteProfileImage;
module.exports.updateBio = updateBio;
module.exports.getFriendStatus = getFriendStatus;
module.exports.makeFriendRequest = makeFriendRequest;
module.exports.cancelFriendRequest = cancelFriendRequest;
module.exports.acceptFriendRequest = acceptFriendRequest;
module.exports.unfriend = unfriend;
module.exports.getReceivedFriendRequests = getReceivedFriendRequests;
module.exports.getSentFriendRequests = getSentFriendRequests;
module.exports.getFriends = getFriends;
