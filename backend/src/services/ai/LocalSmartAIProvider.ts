import {
  AIProvider,
  AIExplanationResult,
  AIRoadmapGenerated,
  AISkillRecommendation,
  AIEnglishPracticeResult,
} from './AIProvider';

export class LocalSmartAIProvider implements AIProvider {
  name = 'SkillSwap Local Smart AI Engine';

  isAvailable(): boolean {
    return true;
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    const p = prompt.toLowerCase();

    if (p.includes('react') || p.includes('frontend')) {
      return (
        "In modern React, component architecture centers around functional components and hooks like `useState` and `useEffect`. " +
        "When managing state between student peers, focus on unidirectional data flow and clean prop drilling prevention. " +
        "Tip for SkillSwap sessions: Break your component into a presenter UI and custom hooks for data fetching!"
      );
    }

    if (p.includes('python') || p.includes('data') || p.includes('pandas')) {
      return (
        "Python's strength in data science comes from vectorization in NumPy and Pandas. " +
        "When analyzing datasets, avoid slow Python `for` loops and instead leverage `.apply()` or vectorized boolean masks. " +
        "If you want to practice together, schedule a quick peer session with someone teaching Python Data Structures!"
      );
    }

    if (p.includes('sql') || p.includes('database')) {
      return (
        "SQL queries execute in a logical order different from lexical writing: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY. " +
        "Understanding this pipeline makes writing complex JOINs and analytical window functions much more intuitive."
      );
    }

    if (p.includes('webrtc') || p.includes('video') || p.includes('peer')) {
      return (
        "WebRTC establishes peer-to-peer real-time audio/video using SDP (Session Description Protocol) offers and answers exchanged via a signaling channel. " +
        "ICE candidates discover network paths (STUN handles NAT traversal, TURN relays if firewall blocks direct P2P)."
      );
    }

    return (
      `Here is a structured explanation to help you understand:\n\n` +
      `1. **Core Concept**: Let's break this down into first principles. Rather than memorizing the syntax, understand why this pattern exists.\n` +
      `2. **Step-by-step Insight**: Examine inputs, state transformations, and edge cases.\n` +
      `3. **Peer Exchange Advice**: The best way to solidify this topic is to explain it to another student on SkillSwap!`
    );
  }

  async explainConcept(
    concept: string,
    studentQuestion?: string,
    level: string = 'INTERMEDIATE'
  ): Promise<AIExplanationResult> {
    const q = (studentQuestion || concept).toLowerCase();

    return {
      explanation:
        `### Concept Breakdown: ${concept}\n\n` +
        `When learning **${concept}** at a ${level.toLowerCase()} level, it is essential to understand both the underlying mechanism and how to apply it practically.\n\n` +
        `**Key Principle**: Break the problem down into distinct, testable units. Identify what data is being transformed and where side-effects occur.\n\n` +
        `**Common Pitfall**: Students often jump directly to complex abstractions before writing out a basic concrete working example on paper or in pseudo-code.`,
      hints: [
        'Hint 1: Trace the execution step-by-step with small sample values.',
        'Hint 2: Consider edge cases such as empty collections, zero values, or null inputs.',
        'Hint 3: Try drawing a quick diagram of the data flow before writing actual code.',
      ],
      practiceQuestion: `How would you explain the difference between a stateful and stateless approach when implementing ${concept}?`,
      suggestedAction: 'Ask a fellow student who lists this skill in their profile for a 30-minute peer review!',
    };
  }

  async generateRoadmap(targetGoal: string): Promise<AIRoadmapGenerated> {
    const goalLower = targetGoal.toLowerCase();

    if (goalLower.includes('data analyst') || goalLower.includes('data analytics')) {
      return {
        title: 'Data Analyst Mastery Roadmap',
        targetRole: 'Data Analyst',
        description: 'A structured, student-tested pathway from spreadsheet fundamentals to statistical SQL and predictive dashboards.',
        items: [
          {
            order: 1,
            title: '1. Advanced Excel & Tabular Modeling',
            description: 'Master pivot tables, VLOOKUP/XLOOKUP, index-match, and structured references.',
            recommendedSkillName: 'Data Science',
          },
          {
            order: 2,
            title: '2. Relational Databases & SQL',
            description: 'Write aggregate queries, JOIN operations, subqueries, and window functions.',
            recommendedSkillName: 'Data Science',
          },
          {
            order: 3,
            title: '3. Python for Data Analysis',
            description: 'Explore NumPy arrays, Pandas DataFrames, and data cleaning techniques.',
            recommendedSkillName: 'Programming',
          },
          {
            order: 4,
            title: '4. Data Visualization & Storytelling',
            description: 'Build interactive dashboards using Tableau, Power BI, or Matplotlib/Seaborn.',
            recommendedSkillName: 'UI/UX',
          },
          {
            order: 5,
            title: '5. Applied Business Statistics',
            description: 'Hypothesis testing, A/B test analysis, distributions, and regression models.',
            recommendedSkillName: 'Mathematics',
          },
          {
            order: 6,
            title: '6. Capstone Portfolio Project',
            description: 'Deliver an end-to-end data story on GitHub with clean documentation and presentation.',
            recommendedSkillName: 'Communication',
          },
        ],
      };
    }

    if (goalLower.includes('full stack') || goalLower.includes('web')) {
      return {
        title: 'Modern Full-Stack Web Development',
        targetRole: 'Full Stack Engineer',
        description: 'From semantic HTML and modern React to scalable Express APIs, relational databases, and real-time WebSockets.',
        items: [
          {
            order: 1,
            title: '1. Modern TypeScript & JavaScript (ES6+)',
            description: 'Master closures, async/await, promises, generics, and type-safe contracts.',
            recommendedSkillName: 'Web Development',
          },
          {
            order: 2,
            title: '2. Responsive Frontend with React & Tailwind CSS',
            description: 'Component lifecycles, hooks, accessible UI design, and responsive layouts.',
            recommendedSkillName: 'Web Development',
          },
          {
            order: 3,
            title: '3. Backend REST APIs with Node.js & Express',
            description: 'Routing, middleware, JWT authentication, error handling, and rate limiting.',
            recommendedSkillName: 'Web Development',
          },
          {
            order: 4,
            title: '4. Relational Database Modeling with Prisma & PostgreSQL',
            description: 'Schema normalization, migrations, relations, indexes, and transactions.',
            recommendedSkillName: 'Programming',
          },
          {
            order: 5,
            title: '5. Real-Time Communication with WebSockets & WebRTC',
            description: 'Event-driven bi-directional messaging, rooms, and peer-to-peer media streaming.',
            recommendedSkillName: 'Web Development',
          },
          {
            order: 6,
            title: '6. Testing, Docker & Cloud Deployment',
            description: 'Containerization, unit/integration testing, CI/CD, and production monitoring.',
            recommendedSkillName: 'Cloud Computing',
          },
        ],
      };
    }

    // Generic roadmap
    return {
      title: `${targetGoal} Learning Roadmap`,
      targetRole: targetGoal,
      description: `A systematic student milestone roadmap tailored for mastering ${targetGoal} through peer exchanges.`,
      items: [
        {
          order: 1,
          title: `1. Fundamentals of ${targetGoal}`,
          description: 'Establish foundational terminology, core tools, and key mental models.',
          recommendedSkillName: 'Programming',
        },
        {
          order: 2,
          title: '2. Core Principles & Practical Techniques',
          description: 'Deep dive into everyday methodologies, best practices, and standard patterns.',
          recommendedSkillName: 'Web Development',
        },
        {
          order: 3,
          title: '3. Intermediate Problem Solving',
          description: 'Solve real-world challenges, debug common traps, and build non-trivial components.',
          recommendedSkillName: 'Data Science',
        },
        {
          order: 4,
          title: '4. Collaborative Peer Review',
          description: 'Pair with another student on SkillSwap to critique code, architecture, or design.',
          recommendedSkillName: 'Communication',
        },
        {
          order: 5,
          title: '5. Comprehensive Capstone Showcase',
          description: 'Publish a polished, production-grade deliverable demonstrating mastery.',
          recommendedSkillName: 'Public Speaking',
        },
      ],
    };
  }

  async recommendSkills(
    skillsLearning: string[],
    skillsTeaching: string[],
    goals: string[]
  ): Promise<AISkillRecommendation[]> {
    const list: AISkillRecommendation[] = [];

    if (!skillsLearning.includes('UI/UX') && skillsLearning.includes('Web Development')) {
      list.push({
        skillName: 'UI/UX Design',
        reason: 'Pairing UI/UX with Web Development gives you full creative agency over product look, feel, and usability.',
        learningTips: 'Study visual hierarchy, typography scales, and Figma auto-layout.',
        suggestedPractice: 'Design a clean student profile card before coding it in Tailwind CSS.',
      });
    }

    if (!skillsLearning.includes('Cloud Computing')) {
      list.push({
        skillName: 'Cloud Computing',
        reason: 'Deploying your applications to Docker containers and cloud environments makes your projects verifiable.',
        learningTips: 'Learn container basics, environment configuration, and reverse proxies.',
        suggestedPractice: 'Containerize an Express + PostgreSQL application with Docker Compose.',
      });
    }

    list.push({
      skillName: 'Public Speaking & Communication',
      reason: 'Articulating complex technical concepts clearly accelerates your ability to teach and learn effectively on SkillSwap.',
      learningTips: 'Practice explaining a difficult algorithm in 2 minutes without jargon.',
      suggestedPractice: 'Host an introductory 30-minute peer swap on a topic you are confident in.',
    });

    return list;
  }

  async practiceEnglish(
    message: string,
    history: Array<{ role: string; content: string }>,
    level: string
  ): Promise<AIEnglishPracticeResult> {
    const words = message.trim().split(/\s+/);
    const feedback: string[] = [];
    const vocab: string[] = [];

    if (level === 'BEGINNER') {
      vocab.push('articulate', 'collaborate', 'perspective');
    } else if (level === 'INTERMEDIATE') {
      vocab.push('nuanced', 'streamlined', 'comprehensive', 'dichotomy');
    } else {
      vocab.push('ubiquitous', 'pragmatic', 'exemplary', 'conundrum');
    }

    if (words.length > 0 && !/[.!?]$/.test(message.trim())) {
      feedback.push('Remember to end your complete sentences with appropriate punctuation.');
    }

    if (/\bi\b/.test(message)) {
      feedback.push('Always capitalize the singular pronoun "I" in written English.');
    }

    return {
      reply:
        `That is a very interesting point! When communicating in college presentations or technical interviews, clarity and pacing are key. ` +
        `How would you express that same thought if you were presenting to a group of first-year engineering students?`,
      vocabularySuggestions: vocab,
      grammarFeedback: feedback.length > 0 ? feedback.join(' ') : 'Great sentence structure and natural phrasing!',
      speakingPrompt: 'Try recording yourself explaining this concept for 45 seconds without using filler words like "um" or "like".',
    };
  }
}
