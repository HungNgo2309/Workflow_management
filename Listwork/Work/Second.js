import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, IconButton } from "react-native-paper";
import ICon from 'react-native-vector-icons/FontAwesome6';

const Second = ({ role, data, navigation }) => {
    const renderwork = useCallback(({ item }) => {
        const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return (
                <TouchableOpacity style={styles.fl} onPress={() => navigation.navigate("DetailTask", { item: item })}>
                    <Text style={{textAlign:'center',fontSize:20,fontWeight:'bold'}}>{item.Task_name}</Text>
                    <Text><ICon color='blue' name="play" />  Start: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Start_day.toDate())}</Text>
                    <Text><ICon color="red" name="flag-checkered" />  End: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.End_day.toDate())}</Text>
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
                </TouchableOpacity>
        );
    }, [navigation]); // Chỉ gọi lại hàm khi navigation thay đổi

    return (
        <View style={{ flex: 1, backgroundColor: '#673ab7' }}>
            <FlatList
                 data={data}
                 renderItem={renderwork}
            />
            {role.Role == 0 ? (
                <View style={{ position: "absolute", bottom: 0, right: 0 }}>
                    <IconButton
                        style={{}}
                        icon="plus"
                        iconColor={MD3Colors.error50}
                        size={20}
                        onPress={() => navigation.navigate("AddTask", { work: work.Project_ID })}
                    />
                </View>
            ) : null}
        </View>
    );
};

export default Second;
const styles = StyleSheet.create({
    fl:{
        shadowOffset: {
            width: 2,
            height: 4,
            },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor:'white',
        margin:10,
        padding:10,
        borderRadius:15,
    }

})