import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

const sampleSurvey = {
  id: 'survey1',
  question: 'Which meals do you prefer for lunch?',
  options: [
    'Garba',
    'Attieké Poisson',
    'Jollof Rice',
    'Burger',
    'Grilled Chicken',
  ],
};

export default function SurveyPage() {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) {
      Alert.alert('Please select at least one option.');
      return;
    }

    // Submit logic here (e.g. send to Firebase or backend)
    console.log('Survey Answer:', {
      surveyId: sampleSurvey.id,
      answers: selectedOptions,
    });

    Alert.alert('Thank you for your feedback!');
    setSelectedOptions([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.question}>{sampleSurvey.question}</Text>

      {sampleSurvey.options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            selectedOptions.includes(option) && styles.selectedOption,
          ]}
          onPress={() => toggleOption(option)}
        >
          <Text
            style={[
              styles.optionText,
              selectedOptions.includes(option) && styles.selectedOptionText,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Answer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
// ========style==========

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fdf2e9',
    padding: 20,
    justifyContent: 'flex-start',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  option: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#27ae60',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
