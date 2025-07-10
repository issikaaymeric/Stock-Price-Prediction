import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';

export default function MenuSender() {
  const [day, setDay] = useState('');
  const [title, setTitle] = useState('');
  const [localImage, setLocalImage] = useState(null);
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const uploadImageAndAddItem = async () => {
    if (!title.trim() || !localImage) {
      Alert.alert('Missing Info', 'Please enter a title and choose an image.');
      return;
    }

    try {
      setUploading(true);
      const imageId = uuid.v4();
      const response = await fetch(localImage);
      const blob = await response.blob();

      const storageRef = ref(storage, `menus/${imageId}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const newItem = { title: title.trim(), image: downloadURL };
      setItems([...items, newItem]);
      setTitle('');
      setLocalImage(null);
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeItem = (itemToRemove) => {
    setItems(items.filter((i) => i.title !== itemToRemove.title));
  };

  const handleSubmit = async () => {
    if (!day || items.length === 0) {
      Alert.alert('Error', 'Please enter a day and at least one menu item.');
      return;
    }

    try {
      await setDoc(doc(db, 'menus', day.toLowerCase()), {
        date: new Date().toISOString(),
        items,
      });

      Alert.alert('Success', `Menu for ${day} has been sent!`);
      setDay('');
      setItems([]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Send Menu of the Day</Text>

      <TextInput
        label="Day (e.g. Monday)"
        value={day}
        mode="outlined"
        onChangeText={setDay}
        style={styles.input}
      />

      <TextInput
        label="Meal Title"
        value={title}
        mode="outlined"
        onChangeText={setTitle}
        style={styles.input}
      />

      {localImage && (
        <Image source={{ uri: localImage }} style={styles.previewImage} />
      )}

      <Button mode="outlined" onPress={pickImage} style={styles.imagePicker}>
        Pick Image
      </Button>

      <Button
        mode="contained"
        onPress={uploadImageAndAddItem}
        style={styles.addButton}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Add Item'}
      </Button>

      <View style={styles.chipContainer}>
        {items.map((menuItem, index) => (
          <Chip
            key={index}
            onClose={() => removeItem(menuItem)}
            style={styles.chip}
          >
            {menuItem.title}
          </Chip>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.sendButton}
        disabled={!day || items.length === 0}
      >
        Send Menu
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fdf2e9',
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    marginBottom: 15,
  },
  imagePicker: {
    borderColor: '#2980b9',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#2980b9',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#27ae60',
    marginTop: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
});
