import React, { useState } from "react";
import { Text, TextInput, View,ScrollView, Image, Alert } from "react-native";
import DatePicker from 'react-native-date-picker'
import {IconButton, Button} from 'react-native-paper'
import firestore from '@react-native-firebase/firestore';

const AddWork=({})=>{
    const[name,setName]=useState("");
    const[description,setDescription]=useState("");
    const [dateStart, setDateStart] = useState(new Date());
    const [dateEnd, setDateEnd] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [user, setUser] = useState("QWqNQon3mmP6HVs0cNT0KKRf5tV2");
    async function AddProject() {
        try {
            if(name!=null)
            {   
                const Project = await firestore().collection('Project');
                        // Nếu chưa tồn tại, thêm mới
                        const docRef = await Project.add({
                            Project_name: name,
                            Description: description,
                            Project_ID: '', // Làm thế nào để cập nhật sau này?
                            Start_day: dateStart,
                            End_day: dateEnd
                        });
                        // Lấy ID của tài liệu vừa được thêm vào
                        const docId = docRef.id;
                        // Cập nhật Project_ID của tài liệu với ID vừa lấy được
                        await Project.doc(docId).update({
                            Project_ID: docId
                        });
                        const Member_PJ = await firestore().collection('Member_PJ');
                        Member_PJ.add({
                            Member_ID:user,
                            Project_ID:docId,
                            Role:0,
                        })
                        Alert.alert("Tạo dự án thành công");
            }else {
                console.error("Một số giá trị không hợp lệ để thêm vào Firestore.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm dữ liệu thuê:", error);
        }
    }
    return(
        <ScrollView>
            <View style={{flex:1,flexDirection:'column'}}>
                <View style={{flex:3}}>
                    <Text>gii</Text>
                </View>
                <View style={{flex:5}}>
                    <Text>Tên dự án</Text>
                    <TextInput
                        style={{borderWidth:2}}
                        value={name}
                        onChangeText={setName}
                    />
                    <Text>Mô tả</Text>
                    <TextInput
                        style={{borderWidth:2}}
                        value={description}
                        onChangeText={setDescription}
                    />
                    <Text>Ngày bắt đầu {dateStart.toDateString()}</Text>
                    <DatePicker
                        modal
                        open={open}
                        date={dateStart}
                        onConfirm={(date) => {
                        setOpen(false)
                        setDateStart(date)
                        }}
                        onCancel={() => {
                        setOpen(false)
                        }}
                    />
                     <IconButton style={{alignContent:"center"}}  icon="calendar-clock" onPress={() => setOpen(true)}/>
                     <Text>Ngày kết thúc dự kiến {dateEnd.toDateString()}</Text>
                     <DatePicker
                        modal
                        open={openE}
                        date={dateEnd}
                        onConfirm={(date) => {
                        setOpenE(false)
                        setDateEnd(date)
                        }}
                        onCancel={() => {
                        setOpenE(false)
                        }}
                    />
                     <IconButton style={{alignContent:"center"}}  icon="calendar-clock" onPress={() => setOpenE(true)}/>
                </View>
                <Button onPress={()=>AddProject()}>Tạo dự án</Button>
            </View>
        </ScrollView>
    )
}
export default AddWork;