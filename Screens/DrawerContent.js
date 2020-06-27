import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import Icon from "react-native-vector-icons/MaterialIcons";
import firebase from '../database/firebaseDb';
import AsyncStorage from '@react-native-community/async-storage';
import { EventRegister } from 'react-native-event-listeners'


const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

export function DrawerContent(props) {
  const [allUser, setAllUser] = useState([])
  const [oldUsers, setoldUsers] = useState([]);
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    getUsers()

  }, [])
  /**
   * get all user form Firebase Database
   */
  const getUsers = async () => {
    userid = await AsyncStorage.getItem('userid');
    var data = firebase.database().ref('/users/');
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
      setLoader(false)
    })

    EventRegister.addEventListener('updatedData', (data) => {
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
          <TouchableOpacity style={styles.cardView} onPress={() => props.navigation.navigate('ChatScreen', { userclickid: res.id, userclickname: res.user })}>
            <View style={{ flexDirection: 'row', alignSelf: 'flex-start', flex: 11 }}>
              <View style={styles.userprofile}>
                <Image style={{ width: 40, height: 40, borderRadius: 50 }} source={res.profilepic ? { uri: res.profilepic } : require('../assets/userpic.png')} />
                <Icon
                  name="lens"
                  size={12}
                  color={res.isOnline == true ? "#5AC383" : "#808080"}
                  style={[res.isOnline == true ? styles.onlineUser : styles.oflineUser]}
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
            <View style={{ flexDirection: 'row', alignSelf: 'flex-start'}}>
             <View style={{flexDirection:'row',flex:5}}>
              <View style={styles.userprofile}>
                <Image style={{ width: 35, height: 35, borderRadius: 50 }} source={res.profilepic ? { uri: res.profilepic } : require('../assets/userpic.png')} />
                <Icon
                  name="lens"
                  size={12}
                  color={res.isOnline == true ? "#5AC383" : "#808080"}
                  style={[res.isOnline == true ? styles.onlineUser : styles.oflineUser]}
                />
              </View>
              <Text style={styles.username}>{res.user}</Text>
              </View>
              <TouchableOpacity
                onPress={() => props.navigation.navigate('Profile')}
                style={{ flexDirection: 'column', flex: 1, right: 0, alignSelf:'flex-end'}}>
                <Icon name={"settings"} size={20} color="#000" style={{ margin: 10 }} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )
      }
    })

    return (
      <View style={{ flex: 1 }}>

        <View style={styles.drawerContent}>
          <View style={{ flexDirection: 'column', flex: 3, backgroundColor: '#3E9487' }}>
            <DrawerItem
              icon={() => (
                <Icon
                  name="chat-bubble"
                  color={'#fff'}
                  size={30}
                />
              )}
              label="Home"
              onPress={() => { props.navigation.navigate('Dashboard') }}
            />
            <DrawerItem
              style={styles.sideButtons}
              label="personal"
              onPress={() => { props.navigation.navigate('Dashboard') }}
            />
          </View>
          <View style={{ flexDirection: 'column', flex: 9, backgroundColor: '#fff' }}>
            <View style={styles.serchviewHeader}>

              <View style={styles.searchView}>
                <TextInput
                  placeholder='Search...'
                  placeholderTextColor="#3E9487"
                  onChangeText={(text) => handleSearch(text)}
                  style={{ flex: 1, color: '#fff' }}
                />
                <Icon name='search' size={20} color='#7F7F7F' style={{ paddingTop: 10, paddingRight: 5 }} />
              </View>

            </View>
            <Text style={{ color: '#3E9487' }}>
              Direct Massage
                    </Text>
            {allusersrender}
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
      width: 40,
      height: 40,
      borderRadius: 360,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 3
    },
    cardView: {
      padding: 10,
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
      bottom: -2,
      borderColor: '#000',
      borderWidth: 2,
      overflow: 'hidden'
    },
    onlineUser: {
      justifyContent: 'center',
      borderRadius: 360,
      height: 12,
      width: 12,
      position: 'absolute',
      right: -2,
      bottom: -3
    },
    bottomDrawerSection: {
      position: 'absolute',
      top: HEIGHT - 80,
      borderTopColor: '#000',
      borderTopWidth: 1,
      width: '100%',
      height: HEIGHT,
      backgroundColor: "#fff",
      flexDirection: 'row'
    },

  });



//   <View style={styles.drawerContent}>
//   <View style={styles.userInfoSection}>
//       <View style={{flexDirection:'row',marginTop: 15}}>
//           <Avatar.Image 
//               source={{
//                   uri: 'https://api.adorable.io/avatars/50/abott@adorable.png'
//               }}
//               size={50}
//           />
//           <View style={{marginLeft:15, flexDirection:'column'}}>
//               <Title style={styles.title}>John Doe</Title>
//               <Caption style={styles.caption}>@j_doe</Caption>
//           </View>
//       </View>

//       <View style={styles.row}>
//           <View style={styles.section}>
//               <Paragraph style={[styles.paragraph, styles.caption]}>80</Paragraph>
//               <Caption style={styles.caption}>Following</Caption>
//           </View>
//           <View style={styles.section}>
//               <Paragraph style={[styles.paragraph, styles.caption]}>100</Paragraph>
//               <Caption style={styles.caption}>Followers</Caption>
//           </View>
//       </View>
//   </View>

//   <Drawer.Section style={styles.drawerSection}>
    //   <DrawerItem 
    //       icon={({color, size}) => (
    //           <Icon 
    //           name="home-outline" 
    //           color={color}
    //           size={size}
    //           />
    //       )}
    //       label="Home"
    //       onPress={() => {props.navigation.navigate('Home')}}
    //   />
//       <DrawerItem 
//           icon={({color, size}) => (
//               <Icon 
//               name="account-outline" 
//               color={color}
//               size={size}
//               />
//           )}
//           label="Profile"
//           onPress={() => {props.navigation.navigate('Profile')}}
//       />
//       <DrawerItem 
//           icon={({color, size}) => (
//               <Icon 
//               name="bookmark-outline" 
//               color={color}
//               size={size}
//               />
//           )}
//           label="Bookmarks"
//           onPress={() => {props.navigation.navigate('BookmarkScreen')}}
//       />
//       <DrawerItem 
//           icon={({color, size}) => (
//               <Icon 
//               name="settings-outline" 
//               color={color}
//               size={size}
//               />
//           )}
//           label="Settings"
//           onPress={() => {props.navigation.navigate('SettingScreen')}}
//       />
//       <DrawerItem 
//           icon={({color, size}) => (
//               <Icon 
//               name="account-check-outline" 
//               color={color}
//               size={size}
//               />
//           )}
//           label="Support"
//           onPress={() => {props.navigation.navigate('SupportScreen')}}
//       />
//   </Drawer.Section>

// </View>