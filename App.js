import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from "./Screens/Dashboard"
import AddUser from "./Screens/AddUser"
import Login from "./Screens/Login"
import ChatScreen from "./Screens/ChatScreen"

console.disableYellowBox = true;
const Stack = createStackNavigator();

function App() {

  return(
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Dashboard">

    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="AddUser" component={AddUser} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />

    </Stack.Navigator>
    </NavigationContainer>
    
    )

}

export default App;