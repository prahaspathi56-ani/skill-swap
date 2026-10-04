import { describe, it, expect } from 'vitest';
import { CodingSandboxService } from '../services/codingSandboxService';

describe('CodingSandboxService Safe Evaluator', () => {
  const sandbox = new CodingSandboxService();

  it('should evaluate JavaScript solution function safely', async () => {
    const code = `
      function twoSum(input) {
        const { nums, target } = JSON.parse(input);
        for (let i = 0; i < nums.length; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) return JSON.stringify([i, j]);
          }
        }
        return "[]";
      }
    `;

    const testCases = [
      { input: '{"nums":[2,7,11,15],"target":9}', expectedOutput: '[0,1]' },
      { input: '{"nums":[3,2,4],"target":6}', expectedOutput: '[1,2]' },
    ];

    const result = await sandbox.evaluateSubmission('javascript', code, testCases);
    expect(result.status).toBe('ACCEPTED');
    expect(result.passedTests).toBe(2);
    expect(result.totalTests).toBe(2);
  });

  it('should reject empty code with an error', async () => {
    const result = await sandbox.evaluateSubmission('javascript', '   ', []);
    expect(result.status).toBe('RUNTIME_ERROR');
    expect(result.outputLog).toContain('Empty code');
  });
});
