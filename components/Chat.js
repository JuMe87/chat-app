import React, { Component } from "react"
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native"

//Chat library
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat"

// online and offline library
import AsyncStorage from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"

// Firestore instruction details
const firebase = require("firebase")
require("firebase/firestore")

// Firebase configuration taken from https://console.firebase.google.com/project/chat-app-7cb10/settings/general/web:MmVjZTExMzUtZTYxNC00Y2MwLWI5NmMtNzE2MmE2MzFhODZm
const firebaseConfig = {
    apiKey: "AIzaSyAF0lWDCDJp9ObGJ5oI7E75BLcu88Pq6Xc",
    authDomain: "chat-app-7cb10.firebaseapp.com",
    projectId: "chat-app-7cb10",
    storageBucket: "chat-app-7cb10.appspot.com",
    messagingSenderId: "929342332179",
    appId: "1:929342332179:web:21ca904635400fce294ee6",
}

class Chat extends Component {
    constructor() {
        super()
        this.state = {
            messages: [],
            uid: 0,
            user: {
                _id: "",
                name: "",
                avatar: "",
            },
            isConnected: false,
        }

        // needed to initialize Firestore app
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig)
        }
        // reference to my “messages” collection on Firestore
        this.referenceChatMessages = firebase.firestore().collection("messages")
        this.referenceMessagesUser = null
    }

    componentDidMount() {
        let { name } = this.props.route.params
        this.props.navigation.setOptions({ title: name })

        // Reference to load messages from Firebase
        this.referenceChatMessages = firebase.firestore().collection("messages")

        NetInfo.fetch().then((connection) => {
            if (connection.isConnected) {
                this.setState({ isConnected: true })
                console.log("online")
            } else {
                console.log("offline")
            }

            // Authenticates user by using Firebase
            this.authUnsubscribe = firebase
                .auth()
                .onAuthStateChanged((user) => {
                    if (!user) {
                        firebase.auth().signInAnonymously()
                    }
                    this.setState({
                        uid: user.uid,
                        messages: [],
                        user: {
                            _id: user.uid,
                            name: name,
                            avatar: "https://placeimg.com/140/140/any",
                        },
                    })
                    this.referenceMessagesUser = firebase
                        .firestore()
                        .collection("messages")
                        .where("uid", "==", this.state.uid)

                    // saves messages when user is online
                    this.saveMessages()
                    this.unsubscribe = this.referenceChatMessages
                        .orderBy("createdAt", "desc")
                        .onSnapshot(this.onCollectionUpdate)
                })
        })
    }

    // saves messages to local storage
    async getMessages() {
        let messages = ""
        try {
            messages = (await AsyncStorage.getItem("messages")) || []
            this.setState({
                messages: JSON.parse(messages),
            })
        } catch (error) {
            console.log(error.message)
        }
    }

    async saveMessages() {
        try {
            await AsyncStorage.setItem(
                "messages",
                JSON.stringify(this.state.messages)
            )
        } catch (error) {
            console.log(error.message)
        }
    }

    async deleteMessages() {
        try {
            await AsyncStorage.removeItem("messages")
            this.setState({
                messages: [],
            })
        } catch (error) {
            console.log(error.message)
        }
    }

    // stop listening to auth and collection changes
    componentWillUnmount() {
        this.authUnsubscribe()
    }

    onSend(messages = []) {
        this.setState(
            (previousState) => ({
                messages: GiftedChat.append(previousState.messages, messages),
            }),
            () => {
                // this.addMessages()
                this.saveMessages()
            }
        )
    }

    // renders messages
    onCollectionUpdate = (querySnapshot) => {
        const messages = []
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            let data = doc.data()
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt.toDate(),
                user: data.user,
            })
        })
        this.setState({
            messages: messages,
        })
    }

    // Adds messages to cloud storage
    addMessages() {
        const message = this.state.messages[0]
        this.referenceChatMessages.add({
            uid: this.state.uid,
            _id: message._id,
            text: message.text || "",
            createdAt: message.createdAt,
            user: message.user,
        })
    }

    // When user is offline disable sending new messages
    renderInputToolbar(props) {
        if (this.state.isConnected == false) {
        } else {
            return <InputToolbar {...props} />
        }
    }

    // adds background colors for different chat bubbles
    renderBubble(props) {
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

    render() {
        let { color, name } = this.props.route.params
        return (
            <View style={[{ backgroundColor: color }, styles.container]}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    // showAvatarForEveryMessage={true}
                    onSend={(messages) => this.onSend(messages)}
                    user={{
                        _id: this.state.user._id,
                        name: name,
                        avatar: this.state.user.avatar,
                    }}
                />
                {/* Avoid keyboard to overlap text messages on older Andriod versions  */}
                {Platform.OS === "android" ? (
                    <KeyboardAvoidingView behavior="height" />
                ) : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

export default Chat
