import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { HelpDetailModal } from "@/components/help/help-detail-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProvinceDropdown } from "@/components/ui/province-dropdown";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { helpService } from "@/services/help/help-service";
import { provinceService } from "@/services/province/province-service";
import { supportService } from "@/services/support/support-service";
import { useAuthStore } from "@/store";
import type { HelpRecord, Province, SupportStatus } from "@/types";
import { SUPPORT_STATUS_INFO } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.4; // 40% of device height
const PAGE_SIZE = 10;

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Thêm mapping tọa độ trung tâm và zoom level cho các tỉnh
const PROVINCE_COORDINATES: Record<
  string,
  {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }
> = {
  "Phú Yên": {
    latitude: 13.0883,
    longitude: 109.2942,
    latitudeDelta: 0.3, // Giảm từ 0.5 xuống 0.3 để zoom sâu hơn
    longitudeDelta: 0.3,
  },
  "Bình Định": {
    latitude: 13.7758,
    longitude: 109.2233,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
  "Khánh Hòa": {
    latitude: 12.2388,
    longitude: 109.1967,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
  "Quảng Nam": {
    latitude: 15.5394,
    longitude: 108.0192,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated, user } = useAuthStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 10.762622, // Default to Ho Chi Minh City
    longitude: 106.660172,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Provinces state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);

  // Help records state
  const [helpRecords, setHelpRecords] = useState<HelpRecord[]>([]);
  const [isLoadingHelpRecords, setIsLoadingHelpRecords] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorLoadingHelp, setErrorLoadingHelp] = useState<string | null>(null);

  // Bottom sheet modal state
  const [selectedHelpRecord, setSelectedHelpRecord] =
    useState<HelpRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Support statuses for help records (keyed by helpRecordId)
  const [supportStatuses, setSupportStatuses] = useState<
    Map<string, SupportStatus | "none">
  >(new Map());

  // Thêm ref cho MapView để có thể control zoom programmatically
  const mapRef = React.useRef<MapView>(null);
  // Track xem đã tự động chọn tỉnh đầu tiên chưa
  const hasAutoSelectedFirstProvince = React.useRef(false);

  const handleCreateHelp = () => {
    router.navigate("/(tabs)/create-help");
  };

  const handleItemPress = (item: HelpRecord) => {
    setSelectedHelpRecord(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedHelpRecord(null);
  };

  const loadHelpRecords = useCallback(
    async (page: number = 0, isLoadMore: boolean = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoadingHelpRecords(true);
          setErrorLoadingHelp(null);
        }

        const result = await helpService.getHelpRecordsPaginated(
          page,
          PAGE_SIZE,
          selectedProvince?.id
        );

        if (isLoadMore) {
          setHelpRecords((prev) => [...prev, ...result.data]);
        } else {
          setHelpRecords(result.data);
        }

        setHasMore(result.hasMore);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error loading help records:", error);
        setErrorLoadingHelp(
          "Không thể tải danh sách trợ giúp. Vui lòng thử lại."
        );
      } finally {
        setIsLoadingHelpRecords(false);
        setIsLoadingMore(false);
      }
    },
    [selectedProvince]
  );

  const handleSupportChange = useCallback(() => {
    // Refresh the current page when support status changes
    loadHelpRecords(currentPage, false);
  }, [loadHelpRecords, currentPage]);

  // Helper function to zoom to province
  const zoomToProvince = useCallback((province: Province) => {
    if (province && PROVINCE_COORDINATES[province.name]) {
      const provinceCoords = PROVINCE_COORDINATES[province.name];
      const newRegion: Region = {
        latitude: provinceCoords.latitude,
        longitude: provinceCoords.longitude,
        latitudeDelta: provinceCoords.latitudeDelta,
        longitudeDelta: provinceCoords.longitudeDelta,
      };

      // Animate map to province
      mapRef.current?.animateToRegion(newRegion, 1000);
      setRegion(newRegion);
    }
  }, []);

  // Handle view help record on map
  const handleViewOnMap = useCallback((helpRecord: HelpRecord) => {
    if (helpRecord.latitude && helpRecord.longitude) {
      const newRegion: Region = {
        latitude: helpRecord.latitude,
        longitude: helpRecord.longitude,
        latitudeDelta: 0.01, // Zoom in closer for specific location
        longitudeDelta: 0.01,
      };

      // Animate map to help record location
      mapRef.current?.animateToRegion(newRegion, 1000);
      setRegion(newRegion);
    }
  }, []);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const provincesData = await provinceService.getAllProvinces(true);
        setProvinces(provincesData);

        // Tự động chọn tỉnh đầu tiên lần đầu tiên load
        if (provincesData.length > 0 && !hasAutoSelectedFirstProvince.current) {
          hasAutoSelectedFirstProvince.current = true;
          const firstProvince = provincesData[0];
          setSelectedProvince(firstProvince);
          // Delay một chút để đảm bảo map đã render
          setTimeout(() => {
            zoomToProvince(firstProvince);
          }, 500);
        }
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    loadProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load initial data and refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Reset to first page and reload data when screen is focused
      setCurrentPage(0);
      setHasMore(true);
      loadHelpRecords(0, false);
    }, [loadHelpRecords])
  );

  // Reload help records when province changes
  useEffect(() => {
    loadHelpRecords(0, false);
  }, [selectedProvince?.id, loadHelpRecords]);

  // Load support statuses when help records change and user is authenticated
  useEffect(() => {
    const loadSupportStatuses = async () => {
      if (!isAuthenticated || !user?.phoneNumber || helpRecords.length === 0) {
        setSupportStatuses(new Map());
        return;
      }

      try {
        // Format phone number to match team format
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

        const formattedPhone = formatPhoneForTeam(user.phoneNumber);
        const statusMap = new Map<string, SupportStatus | "none">();

        // Load support statuses for all help records
        await Promise.all(
          helpRecords.map(async (record) => {
            if (record.id) {
              try {
                const status = await supportService.getSupportStatus(
                  record.id,
                  formattedPhone
                );
                statusMap.set(record.id, status);
              } catch (error) {
                console.error(
                  `Error loading support status for ${record.id}:`,
                  error
                );
                statusMap.set(record.id, "none");
              }
            }
          })
        );

        setSupportStatuses(statusMap);
      } catch (error) {
        console.error("Error loading support statuses:", error);
      }
    };

    loadSupportStatuses();
  }, [helpRecords, isAuthenticated, user?.phoneNumber]);

  // Cập nhật handleProvinceChange để zoom map khi chọn tỉnh
  const handleProvinceChange = (province: Province | null) => {
    setSelectedProvince(province);
    setCurrentPage(0);
    setHasMore(true);

    // Zoom map đến tỉnh được chọn
    if (province) {
      zoomToProvince(province);
    } else if (!province) {
      // Nếu chọn "Tất cả tỉnh", zoom về vị trí user hoặc default
      if (location) {
        const newRegion: Region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.3, // Giảm từ 0.5 xuống 0.3
          longitudeDelta: 0.3,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
        setRegion(newRegion);
      }
    }
  };

  // Lọc help records có tọa độ để hiển thị markers
  const markersToDisplay = helpRecords.filter(
    (record) => record.latitude != null && record.longitude != null
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadHelpRecords(currentPage + 1, true);
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setIsLoadingLocation(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        console.log("Location obtained:", {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        setLocation(currentLocation);

        // Update region when location is obtained
        const newRegion: Region = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Failed to get location. Please try again.");
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // Determine urgency based on time since creation (less than 1 hour = urgent)
  const getUrgency = (
    createdAt?: string
  ): { isUrgent: boolean; label: string } => {
    if (!createdAt) {
      return { isUrgent: false, label: "Không gấp" };
    }
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const hoursSinceCreation = (now - createdTime) / (1000 * 60 * 60);
    const isUrgent = hoursSinceCreation < 1;
    return {
      isUrgent,
      label: isUrgent ? "Khẩn cấp" : "Không gấp",
    };
  };

  const getEssentialItemLabel = (item: string): string => {
    const labels: Record<string, string> = {
      Medical: "Medical",
      Food: "Food",
      Clothes: "Clothes",
      Tools: "Tools",
    };
    return labels[item] || item;
  };

  const renderItem: ListRenderItem<HelpRecord> = ({ item }) => {
    const locationInfo = item.isForSelf
      ? item.address || "Vị trí hiện tại"
      : item.address || item.mapLink || "Chưa có địa chỉ";

    const urgency = getUrgency(item.createdAt);
    const peopleText =
      item.adultCount > 0 && item.childCount > 0
        ? `${item.adultCount} người lớn, ${item.childCount} trẻ nhỏ`
        : item.adultCount > 0
        ? `${item.adultCount} người lớn`
        : `${item.childCount} trẻ nhỏ`;

    // Get support status for this item
    const supportStatus = item.id ? supportStatuses.get(item.id) : "none";
    const showSupportStatus =
      isAuthenticated && supportStatus && supportStatus !== "none";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
        style={styles.itemTouchable}
      >
        <ThemedView
          style={[styles.itemContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.itemHeader}>
            <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
              {item.locationName}
            </ThemedText>
            <View style={styles.headerTags}>
              <View
                style={[
                  styles.urgencyTag,
                  {
                    backgroundColor: urgency.isUrgent ? "#FF3B30" : "#007AFF",
                  },
                ]}
              >
                <ThemedText style={styles.urgencyText}>
                  {urgency.label}
                </ThemedText>
              </View>
              {showSupportStatus && (
                <View
                  style={[
                    styles.supportStatusTag,
                    {
                      backgroundColor:
                        SUPPORT_STATUS_INFO[supportStatus as SupportStatus]
                          .color + "20",
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.supportStatusText,
                      {
                        color:
                          SUPPORT_STATUS_INFO[supportStatus as SupportStatus]
                            .color,
                      },
                    ]}
                  >
                    {SUPPORT_STATUS_INFO[supportStatus as SupportStatus].label}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <ThemedText style={styles.itemPeople}>{peopleText}</ThemedText>

          <View style={styles.itemLocation}>
            <MaterialIcons name="place" size={14} color="#FF3B30" />
            <ThemedText style={styles.itemLocationText} numberOfLines={1}>
              {locationInfo}
            </ThemedText>
          </View>

          {item.essentialItems && item.essentialItems.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.essentialItems.map((essentialItem, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.icon + "20" }]}
                >
                  <ThemedText style={[styles.tagText, { color: colors.icon }]}>
                    {getEssentialItemLabel(essentialItem)}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.mapContainer}>
        {errorMsg ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            <ThemedText style={[styles.errorText, styles.retryText]}>
              Please enable location permissions in Settings
            </ThemedText>
          </View>
        ) : isLoadingLocation ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.loadingText}>
              Loading location...
            </ThemedText>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="standard"
            loadingEnabled={true}
          >
            {/* Marker cho vị trí user */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Vị trí của bạn"
                description="Đây là vị trí hiện tại của bạn"
                pinColor="blue"
              />
            )}

            {/* Markers cho các help records */}
            {markersToDisplay.map((record) => {
              if (!record.latitude || !record.longitude) return null;

              const urgency = getUrgency(record.createdAt);

              return (
                <Marker
                  key={record.id || Math.random().toString()}
                  coordinate={{
                    latitude: record.latitude,
                    longitude: record.longitude,
                  }}
                  title={record.locationName}
                  description={`${
                    record.adultCount + record.childCount
                  } người cần hỗ trợ`}
                  pinColor={urgency.isUrgent ? "red" : "orange"}
                  onPress={() => handleItemPress(record)}
                />
              );
            })}
          </MapView>
        )}
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <ThemedText type="subtitle" style={styles.listTitle}>
            Địa điểm cần hỗ trợ
          </ThemedText>
          <View style={styles.dropdownContainer}>
            <ProvinceDropdown
              provinces={provinces}
              selectedProvince={selectedProvince}
              onSelectProvince={handleProvinceChange}
              placeholder="Tất cả tỉnh"
            />
          </View>
        </View>
        {isLoadingHelpRecords ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
          </View>
        ) : errorLoadingHelp ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{errorLoadingHelp}</ThemedText>
          </View>
        ) : helpRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Chưa có yêu cầu trợ giúp nào
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={helpRecords}
            renderItem={renderItem}
            keyExtractor={(item) => item.id || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.tint,
          },
        ]}
        onPress={handleCreateHelp}
        activeOpacity={0.8}
      >
        <IconSymbol name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Help Detail Modal */}
      <HelpDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        helpRecord={selectedHelpRecord}
        onSupportChange={handleSupportChange}
        onViewOnMap={handleViewOnMap}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    width: "100%",
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    color: "#FF3B30",
    marginBottom: 8,
  },
  retryText: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1C1C1E",
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemTouchable: {
    marginBottom: 0,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerTags: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
    marginRight: 12,
  },
  urgencyTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  supportStatusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  supportStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  itemPeople: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  itemLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  itemLocationText: {
    fontSize: 14,
    color: "#8E8E93",
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20, // Above tab bar (adjust based on tab bar height)
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
