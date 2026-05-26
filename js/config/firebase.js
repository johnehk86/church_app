/**
 * Firebase 설정
 *
 * [필수] 아래 값을 본인의 Firebase 프로젝트 설정값으로 교체하세요.
 * Firebase Console > 프로젝트 설정 > 일반 > 내 앱 > 웹 앱
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
