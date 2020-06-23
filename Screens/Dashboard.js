import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet,ActivityIndicator, ScrollView, Image, TextInput } from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-simple-toast";
import firebase from '../database/firebaseDb';
import AsyncStorage from '@react-native-community/async-storage';

function Dashboard({ navigation }) {
  const [allUser, setAllUser] = useState([])
  const [oldUsers, setoldUsers] = useState([]);
  const [loader , setLoader] = useState(true)
  useEffect(() => {
    getUsers()
  }, [])
  /**
   * get all user form Firebase Database
   */
  const getUsers = async () => {
    userid = await AsyncStorage.getItem('userid');
    var data = firebase.database().ref('/users/');
    data.child(userid).update({ 'isOnline': true })
    data.once('value').then(snapshot => {
      var items = [];
      snapshot.forEach(child => {
        items.push({
          user: child.val().username,
          id: child.val().id,
          isOnline: child.val().isOnline
        })
      })
      setAllUser(items)
      setoldUsers(items)
      setLoader(false)

    })
    var presenceRef = firebase.database().ref("users/").child(userid);
    // Write a string when this client loses connection
    presenceRef.onDisconnect().update({ 'isOnline': false });

  }

  const handleSearch = (text) => {
    if (!text) {
      setAllUser(oldUsers)
    } else {
      const filterList = allUser.filter((item) => {
        const itemData = item.user.toUpperCase()
        const textData = text.toUpperCase()
        console.log(itemData.indexOf(textData) > -1)
        return itemData.indexOf(textData) > -1
      })
      setAllUser(filterList)
    }
  }

  /**
   * render all users
   */
  const allusers = allUser.map((res, index) => {
   
    if (res.id != userid) {
      return (
        <TouchableOpacity style={styles.cardView} onPress={() => navigation.navigate('ChatScreen', { userclickid: res.id, userclickname: res.user })}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', flex: 11 }}>
            <Text style={styles.username}>{res.user}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end', flex: 1 }}>
            <Icon
              name={"lens"}
              size={20}
              color={res.isOnline == true ? "#000" : "#e7e7e7"}
              style={{ marginLeft: 8, marginTop: 10 }}
            />
          </View>
        </TouchableOpacity>
      )
    }
  
  })

  return (
    <View style={styles.container}>
      {
        loader == true ? 
        <View style={{ justifyContent:'center' , alignItems:'center',flex:1 }}>
        <ActivityIndicator animating={loader} size="large" color="#00ff00" />
        </View>
        :
        <> 
      <View style={styles.chatListHeader}>

        <View style={styles.searchView}>
          <TextInput
            placeholder='Search...'
            onChangeText={(text) => handleSearch(text)}
            style={{ flex: 1 }}
          />
          <Icon name='search' size={20} color='#7F7F7F' style={{ paddingTop: 10, paddingRight: 5 }} />
        </View>
        
      </View>
      {allusers}
      </>
      }
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
  },
  searchView: {
    flex: 2,
    borderRadius: 25,
    borderColor: '#ced4da',
    borderWidth: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 2,
    marginLeft: 10,
    backgroundColor: 'white',
    paddingLeft: 5
  },
  chatListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    display: 'flex',
    height: 70,
    borderBottomWidth: 1,
    backgroundColor: '#F1F2F4',
    borderColor: '#DFDFDF',
    borderTopWidth: 1,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
})

