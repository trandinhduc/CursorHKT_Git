import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store';

export default function RegisterPhoneScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { sendOTP, isLoading } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    return cleaned;
  };

  const handleSendOTP = async () => {
    const cleanedPhone = phoneNumber.replace(/\s/g, '');

    if (!cleanedPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone number (10-15 digits)
    if (!/^[0-9]{10,15}$/.test(cleanedPhone)) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ (10-15 chữ số)');
      return;
    }

    try {
      // Format phone number with country code if needed (Vietnam: +84)
      const formattedPhone = cleanedPhone.startsWith('0')
        ? `+84${cleanedPhone.slice(1)}`
        : cleanedPhone.startsWith('84')
        ? `+${cleanedPhone}`
        : `+84${cleanedPhone}`;

      await sendOTP(formattedPhone);
      // Navigate to OTP verification screen with phone number as param
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phoneNumber: formattedPhone },
      });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      Alert.alert('Lỗi', 'Không thể gửi mã OTP. Vui lòng thử lại.');
    }
  };

  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Đăng ký tài khoản
            </ThemedText>

            <ThemedText style={styles.description}>
              Nhập số điện thoại của bạn để nhận mã OTP xác thực
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={colors.icon}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                keyboardType="phone-pad"
                editable={!isLoading}
                autoFocus
                maxLength={15}
              />
              <ThemedText style={styles.hint}>
                Ví dụ: 0912345678 hoặc 0123456789
              </ThemedText>
            </View>

            <ThemedView
              style={[
                styles.button,
                {
                  backgroundColor: colors.tint,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onTouchEnd={handleSendOTP}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Gửi mã OTP</ThemedText>
              )}
            </ThemedView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

