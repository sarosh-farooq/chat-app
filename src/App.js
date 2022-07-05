import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  apiKey: "AIzaSyCLGWTW9mAgGc6wvMLB3bj7AJsVIiDZCS4",
  authDomain: "chat-app-35756.firebaseapp.com",
  projectId: "chat-app-35756",
  storageBucket: "chat-app-35756.appspot.com",
  messagingSenderId: "753891469317",
  appId: "1:753891469317:web:ecccaa45a1c423d77d146c"
})

const auth = firebase.default.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
      <footer></footer>
    </div>
  );
}

export default App;


function SignIn() {


  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
  }

  return (
    <button onClick={signInWithGoogle}>Sign in With Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Signout</button>
  )
}

function ChatRoom() {

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const messages = useCollectionData(query);
  const [formValue, setFormValue] = useState("");
  const [disable, setDisable] = useState(false);
  const dummy = useRef();

  const sendMessage = async (e) => {

    e.preventDefault();
    setDisable(true)

    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoUrl: photoURL
    })

    setFormValue("")
    setDisable(false)
    dummy.current.scrollIntoView({behavior : 'smooth'})
  }

  console.log(messages)
  return (
    <div>
      <main>
        {messages[0] && messages[0].map(msg => <ChatMessage message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} disabled={disable} onChange={(e) => setFormValue(e.target.value)} />
        <button disabled={disable} type='submit'>Send</button>
      </form>

    </div>
  )


}


function ChatMessage(props) {
  const { text, uid, photoUrl } = props.message;

  const messageClass = uid == auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoUrl} />
      <p>{text}</p>
    </div>
  )
}