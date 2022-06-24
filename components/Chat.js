import React, { useState, useEffect, useCallback } from "react"
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native"
// chat library
import { GiftedChat, Bubble } from "react-native-gifted-chat"

export default function Chat(props) {
    let { name, color } = props.route.params
    const [messages, setMessages] = useState([])

    // Set the screen title to the user name entered in the start screen
    useEffect(() => {
        props.navigation.setOptions({ title: name })
        setMessages([
            {
                _id: 1,
                text: "Welcome " + name + "!",
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: "React Native",
                    avatar: "https://placeimg.com/140/140/any",
                },
            },
            //adding a system message to see when the user was last active
            //static system message that the user has entered the chat + the username
            {
                _id: 2,
                text: `${name} has entered the chat.`,
                createdAt: new Date(),
                system: true,
            },
        ])
    }, [])

    //this function adds new chat messages to the state
    const onSend = useCallback((messages = []) => {
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, messages)
        )
    }, [])

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
                onSend={(messages) => onSend(messages)}
                user={{
                    _id: 1,
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
