# QuickSort 3-Way Partitioning

An optimization of QuickSort that handles duplicate elements efficiently using three-way partitioning.

## Implementation

```cpp
void quickSort3Way(int arr[], int low, int high) {
    if (low >= high) return;
    
    int lt = low, gt = high;
    int pivot = arr[low];
    int i = low + 1;
    
    while (i <= gt) {
        if (arr[i] < pivot) {
            std::swap(arr[lt++], arr[i++]);
        } else if (arr[i] > pivot) {
            std::swap(arr[i], arr[gt--]);
        } else {
            i++;
        }
    }
    
    quickSort3Way(arr, low, lt - 1);
    quickSort3Way(arr, gt + 1, high);
}
```

## Complexity
- **Time:** O(n log n) average case, O(n²) worst case, O(n) with many duplicates
- **Space:** O(log n)

## When to Use
- Datasets with many duplicate values
- Better performance than standard QuickSort on such datasets
- General-purpose efficient sorting
