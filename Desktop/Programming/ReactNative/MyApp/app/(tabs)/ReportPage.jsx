import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

export default function FeedbackPage() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const options = ['Good', 'Bad', 'Other'];

  const handleSubmit = () => {
    if (!selectedOption && !feedbackText.trim()) {
      Alert.alert('Error', 'Please select an option or write your experience.');
      return;
    }

    // Here you would normally send to your backend
    console.log('Feedback submitted:', { selectedOption, feedbackText });

    Alert.alert('Thank You!', 'Your feedback has been submitted.');
    setSelectedOption(null);
    setFeedbackText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How was the food today?</Text>

      <View style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedOption === option && styles.selectedOption,
            ]}
            onPress={() => setSelectedOption(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Write your experience:</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Your feedback..."
        value={feedbackText}
        onChangeText={setFeedbackText}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

// ========style=========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2e9',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#27ae60',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  selectedOption: {
    backgroundColor: '#27ae60',
  },
  optionText: {
    color: '#333',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2c3e50',
  },
  textArea: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    height: 120,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

