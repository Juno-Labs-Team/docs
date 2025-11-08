# Selection Sort

Divides the array into sorted and unsorted regions, repeatedly selecting the minimum element from the unsorted region.

## Implementation

```cpp
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        std::swap(arr[i], arr[minIdx]);
    }
}
```

## Complexity
- **Time:** O(n²) all cases
- **Space:** O(1)

## When to Use
- Memory writes are expensive (minimizes number of swaps)
- Small datasets
