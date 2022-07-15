//  import PropTypes
import PropTypes from "prop-types"
//import react
import React from "react"
//import necessary components from react-native
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
//import permissions and imagepicker
import * as Permissions from "expo-permissions"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { Camera } from "expo-camera"
import { useActionSheet } from "@expo/react-native-action-sheet"
import MapView from "react-native-maps"

import * as firebase from "firebase"

export default function CustomActions(props) {
    const { showActionSheetWithOptions } = useActionSheet()

    // Lets user pick photo from phone library
    const pickImage = async () => {
        // expo permission
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync()
        try {
            if (status === "granted") {
                // pick image
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All, // only images are allowed
                }).catch((error) => console.log(error))
                // canceled process
                if (!result.cancelled) {
                    const imageUrl = await uploadImage(result.uri)
                    props.onSend({ image: imageUrl })
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    // Let the user take a photo with device's camera

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        try {
            if (status === "granted") {
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                }).catch((error) => console.log(error))

                //If user selects an image, send it
                if (!result.cancelled) {
                    const imageUrl = await uploadImage(result.uri)
                    props.onSend({ image: imageUrl })
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    // get the location of the user by using GPS

    const getLocation = async () => {
        //Ask for permission to access current location
        const { status } = await Location.requestForegroundPermissionsAsync()
        try {
            //If permission is granted, get their location
            if (status === "granted") {
                const result = await Location.getCurrentPositionAsync({}).catch(
                    (error) => {
                        console.error(error)
                    }
                )
                //If location is found/selected, send it
                if (result) {
                    props.onSend({
                        location: {
                            longitude: result.coords.longitude,
                            latitude: result.coords.latitude,
                        },
                    })
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    //---convert image file into blob and store in Firebase Storage---
    const uploadImage = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.onload = function () {
                resolve(xhr.response)
            }
            xhr.onerror = function (e) {
                console.log(e)
                reject(new TypeError("Network request failed"))
            }
            xhr.responseType = "blob"
            xhr.open("GET", uri, true)
            xhr.send(null)
        })

        const imageNameBefore = uri.split("/")
        const imageName = imageNameBefore[imageNameBefore.length - 1]
        const ref = firebase.storage().ref().child(`images/${imageName}`)
        const snapshot = await ref.put(blob)

        blob.close()

        return await snapshot.ref.getDownloadURL()
    }

    //---function that handles communication features---
    const onActionPress = () => {
        const options = [
            "Choose From Library",
            "Take Picture",
            "Send Location",
            "Cancel",
        ]
        const cancelButtonIndex = options.length - 1

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        console.log("user wants to pick an image")
                        return pickImage()
                    case 1:
                        console.log("user wants to take a photo")
                        return takePhoto()
                    case 2:
                        console.log("user wants to get their location")
                        return getLocation()
                }
            }
        )
    }

    const renderCustomView = (props) => {
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

    //render function
    return (
        <TouchableOpacity
            accessible={true}
            accessibilityLabel="More options"
            accessibilityHint="Let’s you choose to send an image or your geolocation."
            style={[styles.container]}
            onPress={onActionPress}
            renderCustomView={renderCustomView}
        >
            <View style={[styles.wrapper, props.wrapperStyle]}>
                <Text style={[styles.iconText, props.iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: "#b2b2b2",
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: "#b2b2b2",
        fontWeight: "bold",
        fontSize: 16,
        backgroundColor: "transparent",
        textAlign: "center",
    },
})

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
}
