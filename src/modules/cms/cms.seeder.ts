import {
    HeroSlide,
    SiteStat,
    ServiceCard,
    Testimonial,
    ClientPartner,
    AboutContent,
    AIFeature,
    Assessment,
    ClassSession,
    PartyPackage,
    ProgramLevel,
    CampProgram,
    LocationDetail,
    BlogPost,
    JobPosition,
    ContactInfo,
    FAQItem,
} from './cms.model';

// =============================================
// DEFAULT SEED DATA (from landing page content)
// =============================================

const heroSlidesData = [
    {
        title: 'Welcome to ProActiv Fitness',
        subtitle: 'Building Confidence Through Movement',
        image: '/images/hero/gymnastics-1.jpg',
        fallbackGradient: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800',
        ctaText: 'JOIN NOW',
        ctaLink: '/register',
        order: 1,
        isActive: true,
    },
    {
        title: 'Expert Coaching Programs',
        subtitle: 'Professional Training for All Ages',
        image: '/images/hero/gymnastics-2.jpg',
        fallbackGradient: 'bg-gradient-to-br from-green-600 via-teal-600 to-green-800',
        ctaText: 'EXPLORE PROGRAMS',
        ctaLink: '/programs',
        order: 2,
        isActive: true,
    },
    {
        title: 'State-of-the-Art Facilities',
        subtitle: 'Safe & Modern Training Environment',
        image: '/images/hero/gymnastics-3.jpg',
        fallbackGradient: 'bg-gradient-to-br from-orange-600 via-red-600 to-orange-800',
        ctaText: 'BOOK A TRIAL',
        ctaLink: '/book-trial',
        order: 3,
        isActive: true,
    },
];

const siteStatsData = [
    {
        label: 'Active Students',
        value: 5000,
        suffix: '+',
        icon: 'Users',
        color: 'from-blue-400 to-cyan-400',
        order: 1,
        isActive: true,
    },
    {
        label: 'Expert Coaches',
        value: 50,
        suffix: '+',
        icon: 'Award',
        color: 'from-green-400 to-emerald-400',
        order: 2,
        isActive: true,
    },
    {
        label: 'Locations',
        value: 15,
        suffix: '+',
        icon: 'MapPin',
        color: 'from-red-400 to-rose-400',
        order: 3,
        isActive: true,
    },
    {
        label: 'Years Experience',
        value: 10,
        suffix: '+',
        icon: 'Star',
        color: 'from-yellow-400 to-amber-400',
        order: 4,
        isActive: true,
    },
];

const serviceCardsData = [
    {
        title: 'Gymnastics Programs',
        description: 'Professional gymnastics training for all skill levels and ages',
        image: '/images/services/school-gymnastics.jpg',
        emoji: '🤸',
        features: ['Beginner to Advanced levels', 'Professional coaching', 'Skill progression tracking', 'Competition preparation', 'Flexible scheduling'],
        href: '/programs/gymnastics',
        color: 'green',
        gradient: 'from-green-400 to-green-600',
        order: 1,
        isActive: true,
    },
    {
        title: 'Gymnastics Camps',
        description: 'Exciting holiday camps with fun activities and skill development',
        image: '/images/services/holiday-camps.jpg',
        emoji: '🏕️',
        features: ['Full day & half day options', 'Variety of activities', 'Qualified supervision', 'Healthy snacks included', 'New friends & fun'],
        href: '/programs/camps',
        color: 'red',
        gradient: 'from-red-400 to-red-600',
        order: 2,
        isActive: true,
    },
    {
        title: 'Private Coaching',
        description: 'Personalized one-on-one coaching for rapid skill development',
        image: '/images/services/private-coaching.jpg',
        emoji: '👨‍🏫',
        features: ['Personalized training', 'Flexible scheduling', 'Individual attention', 'Rapid progress', 'Goal-oriented'],
        href: '/programs/private-coaching',
        color: 'blue',
        gradient: 'from-blue-400 to-blue-600',
        order: 3,
        isActive: true,
    },
    {
        title: 'Birthday Parties',
        description: 'Unforgettable birthday celebrations with exciting activities',
        image: '/images/services/birthday-parties.jpg',
        emoji: '🎉',
        features: ['Private party room', 'Dedicated party host', 'Exciting activities', 'Party decorations', 'Hassle-free setup'],
        href: '/parties',
        color: 'purple',
        gradient: 'from-purple-400 to-purple-600',
        order: 4,
        isActive: true,
    },
];

const testimonialsData = [
    {
        name: 'Sarah Johnson',
        role: 'Parent',
        rating: 5,
        text: 'My daughter has been attending ProActiv for 2 years now. The coaches are amazing and she has grown so much in confidence!',
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-blue-400 to-cyan-500',
        program: 'Gymnastics',
        order: 1,
        isActive: true,
    },
    {
        name: 'Michael Chen',
        role: 'Parent',
        rating: 5,
        text: "Best decision we made! The facilities are top-notch and the staff truly care about each child's development.",
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-green-400 to-emerald-500',
        program: 'Multi-Activity',
        order: 2,
        isActive: true,
    },
    {
        name: 'Emma Williams',
        role: 'Parent',
        rating: 5,
        text: 'The birthday party we had here was incredible! All the kids had a blast and the organization was perfect.',
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-purple-400 to-pink-500',
        program: 'Birthday Parties',
        order: 3,
        isActive: true,
    },
];

const partnersData = [
    {
        name: 'Hong Kong Gymnastics Association',
        logo: '/images/partners/hkga.png',
        fallbackText: 'HKGA',
        color: 'from-blue-500 to-cyan-500',
        order: 1,
        isActive: true,
    },
    {
        name: 'Education Bureau',
        logo: '/images/partners/edb.png',
        fallbackText: 'EDB',
        color: 'from-green-500 to-emerald-500',
        order: 2,
        isActive: true,
    },
    {
        name: 'Leisure & Cultural Services',
        logo: '/images/partners/lcsd.png',
        fallbackText: 'LCSD',
        color: 'from-purple-500 to-pink-500',
        order: 3,
        isActive: true,
    },
];

const aboutContentData = {
    mission: 'To provide a safe, supportive, and fun environment where children can develop their physical abilities, build confidence, and create lasting friendships through quality gymnastics and fitness programs.',
    vision: 'To be the leading provider of youth fitness programs, inspiring the next generation to lead active, healthy lifestyles while achieving their personal best in a positive and encouraging atmosphere.',
    values: [
        {
            title: 'Safety First',
            description: 'We maintain the highest safety standards with certified coaches and state-of-the-art equipment.',
            icon: 'CheckCircle',
        },
        {
            title: 'Excellence',
            description: 'We strive for excellence in coaching, facilities, and customer service to deliver the best experience.',
            icon: 'Award',
        },
        {
            title: 'Community',
            description: 'We foster a supportive community where everyone feels welcome, valued, and encouraged.',
            icon: 'Heart',
        },
    ],
    stats: [
        { label: 'Years Experience', value: '10+', icon: '📅' },
        { label: 'Active Students', value: '5000+', icon: '👥' },
        { label: 'Locations', value: '15+', icon: '📍' },
        { label: 'Expert Coaches', value: '50+', icon: '🏅' },
    ],
    images: [],
    history: "ProActiv Fitness was founded in 2014 with a simple mission: to provide high-quality gymnastics and fitness programs that help children build confidence, develop skills, and have fun.\n\nWhat started as a single location with a handful of students has grown into a thriving network of 15+ centers serving over 5,000 active students across the region. Our success is built on our commitment to excellence, safety, and creating a positive environment where every child can thrive.\n\nToday, we're proud to be recognized as one of the leading youth fitness providers, with a team of 50+ certified coaches who are passionate about making a difference in children's lives. We continue to innovate and expand our programs to meet the evolving needs of our community.",
    features: [
        {
            title: 'State-of-the-Art Equipment',
            description: 'Our facilities feature the latest gymnastics and fitness equipment, ensuring a safe and effective training environment.',
            icon: 'Zap',
        },
        {
            title: 'Certified Coaches',
            description: 'All our coaches are certified professionals with extensive experience in gymnastics and youth fitness training.',
            icon: 'Award',
        },
        {
            title: 'Personalized Programs',
            description: 'We offer tailored training programs that match each child\'s skill level and goals for optimal development.',
            icon: 'Target',
        },
    ],
};

const aiFeatureData = [
    {
        title: 'AI-Powered Skill Tracking',
        description: 'Our advanced AI system tracks your child\'s progress across all skill areas, providing detailed insights and personalized recommendations.',
        icon: 'Target',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        order: 1,
        isActive: true,
    },
    {
        title: 'Smart Scheduling',
        description: 'AI-driven scheduling optimizes class times and coach assignments to ensure the best learning experience for every student.',
        icon: 'Calendar',
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        order: 2,
        isActive: true,
    },
    {
        title: 'Personalized Learning Paths',
        description: 'Machine learning algorithms create customized training plans based on each student\'s strengths, weaknesses, and goals.',
        icon: 'Sparkles',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        order: 3,
        isActive: true,
    },
    {
        title: 'Safety Monitoring',
        description: 'Real-time AI monitoring helps ensure student safety during training sessions with automated alert systems.',
        icon: 'Shield',
        color: 'from-red-500 to-orange-500',
        bgColor: 'bg-red-50',
        order: 4,
        isActive: true,
    },
];

const assessmentsData = [
    {
        title: 'Beginner Gymnastics Assessment',
        description: 'Free assessment for new students to evaluate current skill level and recommend the best program.',
        image: '/images/assessments/beginner.jpg',
        time: '10:00 am',
        duration: '11:00 am',
        days: 'Mo, We, Fr',
        ageGroup: '3 - 6 years',
        level: 'BEGINNER' as const,
        price: 'FREE',
        isFree: true,
        availableSlots: 8,
        totalSlots: 10,
        category: 'Assessment',
        location: 'Cyberport',
        order: 1,
        isActive: true,
    },
    {
        title: 'Intermediate Skills Evaluation',
        description: 'Assessment for students looking to advance to intermediate level programs.',
        image: '/images/assessments/intermediate.jpg',
        time: '2:00 pm',
        duration: '3:00 pm',
        days: 'Tu, Th',
        ageGroup: '6 - 12 years',
        level: 'INTERMEDIATE' as const,
        price: 'FREE',
        isFree: true,
        availableSlots: 6,
        totalSlots: 8,
        category: 'Assessment',
        location: 'Wan Chai',
        order: 2,
        isActive: true,
    },
    {
        title: 'Advanced Competition Assessment',
        description: 'Evaluation for students interested in competition-level gymnastics training.',
        image: '/images/assessments/advanced.jpg',
        time: '4:00 pm',
        duration: '5:30 pm',
        days: 'Sa',
        ageGroup: '8 - 16 years',
        level: 'ADVANCED' as const,
        price: 'FREE',
        isFree: true,
        availableSlots: 4,
        totalSlots: 6,
        category: 'Assessment',
        location: 'Cyberport',
        order: 3,
        isActive: true,
    },
];

const classSessionsData = [
    {
        title: 'Tiny Tumblers',
        description: 'Introduction to gymnastics for the youngest athletes. Focus on basic motor skills, coordination, and fun!',
        image: '/images/classes/tiny-tumblers.jpg',
        time: '9:30 am',
        duration: '10:15 am',
        days: 'Mo, We, Fr',
        ageGroup: '3 - 4 years',
        level: 'BEGINNER' as const,
        price: 'HK$280/session',
        isFree: false,
        availableSlots: 6,
        totalSlots: 8,
        category: 'Gymnastics',
        location: 'Cyberport',
        order: 1,
        isActive: true,
    },
    {
        title: 'Junior Gymnasts',
        description: 'Structured gymnastics classes focusing on fundamental skills, flexibility, and strength building.',
        image: '/images/classes/junior-gymnasts.jpg',
        time: '10:30 am',
        duration: '11:30 am',
        days: 'Mo, We, Fr',
        ageGroup: '5 - 7 years',
        level: 'BEGINNER' as const,
        price: 'HK$320/session',
        isFree: false,
        availableSlots: 8,
        totalSlots: 12,
        category: 'Gymnastics',
        location: 'Cyberport',
        order: 2,
        isActive: true,
    },
    {
        title: 'Intermediate Skills',
        description: 'Advanced skill development for experienced gymnasts. Includes apparatus work and choreography.',
        image: '/images/classes/intermediate.jpg',
        time: '2:00 pm',
        duration: '3:30 pm',
        days: 'Tu, Th, Sa',
        ageGroup: '7 - 12 years',
        level: 'INTERMEDIATE' as const,
        price: 'HK$380/session',
        isFree: false,
        availableSlots: 5,
        totalSlots: 10,
        category: 'Gymnastics',
        location: 'Wan Chai',
        order: 3,
        isActive: true,
    },
    {
        title: 'Competition Training',
        description: 'Intensive training for competitive gymnasts preparing for regional and national competitions.',
        image: '/images/classes/competition.jpg',
        time: '4:00 pm',
        duration: '6:00 pm',
        days: 'Mo, We, Fr, Sa',
        ageGroup: '8 - 16 years',
        level: 'ADVANCED' as const,
        price: 'HK$450/session',
        isFree: false,
        availableSlots: 3,
        totalSlots: 8,
        category: 'Gymnastics',
        location: 'Cyberport',
        order: 4,
        isActive: true,
    },
];

const partyPackagesData = [
    {
        name: 'Bronze Party Package',
        duration: '1.5 hours',
        maxKids: 15,
        coaches: 1,
        partyRoomTime: '30 minutes',
        features: ['1 hour gym time', '30 min party room', 'Basic decorations', 'Music system', 'Invitations included'],
        notIncluded: ['Food & drinks', 'Party bags', 'Cake'],
        price: 'HK$3,500',
        image: '/images/parties/bronze.jpg',
        order: 1,
        isActive: true,
    },
    {
        name: 'Silver Party Package',
        duration: '2 hours',
        maxKids: 20,
        coaches: 2,
        partyRoomTime: '45 minutes',
        features: ['1.5 hour gym time', '45 min party room', 'Premium decorations', 'Music & lighting', 'Invitations included', 'Party coordinator'],
        notIncluded: ['Food & drinks', 'Cake'],
        price: 'HK$4,800',
        image: '/images/parties/silver.jpg',
        order: 2,
        isActive: true,
    },
    {
        name: 'Gold Party Package',
        duration: '2.5 hours',
        maxKids: 25,
        coaches: 2,
        partyRoomTime: '1 hour',
        features: ['1.5 hour gym time', '1 hour party room', 'Deluxe decorations', 'Music, lighting & effects', 'Invitations included', 'Dedicated party coordinator', 'Party bags for all kids', 'Photo session'],
        notIncluded: ['Cake'],
        price: 'HK$6,500',
        image: '/images/parties/gold.jpg',
        order: 3,
        isActive: true,
    },
];

const programLevelsData = [
    {
        name: 'Mini Movers',
        description: 'An introduction to movement and gymnastics for our youngest athletes. Focus on motor skills, coordination, and social development through play-based learning.',
        image: '/images/programs/mini-movers.jpg',
        ageGroup: '3 - 4 years',
        duration: '45 minutes',
        classSize: '6 students max',
        price: 'HK$280/session',
        objectives: ['Basic motor skills', 'Balance & coordination', 'Social interaction', 'Following instructions', 'Fun with movement'],
        color: 'pink',
        icon: 'Baby',
        order: 1,
        isActive: true,
    },
    {
        name: 'Foundation',
        description: 'Building fundamental gymnastics skills including rolls, handstands, cartwheels, and basic apparatus work in a structured learning environment.',
        image: '/images/programs/foundation.jpg',
        ageGroup: '5 - 7 years',
        duration: '1 hour',
        classSize: '8 students max',
        price: 'HK$320/session',
        objectives: ['Forward & backward rolls', 'Handstands & cartwheels', 'Basic beam work', 'Vault introduction', 'Flexibility training'],
        color: 'blue',
        icon: 'Star',
        order: 2,
        isActive: true,
    },
    {
        name: 'Development',
        description: 'Intermediate level training for gymnasts ready to advance their skills on all apparatus with focus on technique and strength.',
        image: '/images/programs/development.jpg',
        ageGroup: '7 - 12 years',
        duration: '1.5 hours',
        classSize: '10 students max',
        price: 'HK$380/session',
        objectives: ['Advanced tumbling', 'Apparatus combinations', 'Strength conditioning', 'Routine development', 'Competition preparation'],
        color: 'green',
        icon: 'TrendingUp',
        order: 3,
        isActive: true,
    },
    {
        name: 'Elite',
        description: 'Advanced competitive training program for dedicated gymnasts pursuing excellence in regional and national competitions.',
        image: '/images/programs/elite.jpg',
        ageGroup: '10 - 16 years',
        duration: '2 hours',
        classSize: '8 students max',
        price: 'HK$450/session',
        objectives: ['Competition routines', 'Advanced apparatus skills', 'Mental preparation', 'Physical conditioning', 'Performance coaching'],
        color: 'gold',
        icon: 'Trophy',
        order: 4,
        isActive: true,
    },
];

const campProgramsData = [
    {
        title: 'Easter Holiday Camp',
        description: 'A fun-filled camp during Easter break featuring gymnastics, games, arts & crafts, and outdoor activities.',
        image: '/images/camps/easter.jpg',
        dates: 'April 14 - April 25, 2025',
        price: 'HK$2,800/week',
        ageGroup: '5 - 12 years',
        activities: ['Gymnastics training', 'Team games', 'Arts & crafts', 'Dance sessions', 'Obstacle courses'],
        features: ['Full day (9am - 4pm)', 'Qualified coaches', 'Healthy snacks', 'Certificate of completion'],
        location: 'Cyberport',
        order: 1,
        isActive: true,
    },
    {
        title: 'Summer Adventure Camp',
        description: 'Our flagship summer camp with a wide variety of sports, gymnastics, and fun activities to keep kids active all summer.',
        image: '/images/camps/summer.jpg',
        dates: 'July 7 - August 22, 2025',
        price: 'HK$3,200/week',
        ageGroup: '4 - 14 years',
        activities: ['Gymnastics', 'Swimming', 'Rock climbing', 'Team sports', 'Creative workshops', 'Nature exploration'],
        features: ['Full day (9am - 5pm)', 'Multiple sports', 'Lunch included', 'Weekly themes', 'End-of-camp show'],
        location: 'All Locations',
        order: 2,
        isActive: true,
    },
    {
        title: 'Christmas Fun Camp',
        description: 'Festive-themed camp with gymnastics, holiday crafts, and seasonal activities to celebrate the holiday season.',
        image: '/images/camps/christmas.jpg',
        dates: 'December 22 - January 2, 2026',
        price: 'HK$2,500/week',
        ageGroup: '5 - 10 years',
        activities: ['Gymnastics', 'Holiday crafts', 'Dance & movement', 'Games & competitions', 'Festive performances'],
        features: ['Half day option available', 'Holiday snacks', 'Festive themes', 'Performance showcase'],
        location: 'Wan Chai',
        order: 3,
        isActive: true,
    },
];

const locationDetailsData = [
    {
        name: 'Cyberport',
        slug: 'cyberport',
        address: 'Level 3, The Arcade, 100 Cyberport Road, Pok Fu Lam, Hong Kong',
        phone: '+852 2234 5678',
        email: 'cyberport@proactivfitness.com',
        hours: [
            { day: 'Monday - Friday', time: '9:00 AM - 8:00 PM' },
            { day: 'Saturday', time: '9:00 AM - 6:00 PM' },
            { day: 'Sunday', time: '10:00 AM - 5:00 PM' },
        ],
        facilities: [
            { name: 'Main Gymnasium', description: 'Full-size gymnasium with professional apparatus', features: ['Spring floor', 'Vault', 'Bars', 'Beam', 'Foam pit'] },
            { name: 'Party Room', description: 'Dedicated party room for birthday celebrations', features: ['Sound system', 'Lighting', 'Tables & chairs', 'Decoration setup'] },
        ],
        schedule: [],
        team: [
            { name: 'Coach David', role: 'Head Coach', specialization: 'Artistic Gymnastics', experience: '15 years', image: '' },
            { name: 'Coach Sarah', role: 'Senior Coach', specialization: 'Rhythmic Gymnastics', experience: '10 years', image: '' },
        ],
        images: [],
        mapUrl: '',
        isActive: true,
    },
    {
        name: 'Wan Chai',
        slug: 'wan-chai',
        address: '5/F, 168 Hennessy Road, Wan Chai, Hong Kong',
        phone: '+852 2345 6789',
        email: 'wanchai@proactivfitness.com',
        hours: [
            { day: 'Monday - Friday', time: '9:00 AM - 9:00 PM' },
            { day: 'Saturday', time: '9:00 AM - 7:00 PM' },
            { day: 'Sunday', time: '10:00 AM - 6:00 PM' },
        ],
        facilities: [
            { name: 'Training Hall', description: 'Spacious training hall with modern equipment', features: ['Spring floor', 'Tumble track', 'Bars', 'Beam', 'Trampoline'] },
            { name: 'Multi-Purpose Room', description: 'Flexible space for various activities', features: ['Dance floor', 'Mirror wall', 'Sound system'] },
        ],
        schedule: [],
        team: [
            { name: 'Coach Michael', role: 'Head Coach', specialization: 'Artistic Gymnastics', experience: '12 years', image: '' },
            { name: 'Coach Lisa', role: 'Coach', specialization: 'Acrobatics', experience: '8 years', image: '' },
        ],
        images: [],
        mapUrl: '',
        isActive: true,
    },
];

const blogPostsData = [
    {
        title: '5 Benefits of Gymnastics for Children',
        slug: '5-benefits-of-gymnastics-for-children',
        excerpt: 'Discover how gymnastics helps children develop physical strength, flexibility, coordination, and mental resilience.',
        content: 'Gymnastics is more than just a sport - it\'s a comprehensive development tool for children. Here are 5 key benefits:\n\n1. **Physical Strength**: Gymnastics builds whole-body strength through bodyweight exercises and apparatus work.\n\n2. **Flexibility**: Regular stretching and movement patterns improve flexibility and reduce injury risk.\n\n3. **Coordination**: Complex movements develop hand-eye coordination and spatial awareness.\n\n4. **Confidence**: Mastering new skills builds self-confidence and a growth mindset.\n\n5. **Discipline**: Structured training teaches goal-setting, persistence, and time management.',
        author: 'Coach David',
        authorImage: '',
        date: new Date('2025-01-15'),
        category: 'Health & Fitness',
        tags: ['gymnastics', 'children', 'health', 'fitness', 'development'],
        image: '/images/blog/gymnastics-benefits.jpg',
        readTime: '5 min read',
        isFeatured: true,
        isPublished: true,
    },
    {
        title: 'How to Prepare Your Child for Their First Gymnastics Class',
        slug: 'prepare-child-first-gymnastics-class',
        excerpt: 'Tips and advice for parents preparing their child for their first gymnastics experience.',
        content: 'Starting gymnastics can be an exciting but nerve-wracking experience for both children and parents. Here\'s how to prepare:\n\n**What to Wear**: Comfortable, fitted clothing like leotards or tight-fitting athletic wear. Avoid loose clothing that can catch on equipment.\n\n**What to Expect**: The first class will include warm-ups, basic skills introduction, and fun activities. Coaches will assess your child\'s abilities.\n\n**Mental Preparation**: Talk positively about gymnastics, watch videos together, and reassure your child that everyone starts as a beginner.\n\n**Physical Preparation**: Encourage active play at home - climbing, jumping, and balancing activities help prepare the body.\n\n**After Class**: Celebrate their effort, ask what they enjoyed, and encourage them to try again!',
        author: 'Coach Sarah',
        authorImage: '',
        date: new Date('2025-02-01'),
        category: 'Tips & Advice',
        tags: ['first class', 'preparation', 'parents', 'beginners'],
        image: '/images/blog/first-class-prep.jpg',
        readTime: '4 min read',
        isFeatured: true,
        isPublished: true,
    },
    {
        title: 'Summer Camp 2025: What\'s New This Year',
        slug: 'summer-camp-2025-whats-new',
        excerpt: 'Exciting updates and new activities for our upcoming Summer Adventure Camp.',
        content: 'We\'re thrilled to announce our Summer Adventure Camp 2025 is bigger and better than ever!\n\n**New Activities**: This year we\'re introducing rock climbing, aerial silks, and nature exploration programs.\n\n**Extended Hours**: Due to popular demand, we\'re offering extended care from 8am to 6pm.\n\n**Weekly Themes**: Each week features a unique theme - from "Superhero Week" to "Olympics Challenge."\n\n**End-of-Camp Show**: Every camper will participate in our spectacular end-of-camp performance.\n\n**Early Bird Discount**: Register before May 1st and enjoy 15% off!\n\nSpaces are limited, so book early to secure your spot.',
        author: 'ProActiv Team',
        authorImage: '',
        date: new Date('2025-03-01'),
        category: 'News & Events',
        tags: ['summer camp', 'events', '2025', 'activities'],
        image: '/images/blog/summer-camp-2025.jpg',
        readTime: '3 min read',
        isFeatured: false,
        isPublished: true,
    },
];

const jobPositionsData = [
    {
        title: 'Gymnastics Coach',
        location: 'Cyberport, Hong Kong',
        type: 'Full-time',
        description: 'We are looking for an experienced and enthusiastic gymnastics coach to join our team. The ideal candidate will have a passion for teaching children and a strong background in artistic gymnastics.',
        requirements: ['Minimum 3 years coaching experience', 'Gymnastics coaching certification', 'First aid certification', 'Strong communication skills', 'Experience with children aged 3-16'],
        responsibilities: ['Lead gymnastics classes for various age groups', 'Develop lesson plans and training programs', 'Ensure student safety at all times', 'Communicate progress to parents', 'Participate in events and competitions'],
        benefits: ['Competitive salary', 'Professional development opportunities', 'Health insurance', 'Staff gym access', 'Flexible scheduling'],
        salary: 'HK$25,000 - HK$35,000/month',
        image: '',
        order: 1,
        isActive: true,
    },
    {
        title: 'Part-time Camp Instructor',
        location: 'All Locations',
        type: 'Part-time',
        description: 'Join our team of camp instructors for our holiday camp programs. Perfect for sports enthusiasts who enjoy working with children in a fun, active environment.',
        requirements: ['Experience working with children', 'Sports or fitness background', 'First aid certification preferred', 'Energetic and enthusiastic personality', 'Available during school holidays'],
        responsibilities: ['Assist with camp activities and games', 'Supervise children during camp hours', 'Set up and pack away equipment', 'Create a fun and safe environment', 'Support lead coaches during sessions'],
        benefits: ['Competitive hourly rate', 'Fun working environment', 'Training provided', 'Staff gym access during shifts'],
        salary: 'HK$120 - HK$180/hour',
        image: '',
        order: 2,
        isActive: true,
    },
];

const contactInfoData = {
    phone: '+852 2234 5678',
    email: 'info@proactivfitness.com',
    address: 'Level 3, The Arcade\n100 Cyberport Road\nPok Fu Lam, Hong Kong',
    hours: 'Mon-Fri: 9:00 AM - 8:00 PM\nSat: 9:00 AM - 6:00 PM\nSun: 10:00 AM - 5:00 PM',
    whatsapp: '+852 9876 5432',
    socialLinks: [
        { platform: 'Instagram', url: 'https://instagram.com/proactivfitness', icon: 'Instagram' },
        { platform: 'Facebook', url: 'https://facebook.com/proactivfitness', icon: 'Facebook' },
        { platform: 'YouTube', url: 'https://youtube.com/proactivfitness', icon: 'Youtube' },
    ],
    mapUrl: '',
};

const faqItemsData = [
    {
        question: 'What age can my child start gymnastics?',
        answer: 'We accept children from age 3 in our Mini Movers program. Our youngest classes focus on basic motor skills, coordination, and social development through play-based learning.',
        category: 'general',
        order: 1,
        isActive: true,
    },
    {
        question: 'Do I need to stay during my child\'s class?',
        answer: 'For children aged 3-4, we recommend a parent stays in the viewing area. For ages 5+, parents can drop off and pick up. Our facilities have comfortable waiting areas with complimentary Wi-Fi.',
        category: 'classes',
        order: 2,
        isActive: true,
    },
    {
        question: 'What should my child wear to class?',
        answer: 'Children should wear comfortable, fitted athletic clothing. Leotards are ideal but not required. Loose clothing and jewelry should be avoided for safety. Hair should be tied back.',
        category: 'classes',
        order: 3,
        isActive: true,
    },
    {
        question: 'How do I book a free assessment?',
        answer: 'You can book a free assessment through our website by clicking "Book A Trial" or by calling us directly. Assessments help us determine the best program for your child\'s skill level.',
        category: 'assessments',
        order: 4,
        isActive: true,
    },
    {
        question: 'What is included in a birthday party package?',
        answer: 'Our party packages include gym time with structured activities, party room access, decorations, a dedicated party coordinator, and invitations. Food and cake are not included but can be arranged.',
        category: 'birthday-parties',
        order: 5,
        isActive: true,
    },
    {
        question: 'Can I book a half-day camp instead of full-day?',
        answer: 'Yes! We offer both full-day (9am-4pm/5pm) and half-day (9am-12pm or 1pm-4pm) options for most of our camp programs. Check specific camp details for availability.',
        category: 'camps',
        order: 6,
        isActive: true,
    },
    {
        question: 'What are the program levels and how does progression work?',
        answer: 'We have four program levels: Mini Movers (3-4 years), Foundation (5-7 years), Development (7-12 years), and Elite (10-16 years). Coaches regularly assess students and recommend advancement when they\'re ready.',
        category: 'programs',
        order: 7,
        isActive: true,
    },
    {
        question: 'Do you offer competitive gymnastics training?',
        answer: 'Yes! Our Elite program includes competition preparation. Students in this program train more intensively and participate in regional and national gymnastics competitions.',
        category: 'programs',
        order: 8,
        isActive: true,
    },
];

// =============================================
// SEEDER CLASS
// =============================================
export class CMSSeeder {
    static async seedAll(): Promise<{ seeded: string[]; skipped: string[] }> {
        const seeded: string[] = [];
        const skipped: string[] = [];

        // Hero Slides
        const heroCount = await HeroSlide.countDocuments({ isDeleted: { $ne: true } });
        if (heroCount === 0) {
            await HeroSlide.insertMany(heroSlidesData);
            seeded.push('Hero Slides');
        } else {
            skipped.push('Hero Slides (already has data)');
        }

        // Site Stats
        const statsCount = await SiteStat.countDocuments({ isDeleted: { $ne: true } });
        if (statsCount === 0) {
            await SiteStat.insertMany(siteStatsData);
            seeded.push('Site Stats');
        } else {
            skipped.push('Site Stats (already has data)');
        }

        // Service Cards
        const servicesCount = await ServiceCard.countDocuments({ isDeleted: { $ne: true } });
        if (servicesCount === 0) {
            await ServiceCard.insertMany(serviceCardsData);
            seeded.push('Service Cards');
        } else {
            skipped.push('Service Cards (already has data)');
        }

        // Testimonials
        const testimonialsCount = await Testimonial.countDocuments({ isDeleted: { $ne: true } });
        if (testimonialsCount === 0) {
            await Testimonial.insertMany(testimonialsData);
            seeded.push('Testimonials');
        } else {
            skipped.push('Testimonials (already has data)');
        }

        // Client Partners
        const partnersCount = await ClientPartner.countDocuments({ isDeleted: { $ne: true } });
        if (partnersCount === 0) {
            await ClientPartner.insertMany(partnersData);
            seeded.push('Client Partners');
        } else {
            skipped.push('Client Partners (already has data)');
        }

        // About Content
        const aboutCount = await AboutContent.countDocuments({ isDeleted: { $ne: true } });
        if (aboutCount === 0) {
            await AboutContent.create(aboutContentData);
            seeded.push('About Content');
        } else {
            skipped.push('About Content (already has data)');
        }

        // AI Features
        const aiCount = await AIFeature.countDocuments({ isDeleted: { $ne: true } });
        if (aiCount === 0) {
            await AIFeature.insertMany(aiFeatureData);
            seeded.push('AI Features');
        } else {
            skipped.push('AI Features (already has data)');
        }

        // Assessments
        const assessCount = await Assessment.countDocuments({ isDeleted: { $ne: true } });
        if (assessCount === 0) {
            await Assessment.insertMany(assessmentsData);
            seeded.push('Assessments');
        } else {
            skipped.push('Assessments (already has data)');
        }

        // Class Sessions
        const classCount = await ClassSession.countDocuments({ isDeleted: { $ne: true } });
        if (classCount === 0) {
            await ClassSession.insertMany(classSessionsData);
            seeded.push('Class Sessions');
        } else {
            skipped.push('Class Sessions (already has data)');
        }

        // Party Packages
        const partyCount = await PartyPackage.countDocuments({ isDeleted: { $ne: true } });
        if (partyCount === 0) {
            await PartyPackage.insertMany(partyPackagesData);
            seeded.push('Party Packages');
        } else {
            skipped.push('Party Packages (already has data)');
        }

        // Program Levels
        const programCount = await ProgramLevel.countDocuments({ isDeleted: { $ne: true } });
        if (programCount === 0) {
            await ProgramLevel.insertMany(programLevelsData);
            seeded.push('Program Levels');
        } else {
            skipped.push('Program Levels (already has data)');
        }

        // Camp Programs
        const campCount = await CampProgram.countDocuments({ isDeleted: { $ne: true } });
        if (campCount === 0) {
            await CampProgram.insertMany(campProgramsData);
            seeded.push('Camp Programs');
        } else {
            skipped.push('Camp Programs (already has data)');
        }

        // Location Details
        const locCount = await LocationDetail.countDocuments({ isDeleted: { $ne: true } });
        if (locCount === 0) {
            await LocationDetail.insertMany(locationDetailsData);
            seeded.push('Location Details');
        } else {
            skipped.push('Location Details (already has data)');
        }

        // Blog Posts
        const blogCount = await BlogPost.countDocuments({ isDeleted: { $ne: true } });
        if (blogCount === 0) {
            await BlogPost.insertMany(blogPostsData);
            seeded.push('Blog Posts');
        } else {
            skipped.push('Blog Posts (already has data)');
        }

        // Job Positions
        const jobCount = await JobPosition.countDocuments({ isDeleted: { $ne: true } });
        if (jobCount === 0) {
            await JobPosition.insertMany(jobPositionsData);
            seeded.push('Job Positions');
        } else {
            skipped.push('Job Positions (already has data)');
        }

        // Contact Info
        const contactCount = await ContactInfo.countDocuments({ isDeleted: { $ne: true } });
        if (contactCount === 0) {
            await ContactInfo.create(contactInfoData);
            seeded.push('Contact Info');
        } else {
            skipped.push('Contact Info (already has data)');
        }

        // FAQ Items
        const faqCount = await FAQItem.countDocuments({ isDeleted: { $ne: true } });
        if (faqCount === 0) {
            await FAQItem.insertMany(faqItemsData);
            seeded.push('FAQ Items');
        } else {
            skipped.push('FAQ Items (already has data)');
        }

        return { seeded, skipped };
    }

    static async clearAll(): Promise<string[]> {
        const cleared: string[] = [];

        await HeroSlide.deleteMany({});
        cleared.push('Hero Slides');

        await SiteStat.deleteMany({});
        cleared.push('Site Stats');

        await ServiceCard.deleteMany({});
        cleared.push('Service Cards');

        await Testimonial.deleteMany({});
        cleared.push('Testimonials');

        await ClientPartner.deleteMany({});
        cleared.push('Client Partners');

        await AboutContent.deleteMany({});
        cleared.push('About Content');

        await AIFeature.deleteMany({});
        cleared.push('AI Features');

        await Assessment.deleteMany({});
        cleared.push('Assessments');

        await ClassSession.deleteMany({});
        cleared.push('Class Sessions');

        await PartyPackage.deleteMany({});
        cleared.push('Party Packages');

        await ProgramLevel.deleteMany({});
        cleared.push('Program Levels');

        await CampProgram.deleteMany({});
        cleared.push('Camp Programs');

        await LocationDetail.deleteMany({});
        cleared.push('Location Details');

        await BlogPost.deleteMany({});
        cleared.push('Blog Posts');

        await JobPosition.deleteMany({});
        cleared.push('Job Positions');

        await ContactInfo.deleteMany({});
        cleared.push('Contact Info');

        await FAQItem.deleteMany({});
        cleared.push('FAQ Items');

        return cleared;
    }
}
