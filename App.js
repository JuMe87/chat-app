//import React
import React from "react"

// import the screens we want to navigate
import Chat from "./components/Chat"
import Start from "./components/Start"

// import react native gesture handler
import "react-native-gesture-handler"

// import react Navigation
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

// Constant creates StackNavigator
const Stack = createStackNavigator()

export default class App extends React.Component {
    // Stack.Screen puts 2 screens on top of each other
    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Start">
                    <Stack.Screen name="Start" component={Start} />
                    <Stack.Screen name="Chat" component={Chat} />
                </Stack.Navigator>
            </NavigationContainer>
        )
    }
}
