import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import Icon from "react-native-vector-icons/MaterialIcons";
import firebase from '../database/firebaseDb';
import AsyncStorage from '@react-native-community/async-storage';
import { EventRegister } from 'react-native-event-listeners'
import Dialog from "react-native-dialog";

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
let listener;
let name = "Rao Information Technology"
export function DrawerContent(props) {
  const [allUser, setAllUser] = useState([])
  const [oldUsers, setoldUsers] = useState([]);
  const [allchannels, setallchannels] = useState([]);
  const [dialogVisible, setdialogVisible] = useState(false)
  const [channelName, setChannelName] = useState('');
  const [visibleDirectMassages, setvisibleDirectMassages] = useState(true)
  const [isAdmin, setIsAdmin] = useState('')
  useEffect(() => {
    getUsers()
    getChannels()
    return () => {
      EventRegister.removeEventListener(listener)
    }
  }, [])
  /**
   * get all user form Firebase Database
   */
  const getUsers = async () => {
    userid = await AsyncStorage.getItem('userid');
    var adminuser = firebase.database().ref('/users/' + userid)
    adminuser.once('value').then(snapshot => {
      if (snapshot.val().role == "admin") {
        setIsAdmin(snapshot.val().role)
      }
    })
    var data = firebase.database().ref('/users/');
    data.once('value').then(snapshot => {
      var items = [];
      snapshot.forEach(child => {
        items.push({
          user: child.val().username,
          id: child.val().id,
          isOnline: child.val().isOnline,
          profilepic: child.val().profilePic,
        })
      })
      setAllUser(items)
      setoldUsers(items)
    })

    listene = EventRegister.addEventListener('updatedData', (data) => {
      var newData = [];
      data.forEach(child => {
        newData.push({
          user: child.val().username,
          id: child.val().id,
          isOnline: child.val().isOnline,
          profilepic: child.val().profilePic
        })
      })
      setAllUser(newData)
    })
  }

  const getChannels = () => {
    var data = firebase.database().ref('/channel/');
    data.once('value').then(res_channel => {
      var channels = [];
      res_channel.forEach(child => {
        channels.push({
          channelname: child.val().channelName,
          channelKey: child.key
        })
      })
      setallchannels(channels)
    })

  }
  const creteChannelfun = () => {
    if (channelName.length) {

      let addChannel = firebase.database().ref('channel/').push();
      console.log("channelName===================", channelName)
      addChannel.set({
        channelName: channelName
      });
      setdialogVisible(false)
      getChannels()
    }
    else {
      Alert.alert('Wrong Input!', 'Channel Name cannot be empty.', [
        { text: 'Okay' }
      ]);
    }
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


  const allusersrender = allUser.map((res, index) => {
    if (res.id != userid) {
      return (
        <TouchableOpacity style={[styles.cardView, { borderBottomColor: '#e7e7e7', borderBottomWidth: 1 }]} onPress={() => props.navigation.navigate('ChatScreen', { userclickid: res.id, userclickname: res.user, userClickImage: res.profilepic })}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', flex: 11 }}>
            <View style={styles.userprofile}>
              <Image style={{ width: 35, height: 35, borderRadius: 50 }} source={res.profilepic ? { uri: res.profilepic } : require('../assets/userpic.png')} />
              <Icon
                name="lens"
                size={12}
                color={res.isOnline == true ? "#5AC383" : "#808080"}
                style={styles.oflineUser}
              />
            </View>
            <Text style={styles.username}>{res.user}</Text>
          </View>
        </TouchableOpacity>
      )
    }
  })
  const getCurrentUser = allUser.map((res, index) => {
    if (res.id == userid) {
      return (
        <TouchableOpacity style={styles.cardView}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
            <View style={{ flexDirection: 'row', flex: 5 }}>
              <View style={styles.userprofile}>
                <Image style={{ width: 35, height: 35, borderRadius: 50 }} source={res.profilepic ? { uri: res.profilepic } : require('../assets/userpic.png')} />
                <Icon
                  name="lens"
                  size={12}
                  color={res.isOnline == true ? "#5AC383" : "#808080"}
                  style={styles.oflineUser}
                />
              </View>
              <Text style={styles.username}>{res.user}</Text>
            </View>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('Profile')}
              style={{ flexDirection: 'column', flex: 1, right: 0, alignSelf: 'flex-end' }}>
              <Icon name={"settings"} size={20} color="#000" style={{ margin: 10 }} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )
    }
  })

  const renderAllChannels = allchannels.map(res => {
    return (
      <TouchableOpacity style={[styles.cardView, { borderBottomColor: '#e7e7e7', borderBottomWidth: 1 }]}
        onPress={() => props.navigation.navigate('ChannelChatScreen', { userclickid: res.channelKey, userclickname: '# ' + res.channelname })}>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', flex: 11 }}>
          <Text style={styles.username}># {res.channelname}</Text>
        </View>
      </TouchableOpacity>
    )
  })


  return (
    <View style={{ flex: 1 }}>

      <View style={styles.drawerContent}>
        <View style={{ flexDirection: 'column', flex: 3, backgroundColor: '#3E9487', alignItems: 'center' }}>
          <TouchableOpacity style={visibleDirectMassages == true ? styles.onClickedSidebuttons : styles.sideButtons} onPress={() => setvisibleDirectMassages(true)}>
            {
              visibleDirectMassages ?
                <Icon
                  name="chat-bubble"
                  color={'#fff'}
                  size={23}
                /> :
                <Icon
                  name="chat-bubble"
                  color={'#5a5a5a'}
                  size={23}
                />
            }
          </TouchableOpacity>

          <TouchableOpacity style={visibleDirectMassages == false ? styles.onClickedSidebuttons : styles.sideButtons} onPress={() => setvisibleDirectMassages(false)}>
            {
              visibleDirectMassages ?
                <Text>Rao</Text>
                :
                <Text style={{ color: '#fff' }}>Rao</Text>
            }
          </TouchableOpacity>
          {
            isAdmin == 'admin' ?

              <TouchableOpacity style={styles.creteChannel} onPress={() => setdialogVisible(true)}>
                <Icon
                  name="add"
                  color={'#000'}
                  size={28}
                />
              </TouchableOpacity>
              : null
          }

          <Dialog.Container
            visible={dialogVisible}>
            <Dialog.Title>Create Channel</Dialog.Title>
            <Dialog.Input style={{ borderColor: '#000000', borderWidth: 2 }} onChangeText={(text) => setChannelName(text)} autoFocus={true} />
            <Dialog.Button label="Add" onPress={() => creteChannelfun()} />
            <Dialog.Button label="Cancel" onPress={() => setdialogVisible(false)} />
          </Dialog.Container>

        </View>
        <View style={{ flexDirection: 'column', flex: 9, backgroundColor: '#fff',margin:10 }}>
          {
            visibleDirectMassages ?
              <>
                <View style={styles.serchviewHeader}>

                  <View style={styles.searchView}>
                    <TextInput
                      placeholder='Search...'
                      placeholderTextColor="#3E9487"
                      onChangeText={(text) => handleSearch(text)}
                      style={{ flex: 1, color: '#000' }}
                    />
                    <Icon name='search' size={20} color='#7F7F7F' style={{ paddingTop: 10, paddingRight: 5 }} />
                  </View>

                </View>
                <Text style={{ color: '#6A7380' ,fontSize:18}}>
                  Direct Massage
               </Text>
               <ScrollView>

                {allusersrender}
               </ScrollView>
              </>
              : <>
                <View >
                  <Text style={{ fontSize: 20 }}>{name.substring(0, 19)}...</Text>
                </View>
                <ScrollView>
                {renderAllChannels}
                </ScrollView>
              </>
          }
        </View>
      </View>
      <View style={styles.bottomDrawerSection}>
        {getCurrentUser}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    flexDirection: 'row'
  },
  sideButtons: {
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  onClickedSidebuttons: {
    backgroundColor: "#2F4F4F",
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  creteChannel: {
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  cardView: {
    padding: 5,
    flexDirection: 'row',
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
    color: '#000'
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
    flex: 1,
    borderColor: '#ced4da',
    borderWidth: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 5
  },
  serchviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    display: 'flex',
    height: 60,
    borderColor: '#DFDFDF',
    marginTop: 10,
    marginBottom: 5
  },
  userprofile: {
    backgroundColor: "#E7E7E7",
    width: 35,
    height: 35,
    borderRadius: 360,
    margin: 3
  },
  oflineUser: {
    justifyContent: 'center',
    borderRadius: 360,
    height: 12,
    width: 12,
    position: 'absolute',
    right: -2,
    bottom: -2
   
  },
  bottomDrawerSection: {
    position: 'absolute',
    top: HEIGHT - 75,
    borderTopColor: '#000',
    borderTopWidth: 1,
    width: '100%',
    height: HEIGHT,
    backgroundColor: "#fff",
    flexDirection: 'row',
    padding:3
  },

});


