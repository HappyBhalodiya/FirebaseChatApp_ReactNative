import React, { useState, useEffect } from 'react'
import { Dimensions, View, ActivityIndicator } from 'react-native'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from "./Screens/Dashboard"
import AddUser from "./Screens/AddUser"
import Login from "./Screens/Login"
import ChatScreen from "./Screens/ChatScreen"
import Profile from "./Screens/Profile"
import AsyncStorage from '@react-native-community/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from './Screens/DrawerContent';
import firebase from './database/firebaseDb';
import RootStackScreen from './Screens/RootStackScreen';
import { AuthContext } from './components/context';
import ChannelChatScreen from './Screens/ChannelChatScreen'
console.disableYellowBox = true;
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();


const App = () => {
	const initialLoginState = {
		isLoading: true,
		userName: null,
		userToken: null,
	};
	const loginReducer = (prevState, action) => {
		console.log("prevState", prevState, "action", action)
		switch (action.type) {
			case 'RETRIEVE_TOKEN':
				return {
					...prevState,
					userToken: action.token,
					isLoading: false,
				};
			case 'LOGIN':
				return {
					...prevState,
					userName: action.id,
					userToken: action.token,
					isLoading: false,
				};
			case 'LOGOUT':
				return {
					...prevState,
					userName: null,
					userToken: null,
					isLoading: false,
				};
			case 'REGISTER':
				return {
					...prevState,
					userName: action.id,
					userToken: action.token,
					isLoading: false,
				};
		}
	};

	const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);
	const authContext = React.useMemo(() => ({
		signIn: async (foundUser) => {
			console.log("=========================", foundUser)
			const userToken = foundUser.token;
			const userName = foundUser.user;

			try {
				await AsyncStorage.setItem('userToken', userToken);
			} catch (e) {
				console.log(e);
			}
			dispatch({ type: 'LOGIN', id: userName, token: userToken });
		},
		signOut: async () => {
			try {
				await AsyncStorage.removeItem('userToken');

				let userid = await AsyncStorage.getItem('userid');
				var presenceRef = firebase.database().ref("users/").child(userid);
				// Write a string when this client loses connection
				presenceRef.update({ 'isOnline': false });
			} catch (e) {
				console.log(e);
			}
			dispatch({ type: 'LOGOUT' });
		},

	}), []);

	useEffect(() => {
		setTimeout(async () => {
			let userToken;
			userToken = null;
			try {
				userToken = await AsyncStorage.getItem('userToken');
			} catch (e) {
				console.log(e);
			}
			dispatch({ type: 'RETRIEVE_TOKEN', token: userToken });
		}, 1000);
	}, []);
	if (loginState.isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}
	return (
		<AuthContext.Provider value={authContext}>
			<NavigationContainer >
				{loginState.userToken !== null ?
					(
						<Drawer.Navigator drawerStyle={{ width: '80%' }} drawerContent={props => <DrawerContent {...props} />}>
							<Drawer.Screen name="Dashboard" component={Dashboard} />
							<Drawer.Screen name="Profile" component={Profile} />
							<Drawer.Screen name="ChatScreen" component={ChatScreen} />
							<Drawer.Screen name="ChannelChatScreen" component={ChannelChatScreen} />

						</Drawer.Navigator>
					)
					:
					<RootStackScreen />

				}
			</NavigationContainer>
		</AuthContext.Provider>

	);
}

export default App;

