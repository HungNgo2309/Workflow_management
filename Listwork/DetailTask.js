import React, { useContext, useEffect, useState } from "react";
import { Alert, Text, View,Linking, TouchableOpacity, FlatList,useWindowDimensions, Image} from "react-native";
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import { Button, Dialog, Portal, Provider, TextInput, ProgressBar, MD3Colors, Avatar, Icon} from "react-native-paper";
import { AuthenticatedUserContext } from "../providers";
import firestore from '@react-native-firebase/firestore';
import ICon from 'react-native-vector-icons/FontAwesome6';


const DetailTask=({route,navigation})=>{
    const {item}=route.params;
    const layout = useWindowDimensions();
    const { user } = useContext(AuthenticatedUserContext);
    const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const [report,setReport]=useState([]);
    const [visible, setVisible] = useState(false);
    const [proces,setProces]=useState(0);
    const [Description,setDescription]=useState("");
    const [dataevalue,setDataevalue]=useState([]);
    const uploadFileToFirebase = async (fileURI, fileName) => {
        try {
          const reference = storage().ref().child('files/'+fileName+user.uid);
          const task = await reference.putFile(fileURI);
            // Chờ cho đến khi quá trình upload hoàn thành
           await task;
        // Lấy đường dẫn download của tệp
          const downloadURL = await reference.getDownloadURL();
          await firestore().collection('Reports').add({
            Member_upload:user.uid,
            Status:false,
            Task_ID:item.id,
            res:downloadURL,
            name:fileName
          });
          Alert.alert('Success', 'File has been uploaded to Firebase Storage.');
        } catch (error) {
          Alert.alert('Error', 'Failed to upload the file to Firebase Storage.');
          console.error('Error uploading file:', error);
        }
      };
      useEffect(() => {
        const fetchData = async () => {
            try {
                const Member_PJ = firestore().collection('Reports').where("Task_ID", '==', item.id);
                const list = [];
                const snapshot = await Member_PJ.get();
                snapshot.forEach(doc => list.push(doc.data()));
                setReport(list)
                // Cập nhật state hoặc làm bất cứ điều gì bạn muốn với mergedData
              } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };
        fetchData();
    }, [item.id,report]);
    useEffect(() => {
      const fetchData = async () => {
        try {
          const Evalua = firestore().collection('Evaluate_progress').where("Task_id", '==', item.id);
          const ev = [];
          const snapshot_eva = await Evalua.get();
          snapshot_eva.forEach(doc => ev.push(doc.data()));
          setDataevalue(ev);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
      }
      fetchData();
    }, [item.id]);
    
    useEffect(() => {
      if (dataevalue.length > 0) {
        setProces(dataevalue[0].status);
        setDescription(dataevalue[0].Description);
      }
    }, [dataevalue]);
      const pickDocument = async () => {
        try {
          const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
            copyTo:'cachesDirectory'
          });
          if (res && res[0].fileCopyUri) {
            // Lấy tên tệp từ đường dẫn
            const fileName = res[0].name;
            console.log(fileName);
            // Upload tệp đã chọn lên Firebase Storage
            await uploadFileToFirebase(res[0].fileCopyUri, fileName,res[0].types);
          } else {
            Alert.alert('Error', 'Invalid file selected.');
          }
      
        } catch (err) {
          if (DocumentPicker.isCancel(err)) {
            // Người dùng đã hủy lựa chọn tệp
            Alert.alert('Cancelled', 'File selection cancelled.');
          } else {
            // Đã xảy ra lỗi trong quá trình chọn tệp
            Alert.alert('Error', 'Failed to pick the file.');
            console.error('Error picking file:', err);
          }
        }
      };
    const openFile = (link) => {
        Linking.openURL(link);
      };
    const UpdateStatus=()=>{
      const Evalua = firestore().collection('Evaluate_progress');
      const valu = Evalua.where("Task_id", '==', item.id).get();
      
      valu.then((querySnapshot) => {
          if (!querySnapshot.empty) {
              // Có tài liệu trả về từ truy vấn
              querySnapshot.forEach((doc) => {
                  // Thực hiện cập nhật cột status ở đây
                  const documentRef = firestore().collection('Evaluate_progress').doc(doc.id);
                  documentRef.update({ 
                    status:proces})
                      .then(() => {
                          Alert.alert('Document updated successfully!');
                      })
                      .catch((error) => {
                          console.error('Error updating document: ', error);
                      });
              });
          } else {
              // Không có tài liệu trả về từ truy vấn
              // Thực hiện thêm mới document ở đây nếu cần
              Evalua.add(
                {
                  Task_id:item.id,
                  status:proces,
                  Description:Description
                }
              )
                  .then(() => {
                      console.log('New document added successfully!');
                  })
                  .catch((error) => {
                      console.error('Error adding new document: ', error);
                  });
          }
      })
      .catch((error) => {
          console.error('Error getting documents: ', error);
      });
    }
      const renderwork = ({ item }) => {
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(item.name);
        const isPDF = /\.pdf$/i.test(item.name);
        const isWord = /\.docx$/i.test(item.name);
        let iconComponent;
        if (isImage) {
          iconComponent = <ICon size={20}  name="image" />;
        } else if (isPDF) {
          iconComponent = <ICon size={20} name="file-pdf" />;
        } else {
          iconComponent = <ICon size={20} name="file-word" />;
        }
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginBottom: 5 }}>
                <TouchableOpacity style={{  marginLeft: 5,flexDirection:'row',alignItems:'center' }} onPress={()=>openFile(item.res)}>
                  {iconComponent}
                    <Text> {item.name}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', flex: 2, alignItems: 'center' }}>
                </View>
            </View>
        );
    };  
    const lay = (layout.width *0.90)/100;
    //console.log(item.members);
    const isUserMember = item.members.find(member => member.id === user.uid);
    return(
      <Provider>
        <View style={{flex:1,padding:10}}>
              <Text style={{textAlign:'center',fontSize:25}}>{item.Task_name}</Text>
            <View style={{backgroundColor:'white',borderRadius:15,padding:10}}>
                <Text style={{color:'blue', fontSize:20}}>Mô tả công việc</Text>
                <Text>{item.Description}</Text>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <ICon color='blue' name="play" />
                    <Text> Start: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Start_day.toDate())}</Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <ICon color="red" name="flag-checkered" />
                    <Text> End: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.End_day.toDate())}</Text>
                </View>
                <Text>Phụ trách</Text>
                
            <View style={{flexDirection:'row'}}>
                    {
                        item.members.map((memberData, index) => (
                          <View key={memberData.id}>
                            <Avatar.Image source={{ uri:memberData.PhotoURL  }} />
                            <Text style={{textAlign:'center'}} >{memberData.Name}</Text>
                        </View>
                            ))
                    }
                </View>
            </View>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <FlatList
                      data={report}
                      renderItem={renderwork}
                    />
                    {isUserMember!=null?(<Button mode="contained" onPress={pickDocument}>
                        Choose File
                    </Button>)
                      :null
                    }
                    
                    
                </View>
              <View style={{backgroundColor:'white',borderRadius:15,padding:10}}>
                <Text style={{color:'blue', fontSize:20}}>Nhận xét</Text>
                <Text>{Description}</Text>
                <Text style={{paddingLeft:proces*lay}}>{proces} %</Text>
                <ProgressBar progress={proces/100} color={MD3Colors.error50} />

                <Button style={{marginTop:10}} mode="contained" onPress={()=>setVisible(true)}>
                        Xác nhận tiến độ
                </Button>
              </View>
                <Portal>
                <Dialog visible={visible} onDismiss={()=>setVisible(false)}>
                  <Dialog.Content>
                    <Text variant="bodyMedium">Xác nhận tiến độ %</Text>
                    <TextInput keyboardType="number-pad" value={proces.toString()} onChangeText={setProces} />
                    <TextInput value={Description} label="Mô tả đánh giá" onChangeText={setDescription}/>
                    <Button onPress={()=>UpdateStatus()}>Lưu</Button>
                  </Dialog.Content>
                </Dialog>
              </Portal>     
        </View>
        </Provider>
    )
}
export default DetailTask;