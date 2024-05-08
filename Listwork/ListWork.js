import React, { useContext, useEffect, useRef, useState } from "react";
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from "@react-navigation/native";
import { AuthenticatedUserContext } from "../providers";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Avatar, Searchbar, Text } from "react-native-paper";
import ICon from 'react-native-vector-icons/FontAwesome6';

const List=()=>{
    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const { user } = useContext(AuthenticatedUserContext);
    const[searchQuery,setSearchQuery]=useState("");
    const hasFetchedData = useRef(false); 
    const [datasearch,setDatasearch]=useState([]);
    const removeDiacritics = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };
    useEffect(() => { 
        const fetchData = async () => {
            const Tasks = firestore().collection('Member_PJ').where("Member_ID", '==', user.uid);
            const list = [];
            const snapshot = await Tasks.get();
            snapshot.forEach(doc => list.push(doc.data()));

            const userIDs = list.map(item => item.Project_ID);
            const Projects = firestore().collection('Project').orderBy("Start_day","desc").where(firestore.FieldPath.documentId(), 'in', userIDs);
            const listall = [];
            const projectSnapshot = await Projects.get();
            projectSnapshot.forEach(doc => listall.push(doc.data()));
            setData(listall);
        };
        fetchData();
        hasFetchedData.current = true;
    }, [user]);
    const [memberCounts, setMemberCounts] = useState({});
    useEffect(() => {
        const fetchMemberCounts = async () => {
            const counts = {};
            for (const item of data) {
                try {
                    const snapshot = await firestore().collection('Member_PJ').where("Project_ID","==",item.Project_ID).get();
                    const count = snapshot.size;
                    counts[item.Project_ID] = count;
                } catch (error) {
                    console.error('Error counting members:', error);
                    counts[item.Project_ID] = 0; // Gán số thành viên là 0 nếu có lỗi
                }
            }
            setMemberCounts(counts);
        };
        fetchMemberCounts();
    }, [data]);
    useEffect(() => {
        if (hasFetchedData.current) {
        if(searchQuery!=null)
        {
            const filteredResult = data.filter((item) =>
          item &&
          (
            (item.Project_name && removeDiacritics(item.Project_name).toLowerCase().includes(removeDiacritics(searchQuery).toLowerCase())) ||
            (item.Description && removeDiacritics(item.Description).toLowerCase().includes(removeDiacritics(searchQuery).toLowerCase()))
          )
        );
        setDatasearch(filteredResult);
        }else{
            setDatasearch(data);
        }
        
      }}, [searchQuery,data])
    const renderwork = ({ item }) => {
        const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const memberCount = memberCounts[item.Project_ID] || 0; // Lấy số thành viên từ biến trạng thái hoặc mặc định là 0
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin:10,borderRadius:15,shadowColor: '#000',
            shadowOffset: {
            width: 2,
            height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5 }}>
                <TouchableOpacity style={{ flex: 3,flexDirection:'row' }} onPress={() => navigation.navigate("DetailWork", { screen: 'Home', params: {work: item} })}>
                    <View style={{flex:3,justifyContent:'center',paddingLeft:10}}>
                        <Avatar.Image source={{ uri:"https://png.pngtree.com/png-clipart/20230504/original/pngtree-project-management-flat-icon-png-image_9137782.png"  }}/>
                    </View>
                    <View style={{flex:7}}>
                        <Text style={{fontSize:20,color:'blue'}}>{item.Project_name}</Text>
                        <Text><ICon color='blue' name="play" /> Start: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Start_day.toDate())}</Text>
                        <Text><ICon color="red" name="flag-checkered" /> End: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.End_day.toDate())}</Text>
                       <View style={{flexDirection:'row',alignItems:'center'}}>
                            <ICon name="people-group" size={20}/>
                            <Text style={{fontSize:20}}>:   {memberCount} </Text>
                            <ICon name="person" size={20}/>
                       </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }; 
    return(
        <View style={{flex:1}}>
            <Text style={{fontSize:30,marginLeft:10}}>My Project</Text>
            <Searchbar
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
                {data!=null?(
                    <FlatList
                        data={datasearch}
                        renderItem={renderwork}
                    />
                ):(<Text style={{textAlign:'center'}}>Danh sách trống</Text>)}
        </View>
    )
}
export default List;