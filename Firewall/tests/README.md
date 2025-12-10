# LeetCode Solutions Testing

This directory contains unit tests for all LeetCode problem solutions used in the Firewall game.

## Structure

```
tests/
├── solutions/               # Python solution files
│   └── contains_duplicate.py
├── test_leetcode_solutions.py  # Main test file
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Setup

1. **Install Python dependencies:**

```bash
cd Firewall/tests
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
cd Firewall/tests
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running Tests

### Run all tests

```bash
cd Firewall/tests
pytest test_leetcode_solutions.py -v
```

### Run tests with coverage

```bash
pytest test_leetcode_solutions.py -v --cov=solutions --cov-report=html
```

### Run tests for a specific problem

```bash
pytest test_leetcode_solutions.py -v -k "contains_duplicate"
```

## How It Works

The test suite automatically:

1. **Discovers all problems**: Scans `public/data/problems/*.json` for problem definitions
2. **Imports solutions**: Dynamically imports corresponding Python solutions from `solutions/`
3. **Runs test cases**: Executes all test cases (including hidden ones) against each solution
4. **Validates results**: Ensures each solution passes 100% of test cases

## Adding New Problems

When you add a new problem:

1. **Create the problem JSON** in `public/data/problems/your_problem.json`
2. **Create the solution** in `tests/solutions/your_problem.py`
3. **Run the tests** - they will automatically discover and test the new problem!

### Example: Adding "Two Sum" problem

1. Create `public/data/problems/two_sum.json` with test cases
2. Create `tests/solutions/two_sum.py`:

```python
def two_sum(nums, target):
    """
    Find two numbers that add up to target.
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

3. Run `pytest test_leetcode_solutions.py -v` - done!

## Test Output

The tests provide detailed feedback:

```
test_leetcode_solutions.py::TestLeetCodeSolutions::test_solution_passes_all_test_cases[contains_duplicate] PASSED
test_leetcode_solutions.py::TestLeetCodeSolutions::test_solution_exists[contains_duplicate] PASSED
test_leetcode_solutions.py::TestLeetCodeSolutions::test_problem_has_test_cases[contains_duplicate] PASSED
```

If a test fails, you'll see:

```
Test #2:
  Input: [1, 2, 3, 4]
  Expected: false
  Actual: true
```

## CI/CD Integration

You can integrate these tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run LeetCode solution tests
  run: |
    cd Firewall/tests
    pip install -r requirements.txt
    pytest test_leetcode_solutions.py -v
```

## Tips

- **Test-Driven Development**: Write the test cases in the JSON first, then implement the solution
- **Edge Cases**: Always include edge cases in `hiddenTestCases` (empty arrays, single elements, etc.)
- **Performance**: The test suite measures execution time - optimize solutions that are too slow
