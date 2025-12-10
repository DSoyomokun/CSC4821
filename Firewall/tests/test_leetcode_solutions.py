"""
Unit tests for LeetCode problem solutions.

This test file automatically discovers all problem JSON files,
imports their corresponding Python solutions, and validates that
the solutions pass all test cases (including hidden test cases).
"""

import json
import os
import sys
import importlib.util
from pathlib import Path
import pytest

# Add solutions directory to Python path
TESTS_DIR = Path(__file__).parent
SOLUTIONS_DIR = TESTS_DIR / "solutions"
PROBLEMS_DIR = TESTS_DIR.parent / "public" / "data" / "problems"

sys.path.insert(0, str(SOLUTIONS_DIR))


def load_problem(problem_file):
    """Load a problem JSON file and return its data."""
    with open(problem_file, 'r') as f:
        return json.load(f)


def get_all_problems():
    """
    Discover all problem JSON files and return them as a list.

    Returns:
        list: List of tuples (problem_id, problem_data, problem_file_path)
    """
    problems = []

    if not PROBLEMS_DIR.exists():
        print(f"Warning: Problems directory not found: {PROBLEMS_DIR}")
        return problems

    for problem_file in PROBLEMS_DIR.glob("*.json"):
        try:
            problem_data = load_problem(problem_file)
            problem_id = problem_data.get("id")
            if problem_id:
                problems.append((problem_id, problem_data, problem_file))
        except Exception as e:
            print(f"Error loading {problem_file}: {e}")

    return problems


def import_solution(problem_id):
    """
    Dynamically import a solution module by problem ID.

    Args:
        problem_id: The problem identifier (e.g., 'contains_duplicate')

    Returns:
        module: The imported solution module

    Raises:
        ImportError: If the solution file doesn't exist
    """
    solution_file = SOLUTIONS_DIR / f"{problem_id}.py"

    if not solution_file.exists():
        raise ImportError(f"Solution file not found: {solution_file}")

    spec = importlib.util.spec_from_file_location(problem_id, solution_file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module


# Discover all problems
ALL_PROBLEMS = get_all_problems()

if not ALL_PROBLEMS:
    print(f"Warning: No problems found in {PROBLEMS_DIR}")


class TestLeetCodeSolutions:
    """Test class for all LeetCode problem solutions."""

    @pytest.mark.parametrize("problem_id,problem_data,problem_file", ALL_PROBLEMS,
                             ids=[p[0] for p in ALL_PROBLEMS])
    def test_solution_passes_all_test_cases(self, problem_id, problem_data, problem_file):
        """
        Test that the solution passes all test cases for a given problem.

        This includes both visible and hidden test cases.
        """
        # Import the solution module
        try:
            solution_module = import_solution(problem_id)
        except ImportError as e:
            pytest.fail(f"Could not import solution for {problem_id}: {e}")

        # Get the function name from the problem data
        function_name = problem_data.get("functionName")
        if not function_name:
            pytest.fail(f"No functionName specified in {problem_file}")

        # Convert camelCase to snake_case for Python
        python_function_name = self._camel_to_snake(function_name)

        # Get the function from the module
        if not hasattr(solution_module, python_function_name):
            pytest.fail(f"Function '{python_function_name}' not found in solution module")

        solution_function = getattr(solution_module, python_function_name)

        # Combine visible and hidden test cases
        all_test_cases = problem_data.get("testCases", []) + problem_data.get("hiddenTestCases", [])

        if not all_test_cases:
            pytest.skip(f"No test cases defined for {problem_id}")

        # Run each test case
        failed_tests = []
        for i, test_case in enumerate(all_test_cases):
            test_input = test_case.get("input")
            expected_output = test_case.get("expected")

            try:
                # Call the solution function
                # Handle both single argument and multiple arguments
                if isinstance(test_input, list):
                    # Check if it's a list of arguments or a single list argument
                    # This is a heuristic: if problem expects 1 param and input is list, pass as-is
                    num_params = len(problem_data.get("parameters", []))
                    if num_params == 1:
                        actual_output = solution_function(test_input)
                    else:
                        actual_output = solution_function(*test_input)
                else:
                    actual_output = solution_function(test_input)

                # Compare output
                if actual_output != expected_output:
                    failed_tests.append({
                        "test_number": i + 1,
                        "input": test_input,
                        "expected": expected_output,
                        "actual": actual_output,
                        "error": None
                    })
            except Exception as e:
                failed_tests.append({
                    "test_number": i + 1,
                    "input": test_input,
                    "expected": expected_output,
                    "actual": None,
                    "error": str(e)
                })

        # Assert all tests passed
        if failed_tests:
            failure_msg = f"\n{len(failed_tests)}/{len(all_test_cases)} test cases failed for {problem_id}:\n"
            for failure in failed_tests:
                failure_msg += f"\n  Test #{failure['test_number']}:\n"
                failure_msg += f"    Input: {failure['input']}\n"
                failure_msg += f"    Expected: {failure['expected']}\n"
                if failure['error']:
                    failure_msg += f"    Error: {failure['error']}\n"
                else:
                    failure_msg += f"    Actual: {failure['actual']}\n"

            pytest.fail(failure_msg)

    @pytest.mark.parametrize("problem_id,problem_data,problem_file", ALL_PROBLEMS,
                             ids=[p[0] for p in ALL_PROBLEMS])
    def test_solution_exists(self, problem_id, problem_data, problem_file):
        """Test that a solution file exists for each problem."""
        solution_file = SOLUTIONS_DIR / f"{problem_id}.py"
        assert solution_file.exists(), f"Solution file not found: {solution_file}"

    @pytest.mark.parametrize("problem_id,problem_data,problem_file", ALL_PROBLEMS,
                             ids=[p[0] for p in ALL_PROBLEMS])
    def test_problem_has_test_cases(self, problem_id, problem_data, problem_file):
        """Test that each problem has at least one test case."""
        test_cases = problem_data.get("testCases", [])
        assert len(test_cases) > 0, f"Problem {problem_id} has no test cases"

    @staticmethod
    def _camel_to_snake(name):
        """Convert camelCase to snake_case."""
        import re
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()


if __name__ == "__main__":
    # Allow running this file directly
    pytest.main([__file__, "-v"])
