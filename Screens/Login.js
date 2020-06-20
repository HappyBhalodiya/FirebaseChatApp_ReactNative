import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, TextInput } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import Toast from "react-native-simple-toast";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-community/async-storage';
import firebase from '../database/firebaseDb';
function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    /**
     * Login user
     */
    const login = async () => {
        try {
            firebase
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then(async (res) => {
                    console.log("Login Done", res);
                    await AsyncStorage.setItem('userid', res.user.uid)
                    setEmail('')
                    setPassword('')
                    navigation.navigate('Dashboard')
                });
        } catch (error) {
            console.log(error.toString(error));
        }
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
                    <Icon
                        name={"email-outline"}
                        size={20}
                        color="#606060"
                        style={{ margin: 10 }}
                    />
                    <TextInput
                        style={styles.inputs}
                        placeholder="Email"
                        keyboardType="email-address"
                        underlineColorAndroid="transparent"
                        onChangeText={text => setEmail(text)}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Icon
                        name={"lock-outline"}
                        size={20}
                        color="#606060"
                        style={{ margin: 10 }}
                    />
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
                        onPress={() => login()}
                    >
                        <Text style={styles.signUpText}>Log in</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer1}>
                    <Text
                        style={{ fontWeight: "bold", fontSize: 15, color: "silver" }}
                    >
                        New hear ?
            </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AddUser')}>
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                            Create an Account
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


export default Login;

const styles = StyleSheet.create({
    container: {

        flex: 1,
        // alignItems: "center",
        // justifyContent: "center",
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
    signupButton: {
        backgroundColor: "#372e5f",
        marginLeft: 10
    },
    signUpText: {
        color: "white"
    },
    text: {
        fontSize: 20,
        color: "white",
        justifyContent: "center",
        marginTop: 40
    }
});
