// import React and useState
import React, { useState } from "react"
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Pressable,
    TouchableOpacity,
    ImageBackground,
    Platform,
    KeyboardAvoidingView,
} from "react-native"
import BackgroundImage from "../img/Background_Image.png"

// This constant creates background colors the user can choose from
const colors = {
    black: "#090C08",
    purple: "#474056",
    grey: "#8A95A5",
    green: "#B9C6AE",
}

export default function Start(props) {
    let [name, setName] = useState()
    let [color, setColor] = useState()

    return (
        <View style={styles.container}>
            <ImageBackground
                source={BackgroundImage}
                resizeMode="cover"
                style={styles.image}
            >
                <Text style={styles.title}>Chat-App</Text>

                <View style={styles.box}>
                    {/* This input box sets passed user name to chat screen */}
                    <TextInput
                        onChangeText={(name) => setName(name)}
                        value={name}
                        style={styles.input}
                        placeholder="Your name..."
                    />

                    {/* Allows user to choose a background color for chat screen */}
                    <Text style={styles.text}>Choose Background Color:</Text>
                    <View style={styles.colorContainer}>
                        <TouchableOpacity
                            style={[
                                { backgroundColor: colors.black },
                                styles.colorbutton,
                            ]}
                            onPress={() => setColor(colors.black)}
                        />
                        <TouchableOpacity
                            style={[
                                { backgroundColor: colors.purple },
                                styles.colorbutton,
                            ]}
                            onPress={() => setColor(colors.purple)}
                        />
                        <TouchableOpacity
                            style={[
                                { backgroundColor: colors.grey },
                                styles.colorbutton,
                            ]}
                            onPress={() => setColor(colors.grey)}
                        />
                        <TouchableOpacity
                            style={[
                                { backgroundColor: colors.green },
                                styles.colorbutton,
                            ]}
                            onPress={() => setColor(colors.green)}
                        />
                    </View>

                    {/* Opens chatroom and passed user name and background color as props */}
                    <Pressable
                        onPress={() =>
                            props.navigation.navigate("Chat", {
                                name: name,
                                color: color,
                            })
                        }
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed
                                    ? "#585563"
                                    : "#757083",
                            },
                            styles.button,
                        ]}
                    >
                        <Text style={styles.buttontext}>Start Chatting</Text>
                    </Pressable>
                </View>
            </ImageBackground>
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

    image: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center",
    },

    title: {
        fontSize: 45,
        fontWeight: "600",
        color: "#FFFFFF",
    },

    box: {
        width: "88%",
        backgroundColor: "white",
        alignItems: "center",
        height: "44%",
        justifyContent: "space-evenly",
    },

    input: {
        height: 50,
        width: "88%",
        fontSize: 16,
        fontWeight: "300",
        color: "#757083",
        borderColor: "gray",
        borderWidth: 1,
        paddingHorizontal: 10,
    },

    text: {
        color: "#757083",
        fontSize: 16,
        fontWeight: "300",
    },

    colorContainer: {
        width: "88%",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },

    colorbutton: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },

    button: {
        height: 50,
        width: "88%",
        justifyContent: "center",
        alignItems: "center",
    },

    buttontext: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
})
