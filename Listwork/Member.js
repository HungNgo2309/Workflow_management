import React, { useEffect, useState } from "react";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { Avatar, Button, Dialog, Portal, Provider, Text } from "react-native-paper";

const Member=({route,navigation})=>{
    const {item,role}=route.params;
    const [data,setData]=useState([]);
    const [visible, setVisible] = React.useState(false);
    const hideDialog = () => setVisible(false);
    const [selected,setSelected]=useState([]);
    const[loading,setLoading]=useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy tất cả các tài liệu Task có Project_ID tương ứng
                const Member_PJSnapshot = await firestore().collection('Member_PJ').where("Project_ID", '==', item[0].Project_ID).get();
                const Member_PJ = Member_PJSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Lấy tất cả các tài liệu Member
                const memberSnapshot = await firestore().collection('Member').get();
                const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
                // Ghép dữ liệu từ hai collection
                const mergedData = Member_PJ.map(memberPJ => {
                    const correspondingMember = members.find(member => member.id === memberPJ.Member_ID);
                    return { ...memberPJ, member: correspondingMember };
                });
                setData(mergedData)
                console.log("hihi")
                // Cập nhật state hoặc làm bất cứ điều gì bạn muốn với mergedData
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };
    
        fetchData();
    }, [loading]);
    const removeUserIDFromTask = async () => {
        try {
            // Lấy tài liệu từ Firestore
            const taskDoc =  await firestore().collection('Task')
            .where("Project_ID",'==',selected.Project_ID)
            .where("Member_ID", 'array-contains',selected.Member_ID).get();
            const tasks = taskDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Kiểm tra xem tài liệu có tồn tại không
            
            tasks.forEach(async (taskDoc) => {
                    const updatedMemberID = taskDoc.Member_ID.filter(id => id != selected.Member_ID);
                    // Cập nhật tài liệu trong Firestore
                    await firestore().collection('Task').doc(taskDoc.id).update({
                        Member_ID: updatedMemberID
                    });
                });
        } catch (error) {
            console.error('Error removing user from task:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await removeUserIDFromTask();
            await firestore().collection('Member_PJ').doc(selected.id).delete();
            hideDialog();
            setLoading(!loading);
            Alert.alert('Xóa thành công');
        } catch (error) {
            console.error('Error deleting service: ', error);
            Alert.alert('Error', 'An error occurred while deleting the user');
        }
    };
    const renderTask=({item})=>{
        return(
            <View style={{flexDirection:'row',backgroundColor:'white',margin:5,padding:10,alignItems:'center'}}>
                <Avatar.Image  source={{uri:item.member.PhotoURL}}/>
                <View style={{flex:5}}>
                    <Text style={{marginLeft:10}}>{item.member.Name}</Text>
                    <Text>{item.member.Email}</Text>
                </View>
                <View>
               {role[0].Role==0?( 
               <Button style={{justifyContent:'flex-end'}} mode="contained" onPress={()=>
               {setVisible(true);
                setSelected(item);
               }}>
                    Đuổi
                </Button>):null}
                </View>
            </View>
        )
    }
    return(
        <Provider>
        <View style={{flex:1}}>
            <Text style={{fontSize:25,textAlign:'center',fontWeight:"bold"}}>Danh sách thành viên</Text>
            <FlatList
                data={data}
                renderItem={renderTask}
            />
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>Bạn có chắc muốn xóa người này ra khỏi dự án</Dialog.Title>
                    <Dialog.Actions>
                    <Button onPress={() => hideDialog()}>Cancel</Button>
                    <Button onPress={() => handleDelete()}>Ok</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
        </Provider>
    )
}
export default Member;