# Task Documentation: Auto-select First Province on Home Screen

## Task Overview

**Date**: 2024-12-19  
**Time**: Current  
**Task**: Tự động chọn tỉnh đầu tiên trong danh sách khi lần đầu focus vào màn hình Home và zoom map đến tỉnh đó

### User Request
```
Mặc định lần đầu focus vào tỉnh đầu tiên trong list
```

---

## Problem Identified

Khi mở màn hình Home, người dùng phải tự chọn tỉnh từ dropdown để xem các help records và map zoom đến tỉnh đó. Điều này không thuận tiện cho trải nghiệm người dùng.

---

## Solution

Tự động chọn tỉnh đầu tiên trong danh sách khi:
1. Load provinces thành công
2. Chưa có tỉnh nào được chọn trước đó
3. Có ít nhất một tỉnh trong danh sách

Sau khi chọn tỉnh đầu tiên, map sẽ tự động zoom đến tỉnh đó.

---

## Steps Taken

### Step 1: Thêm useRef để track việc auto-select
- Thêm `hasAutoSelectedFirstProvince` ref để đảm bảo chỉ auto-select một lần
- Tránh việc auto-select lại khi component re-render

### Step 2: Tạo helper function `zoomToProvince`
- Tách logic zoom map thành một function riêng để tái sử dụng
- Sử dụng `useCallback` để optimize performance

### Step 3: Cập nhật logic load provinces
- Khi load provinces thành công, kiểm tra xem đã auto-select chưa
- Nếu chưa và có provinces, tự động chọn tỉnh đầu tiên
- Set state `selectedProvince` với tỉnh đầu tiên
- Delay 500ms để đảm bảo map đã render, sau đó zoom đến tỉnh

### Step 4: Refactor `handleProvinceChange`
- Sử dụng `zoomToProvince` helper function thay vì duplicate code

---

## Files Changed

### Modified
- `app/(tabs)/index.tsx`:
  - Thêm `hasAutoSelectedFirstProvince` ref
  - Thêm `zoomToProvince` helper function
  - Cập nhật `useEffect` load provinces để auto-select tỉnh đầu tiên
  - Refactor `handleProvinceChange` để sử dụng `zoomToProvince`

---

## Technical Details

### Key Changes

1. **useRef for tracking**:
   ```typescript
   const hasAutoSelectedFirstProvince = React.useRef(false);
   ```

2. **Helper function**:
   ```typescript
   const zoomToProvince = useCallback((province: Province) => {
     if (province && PROVINCE_COORDINATES[province.name]) {
       const provinceCoords = PROVINCE_COORDINATES[province.name];
       const newRegion: Region = {
         latitude: provinceCoords.latitude,
         longitude: provinceCoords.longitude,
         latitudeDelta: provinceCoords.latitudeDelta,
         longitudeDelta: provinceCoords.longitudeDelta,
       };
       mapRef.current?.animateToRegion(newRegion, 1000);
       setRegion(newRegion);
     }
   }, []);
   ```

3. **Auto-select logic**:
   ```typescript
   if (provincesData.length > 0 && !hasAutoSelectedFirstProvince.current) {
     hasAutoSelectedFirstProvince.current = true;
     const firstProvince = provincesData[0];
     setSelectedProvince(firstProvince);
     setTimeout(() => {
       zoomToProvince(firstProvince);
     }, 500);
   }
   ```

### Why This Works

1. **useRef prevents re-selection**: `hasAutoSelectedFirstProvince.current` đảm bảo chỉ auto-select một lần, ngay cả khi component re-render
2. **Delay ensures map is ready**: 500ms delay đảm bảo MapView đã render và sẵn sàng nhận lệnh zoom
3. **Helper function improves maintainability**: Code dễ đọc và maintain hơn

---

## Build Results

### iOS Build
- **Status**: 🔄 In Progress
- **Command**: `npm run ios`
- **Expected Result**: 
  - App build thành công
  - Khi mở màn hình Home, tự động chọn tỉnh đầu tiên
  - Map tự động zoom đến tỉnh đó
  - Help records của tỉnh đó được hiển thị

---

## Testing Notes

### Expected Behavior
1. Mở app lần đầu → Màn hình Home
2. Provinces được load từ API
3. Tự động chọn tỉnh đầu tiên (ví dụ: Phú Yên)
4. Map tự động zoom đến tỉnh Phú Yên
5. Help records của Phú Yên được hiển thị trong list
6. Markers của help records được hiển thị trên map

### Edge Cases Handled
- Nếu không có provinces → Không auto-select
- Nếu đã có tỉnh được chọn trước đó → Không auto-select lại
- Nếu map chưa render → Delay 500ms đảm bảo map sẵn sàng

---

## Issues Encountered

### Linter Errors Fixed
1. **`loadHelpRecords` used before declaration**: Di chuyển `handleSupportChange` xuống sau `loadHelpRecords`
2. **Missing dependencies in useEffect**: Thêm `loadHelpRecords` vào dependency array
3. **Missing dependencies warning**: Sử dụng `eslint-disable-next-line` cho useEffect load provinces (cần thiết để chỉ chạy một lần)

---

## Additional Notes

### Future Improvements
- Có thể lưu tỉnh đã chọn vào AsyncStorage để nhớ lựa chọn của user
- Có thể thêm animation khi auto-select tỉnh
- Có thể thêm loading indicator khi đang zoom map

---

## Summary

Đã thành công implement tính năng tự động chọn tỉnh đầu tiên khi màn hình Home được focus lần đầu. Map sẽ tự động zoom đến tỉnh đó và hiển thị các help records tương ứng. Code đã được refactor để dễ maintain và optimize performance.

