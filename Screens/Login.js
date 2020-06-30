import React, { useState, useEffect } from 'react'
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native'
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-community/async-storage';
import firebase from '../database/firebaseDb';
import { AuthContext } from '../components/context';
import * as Animatable from 'react-native-animatable';



function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const { signIn } = React.useContext(AuthContext);
    const [loader, setLoader] = useState(false)

    /**
     * Login user
     */
    const login = async () => {
        if (!email || !password) {
            Alert.alert('Wrong Input!', ' Email or password field cannot be empty.', [
                { text: 'Okay' }
            ]);
        }
        else {
            setLoader(true)
            try {
                firebase
                    .auth()
                    .signInWithEmailAndPassword(email, password)
                    .then(async (res) => {
                        console.log("Login Done", res);
                        await AsyncStorage.setItem('userid', res.user.uid)
                        const foundUser = {
                            user: res.user.email,
                            token: res.user.uid
                        }
                        signIn(foundUser);
                        setEmail('')
                        setPassword('')
                        setLoader(false)
                        navigation.navigate('Dashboard')
                    });
            } catch (error) {
                console.log(error.toString(error));
            }

        }
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#009387' barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.text_header}>Welcome!</Text>
            </View>
            <Animatable.View
                animation="fadeInUpBig"
                style={styles.footer}
            >
                <ScrollView>
                    <Text style={styles.text_footer}>Username</Text>
                    <View style={styles.action}>
                        <Icon
                            name="email-outline"
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
                            name="lock"
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
                            onPress={() => login()}
                        >
                            {
                                loader == true ?
                                    <View>
                                        <ActivityIndicator size="large" color="#fff" />
                                    </View>
                                    :
                                    <Text style={[styles.textSign, {
                                        color: '#fff'
                                    }]}>Sign In</Text>
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddUser')}
                            style={[styles.signIn, {
                                borderColor: '#009387',
                                borderWidth: 1,
                                marginTop: 15
                            }]}
                        >
                            <Text style={[styles.textSign, {
                                color: '#009387'
                            }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animatable.View>
        </View>
    );
}


export default Login;

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
        flex: 3,
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
    }
});
