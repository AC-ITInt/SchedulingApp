import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function Sidebar() {

    return (
        <View>
        <Text>Create a Task</Text>
        <TextInput
            placeholder="Enter task like 'Meeting with Alex at 3pm tomorrow'"
            // value={prompt} // Uncomment if using state for input
            // onChangeText={(text) => setPrompt(text)} // Uncomment if using state for input
        />
        <TouchableOpacity  onPress={() => console.log('Task created')}>
            <Text>Create Task</Text>
        </TouchableOpacity>
        </View>
    )
}
