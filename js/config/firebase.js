/**
 * Firebase 설정
 *
 * [필수] 아래 값을 본인의 Firebase 프로젝트 설정값으로 교체하세요.
 * Firebase Console > 프로젝트 설정 > 일반 > 내 앱 > 웹 앱
 */
const firebaseConfig = {
  apiKey: "AIzaSyDjHWSHndQ2sHLC2VWlcfTu1ZaQ1nAQ7YM",
  authDomain: "churchstore-8d483.firebaseapp.com",
  projectId: "churchstore-8d483",
  storageBucket: "churchstore-8d483.firebasestorage.app",
  messagingSenderId: "97533674211",
  appId: "1:97533674211:web:c42496f6d9383b7ac4fbd6",
  measurementId: "G-BW500PYHBH"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
