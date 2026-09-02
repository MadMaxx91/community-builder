import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ContentProvider } from './src/context/ContentContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ProfileScreen } from './src/screens/ProfileScreen';

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
      {user && <ProfileScreen />}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <AppContent />
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
