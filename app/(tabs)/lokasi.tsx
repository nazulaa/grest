import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onValue, ref, remove } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebase/firebaseConfig';

interface PlantPoint {
  id: string;
  name: string;
  coordinates: string;
  date: string;
  accuration: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LokasiScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [plants, setPlants] = useState<PlantPoint[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data dari Firebase
  useEffect(() => {
    const pointsRef = ref(db, 'points');
    
    const unsubscribe = onValue(pointsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Convert object to array
        const plantsArray: PlantPoint[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        
        // Sort by newest first
        plantsArray.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });
        
        setPlants(plantsArray);
        setFilteredPlants(plantsArray);
      } else {
        setPlants([]);
        setFilteredPlants([]);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data dari database');
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredPlants(plants);
    } else {
      const filtered = plants.filter(plant =>
        plant.name?.toLowerCase().includes(text.toLowerCase()) ||
        plant.coordinates?.toLowerCase().includes(text.toLowerCase()) ||
        plant.date?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPlants(filtered);
    }
  };

  // Handle Edit
  const handleEdit = (plant: PlantPoint) => {
    router.push({
      pathname: '/formeditlocation',
      params: { 
        id: plant.id,
        name: plant.name,
        coordinates: plant.coordinates,
        date: plant.date,
        accuration: plant.accuration,
        photoUrl: plant.photoUrl || ''
      }
    });
  };

  // Handle Delete
  const handleDelete = (plant: PlantPoint) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus "${plant.name}"?`,
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const pointRef = ref(db, `points/${plant.id}`);
              await remove(pointRef);
              Alert.alert('Berhasil', 'Data berhasil dihapus');
            } catch (error) {
              console.error('Error deleting point:', error);
              Alert.alert('Error', 'Gagal menghapus data');
            }
          }
        }
      ]
    );
  };

  // Format koordinat untuk ditampilkan
  const formatCoordinates = (coords: string) => {
    if (!coords) return 'N/A';
    const parts = coords.split(',');
    if (parts.length !== 2) return coords;
    return `${parseFloat(parts[0]).toFixed(6)}, ${parseFloat(parts[1]).toFixed(6)}`;
  };

  // Render Plant Card
  const renderPlantCard = ({ item }: { item: PlantPoint }) => (
    <View style={styles.plantCard}>
      {/* Image */}
      {item.photoUrl ? (
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.plantImage}
        />
      ) : (
        <View style={[styles.plantImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}><MaterialIcons name="location-pin" size={24} color="red" /></Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.plantInfo}>
        <Text style={styles.plantName} numberOfLines={1}>
          {item.name || 'Tanpa Nama'}
        </Text>
        <Text style={styles.plantDetails} numberOfLines={1}>
          📍 {formatCoordinates(item.coordinates)}
        </Text>
        <Text style={styles.plantLocation} numberOfLines={1}>
          📅 {item.date || 'N/A'} • 🎯 {item.accuration || 'N/A'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <MaterialIcons name="edit" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <MaterialIcons name="delete" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plant List</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2d5016" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant List</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#ffffff" style={styles.materialSearchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Telusuri Tanaman..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Plant Count */}
        <Text style={styles.countText}>
          Total Lokasi: {filteredPlants.length}
        </Text>

        {/* Empty State */}
        {filteredPlants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data lokasi'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/forminputlocation')}
              >
                <Text style={styles.addButtonText}>+ Tambah Lokasi</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Plant List */
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id}
            renderItem={renderPlantCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5d9c0',
  },
  header: {
    backgroundColor: '#2d5016',
    paddingTop: 25,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d5016',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  materialSearchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 10,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f1e8',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2d5016',
    alignItems: 'center',
  },
  plantImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#d0d0d0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 30,
  },
  plantInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 4,
  },
  plantDetails: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  plantLocation: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2d5016',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2d5016',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});