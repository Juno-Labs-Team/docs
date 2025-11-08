# QuickSort 3-Way Partitioning

QuickSort with 3-way partitioning is an optimization for datasets with many duplicate elements.

## Implementation

```java
public class quicksort3 {

    static void sort(int[] array, int low, int high) {
        if (high <= low) {
            return;
        }

        int lt = low;
        int gt = high;
        int i = low;

        int pivot = array[low];

        while (i <= gt) {
            if (array[i] < pivot) {
                swap(array, lt, i);
                lt++;
                i++;
            } else if (array[i] > pivot) {
                swap(array, i, gt);
                gt--;
            } else {
                i++;
            }
        }

        sort(array, low, lt - 1);
        sort(array, gt + 1, high);
    }

    static void swap(int[] array, int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
```

## Complexity
- **Time:** O(n log n) average case, O(n²) worst case, O(n) with many duplicates
- **Space:** O(log n)

## When to Use
- Datasets with many duplicate values
- Better performance than standard QuickSort on such datasets
- General-purpose efficient sorting
