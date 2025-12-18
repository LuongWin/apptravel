import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { seedTours } from '@/scripts/seedTours';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);

  const handleSeedData = async () => {
    Alert.alert(
      'Thêm dữ liệu mẫu',
      'Bạn có muốn thêm dữ liệu tour mẫu vào Firebase?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await seedTours();
              Alert.alert(
                'Thành công!',
                `Đã thêm ${result.count} tour mẫu vào Firebase`
              );
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể thêm dữ liệu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Quản lý Tour Du lịch</ThemedText>
        <ThemedText>
          Ứng dụng quản lý tour du lịch với các chức năng: Quản lý chuyến bay, khách sạn và tour du lịch.
        </ThemedText>

        <TouchableOpacity
          style={[styles.seedButton, loading && styles.seedButtonDisabled]}
          onPress={handleSeedData}
          disabled={loading}
        >
          <Text style={styles.seedButtonText}>
            {loading ? '⏳ Đang thêm...' : '🎯 Thêm dữ liệu Tour mẫu'}
          </Text>
        </TouchableOpacity>
      </ThemedView> */}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Các tính năng chính</ThemedText>
        <ThemedText>✈️ Quản lý chuyến bay</ThemedText>
        <ThemedText>🏨 Quản lý khách sạn</ThemedText>
        <ThemedText>🌍 Quản lý tour du lịch</ThemedText>
        <ThemedText>📱 Giao diện thân thiện, dễ sử dụng</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Khám phá thêm</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Tours" icon="globe" onPress={() => alert('Tours')} />
            <Link.MenuAction
              title="Flights"
              icon="airplane"
              onPress={() => alert('Flights')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Hotels"
                icon="building.2"
                onPress={() => alert('Hotels')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          Nhấn vào các tab bên dưới để khám phá các tính năng của ứng dụng.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  seedButton: {
    backgroundColor: '#5B7FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  seedButtonDisabled: {
    backgroundColor: '#CCC',
  },
  seedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
