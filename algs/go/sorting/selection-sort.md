# Selection Sort

Divides the array into sorted and unsorted regions, repeatedly selecting the minimum element from the unsorted region.

## Implementation

```go
func selectionSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIdx] {
                minIdx = j
            }
        }
        arr[i], arr[minIdx] = arr[minIdx], arr[i]
    }
}
```

## Complexity
- **Time:** O(n²) all cases
- **Space:** O(1)

## When to Use
- Memory writes are expensive (minimizes number of swaps)
- Small datasets
