"""
Solution for Contains Duplicate problem
LeetCode #1 (in game numbering)

Problem: Given an integer array nums, return true if any value appears
at least twice in the array, and return false if every element is distinct.
"""

def contains_duplicate(nums):
    """
    Check if array contains any duplicates using a set.

    Time Complexity: O(n)
    Space Complexity: O(n)

    Args:
        nums: List of integers

    Returns:
        bool: True if any duplicates exist, False otherwise
    """
    # Use a set to track seen numbers
    seen = set()

    for num in nums:
        # If we've seen this number before, we found a duplicate
        if num in seen:
            return True
        # Add the number to our set of seen numbers
        seen.add(num)

    # No duplicates found
    return False
