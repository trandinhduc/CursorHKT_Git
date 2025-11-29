import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

function HeaderBackButton() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ marginLeft: 8 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialIcons name="arrow-back" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: "card",
      }}
    >
      <Stack.Screen
        name="register-phone"
        options={{
          title: "Đăng ký",
          headerBackTitle: "Trở lại",
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="verify-otp"
        options={{
          title: "Xác thực OTP",
          headerBackTitle: "Trở lại",
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="create-account"
        options={{
          title: "Tạo tài khoản",
          headerBackTitle: "Trở lại",
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="team-registration"
        options={{
          title: "Tên đơn vị cứu trợ",
          headerBackTitle: "Trở lại",
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="login-phone"
        options={{
          title: "Đăng nhập",
          headerBackTitle: "Trở lại",
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="login-otp"
        options={{
          title: "Xác thực OTP",
          headerBackTitle: "Trở lại",
          headerBackVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
