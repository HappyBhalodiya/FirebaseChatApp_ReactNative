import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import Dashboard from "../Screens/Dashboard"
import AddUser from "../Screens/AddUser"
import Login from "../Screens/Login"
import ChatScreen from "../Screens/ChatScreen"
import Profile from "../Screens/Profile"

const RootStack = createStackNavigator();

const RootStackScreen = ({ navigation }) => (
    <RootStack.Navigator headerMode='none'>
        <RootStack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <RootStack.Screen name="AddUser" component={AddUser} options={{ headerShown: false }} />
        <RootStack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
        <RootStack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
    </RootStack.Navigator>
);

export default RootStackScreen;