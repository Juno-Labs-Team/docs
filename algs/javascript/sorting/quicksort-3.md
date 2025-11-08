# QuickSort 3-Way Partitioning

An optimization of QuickSort that handles duplicate elements efficiently using three-way partitioning.

## Implementation

```typescript
function quickSort3Way(arr: number[], low: number = 0, high: number = arr.length - 1): void {
    if (low >= high) return;
    
    let lt = low, gt = high;
    const pivot = arr[low];
    let i = low + 1;
    
    while (i <= gt) {
        if (arr[i] < pivot) {
            [arr[lt], arr[i]] = [arr[i], arr[lt]];
            lt++;
            i++;
        } else if (arr[i] > pivot) {
            [arr[i], arr[gt]] = [arr[gt], arr[i]];
            gt--;
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
