# Bubble Sort

Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.

## Implementation

```cpp
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}
```

## Complexity
- **Time:** O(n²) worst/average case, O(n) best case
- **Space:** O(1)

## When to Use
- Educational purposes
- Nearly sorted data with optimization
- Detecting if array is already sorted
