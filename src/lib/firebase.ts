const { cert } = require("firebase-admin/app");
const serviceAccount = require("../../image-comment-frame-firebase-adminsdk-m0gru-911cccd523.json");
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://image-comment-frame-default-rtdb.firebaseio.com",
  });
}

const { getDatabase } = require("firebase-admin/database");
export const db = getDatabase();
