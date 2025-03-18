// src/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace with your Firebase Real-time Database URL.
  databaseURL: "https://drone-test-pjones-default-rtdb.firebaseio.com/"
});

const db = admin.database();

/**
 * Subscribe to command updates from the web app.
 * Listens on the "gimbalSpeed" node.
 */
function subscribeToGimbalSpeed(callback) {
  const ref = db.ref('gimbalSpeed');
  ref.on('value', snapshot => {
    const data = snapshot.val();
    console.log('Received update from Firebase (gimbalSpeed):', data);
    callback(data);
  }, error => {
    console.error('Error receiving data from Firebase (gimbalSpeed):', error);
  });
  // Return an unsubscribe function.
  return () => ref.off();
}

/**
 * Update Firebase with the device's feedback.
 * Writes to the "gimbalFeedback" node.
 */
function updateDroneMode(feedback) {
  return db.ref('DroneMode').set(feedback);
}

module.exports = { subscribeToGimbalSpeed, updateDroneMode };
