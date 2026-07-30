import React, { useState, useEffect, useRef } from 'react';

type EffortLevel = 'low' | 'high' | 'max';

interface TerminalLine {
  text: string;
  type: 'system' | 'thought' | 'correction' | 'output';
}

const reasoningData = {
  math: {
    low: [
      { text: "[System] Received Input: Prove that for any prime p > 3, p^2 - 1 is divisible by 24.", type: "system" },
      { text: "[Output] Proof: Any prime p > 3 can be written in the form 6k±1.\nThus, p^2 - 1 = (6k±1)^2 - 1 = 36k^2 ± 12k = 12k(3k ± 1).\nSince one of k and (3k ± 1) must be even, 12k(3k ± 1) is divisible by 24.\nQ.E.D.", type: "output" }
    ],
    high: [
      { text: "[System] Received input, launching Chain of Thought...", type: "system" },
      { text: "[Thought] Goal: Prove 24 | (p^2 - 1). Factorize: p^2 - 1 = (p - 1)(p + 1).", type: "thought" },
      { text: "[Thought] Even divisibility property: Since p is an odd prime greater than 3, (p-1) and (p+1) must be consecutive even numbers. One must be a multiple of 4, and the other a multiple of 2. Therefore, 8 | (p-1)(p+1).", type: "thought" },
      { text: "[Thought] Modulo 3 property: Since p is not divisible by 3, by remainders, either p-1 or p+1 must be divisible by 3. Therefore, 3 | (p-1)(p+1).", type: "thought" },
      { text: "[Thought] Since gcd(3, 8) = 1, their product 3 * 8 = 24 divides p^2 - 1.", type: "thought" },
      { text: "[Output] Proof Conclusion:\n1. p^2 - 1 = (p-1)(p+1).\n2. Since p is odd, (p-1) and (p+1) are consecutive even numbers, meaning their product is divisible by 8.\n3. Among three consecutive integers, one must be a multiple of 3. Since p is prime, either p-1 or p+1 is divisible by 3.\n4. Therefore, p^2 - 1 is divisible by 3 * 8 = 24.", type: "output" }
    ],
    max: [
      { text: "[System] Received input, starting symbolic computation verification in AgentEnv VM...", type: "system" },
      { text: "[Thought] Goal: Prove that for any prime p > 3, p^2 - 1 is divisible by 24.", type: "thought" },
      { text: "[Thought] Empirically verifying for small primes first. p=5: 5^2-1=24; p=7: 7^2-1=48; p=11: 11^2-1=120. Empirical formulas all hold.", type: "thought" },
      { text: "[Thought] Attempting modulo operations. Remainders of p mod 24 can only be: 1, 5, 7, 11, 13, 17, 19, 23 (numbers coprime to 24).", type: "thought" },
      { text: "[Thought] Proof Strategy 1: Algebraic expansion. p^2 - 1 = (p-1)(p+1).", type: "thought" },
      { text: "[Thought] Since p > 3 is odd, p-1 and p+1 are consecutive even numbers. Letting p = 2k+1 (k>=2), then (p-1)(p+1) = (2k)(2k+2) = 4k(k+1).", type: "thought" },
      { text: "[Thought] Since k and k+1 are consecutive integers, one of them must be even, so k(k+1) is divisible by 2. Thus, 4k(k+1) must be divisible by 8. Hence, 8 | p^2-1.", type: "thought" },
      { text: "[Thought] Strategy 2: Prove 3 | p^2-1. Among three consecutive integers p-1, p, p+1, one must be a multiple of 3.", type: "thought" },
      { text: "[Thought] Since p is a prime greater than 3, p cannot be divisible by 3. Therefore, either p-1 or p+1 is a multiple of 3. This proves that (p-1)(p+1) is divisible by 3. Hence, 3 | p^2-1.", type: "thought" },
      { text: "[Sandbox Validation] Launching Firecracker sandbox, configuring Python sympy to run inductive reasoning verification on large primes...", type: "system" },
      { text: "[Sandbox Output] Sympy module running normally, no counterexamples found for the first 1,000,000 primes. Formal logical induction shows the proof is complete.", type: "thought" },
      { text: "[Thought] Combining conclusions. Since 3 and 8 are coprime, their product 24 must divide p^2-1. Proof holds, formatting output certificate.", type: "thought" },
      { text: "[Output] Rigorous Algebraic Proof:\nFor any prime p > 3:\n1. Factorization: p^2 - 1 = (p - 1)(p + 1).\n2. Divisibility by 8: Since p is a prime greater than 3, p is odd. Therefore, p-1 and p+1 are consecutive even numbers. One must be a multiple of 4 and the other a multiple of 2, so their product is divisible by 4 * 2 = 8.\n3. Divisibility by 3: Among three consecutive integers p-1, p, p+1, one must be a multiple of 3. Since p is a prime greater than 3, it cannot be divisible by 3, so either p-1 or p+1 must be a multiple of 3. Thus, their product is divisible by 3.\n4. Conclusion: Since p^2-1 is divisible by both 8 and 3, and gcd(8, 3)=1, p^2-1 must be divisible by 8 * 3 = 24.\nConclusion holds.", type: "output" }
    ]
  },
  code: {
    low: [
      { text: "[System] Received Input: Implement a distributed lock with adaptive retries and exponential backoff.", type: "system" },
      { text: "[Output] Redis Distributed Lock Python Implementation:\n```python\nimport time, uuid\n\ndef get_lock(redis_client, key, expire=5000):\n    val = str(uuid.uuid4())\n    if redis_client.set(key, val, nx=True, px=expire):\n        return val\n    return False\n```", type: "output" }
    ],
    high: [
      { text: "[System] Received input, launching Chain of Thought...", type: "system" },
      { text: "[Thought] Distributed lock acquisition core logic design: adaptive retry + exponential backoff + Lua atomic release.", type: "thought" },
      { text: "[Thought] Adaptive delay formula: delay = min(max_delay, base * (factor ^ attempt)) + jitter.", type: "thought" },
      { text: "[Thought] Releasing the lock must verify the UUID token to prevent accidental release of locks held by other instances, using a Lua script to ensure atomicity.", type: "thought" },
      { text: "[Output] Core Code Architecture:\n```python\nimport time, uuid, random\n\nclass RedisLock:\n    def __init__(self, client, key, lease_ms=5000):\n        self.client = client\n        self.key = key\n        self.lease_ms = lease_ms\n\n    def acquire(self, timeout_ms=3000):\n        val = str(uuid.uuid4())\n        end = time.time() + (timeout_ms / 1000.0)\n        attempt = 0\n        base_delay = 0.05\n        \n        while time.time() < end:\n            if self.client.set(self.key, val, nx=True, px=self.lease_ms):\n                return val\n            # Backoff\n            delay = min(1.0, base_delay * (2 ** attempt))\n            time.sleep(delay + random.uniform(0, delay))\n            attempt += 1\n        return False\n```", type: "output" }
    ],
    max: [
      { text: "[System] Received Input: Creating a high-concurrency simulation environment in AgentEnv (Firecracker micro-sandbox)...", type: "system" },
      { text: "[Thought] Task: Robust implementation of distributed lock under high concurrency, with adaptive exponential backoff and auto-renewal Watch Dog.", type: "thought" },
      { text: "[Thought] First, implement the unlock Lua script to ensure atomic verification:\n```lua\nif redis.call('get', KEYS[1]) == ARGV[1] then\n    return redis.call('del', KEYS[1])\nelse\n    return 0\nend\n```", type: "thought" },
      { text: "[Thought] Implement adaptive retries: if the first few attempts fail, automatically increase the backoff base to alleviate pressure on Redis nodes.", type: "thought" },
      { text: "[Thought] Pain point analysis: lock auto-releases on timeout, but long business logic is still running. A background thread (Watch Dog) must be set to periodically extend the TTL.", type: "thought" },
      { text: "[Sandbox Running] Running Python redis client in isolated VM, simulating 200 concurrent processes competing for a single lock...", type: "system" },
      { text: "[Correction] Concurrency pressure test failed! Some retry threads woke up simultaneously due to synchronized exponential backoff delays, causing a thundering herd effect, lock acquisition success rate collapse, and CPU spike. Need to modify the random jitter algorithm.", type: "correction" },
      { text: "[Thought] Modify jitter logic: introduce complete random jitter within the backoff range: jitter = random.uniform(0, current_delay). Testing again.", type: "thought" },
      { text: "[Sandbox Running] Second round of concurrency pressure testing running...", type: "system" },
      { text: "[Sandbox Output] CPU load flattened, lock contention decreased by 72%, acquisition success rate neared 100%. Test passed!", type: "thought" },
      { text: "[Output] Industrial-grade complete Python distributed lock implementation:\n```python\nimport threading, time, uuid, random\n\nLUA_UNLOCK_SCRIPT = \"\"\"\nif redis.call('get', KEYS[1]) == ARGV[1] then\n    return redis.call('del', KEYS[1])\nelse\n    return 0\nend\n\"\"\"\n\nclass DistributedLock:\n    def __init__(self, r_client, key, lease_ms=10000):\n        self.redis = r_client\n        self.key = key\n        self.lease_ms = lease_ms\n        self.uuid = None\n        self.is_locked = False\n\n    def acquire(self, timeout_ms=5000):\n        self.uuid = str(uuid.uuid4())\n        limit = time.time() + (timeout_ms / 1000.0)\n        attempt = 0\n        \n        while time.time() < limit:\n            if self.redis.set(self.key, self.uuid, nx=True, px=self.lease_ms):\n                self.is_locked = True\n                self._start_watchdog()\n                return True\n            # Adaptive exponential backoff and jitter\n            backoff = min(1.5, 0.02 * (1.8 ** attempt))\n            time.sleep(backoff + random.uniform(0, backoff))\n            attempt += 1\n        return False\n\n    def release(self):\n        self.is_locked = False\n        return self.redis.eval(LUA_UNLOCK_SCRIPT, 1, self.key, self.uuid)\n```", type: "output" }
    ]
  },
  agent: {
    low: [
      { text: "[System] Received Input: Locate mysql container crash logs in isolated container and auto-repair.", type: "system" },
      { text: "[Output] Table Repair Plan:\n1. Log in to the container: \`docker exec -it mysql-container bash\`.\n2. Query the crash logs to locate the crashed table.\n3. Execute MySQL command: \`REPAIR TABLE database.table_name;\` to repair table structures corrupted by logical errors.", type: "output" }
    ],
    high: [
      { text: "[System] Received input, launching Chain of Thought...", type: "system" },
      { text: "[Thought] Task: Autonomous troubleshooting. We need to extract the mysql container's recent crash logs, analyze them, and execute a repair.", type: "thought" },
      { text: "[Thought] Executing \`docker logs\` to look for error keywords like 'InnoDB: error', 'corruption', 'marked as crashed'.", type: "thought" },
      { text: "[Thought] If logs show InnoDB internal index page corruption, set \`innodb_force_recovery = 4\` in \`my.cnf\` to force process startup and export backup.", type: "thought" },
      { text: "[Output] Automated Troubleshooting Script:\n```bash\n# 1. Capture core crash logs\ndocker logs mysql-container 2>&1 | grep -iE 'error|crashed|corrupt' > db_err.log\n# 2. Repair corrupted table\ndocker exec -i mysql-container mysql -u root -p'pass' -e \"REPAIR TABLE main.users;\"\n```", type: "output" }
    ],
    max: [
      { text: "[System] Received Input: Launching simulated crashed MySQL container and cloning state in AgentEnv distributed sandbox...", type: "system" },
      { text: "[Thought] Task: Troubleshoot and repair database crash failure in isolated container. Defining autonomous diagnostic decision tree.", type: "thought" },
      { text: "[Thought] Action 1: Test port 3306 connection. Received error \`Connection refused\`. Process is not running.", type: "thought" },
      { text: "[Thought] Action 2: Log in to container, check running processes with \`ps aux\`. Verified no \`mysqld\` process.", type: "thought" },
      { text: "[Thought] Action 3: Read last 50 lines of \`/var/log/mysql/error.log\` to extract the crash reason.", type: "thought" },
      { text: "[Thought] Log contains critical error: \`InnoDB: Write to file ./ibdata1 failed at offset 104857600. Error 28: No space left on device\`.", type: "thought" },
      { text: "[Thought] Root cause identified: Not table corruption, but container partition disk space is completely full, causing InnoDB writes to interrupt and crash.", type: "thought" },
      { text: "[Thought] Action 4: Run \`df -h\`. Confirmed root mount usage at 100%.", type: "thought" },
      { text: "[Thought] Action 5: Search for cleanable files. Found huge backlog of historical \`access.log\` under \`/var/log/nginx/\` without logrotate, total size 9.4GB.", type: "thought" },
      { text: "[Thought] Action 6: Safely release space. Run \`rm -f /var/log/nginx/access.log.*\` and clear active logs. Re-scan \`df -h\`, utilization dropped to 45%.", type: "thought" },
      { text: "[Thought] Action 7: Restart database service via \`service mysql start\` and monitor health metrics. Service started successfully!", type: "thought" },
      { text: "[Sandbox Running] Running concurrent write tests on repaired sandbox database to verify data consistency...", type: "system" },
      { text: "[Correction] Write test failed: Due to forced interruption during space exhaustion, some transactions show inconsistency post-restart due to missing undo logs. Running \`mysqlcheck --all-databases --auto-repair\`.", type: "correction" },
      { text: "[Sandbox Running] Second round of consistency self-healing test...", type: "system" },
      { text: "[Sandbox Output] Verification succeeded, no bad blocks or inconsistencies found. Database status restored to normal.", type: "thought" },
      { text: "[Output] Diagnostic & Self-Healing Report:\n1. **Crash Trigger**: MySQL disk space exhausted by Nginx logs (9.4GB), write operations triggered \`Error 28\` leading to database crash.\n2. **Self-Healing Executed**:\n   - Cleaned up Nginx historical log garbage;\n   - Released 55% disk space;\n   - Executed crash self-healing check and restarted MySQL process;\n   - Performed database index consistency atomic self-check.\n3. **Prevention Recommendation**: Configure Nginx Logrotate and set disk warning alerts at 85% utilization.", type: "output" }
    ]
  }
};

export const ReasoningSandbox: React.FC = () => {
  const [category, setCategory] = useState<'math' | 'code' | 'agent'>('math');
  const [level, setLevel] = useState<EffortLevel>('low');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalLines([]);

    const lines = reasoningData[category][level];
    let idx = 0;

    const printNext = () => {
      if (idx < lines.length) {
        const line = lines[idx];
        setTerminalLines(prev => [...prev, line as TerminalLine]);
        idx++;

        let delay = 500;
        if (line.type === 'thought') delay = 900;
        if (line.type === 'correction') delay = 1400;
        if (line.text.includes('Sandbox') || line.text.includes('sandbox')) delay = 1300;

        setTimeout(printNext, delay);
      } else {
        setIsRunning(false);
      }
    };

    printNext();
  };

  useEffect(() => {
    // Auto scroll terminal to bottom
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLines]);

  return (
    <div className="tab-panel active">
      <header>
        <div className="badge">Chapter 4.2 - Reasoning Effort RL Sandbox</div>
        <h1>Reinforcement Learning & Reasoning Extrapolation Sandbox</h1>
        <p className="subtitle">Solving complex problems through On-Policy Multi-Expert Distillation and adaptive reasoning depth</p>
      </header>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
            Reasoning Effort Inference Controller
          </div>
          
          <div className="playground-input-group">
            <label style={{ fontSize: '1.02rem', color: '#94A3B8', fontWeight: 600 }}>Select Problem Domain:</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as 'math' | 'code' | 'agent')}
              disabled={isRunning}
            >
              <option value="math">Math Puzzle: Prove p² - 1 is divisible by 24 (for prime p &gt; 3)</option>
              <option value="code">Complex Code: Distributed Lock with Exponential Backoff and Watchdog Renewal</option>
              <option value="agent">Agent Troubleshooting: Autonomous Detection and Self-Healing of MySQL Container Crash</option>
            </select>
          </div>

          <div className="effort-selectors">
            <div 
              className={`effort-option ${level === 'low' ? 'active' : ''} ${isRunning ? 'btn-disabled' : ''}`} 
              data-level="low"
              onClick={() => !isRunning && setLevel('low')}
            >
              <h4>Low Effort</h4>
              <p>Lightweight Direct Answer</p>
            </div>
            <div 
              className={`effort-option ${level === 'high' ? 'active' : ''} ${isRunning ? 'btn-disabled' : ''}`} 
              data-level="high"
              onClick={() => !isRunning && setLevel('high')}
            >
              <h4>High Effort</h4>
              <p>Structured Chain of Thought</p>
            </div>
            <div 
              className={`effort-option ${level === 'max' ? 'active' : ''} ${isRunning ? 'btn-disabled' : ''}`} 
              data-level="max"
              onClick={() => !isRunning && setLevel('max')}
            >
              <h4>Max Effort</h4>
              <p>Deep Search & Sandbox Debugging</p>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={runSimulation}
            disabled={isRunning}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            {isRunning ? 'Inference Engine Running...' : 'Run Inference Simulation'}
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><line x1="9" y1="2" x2="9" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
            AgentEnv Execution Trace
          </div>
          
          <div className="reasoning-terminal">
            {terminalLines.length === 0 ? (
              <div className="terminal-line system">Ready. Select category, effort level, and run simulator.</div>
            ) : (
              terminalLines.map((line, idx) => (
                <div key={idx} className={`terminal-line ${line.type}`}>
                  {line.text}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
