import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const app = initializeApp({
	apiKey: 'AIzaSyATd50JNLgDOUkO_gnFgcEikEN6nYXz5Cg',
	authDomain: 'globalchat-92f27.firebaseapp.com',
	projectId: 'globalchat-92f27',
	storageBucket: 'globalchat-92f27.appspot.com',
	messagingSenderId: '450984588844',
	appId: '1:450984588844:web:928650a01b2666a6bf4389',
	measurementId: 'G-S2XRM54D3V',
});

const auth = getAuth(app);
const db = getFirestore(app);

function App() {
	const [user] = useAuthState(auth);

	return (
		<div className="App">
			<header></header>
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider);
	};

	return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
	return auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function ChatRoom() {
	const dummy = useRef();
	const messagesRef = collection(db, 'messages');
	const q = query(messagesRef, orderBy('createdAt'), limit(25));
	const [messages] = useCollectionData(q, { idField: 'id' });

	const [formValue, setFormValue] = useState('');

	const sendMessage = async (e) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await setDoc(doc(messagesRef, String(Math.random())), {
			text: formValue,
			createdAt: serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue('');
		dummy.current.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<>
			<main>
				{messages && messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
				<div ref={dummy}></div>
			</main>

			<form onSubmit={sendMessage}>
				<input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

				<button type="submit" disabled={!formValue}>
					🕊️
				</button>
			</form>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;
	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} referrerPolicy="no-referrer" />
			<p>{text}</p>
		</div>
	);
}

export default App;
