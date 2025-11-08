# Selection Sort

Divides the array into sorted and unsorted regions, repeatedly selecting the minimum element from the unsorted region.

## Implementation

```java
public class SelectionSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }
}
```

## Complexity
- **Time:** O(n²) all cases
- **Space:** O(1)

## When to Use
- Memory writes are expensive (minimizes number of swaps)
- Small datasets
