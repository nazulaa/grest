import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Svg, { Circle } from 'react-native-svg';

interface VegetationDonutChartProps {
  vegetationPercentage?: number;
  nonVegetationPercentage?: number;
  participants?: number;
}

const VegetationDonutChart: React.FC<VegetationDonutChartProps> = ({
  vegetationPercentage = 65,
  nonVegetationPercentage = 35,
  participants = 100,
}) => {
  // SVG circle properties for donut chart
  const size = 100;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke offset for vegetation area
  const vegetationOffset = circumference - (vegetationPercentage / 100) * circumference;

  return (
    <View style={styles.card}>
      <View style={styles.leftContent}>
        <ThemedText style={styles.title}>Vegetation Rate</ThemedText>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Vegetation Area</ThemedText>
            <ThemedText style={styles.statValue}>{vegetationPercentage}%</ThemedText>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Non-Vegetation Area</ThemedText>
            <ThemedText style={styles.statValue}>{nonVegetationPercentage}%</ThemedText>
          </View>
        </View>
        
        <View style={styles.participantRow}>
          <ThemedText style={styles.participantLabel}>Planting Participants :</ThemedText>
          <ThemedText style={styles.participantValue}> ??? </ThemedText>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {/* Background circle (non-vegetation) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#d4c5b3"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Foreground circle (vegetation) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2d5016"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={vegetationOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f5f1e8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 16,
  },
  statsRow: {
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 12,
    color: '#2d5016',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d5016',
  },
  participantRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d4c5b3',
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantLabel: {
    fontSize: 13,
    color: '#2d5016',
    fontWeight: '600',
  },
  participantValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VegetationDonutChart;