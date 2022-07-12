//  import react component
import React, { Component } from "react"
import {
    View,
    Platform,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
} from "react-native"

//Chat library
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat"
import KeyboardSpacer from "react-native-keyboard-spacer"

// online and offline library
import AsyncStorage from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"

// import MapView from "react-native-maps";
import MapView from "react-native-maps"
import CustomActions from "./CustomActions"

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

export default class Chat extends React.Component {
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
            image: null,
            location: null,
        }

        // needed to initialize Firestore app
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig)
        }
        // reference to my “messages” collection on Firestore
        this.referenceChatMessages = firebase.firestore().collection("messages")
        // this.referenceMessagesUser = null
    }

    // temporarly storage of messages
    getMessages = async () => {
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

    componentDidMount() {
        let { name } = this.props.route.params
        this.props.navigation.setOptions({ title: name })

        // Reference to load messages from Firebase
        this.referenceChatMessages = firebase.firestore().collection("messages")

        NetInfo.addEventListener((state) => {
            this.handleConnectivityChange(state)
        })

        NetInfo.fetch().then((state) => {
            const isConnected = state.isConnected
            if (isConnected) {
                this.setState({
                    isConnected: true,
                })

                this.authUnsubscribe = firebase
                    .auth()
                    .onAuthStateChanged(async (user) => {
                        if (!user) {
                            await firebase.auth().signInAnonymously()
                        }

                        this.setState({
                            uid: user.uid,
                            messages: [],
                        })

                        this.unsubscribe = this.referenceChatMessages
                            .orderBy("createdAt", "desc")
                            .onSnapshot(this.onCollectionUpdate)
                    })
            } else {
                this.setState({
                    isConnected: false,
                })

                this.getMessages()
            }
        })
    }

    // firebase storage
    saveMessages = async () => {
        try {
            await AsyncStorage.setItem(
                "messages",
                JSON.stringify(this.state.messages)
            )
        } catch (error) {
            console.log(error.message)
        }
    }

    deleteMessages = async () => {
        try {
            await AsyncStorage.removeItem("messages")
        } catch (error) {
            console.log(error.message)
        }
    }

    // componentDidMount is a "lifecycle method". Lifecycle methods run the
    // function at various times during a component's "lifecycle". For example
    // componentDidMount will run right after the component was added to the page.

    // componentDidMount() {
    //     this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
    //         if (!user) {
    //             firebase.auth().signInAnonymously()
    //         }

    //         this.setState({
    //             uid: user.uid,
    //             messages: [],
    //         })

    //         this.unsubscribe = this.referenceChatMessages
    //             .orderBy("createdAt", "desc")
    //             .onSnapshot(this.onCollectionUpdate)
    //     })
    // }

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
                user: {
                    _id: data.user._id,
                    name: data.user.name,
                    avatar: data.user.avatar,
                },
                image: data.image || null,
                location: data.location || null,
            })
        })
        this.setState({
            messages: messages,
        })
        this.saveMessages()
    }

    handleConnectivityChange = (state) => {
        const isConnected = state.isConnected
        if (isConnected == true) {
            this.setState({
                isConnected: true,
            })
            this.unsubscribe = this.referenceChatMessages
                .orderBy("createdAt", "desc")
                .onSnapshot(this.onCollectionUpdate)
        } else {
            this.setState({
                isConnected: false,
            })
        }
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
            image: message.image || null,
            location: message.location || null,
        })
    }

    //define title in navigation bar
    static navigationOptions = ({ navigation }) => {
        return {
            title: `${navigation.state.params.userName}'s Chat`,
        }
    }

    // handles actions when user hits send-button
    onSend(messages = []) {
        this.setState(
            (previousState) => ({
                messages: GiftedChat.append(previousState.messages, messages),
            }),
            () => {
                this.addMessages()
                this.saveMessages()
            }
        )
    }

    componentWillUnmount() {
        this.unsubscribe()
        this.authUnsubscribe()
    }

    // When user is offline disables input bar
    renderInputToolbar = (props) => {
        console.log("renderInputToolbar --> props", props.isConnected)
        if (props.isConnected === false) {
            return <InputToolbar {...props} />
        } else {
            return <InputToolbar {...props} />
        }
    }

    // displays the communication features
    renderCustomActions = (props) => <CustomActions {...props} />

    //custom map view
    renderCustomView(props) {
        const { currentMessage } = props
        if (currentMessage.location) {
            return (
                <MapView
                    style={{
                        width: 150,
                        height: 100,
                        borderRadius: 13,
                        margin: 3,
                    }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            )
        }
        return null
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

    // render components
    render() {
        let { color, name } = this.props.route.params

        return (
            <View style={[{ backgroundColor: color }, styles.container]}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    isConnected={this.state.isConnected}
                    messages={this.state.messages}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    showAvatarForEveryMessage={true}
                    renderCustomView={this.renderCustomView}
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
                <KeyboardSpacer />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
