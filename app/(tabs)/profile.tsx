import React from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { profile, isAuthenticated, clearProfile } = useProfileStore();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          clearProfile();
        },
      },
    ]);
  };

  const handleLogin = () => {
    router.push('/(auth)/login-phone');
  };

  const handleRegister = () => {
    router.push('/(auth)/team-registration');
  };

  const colors = Colors[colorScheme ?? 'light'];

  if (isAuthenticated && profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedView style={styles.content}>
              <ThemedText type="title" style={styles.title}>
                Profile
              </ThemedText>

              <ThemedView style={styles.userInfo}>
                <ThemedText type="subtitle" style={styles.label}>
                  Tên trưởng đoàn
                </ThemedText>
                <ThemedText style={styles.value}>{profile.teamLeaderName || 'N/A'}</ThemedText>

                <ThemedText type="subtitle" style={[styles.label, styles.marginTop]}>
                  Số điện thoại
                </ThemedText>
                <ThemedText style={styles.value}>{profile.phoneNumber || 'N/A'}</ThemedText>

                <ThemedText type="subtitle" style={[styles.label, styles.marginTop]}>
                  Email
                </ThemedText>
                <ThemedText style={styles.value}>{profile.email || 'N/A'}</ThemedText>

                <ThemedText type="subtitle" style={[styles.label, styles.marginTop]}>
                  Số lượng thành viên
                </ThemedText>
                <ThemedText style={styles.value}>{profile.memberCount || 0}</ThemedText>

                <ThemedText type="subtitle" style={[styles.label, styles.marginTop]}>
                  Nhu yếu phẩm
                </ThemedText>
                <ThemedText style={styles.value}>
                  {profile.essentialItems && profile.essentialItems.length > 0
                    ? profile.essentialItems.join(', ')
                    : 'Chưa có'}
                </ThemedText>
              </ThemedView>

              <ThemedView
                style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]}
                onTouchEnd={handleLogout}>
                <ThemedText style={styles.logoutButtonText}>Đăng xuất</ThemedText>
              </ThemedView>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Profile
            </ThemedText>

            <ThemedText style={styles.description}>
              Vui lòng đăng nhập để xem thông tin profile
            </ThemedText>

            <ThemedView
              style={[
                styles.button,
                {
                  backgroundColor: colors.tint,
                },
              ]}
              onTouchEnd={handleLogin}>
              <ThemedText style={styles.buttonText}>Đăng nhập</ThemedText>
            </ThemedView>

            <ThemedView
              style={[styles.secondaryButton, { borderColor: colors.tint, marginTop: 12 }]}
              onTouchEnd={handleRegister}>
              <ThemedText style={[styles.secondaryButtonText, { color: colors.tint }]}>
                Đăng ký tài khoản mới
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
  userInfo: {
    marginTop: 32,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  value: {
    fontSize: 18,
    marginTop: 4,
  },
  marginTop: {
    marginTop: 24,
  },
  logoutButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

