// @ts-check
import React, { useEffect, useState } from "react"
import { Button, StyleSheet, View } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [notificationsPermissions, setNotificationsPermissions] = useState({
    canAskAgain: undefined,
    expires: undefined,
    granted: undefined,
    status: undefined,
  });

  useEffect(() => {
    const getNotificationsPermissions = async () => {
      const { canAskAgain, expires, granted, status } = await Notifications.getPermissionsAsync();
      // @ts-ignore
      setNotificationsPermissions({ canAskAgain, expires, granted, status });
    };
    getNotificationsPermissions();
  }, [])

  console.log('notificationsPermissions', notificationsPermissions)

  useEffect(() => {
    if (notificationsPermissions.granted === true) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });      
    }
  }, [notificationsPermissions.granted])

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received notification while app is running in foreground', notification)
    });
    return () => {
      subscription.remove();
    }
  }, [])

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User interacted with notification', response.notification)
    });
    return () => {
      subscription.remove();
    }
  }, [])

  return (
    <View style={styles.container}>
      {notificationsPermissions.granted === false && notificationsPermissions.canAskAgain === true &&
        <Button 
          title={'Request notification permission'} 
          onPress={async () => {
            const { canAskAgain, expires, granted, status } =
              await Notifications.requestPermissionsAsync({
                ios: {
                  allowAlert: true,
                  allowBadge: true,
                  allowSound: true,
                },
              });
            // @ts-ignore
            setNotificationsPermissions({ canAskAgain, expires, granted, status });
          }}
        />
      }
      {notificationsPermissions.granted === true &&
        <Button 
          title={'Schedule a local notification'}
          onPress={async () => {
            Notifications.scheduleNotificationAsync({
              content: { 
                title: "Title of notification",
                body: 'Body of notification',
              },
              trigger: { 
                seconds: 10,
              },
            });
          }}
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
