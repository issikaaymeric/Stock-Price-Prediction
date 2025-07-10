import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  FlatList,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, serverTimestamp} from 'firebase/firestore'
import { auth, db } from '../firebase'; 
import { Button } from 'react-native-paper';
import { useLayoutEffect } from 'react';



// const WEEKLY_MENU = {
  // Monday: [
    // { id: '1', image: require('../../assets/images/img/Garba.jpg'), title: 'Garba', },
    // { id: '2', image: require('../../assets/images/img/Attike Leagume.jpg'), title: 'Attieké Légume' },
  // ],
  // Tuesday: [
    // { id: '3', image: require('../../assets/images/img/Attiek poisson braisé.jpg'), title: 'Poisson Braisé' },
    // { id: '4', image: require('../../assets/images/img/Jollof_Rice_with_Stew.jpg'), title: 'Jollof Rice' }
  // ],
  // Wednesday: [
    // { id: '5', image: require('../../assets/images/img/Garba.jpg'), title: 'Garba Extra' },
    // { id: '6', image: require('../../assets/images/img/Barbecue-beef-burger-68d57ec.jpg'), title: 'Burger' }
  // ],
  // Thursday: [
    // { id: '7', image: require('../../assets/images/img/Grilled-Chicken.webp'), title: 'Poulet Grillet' },
    // { id: '8', image: require('../../assets/images/img/Thai-Cucumber-Salad-Square-1200-1.jpg'), title: 'Poisson Braisé' }
  // ],
// };



// Menu item card
const Item = ({ id, title, image, addToCart }) => {
  return (
    <View style={menu.item}>
      <Image source={image} style={menu.itemImage} />
      <Text style={menu.title}>{title}</Text>
      <TouchableOpacity
        style={menu.orderButton}
        onPress={() => addToCart({ id, title, image })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="shopping-cart" size={16} color="#fff" />
          <Text style={menu.orderButtonText}> Order</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};



export default function MyCanteen() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [cartVisible, setCartVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  // const dailyMenu = WEEKLY_MENU[selectedDay];
  const [dailyMenu, setDailyMenu] = useState([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const navigation = useNavigation();

    useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      parent?.setOptions({
        tabBarStyle: { display: 'flex' },
      });
    };
  }, [navigation]);



  const addToCart = (item) => {
  const existingIndex = cartItems.findIndex(i => i.id === item.id);
  if (existingIndex !== -1) {
    const updatedItems = [...cartItems];
    updatedItems[existingIndex].quantity += 1;
    setCartItems(updatedItems);
  } else {
    setCartItems([...cartItems, { ...item, quantity: 1 }]);
  }
};

// Send Orders to firebase db

const sendOrder = async () => {
  if (cartItems.length === 0) {
    Alert.alert('Your cart is empty!');
    return;
  }

  try {
    await addDoc(collection(db, 'orders'), {
      items: cartItems.map(({ title, quantity, image }) => ({
        title,
        quantity,
        image: image?.uri || null,
      })),
      userId: auth.currentUser?.uid || 'anonymous',
      timestamp: serverTimestamp(),
    });

    Alert.alert('Success', 'Your order has been sent!');
    setCartItems([]); // clear cart
    setCartVisible(false);
  } catch (error) {
    console.error('Error sending order:', error);
    Alert.alert('Error', 'Failed to send order.');
  }
};



  // Delete Item in Order page

  const removeItemFromCart = (itemToRemove) => {
  setCartItems((prevItems) =>
    prevItems.filter(item => item.title !== itemToRemove.title)
  );
};

// Loging out and return to the logpage
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setModalVisible(false);
      router.replace('/(tabs)/Login');
    } catch (e) {
      Alert.alert('Logout Error', e.message);
    }
  };


   // Fetch menu from Firebase based on selectedDay

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const docRef = doc(db, 'menu', selectedDay.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Fetched menu data:', data.items);
          const formattedItems = data.items.map((item, index) => ({
            id: index.toString(),
            title: item.title,
            image: { uri: item.image },
          }));
          setDailyMenu(formattedItems);
        } else {
          console.log('No menu found for:', selectedDay);
          setDailyMenu([]);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };

    fetchMenu();
  }, [selectedDay]

);



  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <Image style={styles.logo} source={require('../../assets/images/Avide_logo.jpg')} />
          <Text style={styles.title}>Avide University School Canteen</Text>

          {/* Cart Icon */}
            <View style={{ position: 'absolute', top: 50, right: 20 }}>
              <TouchableOpacity onPress={() => setCartVisible(true)}>
                <Icon name="shopping-cart" size={30} color="#1d8348" />
                {cartItems.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

          {/*Setting Icon*/}
          <View  style={{ position: 'absolute', top: 50, left: 20 }}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Icon name="bars" size={20} color="#1d8348"></Icon>
            </TouchableOpacity>
          </View>


          {/* Banner */}
          <View style={styles.imageContainer}>
            <Image
              style={styles.bodyImg}
              source={require('../../assets/images/img/Ffb-Choukouya-poulet.jpg')}
            />
            <Text style={styles.imageText}>Welcome to our Canteen</Text>
          </View>

          {/* Day Selection Buttons */}
          <View style={styleButton.container}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => (
              <TouchableOpacity
                key={day}
                style={[styleButton.btn, selectedDay === day && { backgroundColor: '#1e8449' }]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={styleButton.btnText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Menu List */} {/*{(selectedItem) => setCartItems(prev => [...prev, selectedItem])}*/}
          <Text style={stylemenu.layout}>Menu</Text>
          <View style={{ height: 280, marginBottom: 20 }}>
            <FlatList
              data={dailyMenu}
              renderItem={({ item }) => (
                <Item
                  id={item.id}
                  title={item.title}
                  image={item.image}
                  addToCart={addToCart}
                />
              )}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator
            />
          </View>

          {/* Calendar */}
          <View style={calendarStyles.calendarContainer}>
            <Calendar
              onDayPress={(day) => console.log('Selected day:', day)}
               markedDates={{
                  [selectedDay]: { selected: true, marked: true, selectedColor: '#27ae60' },
               }}
              style={calendarStyles.calendar}
              theme={{
                backgroundColor: '#fdf2e9',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#27ae60',
                selectedDayBackgroundColor: '#27ae60',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#e74c3c',
                dayTextColor: '#2d3436',
                textDisabledColor: '#bdc3c7',
                arrowColor: '#27ae60',
                monthTextColor: '#2d3436',
                indicatorColor: '#27ae60',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
          {/*Setting Modal*/}
          <Modal
            animationType='fade'
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={settings.modalBackground}>
              <View style={settings.modalContainer}>
                <Text style={settings.modalTitle}>Settings</Text>

                    {/*  Setting Components */}
                <Text style={settings.option} onPress={() => router.push('/account')}>Account</Text>
                <Text style={settings.option} onPress={() => router.push('/survey')}>Survey</Text>
                <Text style={settings.option} onPress={() => router.push('/reportpage')}>Report</Text>
                <Text style={settings.option}>Theme</Text>
                <Text style={settings.option}>Language</Text>

                    {/* Close Btn  */}
                <TouchableOpacity 
                   style={settings.closeIcon} 
                   onPress={() => setModalVisible(false)}> 
                   <Icon name="close" size={24} color="#333"/> 
                 </TouchableOpacity> 

                {/* Logout Btn */}
                  <Pressable
                    style={settings.closeButton}
                    onPress={handleLogout}
                  >
                    <Text style={settings.closeText}>Logout</Text>
                  </Pressable>

              </View>
            </View>

          </Modal>

          {/* Cart Modal */}
              <Modal
                  animationType="fade"
                  transparent={true}
                  visible={cartVisible}
                  onRequestClose={() => setCartVisible(false)}
                >
                  <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                      {/* Close Icon */}
                      <TouchableOpacity
                        onPress={() => setCartVisible(false)}
                        style={modalStyles.closeIcon}
                      >
                        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>×</Text>
                      </TouchableOpacity>

                      {/* Title */}
                      <Text style={modalStyles.modalTitle}>Your Cart</Text>

                      {/* Cart Items */}
                        {cartItems.map((item, index) => (
                          <View key={index} style={modalStyles.cartItem}>
                            <Image source={item.image} style={modalStyles.cartItemImage} />
                            <View style={{ flex: 1 }}>
                              <Text style={modalStyles.cartItemText}>{item.title}</Text>
                              <Text style={modalStyles.cartQty}>Qty: {item.quantity}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeItemFromCart(item)}>
                              <Icon name="trash" size={20} color="#e74c3c" />
                            </TouchableOpacity>
                          </View>
                        ))}

                        <Button
                          mode="contained"
                          onPress={sendOrder}
                          style={{ width: 100, height:35 ,backgroundColor: '#27ae60' }}
                        >
                          Order
                      </Button>
                    </View>
                  </View>

                </Modal>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ==================== Styles ====================
// Main App Dsign
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdf2e9',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  title: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bodyImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageText: {
    position: 'absolute',
    top: '0%',
    left: '30%',
    transform: [{ translateX: -100 }],
    color: '#f4d03f',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
// Cart Icon Badge
  cartBadge: {
  position: 'absolute',
  right: -10,
  top: -8,
  backgroundColor: '#e74c3c',
  borderRadius: 10,
  width: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
},
cartBadgeText: {
  color: 'white',
  fontSize: 12,
  fontWeight: 'bold',
},

});
// Weekly Button Design
const styleButton = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btn: {
    backgroundColor: '#28b463',
    borderRadius: 50,
    width: 70,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
});
// Menu List Card Design
const menu = StyleSheet.create({
  item: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    width: 200,
    height: 250,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  itemImage: {
    width: 190,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  orderButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
// Menu Title Design
const stylemenu = StyleSheet.create({
  layout: {
    fontWeight: 'bold',
    color: '#27ae60',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
});
// Calendar Design
const calendarStyles = StyleSheet.create({
  calendarContainer: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendar: {
    borderRadius: 10,
  },
});
// Modal Window Design(Click Card Icon)
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalView: {
    width: '90%',
    height: '80%', 
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    backgroundColor: '#27ae60',
  },
  buttonClose: {
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 10,
},
cartItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', 
  marginBottom: 15,
  backgroundColor: '#f0f0f0',
  borderRadius: 10,
  padding: 10,
  width: 300,
},

cartItemImage: {
  width: 50,
  height: 50,
  borderRadius: 5,
  marginRight: 10,
  resizeMode: 'cover',
},

cartItemText: {
  fontSize: 14,
  fontWeight: '600',
},

cartQty: {
  fontSize: 12,
  color: '#555',
  marginTop: 2,
}
});

// Stting Modal Design

const settings = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: '75%',
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#27ae60',
  },
  option: {
    fontSize: 18,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
},
  closeText: {
    color: 'white',
    fontSize: 16,
  },
});

