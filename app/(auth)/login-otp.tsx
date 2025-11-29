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
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfileStore, useAuthStore } from '@/store';
import { teamService } from '@/services/team/team-service';
import { supabaseService } from '@/services/auth/supabase-service';

const DEFAULT_OTP = '111111';

export default function LoginOTPScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const { setProfile } = useProfileStore();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');

  const phoneNumber = params.phoneNumber || '';

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

    setIsLoading(true);
    try {
      // Check if OTP is the default OTP (111111)
      if (otp !== DEFAULT_OTP) {
        Alert.alert('Lỗi', 'Mã OTP không hợp lệ. Vui lòng thử lại.');
        setOtp('');
        setIsLoading(false);
        return;
      }

      // Phone number is already formatted from login-phone screen
      // Just ensure it's clean (remove spaces if any)
      const formattedPhone = phoneNumber.replace(/\s/g, '');

      // First, try to send OTP and verify with Supabase to create a session
      // This will persist the session automatically
      try {
        // Send OTP first (if not already sent)
        await supabaseService.signInWithPhone(formattedPhone);
        // Then verify with the default OTP
        // Note: This might fail if Supabase doesn't accept the default OTP
        // In that case, we'll continue with team lookup
        const { user: supabaseUser } = await supabaseService.verifyOTP(
          formattedPhone,
          otp,
          'sms'
        );
        
        if (supabaseUser) {
          // Create user in auth store from Supabase user
          const metadata = supabaseUser.user_metadata || {};
          const authUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || metadata.email || `${formattedPhone}@example.com`,
            name: metadata.full_name || metadata.name || formattedPhone,
            phoneNumber: formattedPhone,
            createdAt: supabaseUser.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          useAuthStore.getState().setUser(authUser);
          console.log('Supabase session created successfully');
        }
      } catch (authError) {
        // If Supabase auth fails (e.g., OTP not valid with Supabase),
        // we'll still continue with team lookup and create a local session
        console.warn('Supabase auth failed, creating local session:', authError);
        
        // Create a local user session even if Supabase auth fails
        // This ensures the user is logged in locally
        const localUser = {
          id: `local_${formattedPhone}`,
          email: `${formattedPhone}@example.com`,
          name: formattedPhone,
          phoneNumber: formattedPhone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        useAuthStore.getState().setUser(localUser);
      }

      // Get team/user information from Supabase
      const team = await teamService.getTeamByPhone(formattedPhone);

      if (!team) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin tài khoản với số điện thoại này.');
        setOtp('');
        setIsLoading(false);
        return;
      }

      // Save profile to Zustand store
      setProfile(team);

      Alert.alert('Thành công', 'Đăng nhập thành công!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to profile screen
            router.replace('/(tabs)/profile');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to verify OTP and get user info:', error);
      Alert.alert('Lỗi', 'Không thể đăng nhập. Vui lòng thử lại.');
      setOtp('');
    } finally {
      setIsLoading(false);
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
              Nhập mã OTP để đăng nhập{'\n'}
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
              <ThemedText style={styles.hint}>
                Mã OTP mặc định: {DEFAULT_OTP}
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
              onTouchEnd={handleVerifyOTP}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Đăng nhập</ThemedText>
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
  hint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
    textAlign: 'center',
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

