// Switch to the target database
db = db.getSiblingDB('keysstore');

// Create the user for this database
db.createUser({
  user: 'admin', // username
  pwd: 'admin', // password
  roles: [
    { role: 'readWrite', db: 'keysstore' }, // full access to keysstore only
  ],
});
