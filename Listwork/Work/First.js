import React, { useEffect, useState } from "react";
import firestore from '@react-native-firebase/firestore';
import { FlatList, SafeAreaView, TouchableOpacity, View } from "react-native";
import { Avatar, IconButton, MD3Colors, Text } from "react-native-paper";
import ICon from 'react-native-vector-icons/FontAwesome6';

const First =({data,handle,navigation})=>{
  const rendernotifi = ({ item }) => {
   
    const dateFormatOptions = { year: 'numeric', day: 'numeric', month: 'numeric' };
    return(
        <View style={{backgroundColor:'white',margin:5,padding:10}}>
          <TouchableOpacity onPress={() => navigation.navigate("DetailTask", { item: item.tasks[0] })}>
             <Text>{item.Description} <Text style={{color:'blue'}}>{ item.Title}</Text> đã được Quản trị viên thêm vào </Text>
             {item.Time!=null?(
                <Text><ICon color='blue' name="play" />  Ngày thêm: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Time.toDate())}</Text>
             ):null}
          </TouchableOpacity>
        </View>
    )
  }
    return(
        <SafeAreaView style={{flex: 1}}>
        <View style={{flex:1}}>
            <FlatList
             data={data}
             renderItem={rendernotifi}
            />
            
        </View>
      </SafeAreaView>
    )
}
export default First;