# Insertion Sort

Builds the final sorted array one item at a time by inserting elements into their correct position.

## Implementation

```go
func insertionSort(arr []int) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        j := i - 1
        
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
}
```

## Complexity
- **Time:** O(n²) worst/average case, O(n) best case
- **Space:** O(1)

## When to Use
- Small datasets
- Nearly sorted data
- Online sorting (sorting data as it arrives)
