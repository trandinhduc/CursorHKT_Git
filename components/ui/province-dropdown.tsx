import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ListRenderItem,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Province } from "@/types";

interface ProvinceDropdownProps {
  provinces: Province[];
  selectedProvince: Province | null;
  onSelectProvince: (province: Province | null) => void;
  placeholder?: string;
}

export const ProvinceDropdown: React.FC<ProvinceDropdownProps> = ({
  provinces,
  selectedProvince,
  onSelectProvince,
  placeholder = "Chọn tỉnh",
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (province: Province | null) => {
    onSelectProvince(province);
    setIsOpen(false);
  };

  const renderProvinceItem: ListRenderItem<Province> = ({ item }) => {
    const isSelected = selectedProvince?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.provinceItem,
          {
            backgroundColor: isSelected
              ? colors.tint + "20"
              : colors.background,
            borderColor: isSelected ? colors.tint : colors.icon + "30",
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <ThemedText
          style={[
            styles.provinceItemText,
            {
              color: isSelected ? colors.tint : colors.text,
              fontWeight: isSelected ? "600" : "400",
            },
          ]}
        >
          {item.name}
        </ThemedText>
        {isSelected && (
          <MaterialIcons name="check" size={20} color={colors.tint} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            backgroundColor: colors.background,
            borderColor: colors.icon + "30",
          },
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <ThemedText
          style={[
            styles.dropdownButtonText,
            {
              color: selectedProvince ? colors.text : colors.icon,
            },
          ]}
        >
          {selectedProvince?.name || placeholder}
        </ThemedText>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={colors.icon}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Chọn tỉnh
              </ThemedText>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={provinces}
              renderItem={renderProvinceItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    styles.provinceItem,
                    {
                      backgroundColor:
                        !selectedProvince
                          ? colors.tint + "20"
                          : colors.background,
                      borderColor: !selectedProvince
                        ? colors.tint
                        : colors.icon + "30",
                    },
                  ]}
                  onPress={() => handleSelect(null)}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.provinceItemText,
                      {
                        color: !selectedProvince ? colors.tint : colors.text,
                        fontWeight: !selectedProvince ? "600" : "400",
                      },
                    ]}
                  >
                    Tất cả tỉnh
                  </ThemedText>
                  {!selectedProvince && (
                    <MaterialIcons name="check" size={20} color={colors.tint} />
                  )}
                </TouchableOpacity>
              }
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  list: {
    maxHeight: 400,
  },
  provinceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  provinceItemText: {
    fontSize: 16,
    flex: 1,
  },
});

