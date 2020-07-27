import React, { useState, useEffect, useRef } from 'react'
import {
    View,
    Text,
    DeviceEventEmitter,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Image,
    TextInput
} from 'react-native'
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
import ParsedText from 'react-native-parsed-text';
import { EventRegister } from 'react-native-event-listeners'

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
let isMention;
let channelkey;
function Dashboard({ route, navigation }) {
    const [chatMessage, setChatMessage] = useState('')
    const [showButtons, setShowButtons] = useState(false)
    const [showAlert, setshowAlert] = useState(false);
    const [visible, setVisible] = useState(false)
    const [selectImage, setSelectImage] = useState(undefined)
    const [loader, setLoader] = useState(false)
    const [progress, setProgress] = useState('')
    const [currentUserProfile, setcurrentUserProfile] = useState('')
    const [currentUserName, setcurrentUserName] = useState('')
    const [channelMassages, setchannelMassages] = useState([])
    const scrollViewRef = useRef();
    const [allUSerName, setAllUSerName] = useState([])
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
        console.log("call massages")

        DeviceEventEmitter.addListener("ConnectionSuccessful", (data) => {
            console.log("Connection successful", data);
        });
        userid = await AsyncStorage.getItem('userid');
        firebase.database().ref('/channel_data/-MAp3hJF8j8jxLwPChfp/').on('value', resp => {
            var channel_massages = [];
            resp.forEach(child => {
                channel_massages.push({
                    massage: child.val().massage,
                    receiverId: child.val().receiverId,
                    senderId: child.val().senderId,
                    date: child.val().date,
                    massage_type: child.val().massage_type,
                    fileName: child.val().fileName,
                    senderProfile: child.val().senderProfile,
                    senderName: child.val().senderName
                })
            })
            setchannelMassages(channel_massages);
        })

        var currentUserData = firebase.database().ref('/users/' + userid);
        currentUserData.once('value').then(snapshot => {
            setcurrentUserProfile(snapshot.val().profilePic)
            setcurrentUserName(snapshot.val().username);
        })
        var allUser = firebase.database().ref('/users/');
        allUser.once('value').then(snapshot => {
            var item = [];
            snapshot.forEach(child => {
                item.push({
                    username: child.val().username.replace(/\s/g, ''),
                    userProfilepic: child.val().profilePic
                })
            })
            setAllUSerName(item)
        })

    }

    /**
     * 
     * @param {any} massages submit massage of File
     * @param {any} type type of File
     * @param {any} fileName name of File
     * Store all Massages or file in Firebase Database
     */
    const submitChatMessage = async (massages, type, fileName) => {
        userid = await AsyncStorage.getItem('userid');
        let date = new Date();
        let formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
        console.log("formattedDate", formattedDate)
        let joinData = firebase.database().ref('channel_data/-MAp3hJF8j8jxLwPChfp').push();
        joinData.set({
            massage: massages,
            receiverId: '-MAp3hJF8j8jxLwPChfp',
            senderId: userid,
            date: formattedDate,
            massage_type: type,
            fileName: fileName,
            senderProfile: currentUserProfile,
            senderName: currentUserName
        });
        getAllMassages()
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
    const renderAllMassages = channelMassages.map((massage, index) => {

        let changeDateFormate = moment(massage.date).format('h:mm a')

        if (massage.massage_type == 'image') {
            return (
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Image style={styles.img} source={massage.senderProfile ? { uri: massage.senderProfile } : require('../assets/userpic.png')} />
                    </View>
                    <View style={{ flexDirection: 'column', flex: 7 }}>
                        <Text style={styles.sendername}>{massage.senderName}</Text>
                        <View style={styles.sendfile} >
                            <TouchableOpacity onPress={() => showImg(massage.massage)}>
                                <Image source={{ uri: massage.massage }}
                                    style={{ width: 250, height: 250 }} />
                            </TouchableOpacity>
                            <Text style={styles.sendertime}>{changeDateFormate}</Text>


                        </View>
                    </View>
                    <Modal
                        animationType="fade"
                        transparent={false}
                        visible={visible}
                        onRequestClose={() => {
                        }}>
                        <View >
                            <View >
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
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
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Image style={styles.img} source={massage.senderProfile ? { uri: massage.senderProfile } : require('../assets/userpic.png')} />
                    </View>
                    <View style={{ flexDirection: 'column', flex: 7 }}>
                        <Text style={styles.sendername}>{massage.senderName}</Text>
                        <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
                            <View style={{ backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>
                                <Text key={chatMessage} style={styles.pdfText}>{massage.fileName}</Text>
                            </View>
                            <Text style={styles.sendertime}>{changeDateFormate}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        else if (massage.massage_type == 'audio') {
            return (
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Image style={styles.img} source={massage.senderProfile ? { uri: massage.senderProfile } : require('../assets/userpic.png')} />
                    </View>
                    <View style={{ flexDirection: 'column', flex: 7 }}>
                        <Text style={styles.sendername}>{massage.senderName}</Text>
                        <TouchableOpacity style={styles.sendfile} onLongPress={() => openallFiles(massage.massage, massage.fileName)}>
                            <View style={{ backgroundColor: 'white', flexDirection: 'row', padding: 5 }}>
                                <Text key={chatMessage} style={styles.pdfText}>{massage.fileName}</Text>
                            </View>
                            <Text style={styles.sendertime}>{changeDateFormate}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        else if (massage.massage_type == 'video') {
            return (
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Image style={styles.img} source={massage.senderProfile ? { uri: massage.senderProfile } : require('../assets/userpic.png')} />
                    </View>
                    <View style={{ flexDirection: 'column', flex: 7 }}>
                        <Text style={styles.sendername}>{massage.senderName}</Text>
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
                </View>
            )
        }
        else {
            return (
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Image style={styles.img} source={massage.senderProfile ? { uri: massage.senderProfile } : require('../assets/userpic.png')} />
                    </View>
                    <View style={{ flexDirection: 'column', flex: 7 }}>
                        <Text style={styles.sendername}>{massage.senderName}</Text>
                        <View style={styles.sendermsg}>
                            <ParsedText
                                style={{ marginRight: 50, fontSize: 16 }}
                                parse={
                                    [
                                        { pattern: /@(\w+)/, style: { color: 'blue', marginRight: 50, fontSize: 16 } },
                                    ]
                                }
                                childrenProps={{ allowFontScaling: false }}
                            >
                                {massage.massage}
                            </ParsedText>
                            {/* <Text style={ { color: 'blue', marginRight: 50, fontSize: 16 } : { marginRight: 50, fontSize: 16 }}>{massage.massage}</Text> */}
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.sendertime}>{changeDateFormate}</Text>
                            </View>
                        </View>
                    </View>
                </View>

            )
        }
    })
    const allusersrender = allUSerName.map(data => {

        return (
            <TouchableOpacity style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e7e7e7' }} onPress={() => [chatMessage.length ? setChatMessage(chatMessage + data.username) : setChatMessage(data.username), isMention = false]}>
                <Image style={{ width: 35, height: 35, margin: 10, borderRadius: 360 }} source={data.userProfilepic ? { uri: data.userProfilepic } : require('../assets/userpic.png')}></Image>
                <Text style={{ fontSize: 20, margin: 10 }}>{data.username}</Text>
            </TouchableOpacity>
        )
    })
    const checkMention = (chatMessage) => {

        let char = chatMessage.charAt(chatMessage.length - 1);
        if (char == '@') {
            isMention = true;
        } else {
            isMention = false;
        }
    }
    return (
        <View style={styles.container}>
            <Header style={{ backgroundColor: '#3E9487', height: 55, padding: 5 }}>
                <NavigationDrawerStructure navigationProps={navigation} />

                <View style={{ flexDirection: 'column', flex: 10 }}>
                    <Text style={styles.headertext}># general</Text>
                </View>

            </Header>
            {
                loader == true ?
                    <ProgressBar progress={progress} style={{ height: 5 }} color="#C16AE3" />
                    : null
            }
            <View style={{ flex: 8 }}>
                <ScrollView ref={scrollViewRef}
                    onContentSizeChange={(contentWidth, contentHeight) => { scrollViewRef.current.scrollToEnd({ animated: true }) }}>
                    <View>
                        {renderAllMassages}
                    </View>
                </ScrollView>
                {
                    isMention ?
                        <View style={{ flexDirection: 'row', height: 200, backgroundColor: '#c9e8e4', margin: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <ScrollView>
                                {allusersrender}
                            </ScrollView>
                        </View>
                        : null
                }
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
                                setChatMessage(chatMessage)
                                checkMention(chatMessage)

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


        </View>
    )
}

export default Dashboard;
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        backgroundColor: '#edf7f6',
        borderRadius: 5,
        flexDirection: 'column',
        alignSelf: 'flex-start',
        maxWidth: '75%',
        position: 'relative'
    },

    sendermsg: {
        margin: 5,
        elevation: 5,
        padding: 10,
        backgroundColor: '#edf7f6',
        borderRadius: 5,
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
    sendertime: {
        fontSize: 12,
        color: '#859B74',
        alignItems: 'center',
        justifyContent: 'center',
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
    sendername: {
        marginLeft: 5,
        fontSize: 18,
        color: '#000'
    }
})
