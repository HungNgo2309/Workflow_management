import React, { useEffect, useState } from "react";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { Avatar, Button, Text } from "react-native-paper";

const AddMember=({route,navigation})=>{
    const {item,role}=route.params;
    console.log(item[0].Project_ID);
    const [data,setData]=useState([]);
    const [loading,setLoading]=useState(true);
    const fetchData = async () => {
        try {
            // Lấy tất cả các tài liệu Task có Project_ID tương ứng
            const Member_PJSnapshot = await firestore().collection('Member_PJ').where("Project_ID", '==', item[0].Project_ID).get();
            const Member_PJ = Member_PJSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            

            // Lấy tất cả các tài liệu Member
            const memberSnapshot = await firestore().collection('Member').get();
            const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ghép dữ liệu từ hai collection
            const mergedData = members.map(member => {
                const relatedMembers = Member_PJ.filter(PJ => PJ.Member_ID === member.id);
                return {
                    ...member,
                    relatedMembers: relatedMembers
                };
            });
            setData(mergedData);
            // Cập nhật state hoặc làm bất cứ điều gì bạn muốn với mergedData
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [item[0].Project_ID,loading]);
    const renderTask=({item})=>{
        return(
            <View style={{flexDirection:'row',backgroundColor:'white',margin:5,padding:10,alignItems:'center'}}>
                {
                    item.PhotoURL?(<Avatar.Image  source={{uri:item.PhotoURL}}/>):null
                }
                <View style={{flex:5}}>
                    <Text style={{marginLeft:10}}>{item.Name}</Text>
                    <Text>{item.Email}</Text>
                </View>
                {
                    role[0].Role==0?(
                        <View>
                        {
                            item.relatedMembers.length ==0?(<Button onPress={()=>Join_PJ(item.id)} style={{justifyContent:'flex-end'}} mode="contained">
                            Thêm thành viên
                        </Button>):<Text style={{color:'green'}}>Thành viên nhóm</Text>
                        }
                   
                    </View>
                    ):null
                }
            </View>
        )
    }
    const Join_PJ=async(id)=>{
            console.log(id);
            const Evalua = await firestore().collection('Member_PJ');
            await Evalua.add({
                Member_ID:id,
                Project_ID:item[0].Project_ID,
                Role:2
            })
            setLoading(!loading);
    }     
    return(
        <View>
            <FlatList
                data={data}
                renderItem={renderTask}
            />
        </View>
    )
}
export default AddMember;