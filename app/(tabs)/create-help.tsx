import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProvinceDropdown } from '@/components/ui/province-dropdown';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { helpService } from '@/services/help/help-service';
import { provinceService } from '@/services/province/province-service';
import { useProfileStore } from '@/store';
import type { EssentialItem, CreateHelpRecordDto, Province } from '@/types';

const ESSENTIAL_ITEMS: EssentialItem[] = ['Medical', 'Food', 'Clothes', 'Tools'];

// Map EssentialItem to Vietnamese labels and icons
const ESSENTIAL_ITEM_CONFIG: Record<
  EssentialItem,
  { label: string; icon: string; iconName: keyof typeof MaterialIcons.glyphMap }
> = {
  Medical: { label: 'Y tế', icon: 'medical-bag', iconName: 'medical-services' },
  Food: { label: 'Thực phẩm', icon: 'food', iconName: 'restaurant' },
  Clothes: { label: 'Quần áo', icon: 'clothes', iconName: 'checkroom' },
  Tools: { label: 'Nơi trú ẩn', icon: 'shelter', iconName: 'home' },
};

export default function CreateHelpScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { profile } = useProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [formData, setFormData] = useState<CreateHelpRecordDto>({
    isForSelf: true,
    locationName: '',
    adultCount: 1,
    childCount: 0,
    phoneNumber: profile?.phoneNumber || '',
    essentialItems: [],
    latitude: undefined,
    longitude: undefined,
    address: undefined,
    mapLink: undefined,
    provinceId: undefined,
  });
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  
  // Provinces state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const provincesData = await provinceService.getAllProvinces(true);
        setProvinces(provincesData);
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  useEffect(() => {
    // Get user location if creating for self
    if (formData.isForSelf) {
      getCurrentLocation();
    }
  }, [formData.isForSelf]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập vị trí để tạo trợ giúp cho bản thân');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);
      setFormData((prev) => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleInputChange = (field: keyof CreateHelpRecordDto, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (province: Province | null) => {
    setSelectedProvince(province);
    setFormData((prev) => ({ ...prev, provinceId: province?.id }));
  };

  const resetForm = () => {
    setFormData({
      isForSelf: true,
      locationName: '',
      adultCount: 1,
      childCount: 0,
      phoneNumber: profile?.phoneNumber || '',
      essentialItems: [],
      latitude: undefined,
      longitude: undefined,
      address: undefined,
      mapLink: undefined,
      provinceId: undefined,
    });
    setSelectedProvince(null);
    setUserLocation(null);
  };

  const toggleEssentialItem = (item: EssentialItem) => {
    setFormData((prev) => {
      const currentItems = prev.essentialItems;
      const isSelected = currentItems.includes(item);
      return {
        ...prev,
        essentialItems: isSelected
          ? currentItems.filter((i) => i !== item)
          : [...currentItems, item],
      };
    });
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.locationName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên trợ giúp');
      return;
    }

    if (formData.adultCount < 0 || formData.childCount < 0) {
      Alert.alert('Lỗi', 'Số lượng người không hợp lệ');
      return;
    }

    if (formData.adultCount === 0 && formData.childCount === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng người cần trợ giúp');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    const cleanedPhone = formData.phoneNumber.replace(/\s/g, '');
    if (!/^[0-9]{10,15}$/.test(cleanedPhone)) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ (10-15 chữ số)');
      return;
    }

    if (formData.essentialItems.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một nhu yếu phẩm');
      return;
    }

    if (!formData.provinceId) {
      Alert.alert('Lỗi', 'Vui lòng chọn tỉnh thành');
      return;
    }

    // Validate location requirements
    if (formData.isForSelf) {
      if (!formData.latitude || !formData.longitude) {
        Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
        return;
      }
    }

    setIsLoading(true);
    try {
      await helpService.createHelpRecord(formData);
      // Clear form
      resetForm();
      // Navigate back to home
      router.back();
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Thành công', 'Đã tạo yêu cầu trợ giúp thành công!');
      }, 300);
    } catch (error) {
      console.error('Failed to create help record:', error);
      Alert.alert('Lỗi', 'Không thể tạo yêu cầu trợ giúp. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const colors = Colors[colorScheme ?? 'light'];
  const primaryColor = colors.tint; // Use tint color instead of red

  const adjustCount = (type: 'adult' | 'child', delta: number) => {
    const field = type === 'adult' ? 'adultCount' : 'childCount';
    const currentValue = formData[field];
    const newValue = Math.max(0, currentValue + delta);
    handleInputChange(field, newValue);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          Tạo trợ giúp
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>

            {/* Help Name Input */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Tên trợ giúp</ThemedText>
              <View style={[styles.textInputContainer, { backgroundColor: colors.background, borderColor: '#E5E5EA' }]}>
                <MaterialIcons name="title" size={20} color={colors.icon} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Nhập tên trợ giúp (ví dụ: Thôn 12, Xã ABC...)"
                  placeholderTextColor={colors.icon}
                  value={formData.locationName}
                  onChangeText={(text) => handleInputChange('locationName', text)}
                  editable={!isLoading}
                  maxLength={200}
                />
              </View>
            </View>

            {/* Number of People Selection */}
            <View style={styles.section}>
              <View style={[styles.personCard, { backgroundColor: colors.background, borderColor: '#E5E5EA' }]}>
                <ThemedText style={styles.personLabel}>Người lớn</ThemedText>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: primaryColor }]}
                    onPress={() => adjustCount('adult', -1)}
                    disabled={isLoading || formData.adultCount === 0}>
                    <MaterialIcons name="remove" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <ThemedText style={styles.counterValue}>{formData.adultCount}</ThemedText>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: primaryColor }]}
                    onPress={() => adjustCount('adult', 1)}
                    disabled={isLoading}>
                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.personCard, { backgroundColor: colors.background, borderColor: '#E5E5EA' }]}>
                <ThemedText style={styles.personLabel}>Trẻ em</ThemedText>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: primaryColor }]}
                    onPress={() => adjustCount('child', -1)}
                    disabled={isLoading || formData.childCount === 0}>
                    <MaterialIcons name="remove" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <ThemedText style={styles.counterValue}>{formData.childCount}</ThemedText>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: primaryColor }]}
                    onPress={() => adjustCount('child', 1)}
                    disabled={isLoading}>
                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Select Help Type */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Chọn trợ giúp</ThemedText>
              <View style={styles.helpTypeGrid}>
                {ESSENTIAL_ITEMS.map((item) => {
                  const isSelected = formData.essentialItems.includes(item);
                  const config = ESSENTIAL_ITEM_CONFIG[item];
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.helpTypeButton,
                        {
                          backgroundColor: isSelected
                            ? primaryColor + '20'
                            : colors.background,
                          borderColor: isSelected ? primaryColor : '#E5E5EA',
                        },
                      ]}
                      onPress={() => toggleEssentialItem(item)}
                      disabled={isLoading}>
                      <MaterialIcons
                        name={config.iconName}
                        size={32}
                        color={isSelected ? primaryColor : colors.icon}
                      />
                      <ThemedText
                        style={[
                          styles.helpTypeLabel,
                          { color: isSelected ? primaryColor : colors.text },
                        ]}>
                        {config.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Province Selection */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Chọn tỉnh thành</ThemedText>
              <ProvinceDropdown
                provinces={provinces}
                selectedProvince={selectedProvince}
                onSelectProvince={handleProvinceChange}
                placeholder="Chọn tỉnh thành"
              />
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Thông tin liên hệ</ThemedText>
              <View style={[styles.phoneInputContainer, { backgroundColor: colors.background, borderColor: '#E5E5EA' }]}>
                <MaterialIcons name="phone" size={20} color={colors.icon} />
                <TextInput
                  style={[styles.phoneInput, { color: colors.text }]}
                  placeholder="Your Phone Number"
                  placeholderTextColor={colors.icon}
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', formatPhoneNumber(text))}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  maxLength={15}
                />
              </View>
            </View>

            {/* Automatic Address Detection */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Tự động xác định địa chỉ</ThemedText>
              {isLoadingLocation ? (
                <View style={[styles.locationCard, { backgroundColor: colors.background, borderColor: '#E5E5EA' }]}>
                  <ActivityIndicator size="small" color={primaryColor} />
                  <ThemedText style={styles.locationText}>Đang lấy vị trí...</ThemedText>
                </View>
              ) : userLocation ? (
                <View style={[styles.locationCard, { backgroundColor: colors.background, borderColor: '#E5E5EA' }]}>
                  <MaterialIcons name="place" size={24} color={primaryColor} />
                  <View style={styles.locationInfo}>
                    <ThemedText style={styles.locationCoordinates}>
                      {userLocation.coords.latitude.toFixed(4)} N, {Math.abs(userLocation.coords.longitude).toFixed(4)} W
                    </ThemedText>
                    <ThemedText style={styles.locationUpdated}>Updated: Just now</ThemedText>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.locationCard, { backgroundColor: colors.background, borderColor: '#E5E5EA' }]}
                  onPress={getCurrentLocation}
                  disabled={isLoading}>
                  <MaterialIcons name="place" size={24} color={primaryColor} />
                  <View style={styles.locationInfo}>
                    <ThemedText style={styles.locationCoordinates}>Tap to get location</ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* SOS / Send Button */}
            <TouchableOpacity
              style={[
                styles.sosButton,
                {
                  backgroundColor: primaryColor,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.sosButtonText}>SOS / Gởi</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  // Person Cards
  personCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  personLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  // Help Type Grid
  helpTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  helpTypeButton: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  helpTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  // Text Input
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  // Phone Input
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
  },
  // Location Card
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationCoordinates: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  locationUpdated: {
    fontSize: 12,
    color: '#8E8E93',
  },
  locationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  // SOS Button
  sosButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

