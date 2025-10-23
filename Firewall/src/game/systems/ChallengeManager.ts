import { Scene } from 'phaser';

export interface TestCase {
    input: any[];
    expected: any;
}

export interface Challenge {
    id: string;
    tier: 'white' | 'blue' | 'black';
    title: string;
    description: string;
    example: string;
    testCases: TestCase[];
    functionName: string;
    reward: number;
}

interface ChallengesData {
    challenges: Challenge[];
}

/**
 * ChallengeManager - Manages loading and retrieving coding challenges
 */
export class ChallengeManager {
    private scene: Scene;
    private challenges: Map<string, Challenge> = new Map();
    private completedChallenges: Set<string> = new Set();

    constructor(scene: Scene) {
        this.scene = scene;
        this.loadChallenges();
    }

    private loadChallenges(): void {
        const data = this.scene.cache.json.get('challenges') as ChallengesData;

        if (data && data.challenges) {
            for (const challenge of data.challenges) {
                this.challenges.set(challenge.id, challenge);
            }
            console.log(`Loaded ${this.challenges.size} challenges`);
        } else {
            console.error('Failed to load challenges');
        }
    }

    public getChallenge(id: string): Challenge | undefined {
        return this.challenges.get(id);
    }

    public getChallengesByTier(tier: 'white' | 'blue' | 'black'): Challenge[] {
        const tierChallenges: Challenge[] = [];
        for (const challenge of this.challenges.values()) {
            if (challenge.tier === tier) {
                tierChallenges.push(challenge);
            }
        }
        return tierChallenges;
    }

    public markComplete(id: string): void {
        this.completedChallenges.add(id);
        console.log(`Marked challenge ${id} as complete`);
    }

    public isCompleted(id: string): boolean {
        return this.completedChallenges.has(id);
    }

    public getCompletedCount(): number {
        return this.completedChallenges.size;
    }

    public getTotalCount(): number {
        return this.challenges.size;
    }

    public getProgress(): { completed: number; total: number } {
        return {
            completed: this.getCompletedCount(),
            total: this.getTotalCount()
        };
    }
}
