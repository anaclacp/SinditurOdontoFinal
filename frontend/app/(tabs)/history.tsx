import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { appointmentsAPI } from '../../services/api';

interface Appointment {
  id: string;
  user_id: string;
  unit_id: string;
  unit_name: string;
  service_id: string;
  service_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function HistoryScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'agendado' | 'cancelado'>('todos');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppointments();
  }, []);

  const handleCancel = (appointmentId: string) => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentsAPI.cancel(appointmentId);
              Alert.alert('Sucesso', 'Agendamento cancelado');
              loadAppointments();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento');
            }
          },
        },
      ]
    );
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'todos') return true;
    return apt.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return '#4CAF50';
      case 'cancelado':
        return '#F44336';
      case 'concluido':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'cancelado':
        return 'Cancelado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Histórico</Text>
        <Text style={styles.headerSubtitle}>
          {appointments.length} agendamento(s)
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['todos', 'agendado', 'cancelado'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && styles.filterTabActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'todos' ? 'Todos' : f === 'agendado' ? 'Agendados' : 'Cancelados'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'todos'
                ? 'Você ainda não fez nenhum agendamento'
                : `Nenhum agendamento com status "${getStatusText(filter)}"`}
            </Text>
          </View>
        ) : (
          filteredAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar" size={18} color="#1E88E5" />
                  <Text style={styles.dateText}>{appointment.date}</Text>
                  <Ionicons name="time" size={18} color="#1E88E5" style={{ marginLeft: 12 }} />
                  <Text style={styles.dateText}>{appointment.time}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(appointment.status) },
                    ]}
                  >
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="medical" size={18} color="#666" />
                  <Text style={styles.infoText}>{appointment.service_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={18} color="#666" />
                  <Text style={styles.infoText}>{appointment.doctor_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={18} color="#666" />
                  <Text style={styles.infoText}>{appointment.unit_name}</Text>
                </View>
                {appointment.notes ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text" size={18} color="#666" />
                    <Text style={styles.infoText}>{appointment.notes}</Text>
                  </View>
                ) : null}
              </View>

              {appointment.status === 'agendado' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(appointment.id)}
                >
                  <Ionicons name="close-circle" size={18} color="#F44336" />
                  <Text style={styles.cancelButtonText}>Cancelar Agendamento</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  filterTabActive: {
    backgroundColor: '#1E88E5',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF5F5',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
});
