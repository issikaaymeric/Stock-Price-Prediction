import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!firstName || !lastName || !confirmPassword))) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Login Successful');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save extra user info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email: user.email,
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Account Created', `Welcome, ${firstName}!`);
      }

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Authentication Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      {!isLogin && (
        <>
          <TextInput
            label="First Name"
            value={firstName}
            mode="outlined"
            onChangeText={setFirstName}
            style={styles.input}
          />
          <TextInput
            label="Last Name"
            value={lastName}
            mode="outlined"
            onChangeText={setLastName}
            style={styles.input}
          />
        </>
      )}

      <TextInput
        label="Email"
        value={email}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        mode="outlined"
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      {!isLogin && (
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          mode="outlined"
          secureTextEntry
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
      )}

      <Button mode="contained" onPress={handleAuth} style={styles.button}>
        {isLogin ? 'Login' : 'Sign Up'}
      </Button>

      <Button onPress={() => setIsLogin(!isLogin)} mode="text">
        {isLogin ? 'No account? Sign Up' : 'Have an account? Login'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fdf2e9',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#27ae60',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
});
