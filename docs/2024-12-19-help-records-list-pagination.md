# Help Records List with Pagination Implementation

**Date:** 2024-12-19  
**Task:** Tạo service gọi API lấy danh sách trợ giúp từ Supabase, hiển thị lên list với pagination và load more

## Task Overview

User requested to:
1. Create a service to fetch help records list from Supabase
2. Display the list on Home screen
3. Support load more functionality
4. Load 10 items per page
5. Load next page when scrolling to the end

## Steps Taken

### 1. Updated Help Service with Pagination

- Updated `services/help/help-service.ts` to add `getHelpRecordsPaginated()` method:
  - Accepts `page` (0-indexed) and `limit` (default 10) parameters
  - Uses Supabase `.range()` for pagination
  - Returns `{ data: HelpRecord[], hasMore: boolean }`
  - Uses `count: 'exact'` to determine if there are more pages

### 2. Updated Home Screen

- Updated `app/(tabs)/index.tsx` to:
  - Replace mock data with real help records from Supabase
  - Add state management for:
    - `helpRecords`: Array of loaded help records
    - `isLoadingHelpRecords`: Initial loading state
    - `isLoadingMore`: Loading more state
    - `currentPage`: Current page number
    - `hasMore`: Whether there are more pages to load
    - `errorLoadingHelp`: Error message
  - Implement `loadHelpRecords()` function with pagination
  - Use `useFocusEffect` to reload data when screen is focused
  - Implement `handleLoadMore()` for infinite scroll
  - Update `renderItem()` to display help record information:
    - Location name
    - Help type (for self or others)
    - People count (adults and children)
    - Phone number
    - Location info (coordinates or address/map link)
    - Essential items
    - Created time
  - Add loading states:
    - Initial loading spinner
    - Load more footer spinner
    - Empty state message
    - Error state message
  - Configure FlatList with:
    - `onEndReached` to trigger load more
    - `onEndReachedThreshold={0.5}` for better UX
    - `ListFooterComponent` for loading indicator

## Files Modified

1. `services/help/help-service.ts` - Added `getHelpRecordsPaginated()` method
2. `app/(tabs)/index.tsx` - Complete refactor to use real data with pagination

## Key Features

### Pagination Implementation

- **Page Size**: 10 items per page (configurable via `PAGE_SIZE` constant)
- **Pagination Logic**: Uses Supabase `.range(from, to)` for efficient pagination
- **Has More Detection**: Uses `count: 'exact'` to determine if more pages exist
- **Load More Trigger**: Automatically loads when user scrolls to 50% from bottom

### Data Display

Each help record item displays:
- **Location Name**: Name of the location
- **Help Type**: "Trợ giúp cho bản thân" or "Trợ giúp cho người khác"
- **People Count**: Total people, adults, and children
- **Phone Number**: Contact phone number
- **Location Info**: 
  - If for self: Coordinates (latitude, longitude)
  - If for others: Address or Google Maps link
- **Essential Items**: Comma-separated list of needed items
- **Created Time**: Formatted Vietnamese date/time

### Loading States

- **Initial Load**: Shows spinner and "Đang tải..." message
- **Load More**: Shows spinner in footer when loading next page
- **Empty State**: Shows "Chưa có yêu cầu trợ giúp nào" when no records
- **Error State**: Shows error message if loading fails

### Auto Refresh

- Uses `useFocusEffect` to reload data when screen comes into focus
- Ensures fresh data when user navigates back from create-help screen

## Technical Details

### Service Method

```typescript
async getHelpRecordsPaginated(
  page: number = 0,
  limit: number = 10
): Promise<{ data: HelpRecord[]; hasMore: boolean }>
```

- Uses Supabase `.range()` for efficient pagination
- Calculates `from` and `to` based on page and limit
- Returns data array and hasMore flag

### State Management

```typescript
const [helpRecords, setHelpRecords] = useState<HelpRecord[]>([]);
const [isLoadingHelpRecords, setIsLoadingHelpRecords] = useState(false);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [currentPage, setCurrentPage] = useState(0);
const [hasMore, setHasMore] = useState(true);
```

### Load More Logic

```typescript
const handleLoadMore = () => {
  if (!isLoadingMore && hasMore) {
    loadHelpRecords(currentPage + 1, true);
  }
};
```

- Only loads if not already loading and more pages exist
- Appends new data to existing array

### FlatList Configuration

```typescript
<FlatList
  data={helpRecords}
  renderItem={renderItem}
  keyExtractor={(item) => item.id || Math.random().toString()}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={renderFooter}
/>
```

- `onEndReachedThreshold={0.5}`: Triggers load more when 50% from bottom
- `ListFooterComponent`: Shows loading spinner when loading more

## Usage Flow

1. User opens Home screen
2. System automatically loads first page (10 items)
3. User scrolls through the list
4. When user scrolls to 50% from bottom, next page loads automatically
5. Loading spinner appears in footer
6. New items are appended to the list
7. Process repeats until all pages are loaded

## Notes

- Page size is set to 10 items per page (configurable)
- Data is sorted by `created_at` descending (newest first)
- List automatically refreshes when screen comes into focus
- Error handling shows user-friendly messages
- Empty state provides clear feedback when no records exist
- Load more only triggers when there are more pages available

## Build Results

Pending - Will run iOS build after documentation completion.

