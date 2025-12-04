import GeeMapCard from '@/components/GeeMapCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import VegetationDonutChart from '@/components/VegetationDonutChart'; // Import komponen donut chart
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {/* Header dengan warna hijau gelap */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Home</ThemedText>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* GEE Map Analysis Card */}
        <View style={styles.geeMapCardContainer}>
          <ThemedText style={styles.geeMapTitle}>NDVI Analysis</ThemedText>
          <GeeMapCard />
        </View>

        {/* Vegetation Rate Card dengan Grafik Donut */}
        <VegetationDonutChart 
          vegetationPercentage={69} 
          nonVegetationPercentage={31} 
        />

        {/* Menu Section */}
        <ThemedText style={styles.menuTitle}>Menu</ThemedText>
        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/mapwebview')}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="map" size={30} color="#2d5016" />
            </View>
            <ThemedText style={styles.menuText}>Maps</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/gee')}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="bar-chart" size={30} color="#2d5016" />
            </View>
            <ThemedText style={styles.menuText}>Analysis</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./forminputlocation')}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="add-location" size={30} color="#2d5016" />
            </View>
            <ThemedText style={styles.menuText}>Add Yours</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/lokasi')}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="local-florist" size={30} color="#2d5016" />
            </View>
            <ThemedText style={styles.menuText}>Plants</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Green Info Section */}
        <ThemedText style={styles.infoSectionTitle}>Did You Know?</ThemedText>
        <View style={styles.infoSectionCard}>
          <MaterialIcons name="eco" size={40} color="#2d5016" />
          <View style={styles.infoSectionTextContainer}>
            <ThemedText style={styles.infoSectionTitleText}>The Importance of Green Spaces</ThemedText>
            <ThemedText style={styles.infoSectionContentText}>
              Urban vegetation helps reduce air pollution, lower temperatures, and improve the mental well-being of residents.
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5d9c0',
  },
  header: {
    backgroundColor: '#2d5016',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  geeMapCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  geeMapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 10,
    textAlign: 'left',
  },
  infoCard: {
    backgroundColor: '#f5f1e8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoContent: {
    flex: 1,
    paddingRight: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d5016',
    marginTop: 8,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#2d5016',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutChart: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 15,
    borderColor: '#2d5016',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f1e8',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 16,
    marginTop: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#c5d9c0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2d5016',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 16,
    marginTop: 24,
  },
  infoSectionCard: {
    backgroundColor: '#e8f5e9', // a light green color
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSectionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoSectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 8,
  },
  infoSectionContentText: {
    fontSize: 14,
    color: '#2d5016',
    lineHeight: 20,
  },
});