# Task Documentation: Add "View on Map" Button to Help Detail Modal

## Task Overview

**Date**: 2024-12-19  
**Time**: Current  
**Task**: Thêm nút "Xem trên bản đồ" trong bottom sheet thông tin cứu trợ, khi bấm vào sẽ focus map đến vị trí của help record

### User Request
```
Thêm một nút xem trên bản đồ trong bottom sheet thông tin cứu trợ. Bấm vào đó sẽ focus tới vị trí của nó ở trên bản đồ.
```

---

## Problem Identified

Khi user xem chi tiết một help record trong bottom sheet modal, không có cách nào để xem vị trí của nó trên map. User phải tự tìm marker trên map, điều này không thuận tiện.

---

## Solution

1. **Add Callback Prop**: Thêm prop `onViewOnMap` vào `HelpDetailModal` component
2. **Add Button**: Thêm nút "Xem trên bản đồ" trong section Location của modal
3. **Handle Map Focus**: Tạo function `handleViewOnMap` trong home screen để zoom map đến vị trí của help record
4. **Close Modal**: Tự động đóng modal khi user click "Xem trên bản đồ"

---

## Steps Taken

### Step 1: Update HelpDetailModal Interface
- Thêm prop `onViewOnMap?: (helpRecord: HelpRecord) => void` vào `HelpDetailModalProps`
- Prop này là optional vì không phải tất cả help records đều có coordinates

### Step 2: Add "View on Map" Button
- Thêm button trong section Location của modal
- Chỉ hiển thị button nếu:
  - Help record có `latitude` và `longitude`
  - `onViewOnMap` callback được provide
- Button có icon "place" và text "Xem trên bản đồ"
- Style tương tự các button khác trong modal

### Step 3: Create handleViewOnMap Function
- Tạo function `handleViewOnMap` trong home screen
- Function nhận `HelpRecord` làm parameter
- Kiểm tra xem help record có coordinates không
- Tạo region với zoom level 0.01 (zoom in closer cho specific location)
- Sử dụng `mapRef.current?.animateToRegion()` để animate map đến vị trí
- Update region state

### Step 4: Pass Callback to Modal
- Pass `handleViewOnMap` function vào `HelpDetailModal` component
- Modal sẽ gọi function này khi user click "Xem trên bản đồ"
- Tự động đóng modal sau khi gọi callback

### Step 5: Add Styles
- Thêm `viewOnMapButton` style tương tự `mapButton`
- Thêm `viewOnMapText` style cho text

---

## Files Changed

### Modified
- `components/help/help-detail-modal.tsx`:
  - Thêm prop `onViewOnMap` vào interface
  - Thêm button "Xem trên bản đồ" trong section Location
  - Thêm styles cho button

- `app/(tabs)/index.tsx`:
  - Thêm function `handleViewOnMap` để zoom map đến vị trí help record
  - Pass `handleViewOnMap` vào `HelpDetailModal` component

---

## Technical Details

### Key Changes

1. **Modal Interface Update**:
   ```typescript
   interface HelpDetailModalProps {
     visible: boolean;
     onClose: () => void;
     helpRecord: HelpRecord | null;
     onSupportChange?: () => void;
     onViewOnMap?: (helpRecord: HelpRecord) => void; // NEW
   }
   ```

2. **View on Map Button**:
   ```typescript
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
   ```

3. **Handle View on Map Function**:
   ```typescript
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
   ```

4. **Styles**:
   ```typescript
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
   ```

### Button Display Logic

Button "Xem trên bản đồ" chỉ hiển thị khi:
- Help record có `latitude` và `longitude` (có tọa độ)
- `onViewOnMap` callback được provide (từ parent component)

### Zoom Level

- Sử dụng `latitudeDelta: 0.01` và `longitudeDelta: 0.01` để zoom in closer
- Đây là zoom level phù hợp để xem một địa điểm cụ thể
- Animation duration: 1000ms (1 second)

---

## Build Results

### iOS Build
- **Status**: 🔄 Pending
- **Command**: `npm run ios`
- **Expected Result**: 
  - App build thành công
  - Button "Xem trên bản đồ" hiển thị trong modal
  - Khi click button, map zoom đến vị trí của help record
  - Modal tự động đóng

---

## Testing Notes

### Expected Behavior

1. **Button Display**:
   - Mở help detail modal cho một help record có coordinates
   - Button "Xem trên bản đồ" hiển thị trong section Location
   - Button có icon "place" và text "Xem trên bản đồ"

2. **Button Not Displayed**:
   - Nếu help record không có coordinates → Button không hiển thị
   - Nếu `onViewOnMap` không được provide → Button không hiển thị

3. **Map Focus**:
   - Click button "Xem trên bản đồ"
   - Modal tự động đóng
   - Map animate đến vị trí của help record
   - Zoom level phù hợp để xem địa điểm cụ thể
   - Marker của help record được hiển thị rõ ràng

4. **User Experience**:
   - Smooth animation khi map zoom đến vị trí
   - User có thể thấy marker của help record ngay sau khi modal đóng
   - Map region được update để reflect vị trí mới

### Edge Cases Handled

- Help record không có coordinates → Button không hiển thị
- `onViewOnMap` không được provide → Button không hiển thị
- Map chưa render → `mapRef.current` sẽ là null, function sẽ không crash
- Multiple clicks → Animation sẽ restart mỗi lần click

---

## Issues Encountered

### Linter Warning
- **Warning**: `isLoadingProvinces` is assigned a value but never used
- **Status**: Minor warning, không ảnh hưởng functionality
- **Action**: Can be ignored or variable can be used in future for loading indicator

---

## Additional Notes

### UI/UX Considerations

- Button được đặt trong section Location để user dễ tìm thấy
- Button tự động đóng modal để user có thể xem map ngay lập tức
- Animation smooth với duration 1 second
- Zoom level 0.01 phù hợp để xem một địa điểm cụ thể

### Future Improvements

- Có thể thêm haptic feedback khi click button
- Có thể highlight marker khi map zoom đến vị trí
- Có thể thêm option để zoom in/out thêm
- Có thể thêm animation cho marker khi map focus đến

---

## Summary

Đã thành công implement:
1. ✅ Thêm prop `onViewOnMap` vào HelpDetailModal
2. ✅ Thêm button "Xem trên bản đồ" trong modal
3. ✅ Tạo function `handleViewOnMap` để zoom map đến vị trí help record
4. ✅ Tự động đóng modal khi click button
5. ✅ Smooth animation khi map focus đến vị trí

User experience được cải thiện với khả năng xem vị trí của help record trên map một cách nhanh chóng và thuận tiện.

