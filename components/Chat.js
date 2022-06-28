import React, { useState, useEffect, useCallback } from "react"
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native"

//Chat library
import { GiftedChat, Bubble } from "react-native-gifted-chat"

// https://firebase.google.com/docs/web/modular-upgrade - see website for config details when using firebase": "^9.8.4"
import { initializeApp } from "firebase/app"
import {
    getFirestore,
    collection,
    onSnapshot,
    addDoc,
    query,
    orderBy,
} from "firebase/firestore"
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth"

// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAF0lWDCDJp9ObGJ5oI7E75BLcu88Pq6Xc",
    authDomain: "chat-app-7cb10.firebaseapp.com",
    projectId: "chat-app-7cb10",
    storageBucket: "chat-app-7cb10.appspot.com",
    messagingSenderId: "929342332179",
    appId: "1:929342332179:web:21ca904635400fce294ee6",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

//Initializes Cloud Firestore and gets a reference to the service
const db = getFirestore(app)

export default function Chat(props) {
    let { name, color } = props.route.params

    // State to hold messages
    const [messages, setMessages] = useState([])

    //User uid for authentication
    const [uid, setUid] = useState()

    //User object for Gifted Chat
    const [user, setUser] = useState({
        _id: "",
        name: "",
        avatar: "",
    })

    // Create reference to the message collection on firestore
    const messagesRef = collection(db, "messages")

    // Set the screen title to the user name entered in the start screen
    useEffect(() => {
        props.navigation.setOptions({ title: name })

        const auth = getAuth()

        const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                await signInAnonymously(auth)
            }

            // Set states for user uid and logged in text
            setUid(user.uid)
            setMessages([])
            setUser({
                _id: user.uid,
                name: name,
                avatar: "https://placeimg.com/140/140/any",
            })

            const messagesQuery = query(
                messagesRef,
                orderBy("createdAt", "desc")
            )
            unsubscribe = onSnapshot(messagesQuery, onCollectionUpdate)
        })

        return () => {
            authUnsubscribe()
        }
    }, [uid])

    // this function adds new chat messages to the state, then calls addMessage to add to Firestore
    const onSend = useCallback((messages = []) => {
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, messages)
        )
        addMessage(messages[0])
    }, [])

    // Reading snapshot data for messages collection, adding messages to messages state
    const onCollectionUpdate = (querySnapshot) => {
        setMessages(
            querySnapshot.docs.map((doc) => ({
                _id: doc.data()._id,
                createdAt: doc.data().createdAt.toDate(),
                text: doc.data().text,
                user: doc.data().user,
            }))
        )
    }

    // Add the last message of the messages state to the Firestore messages collection
    const addMessage = (message) => {
        addDoc(messagesRef, {
            uid: uid,
            _id: message._id,
            text: message.text || "",
            createdAt: message.createdAt,
            user: message.user,
        })
    }

    // adds background colors for different chat bubbles
    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: "white",
                    },
                    right: {
                        backgroundColor: "violet",
                    },
                }}
            />
        )
    }

    return (
        <View style={[{ backgroundColor: color }, styles.container]}>
            <GiftedChat
                renderBubble={renderBubble.bind()}
                messages={messages}
                showAvatarForEveryMessage={true}
                onSend={(messages) => onSend(messages)}
                user={{
                    _id: user._id,
                    name: user.name,
                    avatar: "https://placeimg.com/140/140/any",
                }}
            />
            {/* Avoid keyboard to overlap text messages on older Andriod versions */}
            {Platform.OS === "android" ? (
                <KeyboardAvoidingView behavior="height" />
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
