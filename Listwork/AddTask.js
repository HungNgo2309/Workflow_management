import React, { useEffect, useState } from "react";
import { Text, TextInput, View,ScrollView, Image, Alert, StyleSheet } from "react-native";
import DatePicker from 'react-native-date-picker'
import {IconButton, Button, Chip} from 'react-native-paper'
import firestore from '@react-native-firebase/firestore';
import { Dropdown } from "react-native-element-dropdown";
import ICon from 'react-native-vector-icons/FontAwesome6';

const AddTask=({route})=>{
    const { work } = route.params;
    const[name,setName]=useState("");
    const[description,setDescription]=useState("");
    const [dateStart, setDateStart] = useState(new Date());
    const [dateEnd, setDateEnd] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [data,setData]=useState([]);
    const [selected,setSelected]=useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                
                // Lấy tất cả các tài liệu Task có Project_ID tương ứng
                const Member_PJSnapshot = await firestore().collection('Member_PJ').where("Project_ID", '==', work).get();
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
                // Cập nhật state hoặc làm bất cứ điều gì bạn muốn với mergedData
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };
    
        fetchData();
    }, []);
    const handleItemSelected = (item) => {
        // Thêm mục đã chọn vào mảng selectedItems
        if (!isItemSelected(item)) {
            // Nếu mục chưa được chọn, thêm vào mảng selectedItems
            setSelected([...selected, item]);
        }
    };
    const removeFromSelected = (indexToRemove) => {
        const updatedSelected = [...selected];
        updatedSelected.splice(indexToRemove, 1); // Xóa phần tử tại indexToRemove
        setSelected(updatedSelected); // Cập nhật lại mảng selected
    };
    // Tạo một hàm để kiểm tra xem một mục có phải là mục đã chọn hay không
    const isItemSelected = (item) => {
        return selected.some(selectedItem => selectedItem.Member_ID === item.Member_ID);
    };
    async function AddTask() {
        try {
            if(name!=null)
            {   
                const Task = await firestore().collection('Task');
                        // Nếu chưa tồn tại, thêm mới
                        const memberNames = selected.map(item => item.Member_ID);
                        await Task.add({
                            Task_name: name,
                            Description: description,
                            Project_ID: work, // Làm thế nào để cập nhật sau này?
                            Start_day: dateStart,
                            End_day: dateEnd,
                            Status:false,
                            Member_ID:memberNames 
                        });
                        const Notify= await firestore().collection('Notification');
                        await Notify.add({
                            Description: 'Nhiệm vụ mới ',
                            Project_ID: work,
                            Title:name,
                            Time:new Date().toISOString()
                        });
                        Alert.alert("Tạo dự án thành công");
            }else {
                console.error("Một số giá trị không hợp lệ để thêm vào Firestore.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm dữ liệu thuê:", error);
        }
    }
    console.log(selected);
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
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={data.map(item => ({ ...item, disable: isItemSelected(item) }))}
                        search
                        maxHeight={300}
                        labelField="member.Name" // Thiết lập trường bạn muốn hiển thị
                        valueField="Member_ID"
                        placeholder="Chọn danh mục"
                        searchPlaceholder="Search..."
                        disableSearch={true}
                        //value={member.Name}
                        onChange={item => handleItemSelected(item)}
                    />
                     {/* Hiển thị các mục đã chọn */}
                    <Text>Các mục đã chọn:</Text>
                    {selected.map((item, idx) => (
                        <View key={item.Member_ID}>
                            <Chip 
                             avatar={<Image source={{ uri:item.member.PhotoURL }} />}
                            style={{alignSelf:'flex-start'}} 
                            closeIcon="box-cutter-off" 
                            onClose={() => removeFromSelected(idx)}>
                                {item.member.Name}</Chip>
                        </View>
                    ))}

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
                <Button onPress={()=>AddTask()}>Thêm nhiệm vụ</Button>
            </View>
        </ScrollView>
    )
}
export default AddTask;
const styles = StyleSheet.create({
    container: {
      padding: 10,
      
    },
    label: {
      fontSize: 15,
      marginTop: 10,
      
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      paddingHorizontal: 5,
      marginTop: 5,
      
    },
    imageContainer: {
      alignItems: 'center',
      marginTop: 10,
      
    },
    image: {
      width: 200,
      height: 200,
      resizeMode: 'cover',
     
    },
    dropdown: {
      margin: 16,
      height: 50,
      borderBottomColor: 'gray',
      borderBottomWidth: 0.5,
    },
    icon: {
      marginRight: 5,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    
  });