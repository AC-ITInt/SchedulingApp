import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function Sidebar() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async () => {
    console.log('Task created:', prompt);
    setPrompt('');
  };

  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>Create a Task</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter task like 'Meeting with Boss at 3pm tomorrow'"
        placeholderTextColor="#9ca3af"
        value={prompt}
        onChangeText={(text) => setPrompt(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    padding: 24,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // For Android shadow
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});