import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Test = ({route}) => {
    const {item}=route.params;
    //console.log(item.Project_ID)
    const [dateRange, setDateRange] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const taskSnapshot = await firestore().collection('Task').where('Project_ID','==',item.Project_ID).get();
                const tasksData = taskSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().Task_name,
                    startDay: doc.data().Start_day.toDate(),
                    endDay: doc.data().End_day.toDate()
                }));

                tasksData.sort((a, b) => a.startDay - b.startDay);

                const formattedDateRange = generateFormattedDateRange(tasksData);

                setDateRange(formattedDateRange);
                setTasks(tasksData);
            } catch (error) {
                console.error('Error fetching tasks: ', error);
            }
        };

        fetchData();
    }, []);

    const generateFormattedDateRange = (tasksData) => {
        const dateSet = new Set();
        tasksData.forEach(task => {
            dateSet.add(`${task.startDay.getDate()}/${task.startDay.getMonth() + 1}`);
            dateSet.add(`${task.endDay.getDate()}/${task.endDay.getMonth() + 1}`);
        });
        const sortedDateRange = [...dateSet].sort((a, b) => {
            const [dateA, monthA] = a.split('/');
            const [dateB, monthB] = b.split('/');
            return new Date(2000, monthA - 1, dateA) - new Date(2000, monthB - 1, dateB);
        });
        return sortedDateRange;
    };

    const renderDateItem = (date, index) => (
        <View key={index} style={styles.dateItemContainer}>
            <Text style={styles.dateText}>{date}</Text>
        </View>
    );

    const renderTaskBar = (task, index) => {
        const startIdx = dateRange.findIndex(date => date === `${task.startDay.getDate()}/${task.startDay.getMonth() + 1}`);
        const endIdx = dateRange.findIndex(date => date === `${task.endDay.getDate()}/${task.endDay.getMonth() + 1}`);
        const width = (endIdx - startIdx + 1) * 50;
        const marginLeft = startIdx * 50;

        return (
            <View key={index} style={[styles.taskBar, { marginLeft, width }]}>
                <Text style={styles.taskName}>{task.name}</Text>
            </View>
        );
    };

    const renderVerticalLines = () => {
        return dateRange.map((date, index) => {
            const startDate = new Date(date);
            const startIdx = index * 55;
            return (
                <View
                    key={`vertical-line-${index}`}
                    style={[styles.verticalLine, { marginLeft: startIdx + 20 }]}
                />
            );
        });
    };

    return (
       <View style={styles.container0}>
        <ScrollView horizontal>
            <View >
                <View style={styles.dateContainer}>
                    {dateRange.map((date, index) => renderDateItem(date, index))}
                </View>
                <View style={styles.taskContainer}>
                    {renderVerticalLines()}
                    {tasks.map((task, index) => renderTaskBar(task, index))}
                </View>
            </View>
        </ScrollView>
       </View> 
    );
};

const styles = StyleSheet.create({
    container0:{
        borderWidth: 0,
        flex:1,
        justifyContent:'center',
        borderRadius:20,
        backgroundColor:'white',
        marginLeft:10,
        alignItems:'center'
    },
    container: {
        marginLeft: 10,
        marginTop: 10,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateItemContainer: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    dateText: {
        fontSize: 16,
    },
    taskContainer: {
        position: 'relative',
        marginTop: 10,
        marginLeft:10
    },
    taskBar: {
        height: 30,
        backgroundColor: 'blue',
        marginBottom: 10,
    },
    taskName: {
        color: 'white',
        textAlign: 'center',
        marginTop: 5,
    },
    verticalLine: {
        position: 'absolute',
        backgroundColor: 'grey',
        width: 1,
        height: '100%',
        zIndex: -1,
    },
});

export default Test;
