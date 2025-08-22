import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// Read Firebase service account from env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://my-book-project-c5a17-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase(app);
const ref = db.ref("/"); // root path, চাইলে "/movies" দিতে পারো

// Fetch data and write to data.json
ref.once("value")
  .then(snapshot => {
    const data = snapshot.val();
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
    console.log("✅ Firebase data synced to data.json");

    // Git commit & push
    const { execSync } = require("child_process");
    execSync("git config user.email 'actions@github.com'");
    execSync("git config user.name 'GitHub Actions'");
    execSync("git add data.json");
    execSync('git commit -m "Auto sync Firebase data" || echo "No changes"');
    execSync("git push origin main");
    console.log("✅ data.json pushed to GitHub");
  })
  .catch(err => {
    console.error("❌ Firebase read failed:", err);
    process.exit(1);
  });
