import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import Icon from "react-native-vector-icons/MaterialIcons";
import { Container, Header, Content, Card, CardItem, Body } from 'native-base';
import ImagePicker from 'react-native-image-picker';
import firebase from '../database/firebaseDb';
import RNFetchBlob from 'react-native-fetch-blob'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../components/context';

const NavigationDrawerStructure = (props) => {
	const toggleDrawer = () => {
		props.navigationProps.toggleDrawer();
	};
	return (
		<View style={{ flexDirection: 'row' }}>
			<TouchableOpacity onPress={() => toggleDrawer()}>
				<Image
					source={{ uri: 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/drawerWhite.png' }}
					style={{ width: 25, height: 25, margin: 10 }}
				/>
			</TouchableOpacity>
		</View>
	);
  }
function Profile({ navigation }) {
	const useMountEffect = (fun) => useEffect(fun, [])
	const [profilePhoto, setProfilePhoto] = useState(null)
	const [profilePhotoName, setProfilePhotoName] = useState('')
	const [visible, setVisible] = useState(false)
	const [username, setUsername] = useState('')
	const [email , setEmail] = useState('')
	const [ online , setOnline] = useState('')
	const [ profile, setProfilePic] = useState('')
	const [name, setname] = useState('')
	const { signOut } = React.useContext(AuthContext);
	const Blob = RNFetchBlob.polyfill.Blob;
	const fs = RNFetchBlob.fs;
	window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
	window.Blob = Blob;
  
	const options = {
		allowsEditing: true,
		title: 'Select Avatar',
		customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
		storageOptions: {
			skipBackup: true,
			path: '',
		},
	};

	useEffect(() => {
		getCurrentUserDetails()
	})
	const getCurrentUserDetails = async () => {
		userid = await AsyncStorage.getItem('userid');
		var data = firebase.database().ref('/users/'+ userid);
		data.once('value').then(snapshot => {
			console.log("=================================",snapshot)
			setUsername(snapshot.val().username)
			setEmail(snapshot.val().email)
			setOnline(snapshot.val().isOnline)
			setProfilePic(snapshot.val().profilePic)

		
		})
	}
	const profilepicFun = () => {

		return (
			<View>
				<Image style={styles.img} source={profile ?  { uri:  profile } : require('../assets/userpic.png')} />
				<TouchableOpacity style={styles.choosephoto} onPress={() => pickImage()}>
					<Icon
						name="camera-alt"
						size={30}
						color="#fff"
						style={{ justifyContent: 'center', textAlign: 'center' }}
					/>

				</TouchableOpacity>
			</View>
		)
	}
	const pickImage = () => {
		console.log("call pickimage")
		ImagePicker.launchImageLibrary(options, (response) => {


			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			}
			else {
				const source = { uri: response.uri }
				setProfilePhoto(response.uri)
				uploadFileInFirebase(response.uri, response.fileName, response.type)
			}
		});
	};
	const submitProfileImage = (url) => {
		firebase.database().ref('users/').child(userid).update({ 'profilePic': url })
	}
	const updateUsername = () => {
		firebase.database().ref('users/').child(userid).update({ 'username': name })
		setVisible(false)
	}
	  /**
   * 
   * @param {any} fileUri uri of file
   * @param {any} name name of file
   * @param {any} mime type of file
   * Upload all file in firebase storage and download url 
   */
  const uploadFileInFirebase = async (fileUri, name, mime = type) => {
    console.log("================================================", fileUri, name, mime)
    return new Promise((resolve, reject) => {
      let imgUri = fileUri;
      let uploadBlob = null;
      const uploadUri = Platform.OS === 'ios' ? imgUri.replace('file://', '') : imgUri;
      const imageRef = firebase.storage().ref(`/${name}/`)

      fs.readFile(uploadUri, 'base64')
        .then(data => {
          return Blob.build(data, { type: `${mime};BASE64` });
        })
        .then(blob => {
          uploadBlob = blob;
          return imageRef.put(blob, { contentType: mime, name: name });
        })
        .then(() => {
          uploadBlob.close()
          return imageRef.getDownloadURL();
        })
        .then(url => {
          console.log("url===========================", url)
          submitProfileImage(url)
          resolve(url);

        })
        .catch(error => {
          reject(error)
        })
    })
  };


	return (
		<View style={{ flex: 1 }}>
			<Header style={{ backgroundColor: '#3E9487', height: 50, padding: 5 }}>
			<NavigationDrawerStructure navigationProps={navigation} />
				<View style={{ flexDirection: 'column', flex: 10 }}>
					<Text style={styles.headertext}>Profile</Text>

				</View>
				<TouchableOpacity style={{ flexDirection: 'column', flex: 2 }}
				onPress={() => signOut()}>
				
				<Icons 
                        name="exit-to-app" 
                        color='#fff'
						size={30}
						style={{marginTop:8}}
                        />
				</TouchableOpacity>
			</Header>
			<View
				style={{
					flexDirection: "column",
					flex: 1
				}}>

				<View style={styles.profilePic}>
					{profilepicFun()}
				</View>
				<View style={styles.mainCard}>
					<View style={{ flex: 2 }}>
						<Icon
							name="person"
							size={30}
							color="#3E9487"
							style={{ margin: 5 }}
						/>
					</View>
					<View style={{ flex: 8 }}>
						<Text style={styles.mainText}>Name:</Text>
						{
							visible == true ?
								<View>
									<View style={styles.inputContainer}>
										<TextInput
											style={styles.inputs}
											placeholder={username}
											underlineColorAndroid="transparent"
											onChangeText={text => setname(text)}
											autoFocus={true}
										
										/>

									</View>
									<View style={{ alignSelf: 'flex-end', flexDirection: 'row' }}>
										<TouchableOpacity style={{ marginRight: 10 }} onPress={() => setVisible(false)}><Text style={styles.dialogbuttontext}>Cancle</Text></TouchableOpacity>
										<TouchableOpacity style={{ marginLeft: 10 }} onPress={() => updateUsername()}><Text style={styles.dialogbuttontext}>Save</Text></TouchableOpacity>

									</View>
								</View> :

								<View style={{ flexDirection: 'row' }}>
									<View style={{ flexDirection: 'column', flex: 9 }}>

										<Text style={styles.text}>{username}</Text>

									</View>
									<View style={{ flexDirection: 'column', flex: 1 }}>
										<Icon
											name="edit"
											size={20}
											color="#3E9487"
											style={{ margin: 5 }}
											onPress={() => setVisible(true)}
										/>

									</View>
								</View>
						}
					</View>
				</View>

				<View style={styles.mainCard}>
					<View style={{ flex: 2 }}>
						<Icon
							name="email"
							size={30}
							color="#3E9487"
							style={{ margin: 5 }}
						/>
					</View>
					<View style={{ flex: 8 }}>
						<Text style={styles.mainText}>Email:</Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flexDirection: 'column', flex: 9 }}>
								<Text style={styles.text}>{email}</Text>
							</View>

						</View>

					</View>
				</View>

			</View>
		</View>

	);
}

export default Profile;
const styles = StyleSheet.create({
	container: {

		flex: 1,
		backgroundColor: "#000"
	},
	buttonContainer: {
		height: 45,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		width: 150,

	},
	profilePic: {
		alignItems: 'center',
		justifyContent: 'center',

	},
	img: {
		height: 150,
		width: 150,
		borderRadius: 100,
		alignItems: 'center',
		borderColor: '#e7e7e7',
		borderBottomWidth: 5,
		marginTop: 15
	},

	headertext: {
		fontSize: 20,
		color: '#fff',
		marginTop: 10,
		marginLeft: 10
	},
	mainCard: {
		margin: 10,
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#e7e7e7'
	},
	mainText: {
		color: '#6F7579',
		fontSize: 14
	},
	text: {
		fontSize: 18,
		color: '#000'
	},
	inputContainer: {
		borderBottomColor: "#3E9487",
		width: 280,
		height: 45,
		marginBottom: 20,
		flexDirection: 'row',
	},
	inputs: {
		height: 45,
		borderBottomWidth: 3,
		marginLeft: 16,
		borderBottomColor: "#3E9487",
		flex: 1
	},
	choosephoto: {
		justifyContent: 'center',
		backgroundColor: '#3E9487',
		borderRadius: 50,
		height: 50,
		width: 50,
		position: 'absolute',
		right: 10,
		bottom: -10
	},
	dialogbuttontext: {
		color: '#3E9487',
		fontSize: 18
	}
});