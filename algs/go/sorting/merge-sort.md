# Merge Sort

Divide and conquer algorithm that divides the array into halves, recursively sorts them, and merges the sorted halves.

## Implementation

```go
func mergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    
    mid := len(arr) / 2
    left := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])
    
    return merge(left, right)
}

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i])
            i++
        } else {
            result = append(result, right[j])
            j++
        }
    }
    
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}
```

## Complexity
- **Time:** O(n log n) all cases
- **Space:** O(n)

## When to Use
- Stable sorting required
- Guaranteed O(n log n) performance
- Linked lists (no random access needed)
- External sorting (large datasets)
