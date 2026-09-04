import React, { useRef, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const SCREEN_W = Dimensions.get('window').width;
const H_MARGIN = 20;
const PILL_W = SCREEN_W - H_MARGIN * 2;
const TAB_BAR_H = 72;
const BOTTOM = 24;
const R = TAB_BAR_H / 2;
const INDICATOR = 52;
const TAB_W = PILL_W / 3;

function indicatorTarget(index: number) {
  return TAB_W * index + (TAB_W - INDICATOR) / 2;
}

type TabDef = {
  name: string;
  component: React.ComponentType<any>;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
  size: number;
};

const TABS: TabDef[] = [
  { name: 'Home',      component: HomeScreen,     icon: 'home-outline',     iconActive: 'home',     size: 22 },
  { name: 'Community', component: CommunityScreen, icon: 'people-outline',   iconActive: 'people',   size: 26 },
  { name: 'Calendar',  component: CalendarScreen,  icon: 'calendar-outline', iconActive: 'calendar', size: 22 },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const activeRef = useRef(1);
  const slideAnim = useRef(new Animated.Value(indicatorTarget(1))).current;

  function handlePress(index: number) {
    const route = state.routes[index];
    if (state.index !== index) {
      navigation.navigate(route.name);
    }
    if (index !== activeRef.current) {
      activeRef.current = index;
      setActiveIndex(index);
      Animated.spring(slideAnim, {
        toValue: indicatorTarget(index),
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      }).start();
    }
  }

  return (
    <>
      {/* Shadow pill — no overflow:hidden so iOS shadow renders */}
      <View style={styles.pillShadow} />
      {/* Clip pill — clips the sliding indicator */}
      <View style={styles.pillClip}>
        <Animated.View
          style={[styles.indicator, { transform: [{ translateX: slideAnim }] }]}
        />
        {/* Icon row */}
        <View style={styles.row}>
          {TABS.map(({ icon, iconActive, size }, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tabBtn}
              onPress={() => handlePress(index)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeIndex === index ? iconActive : icon}
                size={size}
                color={activeIndex === index ? Colors.accentFg : Colors.inkMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Community"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {TABS.map(({ name, component }) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  pillShadow: {
    position: 'absolute',
    bottom: BOTTOM,
    left: H_MARGIN,
    width: PILL_W,
    height: TAB_BAR_H,
    borderRadius: R,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  pillClip: {
    position: 'absolute',
    bottom: BOTTOM,
    left: H_MARGIN,
    width: PILL_W,
    height: TAB_BAR_H,
    borderRadius: R,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  indicator: {
    position: 'absolute',
    top: (TAB_BAR_H - INDICATOR) / 2,
    left: 0,
    width: INDICATOR,
    height: INDICATOR,
    borderRadius: INDICATOR / 2,
    backgroundColor: Colors.ink,
  },
  row: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
