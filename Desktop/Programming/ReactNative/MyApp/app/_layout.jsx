// import { DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';

// function AppInner() {

//   return (
//     <NavThemeProvider value={DefaultTheme}>  
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="account" options={{ title: 'Your Account' }} />
//         <Stack.Screen name="reportpage" options={{ title: 'Report' }} />
//         <Stack.Screen name="survey" options={{ title: 'Survey' }} />
//         <Stack.Screen name="login" options={{ title: 'Login' }} />
//         <Stack.Screen name="signup" options={{ title: 'SigninPage' }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//     </NavThemeProvider>

//   );
// }

// export default function RootLayout() {
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   if (!loaded) return null;

//   return (
//     // <ThemeProvider>
//       <>
//         <AppInner />
//         <StatusBar style="auto" />
//       </>
//     // </ThemeProvider>
//   );
// }
// import { Stack } from 'expo-router';

// export default function RootLayout() {
//   return <Stack />;
// }
