import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, PermissionsAndroid, ImageBackground, ScrollView, Image, TextInput } from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-simple-toast";
import firebase from '../database/firebaseDb';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { Header } from 'native-base';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob'
import FilePickerManager from 'react-native-file-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import VideoPlayer from 'react-native-video-controls';
import AwesomeAlert from 'react-native-awesome-alerts';
import { ProgressBar, Colors } from 'react-native-paper';
import { cos } from 'react-native-reanimated';
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
let userid;
function Dashboard({ route, navigation }) {
  const [allUser, setAllUser] = useState([])
  const [oldUsers, setoldUsers] = useState([]);
  const [filterList, setfilterList] = useState([]);
  const Blob = RNFetchBlob.polyfill.Blob;
  const fs = RNFetchBlob.fs;
  window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
  window.Blob = Blob;

  useEffect(() => {

    getAllMassages()

  }, [])
  /**
   * get All Massages from Firebase
   */
  const getAllMassages = async () => {
    console.log("calll>>>>>>>>>>>>>>>>>>>>>>>>>")

    userid = await AsyncStorage.getItem('userid');
    var data = firebase.database().ref('/users/');
    data.child(userid).update({ 'isOnline': true })
    data.once('value').then(snapshot => {

      var items = [];
      snapshot.forEach(child => {
        items.push({
          user: child.val().username,
          id: child.val().id,
          isOnline: child.val().isOnline,
          profilepic: child.val().profilePic
        })
      })
      setAllUser(items)
      setoldUsers(items)

    })
    var presenceRef = firebase.database().ref("users/").child(userid);
    // Write a string when this client loses connection
    presenceRef.onDisconnect().update({ 'isOnline': false });
  }


  const handleSearch = (text) => {
    if (!text) {
      setfilterList([])
    } else {
      console.log("call")
      const filterList = allUser.filter((item) => {
        const itemData = item.user.toUpperCase()
        const textData = text.toUpperCase()
        console.log(itemData.indexOf(textData) > -1)
        return itemData.indexOf(textData) > -1
      })
      console.log(filterList)
      setfilterList(filterList)
      
    }
  }
  const serchUsers = filterList.map(res => {
    
    console.log("filterList",res)
    
      return (
        <TouchableOpacity style={styles.cardView} onPress={() => navigation.navigate('ChatScreen', { userclickid: res.id, userclickname: res.user })}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', flex: 11 }}>
            <Text style={styles.username}>{res.user}</Text>
          </View>
        </TouchableOpacity>
      )
    
  })

  /**
   * Render All Massages from Firebase
   */

  return (
    <View style={{ flex: 1 }}>
      <Header style={{ backgroundColor: '#3E9487', height: 50, padding: 5 }}>
        <NavigationDrawerStructure navigationProps={navigation} />
        <View style={{ flexDirection: 'column', flex: 10 }}>
          <Text style={styles.headertext}>Dashboard</Text>
        </View>
      </Header>
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
      {serchUsers}
    </View>
  )
}

export default Dashboard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  headertext: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10
  },
  cardView: {
    padding: 10,
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
    marginLeft: 10,
    textAlign: 'center',
    marginTop: 5,
    color: '#8E9196'
  },
})
