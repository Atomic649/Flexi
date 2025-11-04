# SwipeableRow Component

A highly customizable and reusable swipe gesture component for React Native that supports actions on both left and right swipes.

## Features

- ✅ **Bi-directional swipes**: Support for both left and right swipe actions
- ✅ **Multiple actions**: Add multiple action buttons on each side
- ✅ **Customizable appearance**: Full control over colors, icons, and text
- ✅ **Smooth animations**: Built with react-native-reanimated for 60fps performance
- ✅ **Gesture handling**: Uses modern react-native-gesture-handler v2 API
- ✅ **TypeScript**: Fully typed for better development experience
- ✅ **Flexible threshold**: Configurable swipe distance to trigger actions
- ✅ **Auto-close**: Actions close automatically after selection or tap

## Installation

Make sure you have the required dependencies:

```bash
npm install react-native-gesture-handler react-native-reanimated
```

## Basic Usage

```tsx
import SwipeableRow, { SwipeAction } from './components/SwipeableRow';

const rightActions: SwipeAction[] = [
  {
    id: "edit",
    icon: "pencil",
    text: "Edit",
    backgroundColor: "#F59E0B",
    onPress: () => console.log("Edit pressed"),
  },
  {
    id: "delete",
    icon: "trash",
    text: "Delete",
    backgroundColor: "#EF4444",
    onPress: () => console.log("Delete pressed"),
  },
];

<SwipeableRow rightActions={rightActions}>
  <YourContentComponent />
</SwipeableRow>
```

## Props

### SwipeableRowProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | **Required.** The content to be swiped |
| `leftActions` | `SwipeAction[]` | `[]` | Actions revealed on right swipe |
| `rightActions` | `SwipeAction[]` | `[]` | Actions revealed on left swipe |
| `threshold` | `number` | `80` | Minimum swipe distance to reveal actions (px) |
| `disabled` | `boolean` | `false` | Disable swipe gestures |
| `actionWidth` | `number` | `80` | Width of each action button (px) |

### SwipeAction

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | **Required.** Unique identifier |
| `icon` | `keyof typeof Ionicons.glyphMap` | - | **Required.** Ionicons icon name |
| `text` | `string` | - | **Required.** Button text |
| `backgroundColor` | `string` | - | **Required.** Button background color |
| `textColor` | `string` | `"#FFFFFF"` | Text and icon color |
| `onPress` | `() => void` | - | **Required.** Callback when pressed |

## Examples

### 1. Basic Left and Right Actions

```tsx
const leftActions: SwipeAction[] = [
  {
    id: "favorite",
    icon: "heart",
    text: "Like",
    backgroundColor: "#EC4899",
    onPress: () => handleLike(),
  },
];

const rightActions: SwipeAction[] = [
  {
    id: "delete",
    icon: "trash",
    text: "Delete",
    backgroundColor: "#EF4444",
    onPress: () => handleDelete(),
  },
];

<SwipeableRow 
  leftActions={leftActions} 
  rightActions={rightActions}
  threshold={60}
>
  <MyListItem />
</SwipeableRow>
```

### 2. Multiple Actions on One Side

```tsx
const rightActions: SwipeAction[] = [
  {
    id: "edit",
    icon: "pencil",
    text: "Edit",
    backgroundColor: "#F59E0B",
    onPress: () => handleEdit(),
  },
  {
    id: "share",
    icon: "share",
    text: "Share",
    backgroundColor: "#3B82F6",
    onPress: () => handleShare(),
  },
  {
    id: "delete",
    icon: "trash",
    text: "Delete",
    backgroundColor: "#EF4444",
    onPress: () => handleDelete(),
  },
];

<SwipeableRow rightActions={rightActions} actionWidth={75}>
  <MyListItem />
</SwipeableRow>
```

### 3. Conditional Actions

```tsx
const getRightActions = (item: Item): SwipeAction[] => {
  const actions: SwipeAction[] = [];
  
  if (item.canEdit) {
    actions.push({
      id: "edit",
      icon: "pencil",
      text: "Edit",
      backgroundColor: "#F59E0B",
      onPress: () => handleEdit(item.id),
    });
  }
  
  if (item.canDelete) {
    actions.push({
      id: "delete",
      icon: "trash",
      text: "Delete",
      backgroundColor: "#EF4444",
      onPress: () => handleDelete(item.id),
    });
  }
  
  return actions;
};

<SwipeableRow rightActions={getRightActions(item)}>
  <MyListItem item={item} />
</SwipeableRow>
```

### 4. Custom Styling

```tsx
const customActions: SwipeAction[] = [
  {
    id: "custom",
    icon: "star",
    text: "VIP",
    backgroundColor: "#8B5CF6",
    textColor: "#FEF3C7", // Custom text color
    onPress: () => handleVIP(),
  },
];

<SwipeableRow 
  rightActions={customActions}
  threshold={100} // Higher threshold
  actionWidth={90} // Wider buttons
>
  <MyListItem />
</SwipeableRow>
```

### 5. Disabled State

```tsx
<SwipeableRow 
  rightActions={rightActions}
  disabled={item.isLocked}
>
  <MyListItem item={item} />
</SwipeableRow>
```

## Color Palette Examples

Here are some common color combinations:

```tsx
// Standard actions
const colors = {
  edit: "#F59E0B",    // Orange
  delete: "#EF4444",  // Red
  archive: "#6B7280", // Gray
  share: "#3B82F6",   // Blue
  like: "#EC4899",    // Pink
  star: "#8B5CF6",    // Purple
  copy: "#10B981",    // Green
  info: "#06B6D4",    // Cyan
};
```

## Integration with BillCard

The SwipeableRow is already integrated into the BillCard component:

```tsx
// In BillCard component
const rightActions: SwipeAction[] = [];

if (canConfirm) {
  rightActions.push({
    id: "confirm",
    icon: "checkmark-circle",
    text: "Confirm",
    backgroundColor: "#ffa12e",
    onPress: handleCustomerConfirm,
  });
}

if (canMarkPaid) {
  rightActions.push({
    id: "paid",
    icon: "cash",
    text: "Paid",
    backgroundColor: priceColor,
    onPress: handleCustomerPaid,
  });
}

<SwipeableRow rightActions={rightActions}>
  <CardContent />
</SwipeableRow>
```

## Performance Tips

1. **Memoize actions**: Use `useMemo` for action arrays to prevent re-renders
2. **Optimize callbacks**: Use `useCallback` for action handlers
3. **Limit actions**: Keep action count reasonable (≤ 4 per side)
4. **Test on device**: Always test swipe gestures on physical devices

## Troubleshooting

### Actions not appearing
- Check that action arrays are not empty
- Verify `disabled` prop is not `true`
- Ensure proper gesture handler setup in your app

### Poor performance
- Reduce action count
- Optimize action callback functions
- Check for unnecessary re-renders

### Swipe not triggering
- Adjust `threshold` value
- Check for conflicting gesture handlers
- Verify touch events aren't being intercepted

## Migration from LongPress

If migrating from a LongPress implementation:

```tsx
// Before (LongPress)
<TouchableOpacity onLongPress={showActions}>
  <Content />
</TouchableOpacity>

// After (SwipeableRow)
<SwipeableRow rightActions={actions}>
  <TouchableOpacity onPress={handlePress}>
    <Content />
  </TouchableOpacity>
</SwipeableRow>
```