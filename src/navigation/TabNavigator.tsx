import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { ShareScreen } from '../screens/ShareScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home:      { active: 'home',           inactive: 'home-outline' },
  Events:    { active: 'calendar',       inactive: 'calendar-outline' },
  Share:     { active: 'swap-horizontal',inactive: 'swap-horizontal-outline' },
  Community: { active: 'people',         inactive: 'people-outline' },
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={color}
            />
          );
        },
        tabBarLabel: ({ focused, children }) => (
          <Text style={{
            fontSize: 10,
            fontWeight: focused ? '600' : '400',
            color: focused ? Colors.ink : Colors.inkMuted,
            marginBottom: 4,
          }}>
            {children}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
          height: 80,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.inkMuted,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Share" component={ShareScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
}
