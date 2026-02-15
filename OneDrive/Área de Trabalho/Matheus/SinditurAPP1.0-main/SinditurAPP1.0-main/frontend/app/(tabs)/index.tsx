import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const features = [
    {
      icon: 'calendar',
      title: 'Agendamento Online',
      description: 'Agende sua consulta de forma rápida e prática',
    },
    {
      icon: 'people',
      title: 'Profissionais Qualificados',
      description: 'Equipe especializada para cuidar do seu sorriso',
    },
    {
      icon: 'location',
      title: '2 Unidades',
      description: 'Escolha a unidade mais próxima de você',
    },
    {
      icon: 'time',
      title: 'Histórico Completo',
      description: 'Acompanhe todas as suas consultas',
    },
  ];

  const services = [
    { name: 'Limpeza', icon: 'sparkles' },
    { name: 'Clareamento', icon: 'sunny' },
    { name: 'Restauração', icon: 'construct' },
    { name: 'Ortodontia', icon: 'git-branch' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subGreeting}>Bem-vindo ao Odonto Sinditur</Text>
          </View>
          <Image
            source={require('../../assets/images/logo.jpg')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Cuide do seu sorriso!</Text>
            <Text style={styles.bannerText}>
              Agende sua consulta e mantenha sua saúde bucal em dia
            </Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => router.push('/(tabs)/appointments')}
            >
              <Text style={styles.bannerButtonText}>Agendar Agora</Text>
              <Ionicons name="arrow-forward" size={18} color="#1E88E5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossos Serviços</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceCard}
                onPress={() => router.push('/(tabs)/appointments')}
              >
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={service.icon as any} size={28} color="#1E88E5" />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por que escolher a Odonto Sinditur?</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon as any} size={24} color="#1E88E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Nossas Unidades</Text>
          <View style={styles.unitCard}>
            <Ionicons name="location" size={24} color="#1E88E5" />
            <View style={styles.unitInfo}>
              <Text style={styles.unitName}>Unidade Sinditur - Flores</Text>
              <Text style={styles.unitAddress}>Rua das Flores, 123 - Flores</Text>
            </View>
          </View>
          <View style={styles.unitCard}>
            <Ionicons name="location" size={24} color="#1E88E5" />
            <View style={styles.unitInfo}>
              <Text style={styles.unitName}>Unidade Centro</Text>
              <Text style={styles.unitAddress}>Av. Central, 456 - Centro</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  banner: {
    margin: 20,
    backgroundColor: '#1E88E5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    padding: 24,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 16,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#1E88E5',
    fontWeight: 'bold',
    marginRight: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  contactSection: {
    padding: 20,
    paddingBottom: 40,
  },
  unitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unitInfo: {
    marginLeft: 16,
  },
  unitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
