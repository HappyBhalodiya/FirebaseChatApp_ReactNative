import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBJg9K8OvJl4lU4WrefuJY9KVt9a1TNp5k",
    authDomain: "chatappreactnative-60992.firebaseapp.com",
    databaseURL: "https://chatappreactnative-60992.firebaseio.com/",
    projectId: "chatappreactnative-60992",
    storageBucket: "gs://chatappreactnative-60992.appspot.com",
    messagingSenderId: "744310452212",
    appId: "1:744310452212:android:1a9c7a68d60965f85493a1"
  };

firebase.initializeApp(firebaseConfig);

firebase.firestore();

export default firebase;