const { cert } = require("firebase-admin/app");
// const serviceAccount = require("../../image-comment-frame-firebase-adminsdk-m0gru-911cccd523.json");
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // cert()の中に直接JSON形式で代入
      projectId: process.env.FSA_PROJECT_ID,
      privateKey: process.env.FSA_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      clientEmail: process.env.FSA_CLIENT_EMAIL,
    }),
    databaseURL: "https://image-comment-frame-default-rtdb.firebaseio.com",
    storageBucket: "image-comment-frame.appspot.com",
  });
}

const { getStorage } = require("firebase-admin/storage");
const { getDatabase } = require("firebase-admin/database");

export const db = getDatabase();
export const storage = getStorage().bucket();
