# Update Team Registration UI

**Date:** 2024-12-19  
**Task:** Update UI của màn hình tạo đơn vị cứu trợ theo UI mới

## Task Overview

Cập nhật màn hình đăng ký đơn vị cứu trợ (`app/(auth)/team-registration.tsx`) để khớp với UI mới từ design, bao gồm:
- Header với nút back và tiêu đề "Tên đơn vị cứu trợ"
- Form fields với icons (person, envelope, phone)
- Stepper control cho số lượng thành viên
- Grid layout 2x2 cho các nhu yếu phẩm với icons
- Button màu đỏ (#FF3B30)

## Steps Taken

1. **Added MaterialIcons import** - Import MaterialIcons từ @expo/vector-icons để sử dụng icons

2. **Created Essential Items Configuration** - Tạo mapping cho các essential items với labels tiếng Việt và icons:
   - Food → "Thức ăn" với icon restaurant
   - Medical → "Y tế" với icon medical-services
   - Clothes → "Quần áo" với icon checkroom
   - Tools → "Nơ trú ẩn an toàn" với icon home

3. **Added Header Component** - Thêm header với:
   - Back button (arrow-back icon)
   - Title "Tên đơn vị cứu trợ" (centered)
   - Spacer để căn chỉnh

4. **Updated Form Fields with Icons**:
   - Team Leader Name: Thêm person icon
   - Email: Thêm email icon
   - Phone Number: Thêm phone icon
   - Tất cả inputs được wrap trong inputWrapper với flexDirection row để hiển thị icon bên trái

5. **Replaced Member Count Input with Stepper**:
   - Thay thế TextInput bằng stepper control
   - Gồm 2 buttons (minus và plus) với số ở giữa
   - Buttons màu đỏ (#FF3B30)
   - Minimum value là 1

6. **Updated Essential Items to Grid Layout**:
   - Chuyển từ horizontal chips sang 2x2 grid
   - Mỗi item là một card vuông với icon ở trên và label ở dưới
   - Selected state: background với opacity và border màu đỏ
   - Unselected state: background trắng với border xám

7. **Updated Button Styling**:
   - Đổi màu từ tint color sang đỏ (#FF3B30)
   - Thay ThemedView bằng TouchableOpacity để có activeOpacity effect
   - Giữ nguyên loading state với ActivityIndicator

8. **Updated Labels**:
   - Section title cho essential items: "Tôi có thể hỗ trợ các nhu yếu phẩm:"
   - Placeholders được cập nhật để khớp với design

## Files Changed

- `app/(auth)/team-registration.tsx` - Complete UI overhaul

## Key Changes

### Imports
- Added `MaterialIcons` from `@expo/vector-icons/MaterialIcons`

### Constants
- Added `ESSENTIAL_ITEM_CONFIG` mapping for Vietnamese labels and icons
- Added `PRIMARY_COLOR = '#FF3B30'` constant

### UI Components
- Header with back button and title
- Input fields with icons (wrapped in inputWrapper)
- Stepper control for member count
- Grid layout (2x2) for essential items
- Red button styling

### Styles
- Added header styles (header, backButton, headerTitle, headerSpacer)
- Added inputWrapper and inputIcon styles
- Added stepper styles (stepperContainer, stepperButton, stepperValue)
- Added grid styles (itemsGrid, itemCard, itemCardText)
- Updated button styles to use red color

## Build Results

- iOS build initiated in background
- No linter errors found

## Notes/Issues

- All functionality remains intact (validation, form submission, etc.)
- UI now matches the new design specification
- Colors and spacing adjusted to match design
- Icons are consistent with MaterialIcons library
- Grid layout is responsive and maintains 2x2 structure

