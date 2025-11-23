export interface LeetCodeProblem {
    id: string;
    number: number;
    title: string;
    difficulty: number; // 1-10 scale for granular difficulty
    leetcodeDifficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    topics: string[]; // Multiple topics
    description: string;
    examples: Example[];
    constraints: string[];
    hints?: string[];
    functionName: string;
    functionSignature: string;
    parameters: string[];
    parametersJava?: string;
    returnType: string;
    starterCode?: string;
    starterCodePython?: string;
    starterCodeJava?: string;
    testCases: TestCase[];
    hiddenTestCases?: TestCase[];
    reward: number;
    companies?: string[]; // Companies that ask this question
    similarProblems?: string[]; // IDs of similar problems
}

export interface Example {
    input: string;
    output: string;
    explanation?: string;
}

export interface TestCase {
    input: any;
    expected: any;
}

export interface TestResult {
    passed: boolean;
    input: any;
    expected: any;
    actual: any;
    error: string | null;
    executionTime: number;
}
