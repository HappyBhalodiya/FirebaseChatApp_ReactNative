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
let messageDateString;

function ChatScreen({ route, navigation }) {
  const [chatMessage, setChatMessage] = useState('')
  const [allChats, setallChats] = useState([])
  const [showButtons, setShowButtons] = useState(false)
  const [resultrecordedfile, setresultrecordedfile] = useState('');
  const [recordSecs, setrecordSecs] = useState('');
  const [showAlert, setshowAlert] = useState(false);
  const [visible, setVisible] = useState(false)
  const [selectImage, setSelectImage] = useState(undefined)
  const [loader, setLoader] = useState(false)
  const [progress, setProgress] = useState('')
  const scrollViewRef = useRef();
  const Blob = RNFetchBlob.polyfill.Blob;
  const fs = RNFetchBlob.fs;
  window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
  window.Blob = Blob;

  useEffect(() => {console.log(route.params.userclickid,route.params.userclickname)
    getAllMassages()
  }, [])


  /**
   * check Message created date
   * @param {Number} messageIndex
   */
  const isDifferentDay = (messageIndex) => {
    if (messageIndex === 0) return true;
    const d1 = new Date(allChats[messageIndex - 1].date);
    const d2 = new Date(allChats[messageIndex].date);

    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  }

  /**
   * Group Message by Created date
   * @param {Number} messageIndex
   */
  const getMessageDate = (messageIndex) => {
    let dateToday = new Date().toDateString();
    let longDateYesterday = new Date();
    longDateYesterday.setDate(new Date().getDate() - 1);
    let dateYesterday = longDateYesterday.toDateString();
    let today = dateToday.slice(0, dateToday.length - 5);

    let yesterday = dateYesterday.slice(0, dateToday.length - 5);
    const wholeDate = new Date(
      allChats[messageIndex].date.split(' ')[0]
    ).toDateString();
    messageDateString = wholeDate.slice(0, wholeDate.length - 5);
    console.log("===========", wholeDate, "========", messageDateString);

    if (
      new Date(allChats[messageIndex].date.split(' ')[0]).getFullYear() ===
      new Date().getFullYear()
    ) {
      if (messageDateString == today) {
        return "Today";
      } else if (messageDateString == yesterday) {
        return "Yesterday";
      } else {
        console.log("message string", messageDateString)
        return messageDateString;
      }
    } else {
      return wholeDate;
    }
  }
  /**
   * get All Massages from Firebase
   */
  const getAllMassages = async () => {
    userid = await AsyncStorage.getItem('userid');

    userid = await AsyncStorage.getItem('userid');
    var data = firebase.database().ref('/users/');
    data.child(userid).update({ 'isOnline': true })
    var presenceRef = firebase.database().ref("users/").child(userid);
    // Write a string when this client loses connection
    presenceRef.onDisconnect().update({ 'isOnline': false });

    firebase.database().ref('chat_data/').on('value', resp => {
      var massages = [];
      resp.forEach(child => {
        massages.push({
          massage: child.val().massage,
          receiverId: child.val().receiverId,
          senderId: child.val().senderId,
          date: child.val().date,
          massage_type: child.val().massage_type,
          fileName: child.val().fileName,
          isRead: child.val().isRead,
          key: child.key
        })
      })
      setallChats(massages)

    })

  }

  /**
   * 
   * @param {any} massages submit massage of File
   * @param {any} type type of File
   * @param {any} fileName name of File
   * Store all Massages or file in Firebase Database
   */
  const submitChatMessage = (massages, type, fileName) => {

    let date = new Date();
    let formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
    console.log("formattedDate", formattedDate)
    let joinData = firebase.database().ref('chat_data/').push();
    joinData.set({
      massage: massages,
      receiverId: route.params.userclickid,
      senderId: userid,
      date: formattedDate,
      massage_type: type,
      fileName: fileName,
      isRead: false

    });
    setChatMessage('')
    setLoader(false)
  }

  /**
   * Image Picker
   */
  const launchImageLibrary = () => {

    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, async (response) => {

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {

        uploadFileInFirebase(response.uri, response.fileName, response.type)

      }
    });
  }
  /**
   * File picker
   */
  const FilePicker = () => {

    FilePickerManager.showFilePicker(null, (response) => {
      if (response.didCancel) {
        console.log('User cancelled file picker');
      }
      else if (response.error) {
        console.log('FilePickerManager Error: ', response.error);
      }
      else {
        console.log("response===========", response)
        uploadFileInFirebase(response.uri, response.fileName, response.type)
      }
    });
  }
  /**
   * 
   * @param {any} fileUri uri of file
   * @param {any} name name of file
   * @param {any} mime type of file
   * Upload all file in firebase storage and download url 
   */
  const uploadFileInFirebase = async (fileUri, name, mime = type) => {
    setshowAlert(false)
    setLoader(true)
    console.log("================================================", fileUri, name, mime)
    return new Promise((resolve, reject) => {
      let imgUri = fileUri;
      let uploadBlob = null;
      const uploadUri = Platform.OS === 'ios' ? imgUri.replace('file://', '') : imgUri;
      const imageRef = firebase.storage().ref(`/${name}/`)

      fs.readFile(uploadUri, 'base64')
        .then(data => {
          return Blob.build(data, { type: `${mime};BASE64` });
        })
        .then(blob => {
          uploadBlob = blob;
          var uploadTask = imageRef.put(blob, { contentType: mime, name: name });;
          uploadTask.on('state_changed', function (snapshot) {
            var progressFile = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progressFile + '% done');
            setProgress(progressFile)
          })
          return imageRef.put(blob, { contentType: mime, name: name });
        })
        .then(() => {
          uploadBlob.close()
          return imageRef.getDownloadURL();
        })
        .then(url => {
          console.log("url===========================", url)
          submitChatMessage(url, mime.split('/')[0], name)
          resolve(url);

        })
        .catch(error => {
          reject(error)
        })
    })
  };
  /**
   * 
   * @param {any} filepath path of file
   * @param {*} filename name of file
   * open file in device
   */
  const openallFiles = (filepath, filename) => {
    console.log("callllllll")
    const url = filepath;
    const localFile = `${RNFS.DocumentDirectoryPath}/` + filename;
    console.log("localFile", localFile)

    const options = {
      fromUrl: url,
      toFile: localFile
    };
    RNFS.downloadFile(options).promise
      .then(() => FileViewer.open(localFile))
      .then(() => {
        console.log("open")
      })
      .catch(error => {
        console.log(error)
      });
  }

  /**
   * 
   * @param {any} filepath is path of Image
   * show image in model
   */
  const showImg = (filepath) => {
    setVisible(true)
    setSelectImage(filepath)
  }
  /**
   * Render All Massages from Firebase
   */
  const renderAllMassages = allChats.map((massage, index) => {

    let changeDateFormate = moment(massage.date).format('h:mm a')


    // if (isDifferentDay(index)) {
    //   console.log(getMessageDate(index))
    //   return (
    //     <View>
    //       <Text>{getMessageDate(index)}</Text>
    //     </View>
    //   )
    // }
    if (massage.receiverId == route.params.userclickid && massage.senderId == userid) {
      if (massage.massage_type == 'image') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>

            <View style={styles.sendfile} >
              <TouchableOpacity onPress={() => showImg(massage.massage)}>
                <Image source={{ uri: massage.massage }}
                  style={{ width: 250, height: 250 }} />
              </TouchableOpacity>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>


            </View>
            <Modal
              animationType="fade"
              transparent={false}
              visible={visible}
              onRequestClose={() => {
              }}>
              <View >
                <View >
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setVisible(false)} >
                      <Icon name="close" color="grey" size={30} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ elevation: 5, padding: 10 }}>
                    <Image source={{ uri: selectImage }} style={styles.selectImage} />
                  </View>
                </View>
              </View>
            </Modal>

          </View>
        )
      } else if (massage.massage_type == 'application') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
            <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
              <View style={{ backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>
                <Text key={chatMessage} style={styles.pdfText}>{massage.fileName}</Text>
              </View>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </TouchableOpacity>

          </View>
        )
      }
      else if (massage.massage_type == 'audio') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>

            <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
              <View style={{ backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>
                <Text key={chatMessage} style={styles.pdfText}>{massage.fileName}</Text>
              </View>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </TouchableOpacity>

          </View>
        )
      }
      else if (massage.massage_type == 'video') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>

            <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
              <View style={{ flexDirection: 'row', padding: 5, height: 250, width: 250 }}>
                <VideoPlayer
                  source={{ uri: massage.massage }}
                  disableFullscreen={true}
                  disableBack={true}
                  disableVolume={true}
                  paused={true}
                  disableSeekbar={false}
                />
              </View>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </TouchableOpacity>

          </View>
        )
      }
      else {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
            <View style={styles.sendermsg}>
              <Text style={{ marginRight: 50, fontSize: 16 }}>{massage.massage}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.sendertime}>{changeDateFormate}</Text>

              </View>


            </View>

          </View>
        )
      }
    }
    else if (route.params.userclickid == massage.senderId && (massage.senderId == userid || massage.receiverId == userid)) {
      if (massage.massage_type == 'image') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
            <View style={styles.sendfile} >
              <TouchableOpacity onPress={() => showImg(massage.massage)}>

                <Image source={{ uri: massage.massage }}
                  style={{ width: 250, height: 250 }} />
              </TouchableOpacity>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </View>
            <Modal
              animationType="fade"
              transparent={false}
              visible={visible}
              onRequestClose={() => {
              }}>
              <View >
                <View >
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setVisible(false)} >
                      <Icon name="close" color="grey" size={30} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ elevation: 5, padding: 10 }}>
                    <Image source={{ uri: selectImage }} style={styles.selectImage} />
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )
      }
      else if (massage.massage_type == 'application') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
            <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
              <View style={{ backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>
                <Text key={chatMessage} style={styles.pdfText}>{massage.fileName}</Text>
              </View>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </TouchableOpacity>
          </View>
        )
      }
      else if (massage.massage_type == 'audio') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>

            <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
              <View style={{ backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>

                <Text key={chatMessage} style={styles.pdfText}>{massage.fileName}</Text>
              </View>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </TouchableOpacity>

          </View>
        )
      }
      else if (massage.massage_type == 'video') {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
            <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
              <View style={{ flexDirection: 'row', padding: 5, height: 250, width: 250 }}>
                <VideoPlayer
                  source={{ uri: massage.massage }}
                  disableFullscreen={true}
                  disableBack={true}
                  disableVolume={true}
                  paused={true}
                  disableSeekbar={false}
                />

              </View>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </TouchableOpacity>
          </View>
        )
      }
      else {
        return (
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
            <View style={styles.receivermsg}>
              <Text style={{ marginRight: 50, fontSize: 16 }}>{massage.massage}</Text>
              <Text style={styles.sendertime}>{changeDateFormate}</Text>
            </View>
          </View>
        )
      }

    }
  })

  return (
    <View style={styles.container}>
      <Header style={{ backgroundColor: '#3E9487', height: 55, padding: 5 }}>
        <NavigationDrawerStructure navigationProps={navigation} />

        <View style={{ flexDirection: 'column', flex: 10 }}>
          <Text style={styles.headertext}>{route.params.userclickname}</Text>
        </View>

      </Header>
      <ImageBackground style={styles.imgBackground}
        resizeMode='cover'
        source={require('../assets/bg.jpg')}>
        {
          loader == true ?
            <ProgressBar progress={progress} style={{ height: 5 }} color="#C16AE3" />
            : null
        }
        <View style={{ flex: 6 }}>
          <ScrollView ref={scrollViewRef}
            onContentSizeChange={(contentWidth, contentHeight) => { scrollViewRef.current.scrollToEnd({ animated: true }) }}>
            <View>
              {renderAllMassages}
            </View>
          </ScrollView>
          <View style={styles.footer}>


            {
              showButtons == true ?
                <>
                  <TouchableOpacity

                    style={styles.bottomBtn}
                    onPress={() => launchImageLibrary()} >
                    <Icon
                      name="insert-photo"
                      size={25}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bottomBtn}
                    onPress={() => FilePicker()}>

                    <Icon
                      name="insert-drive-file"
                      size={25}
                      color="white"
                    />
                  </TouchableOpacity>
                </>
                : <TouchableOpacity style={styles.btnSend} onPress={() => setShowButtons(true)}>
                  <Icon
                    name="keyboard-arrow-right"
                    size={25}
                    color="white"
                  />
                </TouchableOpacity>

            }

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
                onFocus={() => setShowButtons(false)}
                onKeyPress={() => setShowButtons(false)}
              />

            </TouchableOpacity>
            {
              !showButtons ?

                <TouchableOpacity style={styles.btnSend} onPress={() => submitChatMessage(chatMessage, 'text', 'empty')}>

                  <Icon
                    name="send"
                    size={25}
                    color="white"
                  />
                </TouchableOpacity>


                : null
            }

          </View>
          <View>
          </View>


          <AwesomeAlert
            show={showAlert}
            showProgress={false}
            title="Send Audio Sms"
            message="I have a message for you!"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No, delete it "
            confirmText="Yes, send it"
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setshowAlert(false)
            }}
            onConfirmPressed={() => {
              uploadFileInFirebase(resultrecordedfile, resultrecordedfile.split('/')[4], 'audio')
            }}
          />
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
    marginTop: 10,
    marginLeft: 5
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
    backgroundColor: "#3E9487",
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
    backgroundColor: "#3E9487"
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
  videoContainer: {
    height: 250,
    width: 180,
  },
})
