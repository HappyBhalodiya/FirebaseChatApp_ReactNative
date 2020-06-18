import React, { useState, useEffect,useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-simple-toast";
import firebase from '../database/firebaseDb';
import AsyncStorage from '@react-native-community/async-storage';



function Dashboard({ navigation }) {
  const [allUser , setAllUser] = useState([])

  useEffect( () => {
    getUsers()
  },[])

  const getUsers  = async() =>{
    userid = await AsyncStorage.getItem('userid');
    var data = firebase.database().ref('/users/');
    data.once('value').then(snapshot => {
      var items = [];
      snapshot.forEach(child => {
        items.push({
          user:child.val().username,
          id:child.val().id
        })
      })
      setAllUser(items)
    })

  }
  

  const allusers = allUser.map((res, index) => {
    console.log(res)
    if (res.id != userid ) {
      return (

        <TouchableOpacity style={styles.cardView} onPress={() => navigation.navigate('ChatScreen', { userclickid: res.id})}>

        <View style={{ flexDirection: 'column', flex: 11 }}>
        <Text style={styles.username}>{res.user}</Text>

        </View>
        </TouchableOpacity>
        )
    }
  })

  return (
    <View style={styles.container}>
    {allusers}
    </View>
    )
}

export default Dashboard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  cardView: {
    borderBottomWidth: 2,
    borderBottomColor: '#e7e7e7',
    padding: 10,
    backgroundColor: "#fff",
    flexDirection: 'row'
  },
  img: {
    height: 35,
    width: 35,
    borderRadius: 50,
    alignItems: 'center',
    borderColor: '#e7e7e7',
    borderBottomWidth: 5
  },
  username: {
    fontSize: 18,
    alignItems: 'center',
  },
  headertext: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10
  },
  status: {
    color: '#6F7579',
    fontSize: 16
  }
})