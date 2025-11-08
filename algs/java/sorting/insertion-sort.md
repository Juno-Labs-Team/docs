# Insertion Sort

Builds the final sorted array one item at a time by inserting elements into their correct position.

## Implementation

```java
public class InsertionSort {
    public static void sort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
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
