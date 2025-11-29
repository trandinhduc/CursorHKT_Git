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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store';

export default function VerifyOTPScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const { verifyOTP, sendOTP, isLoading } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const phoneNumber = params.phoneNumber || '';

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Thiếu thông tin số điện thoại');
      router.back();
      return;
    }

    try {
      await verifyOTP(phoneNumber, otp);
      // Navigate to create account screen with phone number
      router.push({
        pathname: '/(auth)/create-account',
        params: { phoneNumber },
      });
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      Alert.alert('Lỗi', 'Mã OTP không hợp lệ. Vui lòng thử lại.');
      setOtp('');
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return;
    }

    try {
      await sendOTP(phoneNumber);
      setResendCooldown(60); // 60 seconds cooldown
      Alert.alert('Thành công', 'Mã OTP đã được gửi lại');
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      Alert.alert('Lỗi', 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
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
              Xác thực OTP
            </ThemedText>

            <ThemedText style={styles.description}>
              Chúng tôi đã gửi mã OTP đến số điện thoại{'\n'}
              <ThemedText style={styles.phoneNumber}>{phoneNumber}</ThemedText>
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Nhập mã OTP</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder="Nhập 6 chữ số"
                placeholderTextColor={colors.icon}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
                autoFocus
              />
            </View>

            <ThemedView
              style={[
                styles.button,
                {
                  backgroundColor: colors.tint,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onTouchEnd={handleVerifyOTP}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Xác thực</ThemedText>
              )}
            </ThemedView>

            <ThemedView
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.tint,
                  opacity: resendCooldown > 0 ? 0.5 : 1,
                },
              ]}
              onTouchEnd={handleResendOTP}
              disabled={resendCooldown > 0 || isLoading}>
              <ThemedText style={[styles.secondaryButtonText, { color: colors.tint }]}>
                {resendCooldown > 0
                  ? `Gửi lại mã sau ${resendCooldown}s`
                  : 'Gửi lại mã OTP'}
              </ThemedText>
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
    textAlign: 'center',
  },
  phoneNumber: {
    fontWeight: '600',
    opacity: 1,
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
    fontSize: 24,
    borderWidth: 1,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
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
  secondaryButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

