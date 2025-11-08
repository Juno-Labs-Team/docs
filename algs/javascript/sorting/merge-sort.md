# Merge Sort

Divide and conquer algorithm that divides the array into halves, recursively sorts them, and merges the sorted halves.

## Implementation

```typescript
function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) {
        return arr;
    }
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
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
