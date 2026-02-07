import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { unitsAPI, servicesAPI, doctorsAPI, appointmentsAPI } from '../../services/api';

// Configure Portuguese locale
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

interface Unit {
  id: string;
  name: string;
  address: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  unit_id: string;
  photo_base64: string | null;
  bio: string;
  available_days: string[];
}

export default function AppointmentsScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [units, setUnits] = useState<Unit[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateFormatted, setSelectedDateFormatted] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
  ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      loadDoctors();
    }
  }, [selectedUnit]);

  const loadData = async () => {
    try {
      const [unitsRes, servicesRes] = await Promise.all([
        unitsAPI.getAll(),
        servicesAPI.getAll(),
      ]);
      setUnits(unitsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    if (!selectedUnit) return;
    try {
      const response = await doctorsAPI.getAll(selectedUnit.id);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const formatDateToBrazilian = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
    setSelectedDateFormatted(formatDateToBrazilian(day.dateString));
  };

  const handleSubmit = async () => {
    if (!selectedUnit || !selectedService || !selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentsAPI.create({
        unit_id: selectedUnit.id,
        service_id: selectedService.id,
        doctor_id: selectedDoctor.id,
        date: selectedDateFormatted,
        time: selectedTime,
        notes,
      });

      Alert.alert('Sucesso', 'Agendamento realizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setStep(1);
            setSelectedUnit(null);
            setSelectedService(null);
            setSelectedDoctor(null);
            setSelectedDate('');
            setSelectedDateFormatted('');
            setSelectedTime('');
            setNotes('');
          },
        },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro ao criar agendamento';
      Alert.alert('Erro', message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <View key={s} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              step >= s && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                step >= s && styles.stepNumberActive,
              ]}
            >
              {s}
            </Text>
          </View>
          {s < 4 && (
            <View
              style={[
                styles.stepLine,
                step > s && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Escolha a Unidade</Text>
      {units.map((unit) => (
        <TouchableOpacity
          key={unit.id}
          style={[
            styles.optionCard,
            selectedUnit?.id === unit.id && styles.optionCardSelected,
          ]}
          onPress={() => {
            setSelectedUnit(unit);
            setSelectedDoctor(null);
          }}
        >
          <Ionicons
            name="location"
            size={24}
            color={selectedUnit?.id === unit.id ? '#1E88E5' : '#666'}
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>{unit.name}</Text>
            <Text style={styles.optionSubtitle}>{unit.address}</Text>
          </View>
          {selectedUnit?.id === unit.id && (
            <Ionicons name="checkmark-circle" size={24} color="#1E88E5" />
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.nextButton, !selectedUnit && styles.nextButtonDisabled]}
        onPress={() => selectedUnit && setStep(2)}
        disabled={!selectedUnit}
      >
        <Text style={styles.nextButtonText}>Próximo</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Escolha o Serviço</Text>
      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.optionCard,
              selectedService?.id === service.id && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedService(service)}
          >
            <Ionicons
              name="medical"
              size={24}
              color={selectedService?.id === service.id ? '#1E88E5' : '#666'}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{service.name}</Text>
              <Text style={styles.optionSubtitle}>{service.description}</Text>
              <Text style={styles.serviceDuration}>{service.duration_minutes} minutos</Text>
            </View>
            {selectedService?.id === service.id && (
              <Ionicons name="checkmark-circle" size={24} color="#1E88E5" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !selectedService && styles.nextButtonDisabled]}
          onPress={() => selectedService && setStep(3)}
          disabled={!selectedService}
        >
          <Text style={styles.nextButtonText}>Próximo</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Escolha o Profissional</Text>
      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
        {doctors.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={[
              styles.doctorCard,
              selectedDoctor?.id === doctor.id && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedDoctor(doctor)}
          >
            <View style={styles.doctorPhotoContainer}>
              {doctor.photo_base64 ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${doctor.photo_base64}` }}
                  style={styles.doctorPhoto}
                />
              ) : (
                <View style={styles.doctorPhotoPlaceholder}>
                  <Ionicons name="person" size={32} color="#1E88E5" />
                </View>
              )}
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <Text style={styles.doctorBio}>{doctor.bio}</Text>
              <View style={styles.availableDays}>
                {doctor.available_days.map((day, index) => (
                  <Text key={index} style={styles.dayTag}>
                    {day.substring(0, 3)}
                  </Text>
                ))}
              </View>
            </View>
            {selectedDoctor?.id === doctor.id && (
              <Ionicons name="checkmark-circle" size={24} color="#1E88E5" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !selectedDoctor && styles.nextButtonDisabled]}
          onPress={() => selectedDoctor && setStep(4)}
          disabled={!selectedDoctor}
        >
          <Text style={styles.nextButtonText}>Próximo</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Data e Horário</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            minDate={today}
            onDayPress={handleDateSelect}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#1E88E5',
              },
            }}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#666',
              selectedDayBackgroundColor: '#1E88E5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#1E88E5',
              dayTextColor: '#333',
              textDisabledColor: '#d9d9d9',
              dotColor: '#1E88E5',
              selectedDotColor: '#ffffff',
              arrowColor: '#1E88E5',
              monthTextColor: '#333',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {selectedDate && (
          <>
            <Text style={styles.timeTitle}>Selecione o Horário</Text>
            <View style={styles.timesGrid}>
              {availableTimes.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.notesLabel}>Observações (opcional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Alguma informação adicional..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo do Agendamento</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Unidade:</Text>
            <Text style={styles.summaryValue}>{selectedUnit?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Serviço:</Text>
            <Text style={styles.summaryValue}>{selectedService?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Profissional:</Text>
            <Text style={styles.summaryValue}>{selectedDoctor?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Data:</Text>
            <Text style={styles.summaryValue}>{selectedDateFormatted || '-'}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryLabel}>Horário:</Text>
            <Text style={styles.summaryValue}>{selectedTime || '-'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedDate || !selectedTime) && styles.nextButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedDate || !selectedTime || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Confirmar</Text>
              <Ionicons name="checkmark" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Agendar Consulta</Text>
      </View>
      {renderStepIndicator()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#1E88E5',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#1E88E5',
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  optionsList: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#1E88E5',
    backgroundColor: '#E3F2FD',
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  serviceDuration: {
    fontSize: 13,
    color: '#1E88E5',
    marginTop: 6,
    fontWeight: '500',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  doctorPhotoContainer: {
    marginRight: 16,
  },
  doctorPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  doctorPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#1E88E5',
    marginTop: 4,
  },
  doctorBio: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  availableDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayTag: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSlotSelected: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  timeTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
