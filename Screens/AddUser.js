import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-simple-toast";
import firebase from '../database/firebaseDb';

function AddUser({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  let dbRef = firebase.firestore().collection('users');

  /**
   * Add Users in Firebase 
   */
  const AddData = () => {
    console.log(username, email, password)

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((res) => {
        console.log("Response before Database:", res)
        firebase.database().ref('users/' + res.user.uid).set({
          id: res.user.uid,
          username: username,
          password: password,
          email: email,

        })
        navigation.navigate('Login')
      })

  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "column",
          flex: 4
        }}
      />
      <View
        style={{
          flexDirection: "column",
          flex: 7,
          justifyContent: "center",
          alignItems: "center"
        }}
      >


        <View style={styles.inputContainer}>
          <Icon name={"lock-outline"} size={20} color="#606060" style={{ margin: 10 }} />
          <TextInput
            style={styles.inputs}
            placeholder="username"
            underlineColorAndroid="transparent"
            onChangeText={text => setUsername(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name={"email"} size={20} color="#606060" style={{ margin: 10 }} />

          <TextInput
            style={styles.inputs}
            placeholder="Email"
            keyboardType="email-address"
            underlineColorAndroid="transparent"
            onChangeText={text => setEmail(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name={"lock-outline"} size={20} color="#606060" style={{ margin: 10 }} />
          <TextInput
            style={styles.inputs}
            placeholder="Password"
            secureTextEntry={true}
            underlineColorAndroid="transparent"
            onChangeText={text => setPassword(text)}
          />
        </View>

        <View style={styles.inputContainer1}>
          <TouchableOpacity
            style={[styles.buttonContainer, styles.loginButton]}
            onPress={() => AddData()}
          >
            <Text style={styles.signUpText}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer1}>
          <Text
            style={{ fontWeight: "bold", fontSize: 15, color: "silver" }}
          >

            Already have an account.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>
              Log in
          </Text>
          </TouchableOpacity>
        </View>

      </View>
      <View
        style={{
          flexDirection: "column",
          flex: 4
        }}
      />
    </View>

  );
}

export default AddUser;
const styles = StyleSheet.create({
  container: {

    flex: 1,
    backgroundColor: "#000"
  },

  inputContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#e7e7e7",

    width: 280,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
  },
  inputContainer1: {
    width: 250,
    height: 45,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: "#FFFFFF",
    flex: 1
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: "center"
  },
  buttonContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 150,

  },
  loginButton: {
    backgroundColor: "#38887A"
  },
  signUpText: {
    color: "white"
  },
  text: {
    fontSize: 20,
    color: "white",
    justifyContent: "center",
    marginTop: 40
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
    marginBottom: 20
  },

  choosephoto: {
    justifyContent: 'center',
    backgroundColor: '#38887A',
    borderRadius: 50,
    height: 50,
    width: 50,
    position: 'absolute',
    right: 15,
    bottom: 5
  },
});
