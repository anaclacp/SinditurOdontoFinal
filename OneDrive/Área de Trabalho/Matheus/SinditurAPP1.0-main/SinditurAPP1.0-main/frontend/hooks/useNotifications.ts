import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import { appointmentsAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Notifications: any = null;

// Dynamically import expo-notifications only on native platforms
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.log('expo-notifications not available');
  }
}

export function useNotifications() {
  const notificationListener = useRef<any>();
  const appState = useRef(AppState.currentState);

  const checkAndScheduleReminders = useCallback(async () => {
    if (!Notifications) return;
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await appointmentsAPI.getReminders();
      const reminders = response.data.reminders || [];

      // Cancel all existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const reminder of reminders) {
        const [day, month, year] = reminder.date.split('/');
        const [hour, minute] = reminder.time.split(':');
        
        const appointmentDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute)
        );

        // Schedule notification 24 hours before
        const notifDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
        const now = new Date();

        if (notifDate > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Lembrete de Consulta',
              body: `Sua consulta com ${reminder.doctor_name} (${reminder.service_name}) esta agendada para amanha as ${reminder.time} na ${reminder.unit_name}`,
              sound: 'default',
              data: { appointmentId: reminder.id },
            },
            trigger: {
              type: 'date',
              date: notifDate,
            },
          });
        }

        // Also schedule a 1-hour before reminder
        const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
        if (oneHourBefore > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Consulta em 1 hora!',
              body: `Lembrete: ${reminder.service_name} com ${reminder.doctor_name} as ${reminder.time}`,
              sound: 'default',
              data: { appointmentId: reminder.id },
            },
            trigger: {
              type: 'date',
              date: oneHourBefore,
            },
          });
        }
      }
    } catch (error) {
      console.log('Error checking reminders:', error);
    }
  }, []);

  useEffect(() => {
    if (!Notifications) return;

    const registerForPushNotifications = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Notification permission not granted');
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Lembretes de Consulta',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
          });
        }
      } catch (error) {
        console.log('Error registering for push notifications:', error);
      }
    };

    registerForPushNotifications();

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
    });

    // Check on app foreground
    const subscription = AppState.addEventListener('change', (nextAppState: string) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkAndScheduleReminders();
      }
      appState.current = nextAppState as any;
    });

    // Initial check
    checkAndScheduleReminders();

    // Check every 30 minutes
    const interval = setInterval(checkAndScheduleReminders, 30 * 60 * 1000);

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      subscription.remove();
      clearInterval(interval);
    };
  }, [checkAndScheduleReminders]);

  return { checkAndScheduleReminders };
}
