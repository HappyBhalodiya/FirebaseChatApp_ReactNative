import React, { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from "./Screens/Dashboard"
import ChatScreen from "./Screens/ChatScreen"
import Profile from "./Screens/Profile"
import AsyncStorage from '@react-native-community/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from './Screens/DrawerContent';
import firebase from './database/firebaseDb';
import RootStackScreen from './Screens/RootStackScreen';
import { AuthContext } from './components/context';
import ChannelChatScreen from './Screens/ChannelChatScreen'
import firebasee  from 'react-native-firebase';
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
				firebase.database().ref('users/').child(userid).update({ 'fcmToken': '' })
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
		checkPermission()
		createNotificationListeners()
	}, []);


	const checkPermission = async () => {
		const enabled = await firebasee.messaging().hasPermission();
		// If Premission granted proceed towards token fetch
		if (enabled) {
			getToken();
		} else {
			// If permission hasn’t been granted to our app, request user in requestPermission method. 
			requestPermission();
		}
	}
	const getToken = async()  => {
		let fcmToken = await AsyncStorage.getItem('fcmToken');
		console.log("token====================",fcmToken)
		if (!fcmToken) {
		  fcmToken = await firebasee.messaging().getToken();
		  if (fcmToken) {
			// user has a device token
			await AsyncStorage.setItem('fcmToken', fcmToken);
		  }
		}
	  }
	
	   const requestPermission = async() => {
		try {
		  await firebasee.messaging().requestPermission();
		  // User has authorised
		  getToken();
		} catch (error) {
		  // User has rejected permissions
		  console.log('permission rejected');
		}
	  }

	const createNotificationListeners = async () => {
		console.log("calllllllllllllllllll")	
		// This listener triggered when notification has been received in foreground
		 notificationListener = firebasee.notifications().onNotification((notification) => {
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>",notification)
			const { title, body } = notification;

			const localNotification = new firebasee.notifications.Notification({
				sound: 'sampleaudio',
				show_in_foreground: true,
			  }) 
			  .setNotificationId(notification.notificationId)
			  .setTitle(notification.title)
			  .setBody(notification.body)
			  .setSound('default')
			  .android.setLargeIcon('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg')
			  .android.setChannelId('fcm_FirebaseNotifiction_default_channel') // e.g. the id you chose above
			  .android.setSmallIcon('https://www.gettyimages.in/gi-resources/images/500px/983794168.jpg') // create this icon in Android Studio
			  .android.setColor('#000000') // you can set a color here
			  .android.setPriority(firebasee.notifications.Android.Priority.High);

			  const action = new firebasee.notifications.Android.Action('action', 'ic_launcher', 'Visit Profile', () => {
				console.log("Add event in addaction=====================>")
			  });
			  
			  // Add the action to the notification
			  localNotification.android.addAction(action);
			  firebasee.notifications()
				.displayNotification(localNotification)
				.catch(err => console.error('err===============>', err));
			
	  
		});

		notificationOpenedListener = firebasee.notifications().onNotificationOpened((notificationOpen) => {
			const { title, body } = notificationOpen.notification;
			console.log("notification",notificationOpen)
			
		  });

	}
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


