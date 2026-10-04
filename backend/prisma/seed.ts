import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SkillSwap database with authentic student demo data...');

  // 1. Seed Skill Categories
  const categoriesData = [
    { name: 'Programming', slug: 'programming', description: 'Core languages, data structures, algorithms, and logic' },
    { name: 'Web Development', slug: 'web-development', description: 'Frontend, backend, APIs, full-stack frameworks' },
    { name: 'AI & ML', slug: 'ai-ml', description: 'Machine learning, deep learning, PyTorch, computer vision, NLP' },
    { name: 'Data Science', slug: 'data-science', description: 'Analytics, data manipulation, Pandas, SQL, visualization' },
    { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Ethical hacking, network security, cryptography' },
    { name: 'Cloud Computing', slug: 'cloud-computing', description: 'AWS, Azure, Docker, Kubernetes, microservices' },
    { name: 'DevOps', slug: 'devops', description: 'CI/CD pipelines, Terraform, automation, infrastructure' },
    { name: 'UI/UX', slug: 'ui-ux', description: 'User interface design, Figma, design systems, wireframing' },
    { name: 'Graphic Design', slug: 'graphic-design', description: 'Branding, vector illustration, Photoshop, Illustrator' },
    { name: 'Video Editing', slug: 'video-editing', description: 'Premiere Pro, DaVinci Resolve, motion graphics' },
    { name: 'Photography', slug: 'photography', description: 'Composition, lighting, Lightroom post-processing' },
    { name: 'Communication', slug: 'communication', description: 'Interpersonal skills, active listening, negotiation' },
    { name: 'English', slug: 'english', description: 'Fluency, technical writing, professional speech, grammar' },
    { name: 'Public Speaking', slug: 'public-speaking', description: 'Presentations, slide decks, stage presence, pacing' },
    { name: 'Leadership', slug: 'leadership', description: 'Project management, team coordination, conflict resolution' },
    { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Pitch decks, business models, student startups' },
    { name: 'Marketing', slug: 'marketing', description: 'Content marketing, SEO, social growth, brand building' },
    { name: 'Finance', slug: 'finance', description: 'Budgeting, personal investing, financial modeling' },
    { name: 'Research', slug: 'research', description: 'Literature review, academic writing, research methodology' },
    { name: 'Mathematics', slug: 'mathematics', description: 'Linear algebra, calculus, discrete math, probability' },
    { name: 'Science', slug: 'science', description: 'Physics, computational biology, engineering fundamentals' },
    { name: 'Languages', slug: 'languages', description: 'Spanish, French, German, Mandarin, Japanese' },
    { name: 'Music', slug: 'music', description: 'Guitar, keyboard, music production, theory' },
    { name: 'Sports', slug: 'sports', description: 'Fitness, chess, athletics, nutrition' },
    { name: 'Other', slug: 'other', description: 'Custom student skills and unique craft hobbies' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.skillCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  // 2. Seed Skills (30 skills)
  const skillsData = [
    { name: 'Python', cat: 'programming', desc: 'Syntax, OOP, scripting, and algorithmic problem solving' },
    { name: 'C++', cat: 'programming', desc: 'Object-oriented programming, pointers, STL, low-level efficiency' },
    { name: 'Java', cat: 'programming', desc: 'Enterprise concepts, OOP design patterns, multithreading' },
    { name: 'JavaScript', cat: 'programming', desc: 'ES6+, async programming, DOM manipulation' },
    { name: 'TypeScript', cat: 'web-development', desc: 'Static typing, interfaces, generics, type-safe development' },
    { name: 'React', cat: 'web-development', desc: 'Components, hooks, virtual DOM, state management' },
    { name: 'Node.js & Express', cat: 'web-development', desc: 'RESTful APIs, routing, middleware, authentication' },
    { name: 'Next.js', cat: 'web-development', desc: 'Server-side rendering, App Router, full-stack React' },
    { name: 'Tailwind CSS', cat: 'web-development', desc: 'Utility-first modern styling, responsive layouts' },
    { name: 'PostgreSQL & SQL', cat: 'data-science', desc: 'Relational database queries, schemas, indexing, joins' },
    { name: 'Machine Learning', cat: 'ai-ml', desc: 'Supervised/unsupervised models, Scikit-Learn, evaluation' },
    { name: 'Deep Learning with PyTorch', cat: 'ai-ml', desc: 'Neural networks, backprop, tensor ops, model training' },
    { name: 'Computer Vision', cat: 'ai-ml', desc: 'OpenCV, image processing, object detection, CNNs' },
    { name: 'Natural Language Processing', cat: 'ai-ml', desc: 'Tokenization, transformers, embeddings, sentiment analysis' },
    { name: 'Data Analysis with Pandas', cat: 'data-science', desc: 'Data cleaning, tabular transforms, exploratory analysis' },
    { name: 'Docker & Containers', cat: 'cloud-computing', desc: 'Containerization, Dockerfile, multi-stage builds, compose' },
    { name: 'AWS Basics', cat: 'cloud-computing', desc: 'EC2, S3, IAM, Lambda serverless architectures' },
    { name: 'Figma UI/UX Design', cat: 'ui-ux', desc: 'Design systems, wireframes, prototypes, auto-layout' },
    { name: 'Design Systems', cat: 'ui-ux', desc: 'Design tokens, typography scales, accessibility contrasts' },
    { name: 'Graphic Design with Photoshop', cat: 'graphic-design', desc: 'Digital manipulation, banners, posters, social assets' },
    { name: 'Video Editing with Premiere', cat: 'video-editing', desc: 'Story pacing, color grading, sound design, transitions' },
    { name: 'English Conversational Fluency', cat: 'english', desc: 'Speaking practice, natural idiom usage, accent reduction' },
    { name: 'Technical Writing', cat: 'english', desc: 'Documentation, research papers, GitHub READMEs' },
    { name: 'Public Speaking & Presentations', cat: 'public-speaking', desc: 'Slide storytelling, vocal projection, body language' },
    { name: 'Linear Algebra', cat: 'mathematics', desc: 'Matrices, vectors, eigenvalues, ML mathematical foundations' },
    { name: 'Discrete Mathematics', cat: 'mathematics', desc: 'Graph theory, proofs, combinatorics, set theory' },
    { name: 'Ethical Hacking & Web Security', cat: 'cybersecurity', desc: 'OWASP top 10, penetration testing, XSS/SQLi defense' },
    { name: 'Acoustic Guitar Basics', cat: 'music', desc: 'Chords, strumming patterns, fingerstyle technique' },
    { name: 'Spanish for Beginners', cat: 'languages', desc: 'Basic vocabulary, conversational phrases, verb tenses' },
    { name: 'Resume & Interview Prep', cat: 'communication', desc: 'STAR method, behavioral interviews, tech resume reviews' },
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillsData) {
    const catId = categoryMap.get(s.cat) || categoryMap.get('programming')!;
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        categoryId: catId,
        description: s.desc,
        isCustom: false,
      },
    });
    skillMap.set(s.name, skill.id);
  }

  // 3. Seed Achievements
  const achievements = [
    { code: 'FIRST_SKILL_SHARED', title: 'First Skill Shared', description: 'Listed your first skill to teach fellow students.', icon: 'Sparkles', category: 'TEACHING' },
    { code: 'FIRST_SKILL_LEARNED', title: 'Curious Mind', description: 'Completed your very first learning session on SkillSwap.', icon: 'GraduationCap', category: 'LEARNING' },
    { code: 'FIRST_SWAP_COMPLETED', title: 'Reciprocal Learner', description: 'Successfully completed a full bilateral skill exchange.', icon: 'Repeat', category: 'COMMUNITY' },
    { code: 'TEN_SESSIONS_COMPLETED', title: 'Seasoned Exchanger', description: 'Conducted 10 collaborative learning & teaching sessions.', icon: 'Award', category: 'COMMUNITY' },
    { code: 'HELPFUL_ANSWER', title: 'Student Beacon', description: 'Received 5+ upvotes on an answer in Question Hub.', icon: 'ThumbsUp', category: 'COMMUNITY' },
    { code: 'ENGLISH_PRACTICE_STREAK', title: 'Confident Speaker', description: 'Engaged in English conversation & vocabulary practice runs.', icon: 'MessageSquare', category: 'LEARNING' },
    { code: 'CODING_CHAMPION', title: 'Bug Crusher', description: 'Solved 3 or more coding challenges.', icon: 'Code', category: 'LEARNING' },
    { code: 'KNOWLEDGE_SHARER', title: 'Knowledge Sharer', description: 'Earned a 5-star rating for teaching clarity in a session.', icon: 'Star', category: 'TEACHING' },
  ];

  const achMap = new Map<string, string>();
  for (const ach of achievements) {
    const created = await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {},
      create: ach,
    });
    achMap.set(ach.code, created.id);
  }

  // Common password hash for test accounts
  const salt = await bcrypt.genSalt(10);
  const studentPasswordHash = await bcrypt.hash('student123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  // 4. Seed Admin & Demo Student
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillswap.edu' },
    update: {},
    create: {
      email: 'admin@skillswap.edu',
      name: 'Elena Vance (Admin)',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      college: 'MIT & SkillSwap Core',
      department: 'Computer Science',
      year: 'Graduate Alumni',
      bio: 'Platform maintainer and moderation lead. Dedicated to keeping SkillSwap free, open, and student-powered.',
      languages: 'English, German',
      availability: 'Weekdays & Evenings',
      isVerified: true,
      learningHours: 120,
      teachingHours: 350,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@skillswap.edu' },
    update: {},
    create: {
      email: 'demo@skillswap.edu',
      name: 'Alex Chen',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      college: 'UC Berkeley',
      department: 'Electrical Engineering & Computer Science',
      year: '3rd Year',
      bio: 'Loves Python algorithms, backend engineering, and competitive programming. Eager to master UI/UX and Figma for personal side projects!',
      languages: 'English, Mandarin',
      availability: 'Mon/Wed/Fri after 5 PM, Weekends anytime',
      isVerified: true,
      learningHours: 18,
      teachingHours: 24,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Assign demoUser skills:
  // Teaches Python (Intermediate) & C++ (Advanced)
  // Wants to learn: Figma UI/UX Design (Beginner) & Public Speaking (Beginner)
  const pyId = skillMap.get('Python')!;
  const cppId = skillMap.get('C++')!;
  const figmaId = skillMap.get('Figma UI/UX Design')!;
  const speechId = skillMap.get('Public Speaking & Presentations')!;

  await prisma.userSkill.createMany({
    data: [
      { userId: demoUser.id, skillId: pyId, type: 'TEACH', level: 'INTERMEDIATE', description: 'Comfortable explaining OOP, data structures, and script automation' },
      { userId: demoUser.id, skillId: cppId, type: 'TEACH', level: 'ADVANCED', description: 'Pointers, memory management, STL containers' },
      { userId: demoUser.id, skillId: figmaId, type: 'LEARN', level: 'BEGINNER', description: 'Looking to learn how to design clean mockups and wireframes' },
      { userId: demoUser.id, skillId: speechId, type: 'LEARN', level: 'BEGINNER', description: 'Want to gain confidence when presenting project demos' },
    ],
  });

  // 5. Seed 19 additional diverse students
  const sampleStudents = [
    {
      name: 'Maya Patel',
      email: 'maya.patel@stanford.edu',
      college: 'Stanford University',
      department: 'Product Design & HCI',
      year: '4th Year',
      bio: 'Passionate about UI/UX and accessibility. Can teach Figma design systems and user research! Currently struggling with Python data processing.',
      languages: 'English, Hindi',
      availability: 'Tuesday & Thursday afternoons',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      teach: ['Figma UI/UX Design', 'Design Systems'],
      learn: ['Python', 'Data Analysis with Pandas'],
    },
    {
      name: 'Marcus Brody',
      email: 'marcus.b@mit.edu',
      college: 'MIT',
      department: 'Computer Science & AI',
      year: 'Graduate',
      bio: 'Researcher in deep learning and transformers. Can guide you through PyTorch and computer vision. Looking to improve public speaking for conferences.',
      languages: 'English',
      availability: 'Weekends 10 AM - 4 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      teach: ['Deep Learning with PyTorch', 'Machine Learning'],
      learn: ['Public Speaking & Presentations', 'Technical Writing'],
    },
    {
      name: 'Sophia Rodriguez',
      email: 'sophia.r@cmu.edu',
      college: 'Carnegie Mellon University',
      department: 'Software Engineering',
      year: '3rd Year',
      bio: 'Full stack builder with React, TypeScript, and Express. Want to learn Docker and cloud infrastructure.',
      languages: 'English, Spanish',
      availability: 'Weekdays after 6 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      teach: ['React', 'TypeScript', 'Node.js & Express'],
      learn: ['Docker & Containers', 'AWS Basics'],
    },
    {
      name: 'Rohan Sharma',
      email: 'rohan.s@gatech.edu',
      college: 'Georgia Tech',
      department: 'Computer Science',
      year: '2nd Year',
      bio: 'Competitive programmer loving C++ and algorithms. Trying to get better at web development and React.',
      languages: 'English, Hindi',
      availability: 'Flexible / evenings',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      teach: ['C++', 'Discrete Mathematics'],
      learn: ['React', 'JavaScript'],
    },
    {
      name: 'Emma Watson-Lee',
      email: 'emma.wl@harvard.edu',
      college: 'Harvard University',
      department: 'Applied Mathematics',
      year: 'Senior',
      bio: 'Math nerd specializing in Linear Algebra and Probability. Wants to learn Python data science to apply mathematical models to real data.',
      languages: 'English, French',
      availability: 'Friday afternoons & Sundays',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      teach: ['Linear Algebra', 'Discrete Mathematics'],
      learn: ['Python', 'Data Analysis with Pandas'],
    },
    {
      name: 'Daniel Kim',
      email: 'daniel.kim@illinois.edu',
      college: 'UIUC',
      department: 'Computer Engineering',
      year: 'Junior',
      bio: 'Cloud and DevOps enthusiast. I build automated CI/CD pipelines and Docker environments. Looking to learn modern UI/UX design.',
      languages: 'English, Korean',
      availability: 'Mon/Wed 4-8 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      teach: ['Docker & Containers', 'AWS Basics'],
      learn: ['Figma UI/UX Design', 'Tailwind CSS'],
    },
    {
      name: 'Amina Al-Mansoor',
      email: 'amina.m@oxford.edu',
      college: 'Oxford University',
      department: 'Linguistics & CS',
      year: 'Postgraduate',
      bio: 'Specializing in NLP and English phonetics. Eager to help anyone improve conversational English & presentation skills! Want to learn PostgreSQL.',
      languages: 'English, Arabic, French',
      availability: 'Daily 2-6 PM GMT',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
      teach: ['English Conversational Fluency', 'Technical Writing'],
      learn: ['PostgreSQL & SQL', 'Python'],
    },
    {
      name: 'Liam O’Connor',
      email: 'liam.oc@utexas.edu',
      college: 'UT Austin',
      department: 'Radio-Television-Film & CS',
      year: 'Senior',
      bio: 'Video editor and visual storyteller. Premiere Pro master. Looking to learn JavaScript and React to build an interactive portfolio.',
      languages: 'English',
      availability: 'Evenings and Saturdays',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      teach: ['Video Editing with Premiere', 'Graphic Design with Photoshop'],
      learn: ['JavaScript', 'Web Development'],
    },
    {
      name: 'Priya Sundaram',
      email: 'priya.s@iitm.ac.in',
      college: 'IIT Madras',
      department: 'Data Science & AI',
      year: 'Final Year',
      bio: 'Experienced in SQL querying, database indexing, and exploratory data analysis with Pandas. Want to learn Next.js.',
      languages: 'English, Tamil',
      availability: 'Weekends 2 PM - 7 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      teach: ['PostgreSQL & SQL', 'Data Analysis with Pandas'],
      learn: ['Next.js', 'TypeScript'],
    },
    {
      name: 'Lucas Silva',
      email: 'lucas.s@usp.br',
      college: 'University of São Paulo',
      department: 'Information Systems',
      year: '3rd Year',
      bio: 'Cybersecurity student. Ethical hacking, network defenses, and secure coding. Want to practice English conversational fluency for job interviews.',
      languages: 'Portuguese, English',
      availability: 'Weeknights',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      teach: ['Ethical Hacking & Web Security'],
      learn: ['English Conversational Fluency', 'Resume & Interview Prep'],
    },
    {
      name: 'Chloe Tremblay',
      email: 'chloe.t@mcgill.ca',
      college: 'McGill University',
      department: 'Communications & Media',
      year: '4th Year',
      bio: 'Passionate debater and public speaker. Coach for student TEDx speakers. Seeking peer help with Python programming.',
      languages: 'English, French',
      availability: 'Mondays and Wednesdays',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      teach: ['Public Speaking & Presentations', 'Resume & Interview Prep'],
      learn: ['Python', 'JavaScript'],
    },
    {
      name: 'Kenji Takahashi',
      email: 'kenji.t@u-tokyo.ac.jp',
      college: 'University of Tokyo',
      department: 'Mathematical Engineering',
      year: 'Graduate',
      bio: 'Machine learning theory and linear algebra. Interested in learning UI/UX prototyping to make my research models interactive.',
      languages: 'Japanese, English',
      availability: 'Sunday mornings',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      teach: ['Machine Learning', 'Linear Algebra'],
      learn: ['Figma UI/UX Design'],
    },
    {
      name: 'Zainab Qasim',
      email: 'zainab.q@ucl.ac.uk',
      college: 'University College London',
      department: 'Computer Science',
      year: '2nd Year',
      bio: 'Frontend enthusiast with Tailwind CSS and React. Looking to exchange for backend Node.js and SQL.',
      languages: 'English, Urdu',
      availability: 'Thursday & Friday evenings',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      teach: ['Tailwind CSS', 'React'],
      learn: ['Node.js & Express', 'PostgreSQL & SQL'],
    },
    {
      name: 'Gabriel Morales',
      email: 'gabriel.m@ucla.edu',
      college: 'UCLA',
      department: 'Music & Computer Science',
      year: 'Senior',
      bio: 'Acoustic guitar player for 8 years and audio programmer. Happy to teach beginner guitar in exchange for C++ guidance!',
      languages: 'English, Spanish',
      availability: 'Weekends',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      teach: ['Acoustic Guitar Basics', 'Spanish for Beginners'],
      learn: ['C++', 'Python'],
    },
    {
      name: 'Fatima Zahra',
      email: 'fatima.z@toronto.ca',
      college: 'University of Toronto',
      department: 'Statistics',
      year: '3rd Year',
      bio: 'Stats and hypothesis testing wizard. I write clean Pandas analysis. Looking for peer practice with English mock interviews.',
      languages: 'English, Arabic',
      availability: 'Wednesdays and Saturdays',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      teach: ['Data Analysis with Pandas', 'Linear Algebra'],
      learn: ['Resume & Interview Prep', 'English Conversational Fluency'],
    },
    {
      name: 'Vikram Joshi',
      email: 'vikram.j@purdue.edu',
      college: 'Purdue University',
      department: 'Mechanical Engineering & Robotics',
      year: 'Senior',
      bio: 'Robotics and Computer Vision with OpenCV. Want to learn web dashboard creation using React.',
      languages: 'English, Hindi, Marathi',
      availability: 'Tuesdays 6-9 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      teach: ['Computer Vision', 'C++'],
      learn: ['React', 'JavaScript'],
    },
    {
      name: 'Hannah Schmidt',
      email: 'hannah.s@tum.de',
      college: 'Technical University of Munich',
      department: 'Informatics',
      year: 'Master Student',
      bio: 'Distributed systems and Docker containers. Looking to learn Figma design to make my team projects visually appealing.',
      languages: 'German, English',
      availability: 'Thursdays 5 PM CET',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      teach: ['Docker & Containers', 'Java'],
      learn: ['Figma UI/UX Design'],
    },
    {
      name: 'Ethan Cole',
      email: 'ethan.c@uw.edu',
      college: 'University of Washington',
      department: 'Human Centered Design',
      year: 'Junior',
      bio: 'Product designer focusing on micro-interactions and design tokens. Want to learn TypeScript to build my own apps.',
      languages: 'English',
      availability: 'Mon/Wed/Fri mornings',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      teach: ['Figma UI/UX Design', 'Design Systems'],
      learn: ['TypeScript', 'React'],
    },
    {
      name: 'Ananya Roy',
      email: 'ananya.roy@nus.edu.sg',
      college: 'National University of Singapore',
      department: 'Business Analytics',
      year: 'Final Year',
      bio: 'Strong background in SQL, Tableau, and data presentation. Looking to exchange for Machine Learning concepts.',
      languages: 'English, Bengali',
      availability: 'Flexible on weekends',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      teach: ['PostgreSQL & SQL', 'Technical Writing'],
      learn: ['Machine Learning', 'Python'],
    },
  ];

  const createdStudents: any[] = [demoUser];
  for (const s of sampleStudents) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        name: s.name,
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        college: s.college,
        department: s.department,
        year: s.year,
        bio: s.bio,
        languages: s.languages,
        availability: s.availability,
        avatarUrl: s.avatarUrl,
        isVerified: true,
        learningHours: Math.floor(Math.random() * 20) + 5,
        teachingHours: Math.floor(Math.random() * 25) + 6,
      },
    });
    createdStudents.push(user);

    // Attach teach skills
    for (const skillName of s.teach) {
      const sId = skillMap.get(skillName);
      if (sId) {
        await prisma.userSkill.create({
          data: { userId: user.id, skillId: sId, type: 'TEACH', level: 'INTERMEDIATE' },
        });
      }
    }
    // Attach learn skills
    for (const skillName of s.learn) {
      const sId = skillMap.get(skillName);
      if (sId) {
        await prisma.userSkill.create({
          data: { userId: user.id, skillId: sId, type: 'LEARN', level: 'BEGINNER' },
        });
      }
    }
  }

  // 6. Seed Questions (10 questions with tags & answers)
  const maya = createdStudents.find((s) => s.email === 'maya.patel@stanford.edu') || demoUser;
  const marcus = createdStudents.find((s) => s.email === 'marcus.b@mit.edu') || demoUser;
  const sophia = createdStudents.find((s) => s.email === 'sophia.r@cmu.edu') || demoUser;
  const rohan = createdStudents.find((s) => s.email === 'rohan.s@gatech.edu') || demoUser;

  const progCatId = categoryMap.get('programming')!;
  const webCatId = categoryMap.get('web-development')!;
  const uiCatId = categoryMap.get('ui-ux')!;
  const dataCatId = categoryMap.get('data-science')!;

  const sampleQuestions = [
    {
      title: 'How does React 19 handle actions compared to traditional useEffect form submissions?',
      content: 'I am modernizing our campus club project to React 19. What are the key architectural advantages of `useActionState` and Server Actions over standard `useEffect` + `useState`?',
      authorId: sophia.id,
      categoryId: webCatId,
      tags: 'react,javascript,web-dev,frontend',
      views: 142,
      voteCount: 12,
      aiAnswer: 'React 19 Actions streamline pending states, optimistic updates, and error handling natively. Instead of juggling manual `isSubmitting` and `error` state flags inside `useEffect`, `useActionState` wraps async transitions and resets form states deterministically.',
      answers: [
        {
          authorId: demoUser.id,
          content: 'The biggest win is automatic pending state tracking! In React 18, you had to manually set `setLoading(true)` and try/catch. In React 19, `useActionState` manages the loading state and optimistic feedback during the network round-trip.',
          voteCount: 7,
          isAccepted: true,
        },
      ],
    },
    {
      title: 'Why is vectorization in NumPy so much faster than a standard Python for-loop?',
      content: 'When computing pairwise Euclidean distances across 10,000 data points, NumPy finishes in 12ms while my Python loop took 18 seconds. What is happening under the hood?',
      authorId: maya.id,
      categoryId: dataCatId,
      tags: 'python,numpy,performance,data-science',
      views: 98,
      voteCount: 9,
      aiAnswer: 'NumPy operations execute in pre-compiled C loops with contiguous memory buffers, enabling SIMD (Single Instruction Multiple Data) CPU register instructions and bypassing the Python interpreter bytecode overhead and GIL checks.',
      answers: [
        {
          authorId: marcus.id,
          content: 'Contiguous C memory arrays + SIMD instructions! Regular Python lists contain pointers to boxed PyObject wrappers, which cause CPU cache misses on every iteration. NumPy arrays store homogeneous bytes sequentially in memory.',
          voteCount: 6,
          isAccepted: true,
        },
      ],
    },
    {
      title: 'What is the optimal spacing system when designing a student dashboard in Figma?',
      content: 'Should I base my margins and component padding on an 8pt grid or a 4pt grid? What are the standard practices for responsive student SaaS applications?',
      authorId: demoUser.id,
      categoryId: uiCatId,
      tags: 'figma,ui-ux,design-system,grids',
      views: 87,
      voteCount: 11,
      aiAnswer: 'An 8pt grid with 4pt half-steps for compact micro-spacing (like badge padding and icon-to-label gaps) provides the most balanced mathematical rhythm across various screen densities and CSS rem scaling.',
      answers: [
        {
          authorId: maya.id,
          content: 'Go with an 8pt base grid for layout containers and section gutters (16, 24, 32, 48px), and use 4px for tight interior elements (e.g. 4px vertical padding on pills). It maps 1:1 with Tailwind CSS scale (p-1 = 4px, p-2 = 8px, p-4 = 16px)!',
          voteCount: 10,
          isAccepted: true,
        },
      ],
    },
    {
      title: 'When should I choose C++ pointers vs std::unique_ptr in modern projects?',
      content: 'Learning modern C++20. Is there any scenario in college assignments where raw pointers are preferred over smart pointers like `std::unique_ptr`?',
      authorId: rohan.id,
      categoryId: progCatId,
      tags: 'c++,memory,pointers,cpp20',
      views: 65,
      voteCount: 5,
      aiAnswer: 'Use smart pointers (`std::unique_ptr` or `std::shared_ptr`) for ownership semantics. Raw pointers should strictly represent non-owning, optional observers (viewers) that do not manage allocation lifecycles.',
      answers: [
        {
          authorId: demoUser.id,
          content: 'Rule of thumb: smart pointers express *ownership*, raw pointers express *observation*. Never call `new` or `delete` manually in modern C++; use `std::make_unique` instead!',
          voteCount: 4,
          isAccepted: false,
        },
      ],
    },
  ];

  for (const q of sampleQuestions) {
    const question = await prisma.question.create({
      data: {
        title: q.title,
        content: q.content,
        authorId: q.authorId,
        categoryId: q.categoryId,
        tags: q.tags,
        views: q.views,
        voteCount: q.voteCount,
        answerCount: q.answers.length,
        aiAssistanceAnswer: q.aiAnswer,
        answers: {
          create: q.answers.map((a) => ({
            authorId: a.authorId,
            content: a.content,
            voteCount: a.voteCount,
            isAccepted: a.isAccepted,
          })),
        },
      },
    });
  }

  // 7. Seed Community Posts (10 posts)
  const posts = [
    {
      title: 'How Maya and I swapped Python and Figma to build our hackathon project',
      content: 'Two weeks ago, Maya needed help cleaning geospatial datasets for her environmental analytics project. In return, she taught me Figma auto-layout and component variants. Today we won 2nd place in the student social good track! Reciprocal peer learning works 10x better than solo tutorials.',
      authorId: demoUser.id,
      category: 'Success Story',
      tags: 'hackathon,skillswap,figma,python',
      likesCount: 38,
      comments: [
        { authorId: maya.id, content: 'Such an awesome swap! Your pandas groupby breakdown saved me hours of manual excel work!' },
      ],
    },
    {
      title: 'Guide: How to structure your first 45-minute live SkillSwap teaching session',
      content: 'Teaching another student can feel intimidating at first. Here is a battle-tested template: 1. (5 mins) Alignment on what they want to achieve today. 2. (15 mins) High-level mental model + 1 interactive demo. 3. (20 mins) Let them drive the screen while you guide. 4. (5 mins) Summary & mutual feedback.',
      authorId: marcus.id,
      category: 'Tips & Tricks',
      tags: 'teaching,mentorship,students',
      likesCount: 52,
      comments: [
        { authorId: sophia.id, content: 'Point #3 is the golden rule: let the learner drive the screen!' },
      ],
    },
    {
      title: 'Looking for a peer to practice daily technical English interview questions',
      content: 'I have software engineering placement interviews coming up in 4 weeks. Looking for a peer to hop on a 20-minute audio session every other day to practice the STAR method for behavioral questions. I can teach SQL or Java in exchange!',
      authorId: rohan.id,
      category: 'Collaboration',
      tags: 'english,interview-prep,collaboration',
      likesCount: 19,
      comments: [],
    },
  ];

  for (const p of posts) {
    await prisma.communityPost.create({
      data: {
        title: p.title,
        content: p.content,
        authorId: p.authorId,
        category: p.category,
        tags: p.tags,
        likesCount: p.likesCount,
        commentsCount: p.comments.length,
        comments: {
          create: p.comments.map((c) => ({
            authorId: c.authorId,
            content: c.content,
          })),
        },
      },
    });
  }

  // 8. Seed Study Groups (5 groups)
  const studyGroups = [
    {
      name: 'Python & Data Structures Mastery',
      description: 'Peer-led study group for mastering LeetCode patterns, algorithms, and computational efficiency.',
      category: 'Programming',
      topics: 'Python, Algorithms, LeetCode, Data Structures',
      creatorId: demoUser.id,
    },
    {
      name: 'UI/UX & Design Systems Collective',
      description: 'Weekly student design critiques, Figma tricks, accessible color contrast checks, and portfolio reviews.',
      category: 'UI/UX',
      topics: 'Figma, UI/UX, Design Systems, Typography',
      creatorId: maya.id,
    },
    {
      name: 'English Speaking & Presentation Club',
      description: 'A relaxed, supportive student space to practice conversational fluency, public speaking, and viva prep.',
      category: 'English',
      topics: 'Speaking, Fluency, Pronunciation, Interviews',
      creatorId: marcus.id,
    },
    {
      name: 'Full-Stack Web Dev Builders',
      description: 'Collaborate on open-source student apps, modern React architectures, and database optimizations.',
      category: 'Web Development',
      topics: 'React, TypeScript, Express, PostgreSQL',
      creatorId: sophia.id,
    },
    {
      name: 'AI & Machine Learning Reading Group',
      description: 'Dissecting seminal ML papers, reproducing experiments in PyTorch, and discussing model architectures.',
      category: 'AI & ML',
      topics: 'Machine Learning, PyTorch, Deep Learning, NLP',
      creatorId: marcus.id,
    },
  ];

  for (const sg of studyGroups) {
    const membersData = [{ userId: sg.creatorId, role: 'ADMIN' }];
    if (sg.creatorId !== demoUser.id) {
      membersData.push({ userId: demoUser.id, role: 'MEMBER' });
    }

    await prisma.studyGroup.create({
      data: {
        name: sg.name,
        description: sg.description,
        category: sg.category,
        topics: sg.topics,
        creatorId: sg.creatorId,
        memberCount: 8,
        members: {
          create: membersData,
        },
      },
    });
  }

  // 9. Seed Coding Problems
  const codingProblems = [
    {
      title: 'Two Sum Problem',
      slug: 'two-sum',
      difficulty: 'EASY',
      category: 'Arrays & Hash Maps',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
      starterCode: JSON.stringify({
        javascript: `function twoSum(input) {\n  const { nums, target } = JSON.parse(input);\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return JSON.stringify([map.get(complement), i]);\n    }\n    map.set(nums[i], i);\n  }\n  return "[]";\n}`,
        python: `def twoSum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        if target - num in lookup:\n            return [lookup[target - num], i]\n        lookup[num] = i\n    return []`,
        cpp: `#include <vector>\n#include <unordered_map>\n\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int comp = target - nums[i];\n        if (map.count(comp)) return {map[comp], i};\n        map[nums[i]] = i;\n    }\n    return {};\n}`,
      }),
      testCases: JSON.stringify([
        { input: '{"nums":[2,7,11,15],"target":9}', expectedOutput: '[0,1]' },
        { input: '{"nums":[3,2,4],"target":6}', expectedOutput: '[1,2]' },
        { input: '{"nums":[3,3],"target":6}', expectedOutput: '[0,1]' },
      ]),
      hints: JSON.stringify([
        'Think about storing values you have already seen in a hash map to achieve O(n) lookup time.',
        'As you iterate, calculate `complement = target - currentNumber` and check if `complement` exists in the map.',
      ]),
    },
    {
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      difficulty: 'EASY',
      category: 'Two Pointers & Strings',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      starterCode: JSON.stringify({
        javascript: `function isPalindrome(input) {\n  const clean = input.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}`,
        python: `def isPalindrome(s: str) -> bool:\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]`,
      }),
      testCases: JSON.stringify([
        { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true' },
        { input: 'race a car', expectedOutput: 'false' },
        { input: ' ', expectedOutput: 'true' },
      ]),
      hints: JSON.stringify([
        'First clean the string of punctuation and spaces using regex or character checking.',
        'Use two pointers starting at opposite ends moving toward the center.',
      ]),
    },
    {
      title: 'Reverse a Linked String',
      slug: 'reverse-string',
      difficulty: 'EASY',
      category: 'Strings',
      description: 'Write a function that reverses a given input string in place with O(1) extra memory.',
      starterCode: JSON.stringify({
        javascript: `function reverseString(input) {\n  return input.split('').reverse().join('');\n}`,
        python: `def reverseString(s: str) -> str:\n    return s[::-1]`,
      }),
      testCases: JSON.stringify([
        { input: 'hello', expectedOutput: 'olleh' },
        { input: 'SkillSwap', expectedOutput: 'pawSllikS' },
      ]),
      hints: JSON.stringify(['Swap elements from outside in using two pointers.']),
    },
  ];

  for (const prob of codingProblems) {
    await prisma.codingProblem.upsert({
      where: { slug: prob.slug },
      update: {},
      create: prob,
    });
  }

  // 10. Seed Sample Live & Completed Sessions
  const session1 = await prisma.session.create({
    data: {
      title: 'Python Data Structures & Algorithm Design',
      description: 'Deep dive into hash tables, collision resolution, and graph representations.',
      skillId: pyId,
      hostId: demoUser.id,
      participantId: maya.id,
      scheduledStartTime: new Date(Date.now() - 86400000 * 2), // 2 days ago
      durationMinutes: 60,
      status: 'COMPLETED',
      meetingRoomId: 'swap-demo-py-01',
      agenda: '1. Dict internals in CPython. 2. Resolving two-sum with hash map. 3. Q&A.',
      sessionNotes: 'Great session! Maya picked up the hash table lookup concept immediately. We also covered time complexity trade-offs.',
      endedAt: new Date(Date.now() - 86400000 * 2 + 3600000),
      reviews: {
        create: {
          reviewerId: maya.id,
          revieweeId: demoUser.id,
          rating: 5,
          teachingClarity: 5,
          sessionQuality: 5,
          comment: 'Alex was an incredible mentor! Explained Python memory references with clear whiteboard diagrams. 10/10 recommend swapping with him!',
        },
      },
    },
  });

  const session2 = await prisma.session.create({
    data: {
      title: 'Figma Auto-Layout & Component Variants',
      description: 'Hands-on live session building a responsive mobile navigation bar in Figma.',
      skillId: figmaId,
      hostId: maya.id,
      participantId: demoUser.id,
      scheduledStartTime: new Date(Date.now() + 86400000 * 1), // Tomorrow
      durationMinutes: 60,
      status: 'SCHEDULED',
      meetingRoomId: 'swap-demo-figma-02',
      agenda: '1. Auto-layout nesting fundamentals. 2. Component properties and boolean flags. 3. Alex builds his first navbar component.',
    },
  });

  // Create SkillSwap connection between demoUser and maya
  const [u1, u2] = [demoUser.id, maya.id].sort();
  await prisma.skillSwapConnection.upsert({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    update: {},
    create: { user1Id: u1, user2Id: u2, status: 'ACTIVE' },
  });

  const conv = await prisma.conversation.upsert({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    update: {},
    create: { user1Id: u1, user2Id: u2 },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv.id,
        senderId: maya.id,
        content: 'Hi Alex! Loved your profile. Would you be open to exchanging Python fundamentals for Figma UI/UX coaching?',
      },
      {
        conversationId: conv.id,
        senderId: demoUser.id,
        content: 'Hey Maya! That sounds perfect. I am trying to build mockups for my hackathon project. Let’s schedule a session!',
      },
      {
        conversationId: conv.id,
        senderId: maya.id,
        content: 'Awesome! I booked our Figma session for tomorrow. See you in the live room!',
        sessionId: session2.id,
      },
    ],
  });

  // 11. Award Initial Achievements to demoUser
  const firstShared = achMap.get('FIRST_SKILL_SHARED');
  const firstLearned = achMap.get('FIRST_SKILL_LEARNED');
  const firstSwap = achMap.get('FIRST_SWAP_COMPLETED');
  const sharer = achMap.get('KNOWLEDGE_SHARER');

  if (firstShared) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: firstShared } });
  }
  if (firstLearned) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: firstLearned } });
  }
  if (firstSwap) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: firstSwap } });
  }
  if (sharer) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: sharer } });
  }

  // 12. Create sample personalized roadmap for demoUser
  await prisma.learningRoadmap.create({
    data: {
      userId: demoUser.id,
      title: 'UI/UX Design for Full-Stack Engineers',
      targetRole: 'Product Engineer',
      description: 'Master visual hierarchy, component systems, and design-to-code pipelines.',
      progressPercent: 33.3,
      items: {
        create: [
          { order: 1, title: '1. Typography Scales & Spatial 8pt Grid', description: 'Understand rem font sizes and line heights for readable contrast.', isCompleted: true, recommendedSkillName: 'UI/UX' },
          { order: 2, title: '2. Auto-Layout Nesting & Constraints', description: 'Design components that scale smoothly from mobile to widescreen.', isCompleted: true, recommendedSkillName: 'Figma UI/UX Design' },
          { order: 3, title: '3. Component Variants & Design Tokens', description: 'Build reusable button, card, and modal systems with style states.', isCompleted: false, recommendedSkillName: 'Design Systems' },
          { order: 4, title: '4. Usability Testing & Interactive Prototyping', description: 'Run a live peer session on SkillSwap presenting your Figma mockup for feedback.', isCompleted: false, recommendedSkillName: 'Communication' },
        ],
      },
    },
  });

  console.log('✅ SkillSwap database successfully seeded with:');
  console.log(' - 20 Authentic student profiles across major universities');
  console.log(' - 30 Curated skills with structured categories');
  console.log(' - Demo Student: demo@skillswap.edu / student123');
  console.log(' - Demo Admin: admin@skillswap.edu / admin123');
  console.log(' - Questions, discussions, study groups, coding challenges & live sessions');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
