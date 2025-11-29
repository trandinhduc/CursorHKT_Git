import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabaseClient } from "@/services/auth/supabase-service";
import type { CreateTeamDto, EssentialItem } from "@/types";

const ESSENTIAL_ITEMS: EssentialItem[] = [
  "Medical",
  "Food",
  "Clothes",
  "Tools",
];

// Map EssentialItem to Vietnamese labels and icons
const ESSENTIAL_ITEM_CONFIG: Record<
  EssentialItem,
  { label: string; iconName: keyof typeof MaterialIcons.glyphMap }
> = {
  Food: { label: "Thức ăn", iconName: "restaurant" },
  Medical: { label: "Y tế", iconName: "medical-services" },
  Clothes: { label: "Quần áo", iconName: "checkroom" },
  Tools: { label: "Nơ trú ẩn an toàn", iconName: "home" },
};

const PRIMARY_COLOR = "#FF3B30"; // Red color from design

export default function TeamRegistrationScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTeamDto>({
    teamLeaderName: "",
    phoneNumber: "",
    email: "",
    memberCount: 1,
    essentialItems: [],
  });

  const handleInputChange = (
    field: keyof CreateTeamDto,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    return cleaned;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.teamLeaderName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên trưởng đoàn");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    // Validate phone number (10-15 digits)
    const cleanedPhone = formData.phoneNumber.replace(/\s/g, "");
    if (!/^[0-9]{10,15}$/.test(cleanedPhone)) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ (10-15 chữ số)");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ");
      return;
    }

    if (formData.memberCount < 1) {
      Alert.alert("Lỗi", "Số lượng thành viên phải lớn hơn 0");
      return;
    }

    if (formData.essentialItems.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một nhu yếu phẩm");
      return;
    }

    setIsLoading(true);
    try {
      // Format phone number with country code if needed (Vietnam: +84)
      const formattedPhone = cleanedPhone.startsWith("0")
        ? `+84${cleanedPhone.slice(1)}`
        : cleanedPhone.startsWith("84")
        ? `+${cleanedPhone}`
        : cleanedPhone.startsWith("+")
        ? cleanedPhone
        : `+84${cleanedPhone}`;

      // Prepare team data
      const teamData = {
        phone_number: formattedPhone,
        team_leader_name: formData.teamLeaderName.trim(),
        email: formData.email.trim(),
        member_count: formData.memberCount,
        essential_items: formData.essentialItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert team data into Supabase
      const { data, error } = await supabaseClient
        .from("teams")
        .insert(teamData)
        .select()
        .single();

      if (error) {
        // If team already exists (phone number conflict), update instead
        if (error.code === "23505") {
          const { data: updatedData, error: updateError } = await supabaseClient
            .from("teams")
            .update({
              team_leader_name: formData.teamLeaderName.trim(),
              email: formData.email.trim(),
              member_count: formData.memberCount,
              essential_items: formData.essentialItems,
              updated_at: new Date().toISOString(),
            })
            .eq("phone_number", formattedPhone)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          Alert.alert("Thành công", "Thông tin đội đã được cập nhật!", [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/profile");
              },
            },
          ]);
          return;
        }
        throw error;
      }

      Alert.alert("Thành công", "Đăng ký đội thành công!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)/profile");
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to register team:", error);
      Alert.alert("Lỗi", "Không thể đăng ký đội. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const colors = Colors[colorScheme ?? "light"];

  const adjustMemberCount = (delta: number) => {
    const newValue = Math.max(1, formData.memberCount + delta);
    handleInputChange("memberCount", newValue);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background, marginTop: -60 },
      ]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.content}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Tên trưởng đoàn</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
                    borderColor: colorScheme === "dark" ? "#3A3A3C" : "#E5E5EA",
                  },
                ]}
              >
                <MaterialIcons
                  name="person"
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Họ và tên"
                  placeholderTextColor={colors.icon}
                  value={formData.teamLeaderName}
                  onChangeText={(value) =>
                    handleInputChange("teamLeaderName", value)
                  }
                  editable={!isLoading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
                    borderColor: colorScheme === "dark" ? "#3A3A3C" : "#E5E5EA",
                  },
                ]}
              >
                <MaterialIcons
                  name="phone"
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="091.999.999"
                  placeholderTextColor={colors.icon}
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    handleInputChange("phoneNumber", formatPhoneNumber(text))
                  }
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  maxLength={15}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Email</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
                    borderColor: colorScheme === "dark" ? "#3A3A3C" : "#E5E5EA",
                  },
                ]}
              >
                <MaterialIcons
                  name="email"
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="john.doe@example.com"
                  placeholderTextColor={colors.icon}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                Số lượng thành viên
              </ThemedText>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[
                    styles.stepperButton,
                    { backgroundColor: PRIMARY_COLOR },
                  ]}
                  onPress={() => adjustMemberCount(-1)}
                  disabled={isLoading || formData.memberCount === 1}
                >
                  <MaterialIcons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <ThemedText style={styles.stepperValue}>
                  {formData.memberCount}
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.stepperButton,
                    { backgroundColor: PRIMARY_COLOR },
                  ]}
                  onPress={() => adjustMemberCount(1)}
                  disabled={isLoading}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                Tôi có thể hỗ trợ các nhu yếu phẩm:
              </ThemedText>
              <View style={styles.itemsGrid}>
                {ESSENTIAL_ITEMS.map((item) => {
                  const isSelected = formData.essentialItems.includes(item);
                  const config = ESSENTIAL_ITEM_CONFIG[item];
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.itemCard,
                        {
                          backgroundColor: isSelected
                            ? PRIMARY_COLOR + "20"
                            : colorScheme === "dark"
                            ? "#2C2C2E"
                            : "#FFFFFF",
                          borderColor: isSelected ? PRIMARY_COLOR : "#E5E5EA",
                        },
                      ]}
                      onPress={() => toggleEssentialItem(item)}
                      disabled={isLoading}
                    >
                      <MaterialIcons
                        name={config.iconName}
                        size={32}
                        color={isSelected ? PRIMARY_COLOR : colors.icon}
                      />
                      <ThemedText
                        style={[
                          styles.itemCardText,
                          { color: isSelected ? PRIMARY_COLOR : colors.text },
                        ]}
                      >
                        {config.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: PRIMARY_COLOR,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>Đăng ký</ThemedText>
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1C1C1E",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
    color: "#1C1C1E",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  itemCard: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  itemCardText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
