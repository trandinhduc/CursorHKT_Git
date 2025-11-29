import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supportService } from "@/services/support/support-service";
import { teamService } from "@/services/team/team-service";
import {
  SUPPORT_STATUS_INFO,
  type HelpRecord,
  type SupportStatus,
} from "@/types";

interface HelpDetailModalProps {
  visible: boolean;
  onClose: () => void;
  helpRecord: HelpRecord | null;
  onSupportChange?: () => void; // Callback when support status changes
  onViewOnMap?: (helpRecord: HelpRecord) => void; // Callback to view location on map
}

// Format phone number to match team format (e.g., +84901234567)
const formatPhoneForTeam = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("0")) {
    return `+84${cleaned.slice(1)}`;
  } else if (cleaned.startsWith("84")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("+")) {
    return cleaned;
  } else {
    return `+84${cleaned}`;
  }
};

export const HelpDetailModal: React.FC<HelpDetailModalProps> = ({
  visible,
  onClose,
  helpRecord,
  onSupportChange,
  onViewOnMap,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [supportStatus, setSupportStatus] = useState<SupportStatus | "none">(
    "none"
  );
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);
  const [isUpdatingSupport, setIsUpdatingSupport] = useState(false);

  // Load support status when modal opens and user is authenticated
  useEffect(() => {
    const loadSupportStatus = async () => {
      if (!visible || !isAuthenticated || !user || !helpRecord?.id) {
        setSupportStatus("none");
        return;
      }

      setIsLoadingSupport(true);
      try {
        // Format phone number to match team format
        if (!user.phoneNumber) {
          setSupportStatus("none");
          return;
        }
        const formattedPhone = formatPhoneForTeam(user.phoneNumber);
        const status = await supportService.getSupportStatus(
          helpRecord.id,
          formattedPhone
        );
        setSupportStatus(status);
      } catch (error) {
        console.error("Error loading support status:", error);
        setSupportStatus("none");
      } finally {
        setIsLoadingSupport(false);
      }
    };

    loadSupportStatus();
  }, [visible, isAuthenticated, user, helpRecord?.id]);

  const handleSupport = async () => {
    if (!helpRecord?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin yêu cầu hỗ trợ");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user || !user.phoneNumber) {
      // Show login confirmation popup
      Alert.alert(
        "Đăng nhập",
        "Bạn cần đăng nhập để có thể hỗ trợ. Bạn có muốn đăng nhập ngay bây giờ?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đăng nhập",
            onPress: () => {
              onClose(); // Close modal first
              router.push("/(auth)/login-phone");
            },
          },
        ]
      );
      return;
    }

    // Check if user has a team
    setIsUpdatingSupport(true);
    try {
      if (!user.phoneNumber) {
        Alert.alert("Lỗi", "Không tìm thấy số điện thoại");
        return;
      }
      const formattedPhone = formatPhoneForTeam(user.phoneNumber);
      const team = await teamService.getTeamByPhone(formattedPhone);

      if (!team) {
        Alert.alert(
          "Chưa đăng ký đội",
          "Bạn cần đăng ký đội trước khi có thể hỗ trợ. Bạn có muốn đăng ký đội ngay bây giờ?",
          [
            {
              text: "Hủy",
              style: "cancel",
            },
            {
              text: "Đăng ký đội",
              onPress: () => {
                onClose(); // Close modal first
                router.push("/(auth)/team-registration");
              },
            },
          ]
        );
        return;
      }

      // Get current support status
      const currentHelpRecordId = helpRecord.id;
      const currentStatus = await supportService.getSupportStatus(
        currentHelpRecordId,
        formattedPhone
      );

      if (currentStatus === "none") {
        // Create new support (pending status)
        await supportService.createSupport({
          helpRecordId: currentHelpRecordId,
          teamId: formattedPhone,
          status: "pending",
        });
        setSupportStatus("pending");
        Alert.alert(
          "Thành công",
          "Bạn đã đăng ký hỗ trợ cho địa điểm này. Trạng thái: Chưa hỗ trợ"
        );
        // Notify parent to refresh
        onSupportChange?.();
      } else if (currentStatus === "pending") {
        // Update to active
        await supportService.updateSupport(
          currentHelpRecordId,
          formattedPhone,
          { status: "active" }
        );
        setSupportStatus("active");
        Alert.alert("Thành công", "Bạn đã bắt đầu hỗ trợ cho địa điểm này.");
        // Notify parent to refresh
        onSupportChange?.();
      } else if (currentStatus === "active") {
        // Update to completed - capture values for closure
        const helpRecordIdForCallback = currentHelpRecordId;
        const formattedPhoneForCallback = formattedPhone;
        Alert.alert(
          "Hoàn thành hỗ trợ",
          "Bạn có chắc chắn đã hoàn thành hỗ trợ cho địa điểm này?",
          [
            {
              text: "Hủy",
              style: "cancel",
            },
            {
              text: "Hoàn thành",
              onPress: async () => {
                await supportService.updateSupport(
                  helpRecordIdForCallback,
                  formattedPhoneForCallback,
                  { status: "completed" }
                );
                setSupportStatus("completed");
                Alert.alert(
                  "Thành công",
                  "Bạn đã hoàn thành hỗ trợ cho địa điểm này."
                );
                // Notify parent to refresh
                onSupportChange?.();
              },
            },
          ]
        );
      } else {
        // Completed - can restart support - capture values for closure
        const helpRecordIdForCallback = currentHelpRecordId;
        const formattedPhoneForCallback = formattedPhone;
        Alert.alert(
          "Hỗ trợ lại",
          "Bạn đã hoàn thành hỗ trợ cho địa điểm này. Bạn có muốn hỗ trợ lại?",
          [
            {
              text: "Hủy",
              style: "cancel",
            },
            {
              text: "Hỗ trợ lại",
              onPress: async () => {
                await supportService.updateSupport(
                  helpRecordIdForCallback,
                  formattedPhoneForCallback,
                  { status: "pending" }
                );
                setSupportStatus("pending");
                Alert.alert("Thành công", "Bạn đã đăng ký hỗ trợ lại.");
                // Notify parent to refresh
                onSupportChange?.();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error handling support:", error);
      Alert.alert(
        "Lỗi",
        "Đã xảy ra lỗi khi xử lý yêu cầu hỗ trợ. Vui lòng thử lại."
      );
    } finally {
      setIsUpdatingSupport(false);
    }
  };

  const getSupportButtonText = (): string => {
    if (isLoadingSupport) return "Đang tải...";
    if (isUpdatingSupport) return "Đang xử lý...";
    if (supportStatus === "none") return "Hỗ Trợ";
    if (supportStatus === "pending") return "Bắt Đầu Hỗ Trợ";
    if (supportStatus === "active") return "Hoàn Thành Hỗ Trợ";
    return "Hỗ Trợ Lại";
  };

  const getSupportButtonStyle = () => {
    if (supportStatus === "none" || supportStatus === "pending") {
      return { backgroundColor: colors.tint };
    }
    if (supportStatus === "active") {
      return { backgroundColor: SUPPORT_STATUS_INFO.active.color };
    }
    return { backgroundColor: SUPPORT_STATUS_INFO.completed.color };
  };

  if (!helpRecord) {
    return null;
  }

  const handlePhonePress = () => {
    if (helpRecord.phoneNumber) {
      Linking.openURL(`tel:${helpRecord.phoneNumber}`);
    }
  };

  const handleMapLinkPress = () => {
    if (helpRecord.mapLink) {
      Linking.openURL(helpRecord.mapLink);
    }
  };

  const locationInfo = helpRecord.isForSelf
    ? helpRecord.latitude && helpRecord.longitude
      ? `${helpRecord.latitude.toFixed(6)}, ${helpRecord.longitude.toFixed(6)}`
      : "Vị trí hiện tại"
    : helpRecord.address || helpRecord.mapLink || "Chưa có địa chỉ";

  const getEssentialItemLabel = (item: string): string => {
    const labels: Record<string, string> = {
      Medical: "Y tế",
      Food: "Thực phẩm",
      Clothes: "Quần áo",
      Tools: "Dụng cụ",
    };
    return labels[item] || item;
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Chi tiết yêu cầu"
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Location Name */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Địa điểm
          </ThemedText>
          <ThemedText style={styles.sectionValue}>
            {helpRecord.locationName}
          </ThemedText>
        </View>

        {/* People Count */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Số người cần hỗ trợ
          </ThemedText>
          <ThemedText style={styles.sectionValue}>
            {helpRecord.adultCount} người lớn, {helpRecord.childCount} trẻ nhỏ
          </ThemedText>
          <ThemedText style={styles.sectionSubtext}>
            Tổng cộng: {helpRecord.adultCount + helpRecord.childCount} người
          </ThemedText>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Liên hệ
          </ThemedText>
          <TouchableOpacity
            onPress={handlePhonePress}
            style={[styles.contactButton, { borderColor: colors.tint }]}
          >
            <MaterialIcons name="phone" size={18} color={colors.tint} />
            <ThemedText style={[styles.contactText, { color: colors.tint }]}>
              {helpRecord.phoneNumber}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Vị trí
          </ThemedText>
          {helpRecord.mapLink ? (
            <TouchableOpacity
              onPress={handleMapLinkPress}
              style={[styles.mapButton, { borderColor: colors.tint }]}
            >
              <MaterialIcons name="map" size={18} color={colors.tint} />
              <ThemedText
                style={[styles.mapText, { color: colors.tint }]}
                numberOfLines={2}
              >
                {helpRecord.address || "Mở bản đồ"}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <ThemedText style={styles.sectionValue}>{locationInfo}</ThemedText>
          )}
          {helpRecord.isForSelf &&
            helpRecord.latitude &&
            helpRecord.longitude && (
              <ThemedText style={styles.sectionSubtext}>
                Tọa độ: {helpRecord.latitude.toFixed(6)},{" "}
                {helpRecord.longitude.toFixed(6)}
              </ThemedText>
            )}
          
          {/* View on Map Button - Show if help record has coordinates */}
          {helpRecord.latitude && helpRecord.longitude && onViewOnMap && (
            <TouchableOpacity
              onPress={() => {
                onViewOnMap(helpRecord);
                onClose(); // Close modal when viewing on map
              }}
              style={[styles.viewOnMapButton, { borderColor: colors.tint }]}
            >
              <MaterialIcons name="place" size={18} color={colors.tint} />
              <ThemedText style={[styles.viewOnMapText, { color: colors.tint }]}>
                Xem trên bản đồ
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Essential Items */}
        {helpRecord.essentialItems && helpRecord.essentialItems.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Nhu yếu phẩm cần hỗ trợ
            </ThemedText>
            <View style={styles.tagsContainer}>
              {helpRecord.essentialItems.map((item, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.icon + "15" }]}
                >
                  <ThemedText style={[styles.tagText, { color: colors.icon }]}>
                    {getEssentialItemLabel(item)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Type */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Loại yêu cầu
          </ThemedText>
          <ThemedText style={styles.sectionValue}>
            {helpRecord.isForSelf
              ? "Trợ giúp cho bản thân"
              : "Trợ giúp cho người khác"}
          </ThemedText>
        </View>

        {/* Timestamp */}
        {helpRecord.createdAt && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Thời gian tạo
            </ThemedText>
            <ThemedText style={styles.sectionValue}>
              {new Date(helpRecord.createdAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </View>
        )}

        {/* Support Status Display */}
        {isAuthenticated && supportStatus !== "none" && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Trạng thái hỗ trợ
            </ThemedText>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    SUPPORT_STATUS_INFO[supportStatus as SupportStatus].color +
                    "20",
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.statusText,
                  {
                    color:
                      SUPPORT_STATUS_INFO[supportStatus as SupportStatus].color,
                  },
                ]}
              >
                {SUPPORT_STATUS_INFO[supportStatus as SupportStatus].label}
              </ThemedText>
            </View>
            <ThemedText style={styles.statusDescription}>
              {SUPPORT_STATUS_INFO[supportStatus as SupportStatus].description}
            </ThemedText>
          </View>
        )}

        {/* Support Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.supportButton, getSupportButtonStyle()]}
            onPress={handleSupport}
            activeOpacity={0.8}
            disabled={isLoadingSupport || isUpdatingSupport}
          >
            {isLoadingSupport || isUpdatingSupport ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.supportButtonText}>
                {getSupportButtonText()}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  supportButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionSubtext: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "500",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  mapText: {
    fontSize: 16,
    flex: 1,
  },
  viewOnMapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  viewOnMapText: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusDescription: {
    fontSize: 13,
    marginTop: 6,
    opacity: 0.7,
  },
});
