# Merge Sort

Divide and conquer algorithm that divides the array into halves, recursively sorts them, and merges the sorted halves.

## Implementation

```java
public class MergeSort {

    public static void mergeSort(int[] array) {
        if (array.length < 2) {
            return; 
        }

        int mid = array.length / 2;
        int[] leftArray = new int[mid];
        int[] rightArray = new int[array.length - mid];

        for (int i = 0; i < mid; i++) {
            leftArray[i] = array[i];
        }
        for (int i = mid; i < array.length; i++) {
            rightArray[i - mid] = array[i];
        }

        mergeSort(leftArray);  
        mergeSort(rightArray); 

        merge(array, leftArray, rightArray); 
    }

    private static void merge(int[] array, int[] leftArray, int[] rightArray) {
        int L_index = 0; 
        int R_index = 0; 
        int O_index = 0; 

        while (i < leftArray.length && j < rightArray.length) {
            if (leftArray[L_index] <= rightArray[R_index]) {
                array[O_index] = leftArray[L_index];
                L_index++;
            } else {
                array[O_index] = rightArray[R_index];
                R_index++;
            }
            O_index++;
        }

        //remaning ele of leftArr
        while (L_index < leftArray.length) {
            array[O_index] = leftArray[L_index];
            L_index++;
            O_index++;
        }

        // remaining ele of rightArr
        while (R_index < rightArray.length) {
            array[O_index] = rightArray[j];
            R_index++;
            O_index++;
        }
    }
}
```

## Complexity
- **Time:** O(n log n) all cases
- **Space:** O(n)

## When to Use
- Stable sorting required
- Guaranteed O(n log n) performance
- LinO_indexed lists (no random access needed)
- External sorting (large datasets)
