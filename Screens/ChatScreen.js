import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image, TextInput } from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-simple-toast";
import firebase from '../database/firebaseDb';
import AsyncStorage from '@react-native-community/async-storage';


let userid;
function ChatScreen({ route, navigation }) {
  const [chatMessage, setChatMessage] = useState('')
  const [allChats, setallChats] = useState([])
  const scrollViewRef = useRef();


  useEffect(() => {
    getAllMassages()
  }, [])

  const getAllMassages = async() => {
    userid = await AsyncStorage.getItem('userid');
    firebase.database().ref('chat_data/').on('value', resp => {
      console.log(resp)
      var massages = [];
      resp.forEach(child => {
        massages.push({
          massage: child.val().massage,
          receiverId: child.val().receiverId,
          senderId: child.val().senderId
        })
      })
      setallChats(massages)

    })
  }

  const submitChatMessage =  () => {
    console.log("chat masaage ===========", chatMessage, route.params.userclickid)
    let joinData = firebase.database().ref('chat_data/').push();
    joinData.set({
      massage: chatMessage,
      receiverId: route.params.userclickid,
      senderId: userid
    });
    setChatMessage('')
  }
  const renderAllMassages = allChats.map((massage) => {
    if (massage.receiverId == route.params.userclickid && massage.senderId == userid) {

      return(
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>

        <View style={styles.sendermsg}>
          <Text key={chatMessage} style={{ marginRight: 50, fontSize: 16 }}>{massage.massage}</Text>
      
        </View>
        
      </View>
      )
    }else if  (route.params.userclickid == massage.senderId && (massage.senderId == userid || massage.receiverId == userid)){
      return(
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
        
        <View style={styles.receivermsg}>
          <Text key={chatMessage} style={{ marginRight: 50, fontSize: 16 }}>{massage.massage}</Text>
          
        </View>
      </View>
      )

    }
  })

  return (
    <View style={styles.container}>

      <ImageBackground style={styles.imgBackground}
        resizeMode='cover'
        source={require('../assets/bg.jpg')}>

        <View style={{ flex: 6 }}>
          <ScrollView ref={scrollViewRef}
            onContentSizeChange={(contentWidth, contentHeight) => { scrollViewRef.current.scrollToEnd({ animated: true }) }}>
            <View>
                 {renderAllMassages}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.inputContainer}>
              <TextInput
                style={styles.inputs}
                autoCorrect={false}
                value={chatMessage}
                placeholder="Type a message"
                multiline={true}
                onChangeText={chatMessage => {
                  setChatMessage(chatMessage);
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSend} onPress={() => submitChatMessage()}>
              <Icon
                name="send"
                size={25}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View>
          </View>
        </View>
      </ImageBackground>

    </View>
  )
}

export default ChatScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardView: {
    elevation: 3,
    padding: 10,
    margin: 5,
    backgroundColor: "#fff"
  },
  headertext: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10
  },
  footer: {
    flexDirection: 'row',
    height: 'auto',
    paddingHorizontal: 10,
    padding: 5,
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    height: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  inputs: {
    height: 'auto',
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  btnSend: {
    backgroundColor: "#306E5E",
    width: 40,
    height: 40,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3
  },
  sendfile: {
    margin: 5,
    elevation: 5,
    padding: 5,
    backgroundColor: '#E0F6C7',
    borderRadius: 5,
    flexDirection: 'column',
    alignSelf: 'flex-end',
    maxWidth: '75%',
    position: 'relative'
  },
  receivefile: {
    margin: 5,
    elevation: 5,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#eeeeee',
    flexDirection: 'column',
    alignSelf: 'flex-start',
    maxWidth: '75%',
    position: 'relative'
  },
  sendermsg: {
    margin: 5,
    elevation: 5,
    padding: 10,
    backgroundColor: '#E0F6C7',
    borderRadius: 5,
    flexDirection: 'column',
    alignSelf: 'flex-end',
    maxWidth: '75%',
    position: 'relative'
  },
  receivermsg: {
    margin: 5,
    elevation: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#eeeeee',
    flexDirection: 'column',
    alignSelf: 'flex-start',
    maxWidth: '75%',
    position: 'relative'
  },
  img: {
    height: 35,
    width: 35,
    borderRadius: 50,
    alignItems: 'center',
    borderColor: '#e7e7e7',
    margin: 5
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  receivertime: {
    color: '#999999',
    fontSize: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendertime: {
    fontSize: 12,
    color: '#859B74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 5
  },

  bottomBtn: {
    flexDirection: 'column',
    width: 40,
    height: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    backgroundColor: "#306E5E"
  },
  pdfText: {
    marginRight: 50,
    fontSize: 16,
    alignItems: 'center',
    marginLeft: 10,
    fontSize: 15,
    textAlign: 'center'
  },
  selectImage: {
    height: 500,
    width: "100%"
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  selected: {
    backgroundColor: '#ADD2DB',
    marginLeft: 0,
    paddingLeft: 18,
  },
  normal: {
    flex: 1
  },


})
