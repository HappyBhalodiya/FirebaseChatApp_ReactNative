import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";
import firebase from '../database/firebaseDb';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-community/async-storage';


function AddUser({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loader, setLoader] = useState(false)
 
  /**
   * Add Users in Firebase 
   */
  const AddData = async() => {
    console.log(username, email, password)
    if(!username || !email || !password){
      Alert.alert('Wrong Input!', 'Username , Email or password field cannot be empty.', [
        {text: 'Okay'}
      ]);
    }
    else{
      setLoader(true)
      let token = await AsyncStorage.getItem('fcmToken');
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(async(res) => {
        console.log("Response before Database:", res)
        firebase.database().ref('users/' + res.user.uid).set({
          id: res.user.uid,
          username: username,
          password: password,
          email: email,
          isOnline: false,
          profilePic: '',
          fcmToken:token
        })
        navigation.navigate('Login')
        setLoader(false)
        await AsyncStorage.setItem('username',username);
      })
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor='#009387' barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.text_header}>Register Now!</Text>
      </View>
      <Animatable.View
        animation="fadeInUpBig"
        style={styles.footer}
      >
        <ScrollView>
          <Text style={styles.text_footer}>Username</Text>
          <View style={styles.action}>
            <Icon
              name="face"
              color="#05375a"
              size={20}
            />
            <TextInput
              style={styles.textInput}
              placeholder="username"
              underlineColorAndroid="transparent"
              onChangeText={text => setUsername(text)}
            />

          </View>

          <Text style={[styles.text_footer, {
            marginTop: 35
          }]}>Email</Text>
          <View style={styles.action}>
            <Icon
              name="email"
              color="#05375a"
              size={20}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              keyboardType="email-address"
              underlineColorAndroid="transparent"
              onChangeText={text => setEmail(text)}
            />
          </View>

          <Text style={[styles.text_footer, {
            marginTop: 35
          }]}>Password</Text>
          <View style={styles.action}>
            <Icon
              name="lock-outline"
              color="#05375a"
              size={20}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              secureTextEntry={true}
              underlineColorAndroid="transparent"
              onChangeText={text => setPassword(text)}
            />

          </View>

          <View style={styles.button}>
            <TouchableOpacity
              style={[styles.signIn, {
                backgroundColor: '#56C9BA'
              }]}
              onPress={() => AddData()}
            >
              {
                loader == true ?
                  <View>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                  :
                  <Text style={[styles.textSign, {
                    color: '#fff'
                  }]}>Sign Up</Text>
              }

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.signIn, {
                borderColor: '#009387',
                borderWidth: 1,
                marginTop: 15
              }]}
            >
              <Text style={[styles.textSign, {
                color: '#009387'
              }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
    </View>

  );
}

export default AddUser;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387'
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50
  },
  footer: {
    flex: Platform.OS === 'ios' ? 3 : 5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  button: {
    alignItems: 'center',
    marginTop: 50
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20
  },
  color_textPrivate: {
    color: 'grey'
  }
});
