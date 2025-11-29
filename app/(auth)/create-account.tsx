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
import { useAuthStore } from '@/store';
import { supabaseClient } from '@/services/auth/supabase-service';

export default function CreateAccountScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: params.phoneNumber || '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateAccount = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Thiếu thông tin số điện thoại');
      return;
    }

    setIsLoading(true);
    try {
      // Get current user from Supabase (should be authenticated after OTP verification)
      const {
        data: { user: supabaseUser },
        error: getUserError,
      } = await supabaseClient.auth.getUser();

      if (getUserError || !supabaseUser) {
        throw new Error('User not authenticated');
      }

      // Update user metadata in Supabase
      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phoneNumber,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Create user profile in local state
      const newUser = {
        id: supabaseUser.id,
        email: formData.email,
        name: formData.fullName,
        phoneNumber: formData.phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(newUser);

      Alert.alert('Thành công', 'Tài khoản đã được tạo thành công!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to profile screen
            router.replace('/(tabs)/profile');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to create account:', error);
      Alert.alert('Lỗi', 'Không thể tạo tài khoản. Vui lòng thử lại.');
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
              Tạo tài khoản
            </ThemedText>

            <ThemedText style={styles.description}>
              Vui lòng điền thông tin để hoàn tất đăng ký
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Họ tên *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder="Nhập họ tên"
                placeholderTextColor={colors.icon}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                editable={!isLoading}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Email *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder="Nhập email"
                placeholderTextColor={colors.icon}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.icon,
                    borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder="Số điện thoại"
                placeholderTextColor={colors.icon}
                value={formData.phoneNumber}
                editable={false}
              />
              <ThemedText style={styles.hint}>
                Số điện thoại đã được xác thực
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
              onTouchEnd={handleCreateAccount}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Hoàn tất đăng ký</ThemedText>
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

