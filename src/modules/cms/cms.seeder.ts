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
    NavMenuItem,
    PageContent,
    TeamMember,
} from './cms.model';

// =============================================
// DEFAULT SEED DATA (from landing page content)
// =============================================

// 9 hero slides — one per image in /public/images/hero/. Carousel cycles through all of them.
// Admins can edit/disable/reorder any slide from the CMS dashboard.
const heroSlidesData = [
    {
        title: 'Build Champions Through Gymnastics',
        subtitle: 'Professional gymnastics training for all ages and skill levels in Hong Kong',
        image: '/images/hero/gymnastics-1.jpg',
        fallbackGradient: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800',
        ctaText: 'Book Free Trial',
        ctaLink: '/book-trial',
        order: 1,
        isActive: true,
    },
    {
        title: 'Build Confidence Through Gymnastics',
        subtitle: 'Children excel with expert coaching and a safe, welcoming environment',
        image: '/images/hero/gymnastics-2.jpg',
        fallbackGradient: 'bg-gradient-to-br from-green-600 via-teal-600 to-green-800',
        ctaText: 'EXPLORE PROGRAMS',
        ctaLink: '/programs',
        order: 2,
        isActive: true,
    },
    {
        title: 'State-of-the-Art Facilities',
        subtitle: 'Safe & modern training environment with certified coaches',
        image: '/images/hero/gymnastics-3.jpg',
        fallbackGradient: 'bg-gradient-to-br from-orange-600 via-red-600 to-orange-800',
        ctaText: 'BOOK A TRIAL',
        ctaLink: '/book-trial',
        order: 3,
        isActive: true,
    },
    {
        title: 'Expert Coaching Programs',
        subtitle: 'Train with certified professionals who care about your progress',
        image: '/images/hero/gymnastics-4.png',
        fallbackGradient: 'bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-800',
        ctaText: 'MEET OUR COACHES',
        ctaLink: '/team',
        order: 4,
        isActive: true,
    },
    {
        title: 'Join Our Community',
        subtitle: 'Be part of 1000+ students building strength, skill, and friendships',
        image: '/images/hero/gymnastics-5.jpg',
        fallbackGradient: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-800',
        ctaText: 'JOIN NOW',
        ctaLink: '/register',
        order: 5,
        isActive: true,
    },
    {
        title: 'Welcome to ProActive Sports',
        subtitle: "Hong Kong's premier gymnastics academy for ages 3-16",
        image: '/images/hero/img1.png',
        fallbackGradient: 'bg-gradient-to-br from-pink-600 via-rose-600 to-orange-800',
        ctaText: 'EXPLORE PROGRAMS',
        ctaLink: '/programs',
        order: 6,
        isActive: true,
    },
    {
        title: 'Discover Your Potential',
        subtitle: 'From first cartwheel to competitive routines — every step matters',
        image: '/images/hero/img2.jpg',
        fallbackGradient: 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-800',
        ctaText: 'BOOK ASSESSMENT',
        ctaLink: '/book-assessment',
        order: 7,
        isActive: true,
    },
    {
        title: 'Train Like a Champion',
        subtitle: 'Structured programs that build strength, flexibility, and confidence',
        image: '/images/hero/img3.jpg',
        fallbackGradient: 'bg-gradient-to-br from-yellow-600 via-orange-600 to-red-800',
        ctaText: 'VIEW CLASSES',
        ctaLink: '/programs',
        order: 8,
        isActive: true,
    },
    {
        title: 'Start Your Journey Today',
        subtitle: 'Book a free trial class and see why parents choose ProActive Sports',
        image: '/images/hero/img4.jpg',
        fallbackGradient: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-800',
        ctaText: 'BOOK FREE TRIAL',
        ctaLink: '/book-trial',
        order: 9,
        isActive: true,
    },
];

const siteStatsData = [
    {
        label: 'Happy Students',
        value: 1000,
        suffix: '+',
        icon: '👨‍👩‍👧‍👦',
        color: 'from-blue-400 to-cyan-400',
        order: 1,
        isActive: true,
    },
    {
        label: 'Years Experience',
        value: 10,
        suffix: '+',
        icon: '🏆',
        color: 'from-yellow-400 to-orange-400',
        order: 2,
        isActive: true,
    },
    {
        label: 'Premium Locations',
        value: 2,
        suffix: '',
        icon: '📍',
        color: 'from-green-400 to-emerald-400',
        order: 3,
        isActive: true,
    },
    {
        label: 'Expert Coaches',
        value: 15,
        suffix: '+',
        icon: '🥇',
        color: 'from-purple-400 to-pink-400',
        order: 4,
        isActive: true,
    },
];

const serviceCardsData = [
    {
        title: 'GYMNASTICS PROGRAMS',
        description: 'Comprehensive gymnastics programs designed for schools, bringing professional coaching directly to your educational institution.',
        image: '/images/services/school-gymnastics.jpg',
        emoji: '🤸‍♀️',
        features: ['Ages 3-16 Programs', 'Professional Coaches', 'School Integration', 'Progress Tracking'],
        href: '/locations/wan-chai',
        color: 'green',
        gradient: 'from-green-400 to-green-600',
        order: 1,
        isActive: true,
    },
    {
        title: 'GYMNASTICS CAMPS',
        description: 'Fun-filled holiday camps that combine skill development with exciting activities and games during school breaks.',
        image: '/images/services/holiday-camps.jpg',
        emoji: '🏕️',
        features: ['Daily Activities', 'Skill Development', 'Fun Games', 'Professional Supervision'],
        href: '/camps/gymnastics',
        color: 'red',
        gradient: 'from-red-400 to-red-600',
        order: 2,
        isActive: true,
    },
    {
        title: 'PRIVATE COACHING',
        description: 'One-on-one personalized coaching sessions tailored to individual needs and skill levels for accelerated progress.',
        image: '/images/services/private-coaching.jpg',
        emoji: '👨‍🏫',
        features: ['Personalized Training', 'Flexible Schedule', 'Individual Attention', 'Rapid Progress'],
        href: '/private-coaching',
        color: 'blue',
        gradient: 'from-blue-400 to-blue-600',
        order: 3,
        isActive: true,
    },
    {
        title: 'BIRTHDAY PARTIES',
        description: 'Unforgettable birthday celebrations with gymnastics activities, games, and professional hosting for memorable experiences.',
        image: '/images/services/birthday-parties.jpg',
        emoji: '🎉',
        features: ['Party Hosting', 'Gymnastics Fun', 'Games & Activities', 'Memorable Experience'],
        href: '/birthday-parties',
        color: 'darkblue',
        gradient: 'from-blue-800 to-blue-900',
        order: 4,
        isActive: true,
    },
];

const testimonialsData = [
    {
        name: 'Jennifer Wong',
        role: 'Parent of Emma (Age 7)',
        rating: 5,
        text: "ProActive Sports has been amazing for my daughter Emma. She started as a shy 5-year-old and now she's confident, strong, and absolutely loves gymnastics. The coaches are patient, professional, and really know how to work with children.",
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-pink-400 to-purple-500',
        program: 'School Gymnastics Program',
        order: 1,
        isActive: true,
    },
    {
        name: 'David Chen',
        role: 'Parent of Lucas (Age 10)',
        rating: 5,
        text: "We've tried several gymnastics schools, but ProActive Sports stands out. The facilities are excellent, the coaching is top-notch, and most importantly, my son Lucas has developed not just physical skills but also discipline and confidence.",
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-blue-400 to-cyan-500',
        program: 'Advanced Training Program',
        order: 2,
        isActive: true,
    },
    {
        name: 'Sarah Mitchell',
        role: 'Parent of Sophia (Age 6)',
        rating: 5,
        text: "The holiday camps at ProActive Sports are fantastic! Sophia always comes home excited about what she learned. The coaches make it fun while still teaching proper techniques. It's the perfect balance of learning and enjoyment.",
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-green-400 to-teal-500',
        program: 'Holiday Camps',
        order: 3,
        isActive: true,
    },
    {
        name: 'Michael Johnson',
        role: 'Parent of Alex (Age 8)',
        rating: 5,
        text: "We had Alex's birthday party at ProActive Sports and it was incredible! The staff handled everything perfectly, the kids had a blast, and Alex still talks about it months later. Highly recommend for parties!",
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-orange-400 to-red-500',
        program: 'Birthday Party',
        order: 4,
        isActive: true,
    },
    {
        name: 'Lisa Zhang',
        role: 'Parent of Chloe (Age 9)',
        rating: 5,
        text: 'The progress Chloe has made at ProActive Sports is remarkable. From basic tumbling to advanced routines, the structured approach and individual attention from coaches has helped her excel beyond our expectations.',
        image: '',
        fallbackGradient: 'bg-gradient-to-br from-purple-400 to-pink-500',
        program: 'Competitive Training',
        order: 5,
        isActive: true,
    },
];

// "Trusted by Leading International Schools" section on the landing page renders these
// partner schools. Logo intentionally empty — no committed logo files; the frontend
// renders fallbackText + gradient until an admin uploads real logos via the CMS.
const partnersData = [
    {
        name: 'Hong Kong International School',
        logo: '',
        fallbackText: 'HKIS',
        color: 'from-blue-500 to-cyan-500',
        order: 1,
        isActive: true,
    },
    {
        name: 'Discovery Bay International School',
        logo: '',
        fallbackText: 'DBIS',
        color: 'from-green-500 to-emerald-500',
        order: 2,
        isActive: true,
    },
    {
        name: 'German Swiss International School',
        logo: '',
        fallbackText: 'GSIS',
        color: 'from-purple-500 to-pink-500',
        order: 3,
        isActive: true,
    },
    {
        name: 'Kellett School',
        logo: '',
        fallbackText: 'KS',
        color: 'from-orange-500 to-red-500',
        order: 4,
        isActive: true,
    },
    {
        name: 'Hong Kong Academy',
        logo: '',
        fallbackText: 'HKA',
        color: 'from-teal-500 to-cyan-500',
        order: 5,
        isActive: true,
    },
    {
        name: 'Canadian International School',
        logo: '',
        fallbackText: 'CDNIS',
        color: 'from-indigo-500 to-purple-500',
        order: 6,
        isActive: true,
    },
    {
        name: 'Harrow International School',
        logo: '',
        fallbackText: 'HIS',
        color: 'from-pink-500 to-rose-500',
        order: 7,
        isActive: true,
    },
    {
        name: 'French International School',
        logo: '',
        fallbackText: 'FIS',
        color: 'from-yellow-500 to-orange-500',
        order: 8,
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
        title: 'AI Chatbot Assistant',
        description: 'Chat with our intelligent AI assistant 24/7 for instant help with bookings, program information, and scheduling.',
        icon: 'MessageSquare',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        order: 1,
        isActive: true,
    },
    {
        title: 'Personalized Coaching',
        description: "AI analyzes each student's performance and generates custom training plans with specific drills and milestones.",
        icon: 'Target',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        order: 2,
        isActive: true,
    },
    {
        title: 'Smart Nutrition Plans',
        description: 'AI creates age-appropriate meal plans, grocery lists, and kid-friendly recipes tailored to your young athlete.',
        icon: 'Utensils',
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        order: 3,
        isActive: true,
    },
    {
        title: 'Progress Predictions',
        description: 'AI tracks performance trends and predicts growth trajectory so you can see real improvement over time.',
        icon: 'TrendingUp',
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50',
        order: 4,
        isActive: true,
    },
    {
        title: 'Form Analysis & Safety',
        description: 'AI evaluates exercise form to identify correction needs and prevent injuries before they happen.',
        icon: 'Shield',
        color: 'from-red-500 to-pink-500',
        bgColor: 'bg-red-50',
        order: 5,
        isActive: true,
    },
    {
        title: 'Smart Automation',
        description: 'Automated reminders, intelligent scheduling, and workflow management powered by AI for seamless operations.',
        icon: 'Zap',
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-50',
        order: 6,
        isActive: true,
    },
];

const assessmentsData = [
    {
        title: 'Beginner Gymnastics Assessment',
        description: 'Free assessment for new students to evaluate current skill level and recommend the best program.',
        image: '/images/about/img3.jpg',
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
        image: '/images/about/img5.jpg',
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
        image: '/images/about/img6.jpg',
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
        image: '/images/hero/img1.png',
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
        image: '/images/hero/img2.jpg',
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
        image: '/images/hero/img3.jpg',
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
        image: '/images/hero/img4.jpg',
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
        image: '/images/services/birthday-parties.jpg',
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
        image: '/images/pages/birthday-parties-hero.jpg',
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
        image: '/images/pages/book-party-hero.jpg',
        order: 3,
        isActive: true,
    },
];

const programLevelsData = [
    {
        name: 'Mini Movers',
        description: 'An introduction to movement and gymnastics for our youngest athletes. Focus on motor skills, coordination, and social development through play-based learning.',
        image: '/images/hero/gymnastics-1.jpg',
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
        image: '/images/hero/gymnastics-2.jpg',
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
        image: '/images/hero/gymnastics-3.jpg',
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
        image: '/images/hero/gymnastics-5.jpg',
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
        image: '/images/services/holiday-camps.jpg',
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
        image: '/images/pages/school-gymnastics-hero.jpg',
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
        image: '/images/about/img7.jpg',
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
        address: 'Shop 123, Cyberport 3, 100 Cyberport Road, Cyberport, Hong Kong',
        phone: '+852 2234 5678',
        email: 'cyberport@proactivsports.net',
        hours: [
            { day: 'Mon-Fri', time: '3:30PM-8:30PM' },
            { day: 'Sat-Sun', time: '9:00AM-6:00PM' },
        ],
        facilities: [
            { name: 'Main Gymnasium', description: 'Spacious training area with professional gymnastics equipment', features: ['Olympic standard apparatus', 'Safety foam pits', 'Sprung floors', 'Mirrored walls'] },
            { name: 'Reception & Viewing Area', description: 'Comfortable space for parents and visitors', features: ['Seating area', 'Clear viewing windows', 'Refreshment area', 'Free WiFi'] },
            { name: 'Changing Rooms', description: 'Clean and secure facilities for students', features: ['Separate boys/girls areas', 'Lockers available', 'Baby changing facilities', 'Shower facilities'] },
            { name: 'Party Room', description: 'Dedicated space for birthday celebrations', features: ['Tables and chairs', 'Decorations setup', 'Sound system', 'Kitchen access'] },
        ],
        schedule: [
            { day: 'Monday', slots: [
                { time: '4:00 PM - 4:45 PM', program: 'Beginner', ageGroup: '3-5 years', level: 'Beginner', spots: 'Available' },
                { time: '5:00 PM - 6:00 PM', program: 'Intermediate', ageGroup: '6-9 years', level: 'Intermediate', spots: 'Available' },
                { time: '6:15 PM - 7:30 PM', program: 'Advanced', ageGroup: '10+ years', level: 'Advanced', spots: 'Limited' },
            ]},
            { day: 'Tuesday', slots: [
                { time: '4:30 PM - 5:30 PM', program: 'Beginner', ageGroup: '4-6 years', level: 'Beginner', spots: 'Available' },
                { time: '5:45 PM - 7:00 PM', program: 'Competitive Team', ageGroup: 'Mixed', level: 'Competitive', spots: 'Full' },
                { time: '7:15 PM - 8:15 PM', program: 'Adult Classes', ageGroup: 'Adults', level: 'Mixed', spots: 'Available' },
            ]},
            { day: 'Wednesday', slots: [
                { time: '4:00 PM - 4:45 PM', program: 'Toddler Gym', ageGroup: '2-3 years', level: 'Toddler', spots: 'Available' },
                { time: '5:00 PM - 6:00 PM', program: 'Intermediate', ageGroup: '7-10 years', level: 'Intermediate', spots: 'Available' },
                { time: '6:15 PM - 7:30 PM', program: 'Advanced', ageGroup: '11+ years', level: 'Advanced', spots: 'Available' },
            ]},
            { day: 'Thursday', slots: [
                { time: '4:30 PM - 5:30 PM', program: 'Beginner', ageGroup: '5-7 years', level: 'Beginner', spots: 'Limited' },
                { time: '5:45 PM - 7:00 PM', program: 'Competitive Team', ageGroup: 'Mixed', level: 'Competitive', spots: 'Full' },
                { time: '7:15 PM - 8:15 PM', program: 'Teen Classes', ageGroup: '12+ years', level: 'Mixed', spots: 'Available' },
            ]},
            { day: 'Friday', slots: [
                { time: '4:00 PM - 5:00 PM', program: 'Mixed Ages', ageGroup: '4-8 years', level: 'Mixed', spots: 'Available' },
                { time: '5:15 PM - 6:30 PM', program: 'Advanced Skills', ageGroup: 'Mixed', level: 'Advanced', spots: 'Available' },
            ]},
            { day: 'Saturday', slots: [
                { time: '9:00 AM - 9:45 AM', program: 'Toddler Gym', ageGroup: '2-3 years', level: 'Toddler', spots: 'Available' },
                { time: '10:00 AM - 11:00 AM', program: 'Beginner', ageGroup: '4-6 years', level: 'Beginner', spots: 'Limited' },
                { time: '11:15 AM - 12:15 PM', program: 'Intermediate', ageGroup: '7-10 years', level: 'Intermediate', spots: 'Available' },
                { time: '12:30 PM - 1:45 PM', program: 'Advanced', ageGroup: '11+ years', level: 'Advanced', spots: 'Available' },
                { time: '2:00 PM - 3:15 PM', program: 'Competitive Team', ageGroup: 'Mixed', level: 'Competitive', spots: 'Full' },
            ]},
            { day: 'Sunday', slots: [
                { time: '9:00 AM - 10:00 AM', program: 'Family Gym', ageGroup: 'Families', level: 'Mixed', spots: 'Available' },
                { time: '10:15 AM - 11:15 AM', program: 'Beginner', ageGroup: '5-8 years', level: 'Beginner', spots: 'Available' },
                { time: '11:30 AM - 12:30 PM', program: 'Intermediate Skills', ageGroup: 'Mixed', level: 'Intermediate', spots: 'Available' },
            ]},
        ],
        team: [
            { name: 'Monica', role: 'Director of Sports', specialization: 'Competitive gymnastics, program development', experience: '15 years', image: '' },
            { name: 'Juan', role: 'Gymnastics Coach', specialization: 'School programs, beginner classes', experience: '10 years', image: '' },
            { name: 'Sami', role: 'Gymnastics Coach', specialization: 'Holiday camps, birthday parties', experience: '5 years', image: '' },
            { name: 'Joanna', role: 'Head of Customer Service & Operations', specialization: 'Customer service, operations management', experience: '8 years', image: '' },
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
        email: 'wanchai@proactivsports.net',
        hours: [
            { day: 'Mon-Fri', time: '4:00PM-8:00PM' },
            { day: 'Saturday', time: '9:00AM-5:00PM' },
            { day: 'Sunday', time: 'Closed' },
        ],
        facilities: [
            { name: 'Training Hall', description: 'Large, well-equipped gymnastics training space', features: ['Professional apparatus', 'Safety equipment', 'Mirrored walls', 'Sound system'] },
            { name: 'Parent Lounge', description: 'Comfortable waiting area with great views', features: ['Comfortable seating', 'Viewing windows', 'Refreshments', 'Free WiFi'] },
            { name: 'Changing Facilities', description: 'Modern and clean changing rooms', features: ['Separate facilities', 'Secure lockers', 'Family rooms', 'Accessibility features'] },
            { name: 'Multi-Purpose Room', description: 'Flexible space for parties and events', features: ['Party setup', 'Audio/visual equipment', 'Catering space', 'Decoration options'] },
        ],
        schedule: [
            { day: 'Monday', slots: [
                { time: '4:15 PM - 5:00 PM', program: 'Toddler Gym', ageGroup: '2-3 years', level: 'Toddler', spots: 'Available' },
                { time: '5:15 PM - 6:15 PM', program: 'Beginner', ageGroup: '4-6 years', level: 'Beginner', spots: 'Limited' },
                { time: '6:30 PM - 7:45 PM', program: 'Intermediate', ageGroup: '7-10 years', level: 'Intermediate', spots: 'Available' },
            ]},
            { day: 'Tuesday', slots: [
                { time: '4:00 PM - 5:00 PM', program: 'Mixed Ages', ageGroup: '5-8 years', level: 'Mixed', spots: 'Available' },
                { time: '5:15 PM - 6:30 PM', program: 'Advanced', ageGroup: '11+ years', level: 'Advanced', spots: 'Available' },
                { time: '6:45 PM - 7:45 PM', program: 'Teen Classes', ageGroup: '12+ years', level: 'Mixed', spots: 'Available' },
            ]},
            { day: 'Wednesday', slots: [
                { time: '4:15 PM - 5:00 PM', program: 'Beginner', ageGroup: '3-5 years', level: 'Beginner', spots: 'Available' },
                { time: '5:15 PM - 6:15 PM', program: 'Intermediate', ageGroup: '6-9 years', level: 'Intermediate', spots: 'Limited' },
                { time: '6:30 PM - 7:45 PM', program: 'Competitive Team', ageGroup: 'Mixed', level: 'Competitive', spots: 'Full' },
            ]},
            { day: 'Thursday', slots: [
                { time: '4:00 PM - 5:00 PM', program: 'Toddler & Parent', ageGroup: '2-3 years', level: 'Toddler', spots: 'Available' },
                { time: '5:15 PM - 6:30 PM', program: 'Advanced Skills', ageGroup: 'Mixed', level: 'Advanced', spots: 'Available' },
                { time: '6:45 PM - 7:45 PM', program: 'Adult Gymnastics', ageGroup: 'Adults', level: 'Mixed', spots: 'Available' },
            ]},
            { day: 'Friday', slots: [
                { time: '4:15 PM - 5:15 PM', program: 'Mixed Levels', ageGroup: '4-8 years', level: 'Mixed', spots: 'Available' },
                { time: '5:30 PM - 6:45 PM', program: 'Competitive Prep', ageGroup: 'Mixed', level: 'Competitive', spots: 'Limited' },
            ]},
            { day: 'Saturday', slots: [
                { time: '9:00 AM - 9:45 AM', program: 'Toddler Gym', ageGroup: '2-3 years', level: 'Toddler', spots: 'Available' },
                { time: '10:00 AM - 11:00 AM', program: 'Beginner', ageGroup: '4-6 years', level: 'Beginner', spots: 'Available' },
                { time: '11:15 AM - 12:15 PM', program: 'Intermediate', ageGroup: '7-10 years', level: 'Intermediate', spots: 'Limited' },
                { time: '12:30 PM - 1:45 PM', program: 'Advanced', ageGroup: '11+ years', level: 'Advanced', spots: 'Available' },
                { time: '2:00 PM - 3:15 PM', program: 'Competitive Team', ageGroup: 'Mixed', level: 'Competitive', spots: 'Full' },
                { time: '3:30 PM - 4:30 PM', program: 'Open Gym', ageGroup: 'All', level: 'Mixed', spots: 'Available' },
            ]},
        ],
        team: [
            { name: 'Juan', role: 'Lead Coach (Wan Chai)', specialization: 'School programs, beginner classes', experience: '10 years', image: '' },
            { name: 'Sami', role: 'Gymnastics Coach', specialization: 'Holiday camps, birthday parties', experience: '5 years', image: '' },
            { name: 'Joanna', role: 'Customer Service Lead', specialization: 'Customer service, operations management', experience: '8 years', image: '' },
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
        image: '/images/pages/about-hero.jpg',
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
        image: '/images/pages/book-trial-hero.jpg',
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
        image: '/images/pages/school-gymnastics-hero.jpg',
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
// NAV MENU ITEMS (matches landing-page header exactly)
// =============================================
const navMenuItemsData = [
    // Top-level items (parentLabel='')
    { label: 'ProGym Locations', href: '#', parentLabel: '', order: 1, isActive: true },
    { label: 'School Gymnastics', href: '/school-gymnastics', parentLabel: '', order: 2, isActive: true },
    { label: 'Holiday Camps', href: '#', parentLabel: '', order: 3, isActive: true },
    { label: 'Parties', href: '/birthday-parties', parentLabel: '', order: 4, isActive: true },
    { label: 'About Us', href: '#', parentLabel: '', order: 5, isActive: true },
    { label: 'Contact Us', href: '/contact', parentLabel: '', order: 6, isActive: true },

    // ProGym Locations dropdown
    { label: 'Cyberport', href: '/locations/cyberport', parentLabel: 'ProGym Locations', order: 1, isActive: true },
    { label: 'Wan Chai', href: '/locations/wan-chai', parentLabel: 'ProGym Locations', order: 2, isActive: true },

    // Holiday Camps dropdown
    { label: 'Gymnastics Camps', href: '/camps/gymnastics', parentLabel: 'Holiday Camps', order: 1, isActive: true },
    { label: 'Multi-Activity Camps', href: '/camps/multi-activity', parentLabel: 'Holiday Camps', order: 2, isActive: true },
    { label: 'Shenzhen Competitive', href: '/camps/shenzhen-competitive', parentLabel: 'Holiday Camps', order: 3, isActive: true },

    // About Us dropdown
    { label: 'About', href: '/about', parentLabel: 'About Us', order: 1, isActive: true },
    { label: 'Careers', href: '/careers', parentLabel: 'About Us', order: 2, isActive: true },
    { label: 'Team', href: '/team', parentLabel: 'About Us', order: 3, isActive: true },
    { label: 'Blog', href: '/blog', parentLabel: 'About Us', order: 4, isActive: true },
    { label: 'Terms & Conditions', href: '/terms', parentLabel: 'About Us', order: 5, isActive: true },
];

// =============================================
// PAGE CONTENT — one document per landing-page slug.
// Each entry mirrors the visible hero of the corresponding public page.
// Admins edit these from /admin/cms/pages/<slug>.
// =============================================
const pageContentsData = [
    {
        slug: 'cyberport',
        name: 'Cyberport',
        hero: {
            title: 'ProGym Cyberport',
            subtitle: 'Our flagship location in the heart of Cyberport, featuring state-of-the-art facilities and comprehensive gymnastics programs for the whole family.',
            backgroundImage: '/images/locations/cyberport-hero.jpg',
            fallbackGradient: 'from-cyan-600 to-indigo-900',
            ctaText: 'Book Free Trial',
            ctaLink: '/book-trial',
            height: 'large',
        },
        sections: [
            {
                key: 'location-info',
                title: 'Prime Cyberport Location',
                subtitle: 'LOCATION DETAILS',
                body: 'Located in the prestigious Cyberport development, our facility offers easy access via public transport and ample parking. The modern, purpose-built space provides the perfect environment for gymnastics training and development.',
                image: '',
                items: [
                    { iconKey: 'mapPin', label: 'Address', text: 'Shop 123, Cyberport 3, 100 Cyberport Road, Cyberport, Hong Kong' },
                    { iconKey: 'truck', label: 'Parking', text: 'Free parking available in Cyberport parking garage' },
                    { iconKey: 'wifi', label: 'Amenities', text: 'Free WiFi, air conditioning, viewing area for parents' },
                    { iconKey: 'shield', label: 'Safety', text: '24/7 security, CCTV monitoring, first aid certified staff' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'services',
                title: 'Our Services',
                subtitle: '',
                body: 'Comprehensive gymnastics programs and services available at our Cyberport location. Service cards are managed in CMS → Service Cards.',
                image: '',
                items: [],
                order: 2,
                isActive: true,
            },
            {
                key: 'facilities',
                title: 'World-Class Facilities',
                subtitle: 'PREMIUM FACILITIES',
                body: 'Our purpose-built facility features professional-grade equipment and amenities designed for optimal training and comfort. Edit individual facilities in CMS → Location Details → Cyberport → Facilities.',
                image: '',
                items: [],
                order: 3,
                isActive: true,
            },
            {
                key: 'schedule',
                title: 'Weekly Class Schedule',
                subtitle: 'CLASS SCHEDULE',
                body: 'Find the perfect class time for your schedule. We offer programs throughout the week to accommodate busy families. Edit slots in CMS → Location Details → Cyberport → Schedule.',
                image: '',
                items: [{ ctaText: 'Book Your Class Today', ctaLink: '/book-trial' }],
                order: 4,
                isActive: true,
            },
            {
                key: 'team',
                title: 'Meet Our Expert Coaching Team',
                subtitle: 'Our Team',
                body: 'Our sports coaches play a pivotal role in driving the success of our business through their expertise, leadership, and guidance. They serve as the architects of students development, honing the skills and talents of our students to their fullest potential.',
                image: '',
                items: [
                    { value: '15+', label: 'Expert Coaches', sub: 'Certified professionals' },
                    { value: '100+', label: 'Years Combined', sub: 'Total experience' },
                    { value: '500+', label: 'Students Trained', sub: 'Across all programs' },
                ],
                order: 5,
                isActive: true,
            },
            {
                key: 'contact',
                title: 'Visit Our Cyberport Location',
                subtitle: '',
                body: 'Ready to start your gymnastics journey? Contact us today to schedule a visit or book your first class.',
                image: '',
                items: [
                    { ctaText: 'Book Free Trial', ctaLink: '/book-trial' },
                    { ctaText: 'Contact Us', ctaLink: '/contact' },
                ],
                order: 6,
                isActive: true,
            },
        ],
        seo: {
            metaTitle: 'Cyberport Gymnastics Academy | ProActive Sports',
            metaDescription: 'Visit our Cyberport gymnastics facility — premier training for all ages.',
            keywords: ['cyberport', 'gymnastics', 'hong kong'],
        },
        isActive: true,
    },
    {
        slug: 'wan-chai',
        name: 'Wan Chai',
        hero: {
            title: 'ProGym Wan Chai',
            subtitle: 'Modern facility in the heart of Wan Chai district. Central Hong Kong Location, 3 mins from MTR, professional training for all ages.',
            backgroundImage: '/images/locations/wan-chai-hero.jpg',
            fallbackGradient: 'from-yellow-400 to-orange-600',
            ctaText: 'Book Free Trial',
            ctaLink: '/book-trial',
            height: 'large',
        },
        sections: [
            {
                key: 'location-info',
                title: 'Central Wan Chai Location',
                subtitle: 'LOCATION DETAILS',
                body: 'Strategically located in Wan Chai, one of Hong Kong\'s most accessible districts. Our facility is just minutes from Wan Chai MTR station and multiple bus routes, making it convenient for families across Hong Kong Island.',
                image: '',
                items: [
                    { iconKey: 'mapPin', label: 'Address', text: '5/F, 168 Hennessy Road, Wan Chai, Hong Kong' },
                    { iconKey: 'train', label: 'Transportation', text: '3 minutes walk from Wan Chai MTR Station (Exit A3)' },
                    { iconKey: 'wifi', label: 'Amenities', text: 'Free WiFi, air conditioning, viewing area for parents' },
                    { iconKey: 'shield', label: 'Safety', text: 'Building security, CCTV monitoring, first aid certified staff' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'services',
                title: 'Our Services',
                subtitle: '',
                body: 'Comprehensive gymnastics programs and services available at our Wan Chai location.',
                image: '',
                items: [],
                order: 2,
                isActive: true,
            },
            {
                key: 'facilities',
                title: 'World-Class Facilities',
                subtitle: 'PREMIUM FACILITIES',
                body: 'Our Wan Chai location features modern, safe, and well-equipped facilities designed for optimal training. Edit individual facilities in CMS → Location Details → Wan Chai → Facilities.',
                image: '',
                items: [],
                order: 3,
                isActive: true,
            },
            {
                key: 'schedule',
                title: 'Weekly Schedule',
                subtitle: 'CLASS SCHEDULE',
                body: 'Find the perfect class time for your child with our flexible weekly schedule. Edit slots in CMS → Location Details → Wan Chai → Schedule.',
                image: '',
                items: [{ ctaText: 'Book Your Class Today', ctaLink: '/book-trial' }],
                order: 4,
                isActive: true,
            },
            {
                key: 'team',
                title: 'Meet Our Expert Coaching Team',
                subtitle: 'Our Team',
                body: 'Our coaches play a pivotal role in driving the success of our business through their expertise, leadership, and guidance.',
                image: '',
                items: [
                    { value: '15+', label: 'Expert Coaches', sub: 'Certified professionals' },
                    { value: '100+', label: 'Years Combined', sub: 'Total experience' },
                    { value: '500+', label: 'Students Trained', sub: 'Across all programs' },
                ],
                order: 5,
                isActive: true,
            },
            {
                key: 'contact-form',
                title: 'Visit ProGym Wan Chai',
                subtitle: '',
                body: 'Ready to start your gymnastics journey? Visit our Wan Chai location or get in touch to learn more about our programs and schedule a free trial class.',
                image: '',
                items: [
                    { fieldKey: 'parentName', fieldLabel: 'Parent Name', fieldType: 'text', required: true },
                    { fieldKey: 'childName', fieldLabel: 'Child Name', fieldType: 'text', required: true },
                    { fieldKey: 'childAge', fieldLabel: 'Child Age', fieldType: 'select', required: true, options: ['2-3 years', '4-6 years', '7-10 years', '11+ years'] },
                    { fieldKey: 'phone', fieldLabel: 'Phone Number', fieldType: 'tel', required: true },
                    { ctaText: 'Book Free Trial', ctaLink: '/book-trial' },
                ],
                order: 6,
                isActive: true,
            },
        ],
        seo: {
            metaTitle: 'Wan Chai Gymnastics Academy | ProActive Sports',
            metaDescription: 'Visit our Wan Chai gymnastics facility — convenient location, expert coaching.',
            keywords: ['wan chai', 'gymnastics', 'hong kong'],
        },
        isActive: true,
    },
    {
        slug: 'school-gymnastics',
        name: 'School Gymnastics',
        hero: {
            title: 'School Gymnastics Programs',
            subtitle: 'Comprehensive gymnastics training for all skill levels. From first-time gymnasts to competitive athletes, we provide structured programs that build skills, confidence, and character.',
            backgroundImage: '/images/programs/school-gymnastics-hero.jpg',
            fallbackGradient: 'from-blue-600 to-green-600',
            ctaText: 'Explore Programs',
            ctaLink: '/programs',
            height: 'large',
        },
        sections: [
            {
                key: 'program-levels-intro',
                title: 'Choose Your Path',
                subtitle: 'PROGRAM LEVELS',
                body: 'Our structured progression system ensures every student receives appropriate training for their age, skill level, and goals. Edit individual program levels in CMS → Program Levels.',
                image: '',
                items: [{ ctaText: 'Book Trial Class', ctaLink: '/book-trial' }],
                order: 1,
                isActive: true,
            },
            {
                key: 'team-preview',
                title: 'Meet Our Coaching Team',
                subtitle: 'OUR COACHES',
                body: 'Our certified coaches bring years of experience and a passion for developing young gymnasts. Edit team members in CMS → Team.',
                image: '',
                items: [],
                order: 2,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Ready to Start Your Gymnastics Journey?',
                subtitle: '',
                body: 'Join our school gymnastics programs and discover the joy of movement, the thrill of achievement, and the confidence that comes with mastering new skills.',
                image: '',
                items: [
                    { ctaText: 'Book Free Trial', ctaLink: '/book-trial' },
                    { ctaText: 'Get More Info', ctaLink: '/contact' },
                ],
                order: 3,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'School Gymnastics | ProActive Sports', metaDescription: 'Structured gymnastics for school-age children.', keywords: ['school gymnastics', 'kids gymnastics'] },
        isActive: true,
    },
    {
        slug: 'gymnastics-camps',
        name: 'Gymnastics Camps',
        hero: {
            title: 'Gymnastics Holiday Camps',
            subtitle: 'Action-packed holiday camps combining skill development with fun activities. Perfect for gymnasts of all levels to learn, grow, and make new friends during school breaks.',
            backgroundImage: '/images/camps/gymnastics-hero.jpg',
            fallbackGradient: 'from-blue-600 to-indigo-700',
            ctaText: 'Register Now',
            ctaLink: '/book-now',
            height: 'large',
        },
        sections: [
            {
                key: 'camp-levels',
                title: 'Camp Levels',
                subtitle: '',
                body: 'We offer camps tailored to different skill levels, ensuring every participant receives appropriate instruction and has an amazing experience.',
                image: '',
                items: [
                    { name: 'Beginner Level', ageGroup: '4-8 years', description: 'Perfect introduction to gymnastics in a fun, supportive environment.', activities: ['Basic tumbling and rolls', 'Balance beam fundamentals', 'Vault introduction', 'Uneven bars basics', 'Flexibility and strength', 'Games and activities'], objectives: ['Build confidence and coordination', 'Learn basic gymnastics skills', 'Develop social skills', 'Have fun while learning'] },
                    { name: 'Advanced Level', ageGroup: '9-16 years', description: 'Intensive training for experienced gymnasts looking to advance their skills.', activities: ['Advanced tumbling sequences', 'Complex beam routines', 'Vault progressions', 'Bar skill development', 'Conditioning and flexibility', 'Routine choreography'], objectives: ['Master advanced techniques', 'Improve strength and flexibility', 'Develop competitive skills', 'Build mental toughness'] },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'upcoming-camps',
                title: 'Upcoming Camps',
                subtitle: '',
                body: 'Plan ahead and secure your child\'s spot in our popular camps.',
                image: '',
                items: [
                    { name: 'Christmas Holiday Camp', dates: 'Dec 18-22, 2024', duration: '5 days', time: '9:00 AM - 3:00 PM', location: 'Both Locations', price: 'HK$2,500', level: 'All Levels', spotsLeft: 8, highlights: ['Christmas themed activities', 'Special performances', 'Holiday crafts'] },
                    { name: 'New Year Skills Camp', dates: 'Jan 2-5, 2025', duration: '4 days', time: '10:00 AM - 4:00 PM', location: 'Cyberport', price: 'HK$2,200', level: 'Intermediate/Advanced', spotsLeft: 5, highlights: ['Skill assessments', 'Goal setting', 'Progress tracking'] },
                    { name: 'Chinese New Year Camp', dates: 'Feb 10-14, 2025', duration: '5 days', time: '9:00 AM - 3:00 PM', location: 'Wan Chai', price: 'HK$2,600', level: 'All Levels', spotsLeft: 12, highlights: ['Cultural activities', 'Lion dance workshop', 'Traditional games'] },
                    { name: 'Easter Skills Intensive', dates: 'Apr 14-18, 2025', duration: '5 days', time: '9:00 AM - 4:00 PM', location: 'Both Locations', price: 'HK$2,800', level: 'Advanced', spotsLeft: 6, highlights: ['Competition prep', 'Advanced skills', 'Mental training'] },
                ],
                order: 2,
                isActive: true,
            },
            {
                key: 'daily-schedule',
                title: 'Daily Schedule',
                subtitle: 'A TYPICAL CAMP DAY',
                body: 'Each day combines skill development, fun games, and structured rest.',
                image: '',
                items: [
                    { time: '9:00 AM', activity: 'Arrival & Warm-up' },
                    { time: '9:30 AM', activity: 'Skill Development Session 1' },
                    { time: '10:30 AM', activity: 'Snack Break' },
                    { time: '11:00 AM', activity: 'Apparatus Rotation' },
                    { time: '12:00 PM', activity: 'Lunch Break' },
                    { time: '1:00 PM', activity: 'Games & Activities' },
                    { time: '2:00 PM', activity: 'Skill Development Session 2' },
                    { time: '2:45 PM', activity: 'Cool Down & Reflection' },
                    { time: '3:00 PM', activity: 'Departure' },
                ],
                order: 3,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Ready to Book Your Child\'s Adventure?',
                subtitle: '',
                body: 'Spaces fill up quickly! Secure your child\'s spot today.',
                image: '',
                items: [
                    { ctaText: 'Book Camp Now', ctaLink: '/book-now' },
                    { ctaText: 'Ask Questions', ctaLink: '/contact' },
                ],
                order: 4,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Gymnastics Holiday Camps | ProActive Sports', metaDescription: 'Holiday gymnastics camps.', keywords: ['gymnastics camp', 'holiday camp'] },
        isActive: true,
    },
    {
        slug: 'multi-activity-camps',
        name: 'Multi-Activity Camps',
        hero: {
            title: 'Multi-Activity Holiday Camps',
            subtitle: 'A blend of gymnastics, sports, games, and creative activities — perfect for active kids who love variety.',
            backgroundImage: '/images/camps/multi-activity-hero.jpg',
            fallbackGradient: 'from-amber-500 to-pink-500',
            ctaText: 'Register Now',
            ctaLink: '/book-now',
            height: 'large',
        },
        sections: [
            {
                key: 'camp-overview',
                title: 'A Camp For Every Active Kid',
                subtitle: 'OVERVIEW',
                body: 'Multi-activity camps combine gymnastics with team sports, arts and crafts, swimming (selected venues) and group games for a varied, energetic week.',
                image: '',
                items: [
                    { iconKey: 'users', label: 'Ages', value: '5-10 years' },
                    { iconKey: 'clock', label: 'Duration', value: 'Full Day (9am-4pm)' },
                    { iconKey: 'tag', label: 'Price', value: 'From HK$500/day' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'whats-included',
                title: "What's Included",
                subtitle: '',
                body: 'Everything your child needs for an action-packed day.',
                image: '',
                items: [
                    { name: 'Various sports activities', description: 'Football, basketball, tag games, mini-tournaments' },
                    { name: 'Team building games', description: 'Cooperation challenges and group exercises' },
                    { name: 'Creative arts & crafts', description: 'Hands-on creative breaks between active sessions' },
                    { name: 'Swimming (selected venues)', description: 'Splash time on hot days at supported locations' },
                    { name: 'Lunch included', description: 'Healthy lunch + snack provided each day' },
                ],
                order: 2,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Reserve Your Child\'s Spot',
                subtitle: '',
                body: 'Multi-activity weeks book up fast — register early to avoid disappointment.',
                image: '',
                items: [
                    { ctaText: 'Book Camp Now', ctaLink: '/book-now' },
                    { ctaText: 'Ask Questions', ctaLink: '/contact' },
                ],
                order: 3,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Multi-Activity Camps | ProActive Sports', metaDescription: 'Multi-activity holiday camps.', keywords: ['multi-activity camp'] },
        isActive: true,
    },
    {
        slug: 'shenzhen-competitive',
        name: 'Shenzhen Competitive',
        hero: {
            title: 'Shenzhen Competitive Camp',
            subtitle: 'Elite competitive gymnastics training camp in Shenzhen — advanced gymnasts only.',
            backgroundImage: '/images/camps/shenzhen-hero.jpg',
            fallbackGradient: 'from-rose-600 to-red-700',
            ctaText: 'Apply Now',
            ctaLink: '/book-now',
            height: 'large',
        },
        sections: [
            {
                key: 'overview',
                title: 'Elite Training Camp in Shenzhen',
                subtitle: 'OVERVIEW',
                body: 'A high-intensity competitive training week alongside peer athletes from across the region. Designed for gymnasts working at intermediate-competitive level and above.',
                image: '',
                items: [
                    { iconKey: 'users', label: 'Ages', value: '8-18 years' },
                    { iconKey: 'clock', label: 'Duration', value: '2-4 weeks' },
                    { iconKey: 'tag', label: 'Level', value: 'Competitive only' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'training-pillars',
                title: 'Training Pillars',
                subtitle: '',
                body: 'Every day balances technical training, conditioning, and recovery.',
                image: '',
                items: [
                    { name: 'Elite-level coaching', description: 'Coached by experienced national-level coaches' },
                    { name: 'Competition preparation', description: 'Routine cleanup, mental rehearsal, performance practice' },
                    { name: 'Advanced skill training', description: 'Progressions for high-difficulty elements' },
                    { name: 'Video analysis', description: 'Slow-motion review of routines for technical correction' },
                    { name: 'Nutrition guidance', description: 'Meal planning and recovery nutrition for athletes' },
                ],
                order: 2,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Apply for the Shenzhen Camp',
                subtitle: '',
                body: 'Application required — coaches will assess level before confirming a spot.',
                image: '',
                items: [
                    { ctaText: 'Apply Now', ctaLink: '/book-now' },
                    { ctaText: 'Ask Questions', ctaLink: '/contact' },
                ],
                order: 3,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Shenzhen Competitive Camp | ProActive Sports', metaDescription: 'Elite competitive training camp.', keywords: ['shenzhen', 'competitive camp'] },
        isActive: true,
    },
    {
        slug: 'parties',
        name: 'Parties',
        hero: {
            title: 'Unforgettable Birthday Parties',
            subtitle: 'Create magical memories with our gymnastics-themed birthday parties. Professional hosting, exciting activities, and stress-free celebration for the whole family.',
            backgroundImage: '/images/parties/party-hero.jpg',
            fallbackGradient: 'from-pink-600 to-pink-800',
            ctaText: 'View Packages',
            ctaLink: '#packages',
            height: 'large',
        },
        sections: [
            {
                key: 'why-choose-us',
                title: 'Why Choose Our Parties?',
                subtitle: '',
                body: 'We handle all the details so you can focus on celebrating. Our experienced team ensures every party is safe, fun, and memorable for everyone involved.',
                image: '',
                items: [
                    { name: 'Professional Hosting', description: 'Experienced party hosts manage everything so parents can relax and enjoy', icon: '🎯' },
                    { name: 'Age-Appropriate Activities', description: 'Customized activities based on the age group and skill levels of guests', icon: '🤸' },
                    { name: 'Safe Environment', description: 'Fully supervised activities in our safe, professional gymnastics facility', icon: '🛡️' },
                    { name: 'Memory Making', description: 'Professional photos and videos to capture all the special moments', icon: '📸' },
                    { name: 'Fun Atmosphere', description: 'Upbeat music, games, and activities keep the energy high throughout', icon: '🎉' },
                    { name: 'Special Recognition', description: 'Birthday child receives special attention and memorable keepsakes', icon: '⭐' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'packages',
                title: 'Party Packages',
                subtitle: 'CHOOSE YOUR PARTY',
                body: 'Choose from our carefully designed packages, each offering different levels of activities and services to match your celebration needs. Edit packages in CMS → Party Packages.',
                image: '',
                items: [],
                order: 2,
                isActive: true,
            },
            {
                key: 'themes',
                title: 'Exciting Party Themes',
                subtitle: '',
                body: 'Choose from our popular themes or let us create a custom theme based on your child\'s interests and favorite characters.',
                image: '',
                items: [
                    { name: 'Gymnastics Adventure', icon: '🤸‍♀️', description: 'Classic gymnastics fun with apparatus exploration', activities: ['Apparatus rotations', 'Skill challenges', 'Team games', 'Medal ceremony'] },
                    { name: 'Superhero Training', icon: '🦸‍♀️', description: 'Train like superheroes with obstacle courses', activities: ['Hero training course', 'Power skill challenges', 'Cape decorating', 'Hero certificates'] },
                    { name: 'Princess Gymnastics', icon: '👸', description: 'Royal gymnastics with grace and elegance', activities: ['Royal routines', 'Tiara decorating', 'Princess poses', 'Royal ceremony'] },
                    { name: 'Ninja Warrior', icon: '🥷', description: 'Ninja-themed obstacle courses and challenges', activities: ['Ninja course', 'Stealth challenges', 'Martial arts basics', 'Ninja graduation'] },
                    { name: 'Olympic Champions', icon: '🏆', description: 'Olympic-style competition and medal ceremonies', activities: ['Mini competitions', 'Podium ceremonies', 'National anthems', 'Gold medals'] },
                    { name: 'Animal Kingdom', icon: '🦁', description: 'Animal-inspired movements and games', activities: ['Animal movements', 'Jungle adventures', 'Animal masks', 'Safari games'] },
                ],
                order: 3,
                isActive: true,
            },
            {
                key: 'schedule-template',
                title: 'Typical Party Schedule',
                subtitle: '',
                body: 'A 90-120 minute party flows naturally between gymnastics, refreshments, and celebrations.',
                image: '',
                items: [
                    { time: '0-15 min', activity: 'Guest Arrival & Welcome Circle' },
                    { time: '15-45 min', activity: 'Gymnastics Activities - Session 1' },
                    { time: '45-60 min', activity: 'Gymnastics Activities - Session 2' },
                    { time: '60-75 min', activity: 'Special Birthday Activities' },
                    { time: '75-90 min', activity: 'Party Room Time & Refreshments' },
                    { time: '90-105 min', activity: 'Cake Cutting & Singing' },
                    { time: '105-120 min', activity: 'Gift Opening & Goodbyes' },
                ],
                order: 4,
                isActive: true,
            },
            {
                key: 'add-ons',
                title: 'Optional Add-Ons',
                subtitle: '',
                body: 'Customize your party with these optional extras.',
                image: '',
                items: [
                    { name: 'Extra 30 minutes', price: 'HK$500' },
                    { name: 'Additional 5 guests', price: 'HK$400' },
                    { name: 'Premium goodie bags', price: 'HK$150/child' },
                    { name: 'Professional videography', price: 'HK$800' },
                    { name: 'Custom cake ordering', price: 'HK$600+' },
                    { name: 'Face painting', price: 'HK$600' },
                    { name: 'Balloon decorations', price: 'HK$400' },
                    { name: 'Take-home medals', price: 'HK$80/child' },
                ],
                order: 5,
                isActive: true,
            },
            {
                key: 'booking-process',
                title: 'Ready to Book Your Party?',
                subtitle: '',
                body: 'Booking is easy! Contact us to check availability and customize your perfect party. We recommend booking at least 2-3 weeks in advance, especially for weekends.',
                image: '',
                items: [
                    { step: 1, name: 'Choose Your Package' },
                    { step: 2, name: 'Contact Us' },
                    { step: 3, name: 'Enjoy Your Party' },
                ],
                order: 6,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Create Magical Birthday Memories',
                subtitle: '',
                body: 'Give your child the birthday party of their dreams! Our professional team will create an unforgettable celebration that your family will treasure forever.',
                image: '',
                items: [
                    { ctaText: 'Book Now', ctaLink: '/contact' },
                    { ctaText: 'Call Us Today', ctaLink: 'tel:+85212345678' },
                ],
                order: 7,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Birthday Parties | ProActive Sports', metaDescription: 'Birthday parties at our gymnastics academy.', keywords: ['birthday party', 'gymnastics party'] },
        isActive: true,
    },
    {
        slug: 'about',
        name: 'About',
        hero: {
            title: 'About ProActiv Fitness',
            subtitle: 'Building confidence through movement since 2014. We\'re passionate about helping children develop physically, mentally, and socially.',
            backgroundImage: '/images/about/about-hero.jpg',
            fallbackGradient: 'from-blue-600 to-pink-600',
            ctaText: 'Meet Our Team',
            ctaLink: '/team',
            height: 'large',
        },
        sections: [
            {
                key: 'mission-vision',
                title: 'Mission & Vision',
                subtitle: '',
                body: 'Our purpose and where we\'re headed.',
                image: '',
                items: [
                    { name: 'Mission', description: 'To provide a safe, supportive, and fun environment where children can develop their physical abilities, build confidence, and create lasting friendships through quality gymnastics and fitness programs.' },
                    { name: 'Vision', description: 'To be the leading provider of youth fitness programs, inspiring the next generation to lead active, healthy lifestyles while achieving their personal best in a positive and encouraging atmosphere.' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'core-values',
                title: 'Our Core Values',
                subtitle: '',
                body: 'The principles that guide everything we do.',
                image: '',
                items: [
                    { name: 'Safety First', description: 'We maintain the highest safety standards with certified coaches and state-of-the-art equipment.', icon: '🛡️' },
                    { name: 'Excellence', description: 'We strive for excellence in coaching, facilities, and customer service to deliver the best experience.', icon: '⭐' },
                    { name: 'Community', description: 'We foster a supportive community where everyone feels welcome, valued, and encouraged.', icon: '🤝' },
                ],
                order: 2,
                isActive: true,
            },
            {
                key: 'our-story',
                title: 'Our Story',
                subtitle: '',
                body: 'ProActiv Fitness was founded in 2014 with a simple mission: to provide high-quality gymnastics and fitness programs that help children build confidence, develop skills, and have fun.\n\nWhat started as a single location with a handful of students has grown into a thriving network of 15+ centers serving over 5,000 active students across the region. Our success is built on our commitment to excellence, safety, and creating a positive environment where every child can thrive.\n\nToday, we\'re proud to be recognized as one of the leading youth fitness providers, with a team of 50+ certified coaches who are passionate about making a difference in children\'s lives.',
                image: '',
                items: [],
                order: 3,
                isActive: true,
            },
            {
                key: 'stats',
                title: 'By The Numbers',
                subtitle: '',
                body: 'A decade of impact.',
                image: '',
                items: [
                    { label: 'Years Experience', value: '10+' },
                    { label: 'Active Students', value: '5000+' },
                    { label: 'Locations', value: '15+' },
                    { label: 'Expert Coaches', value: '50+' },
                ],
                order: 4,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Join Our Community',
                subtitle: '',
                body: 'Experience the ProActiv difference. Book a free trial class today!',
                image: '',
                items: [{ ctaText: 'Book A Free Trial', ctaLink: '/book-trial' }],
                order: 5,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'About Us | ProActive Sports', metaDescription: 'About ProActive Sports gymnastics academy.', keywords: ['about', 'gymnastics academy'] },
        isActive: true,
    },
    {
        slug: 'careers',
        name: 'Careers',
        hero: {
            title: 'Join Our Team',
            subtitle: 'Build your career at Hong Kong\'s leading gymnastics academy — passionate coaches, modern facilities, and a supportive team.',
            backgroundImage: '/images/careers/careers-hero.jpg',
            fallbackGradient: 'from-gray-700 to-gray-900',
            ctaText: 'View Openings',
            ctaLink: '#openings',
            height: 'large',
        },
        sections: [
            {
                key: 'why-work-here',
                title: 'Why Work With Us',
                subtitle: '',
                body: 'Reasons our coaches and staff love being part of the ProActive family.',
                image: '',
                items: [
                    { name: 'Modern Facilities', description: 'Train in some of Hong Kong\'s best-equipped gymnastics venues.', icon: '🏟️' },
                    { name: 'Certified Coaches', description: 'Work alongside certified, experienced colleagues.', icon: '🎓' },
                    { name: 'Career Growth', description: 'Internal pathways from junior coach to head coach.', icon: '📈' },
                    { name: 'Inclusive Culture', description: 'A respectful, supportive team that values your contribution.', icon: '🤝' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'openings-intro',
                title: 'Open Roles',
                subtitle: 'OPENINGS',
                body: 'Browse current vacancies. Edit individual job postings in CMS → Job Positions.',
                image: '',
                items: [],
                order: 2,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Don\'t see the right role?',
                subtitle: '',
                body: 'We\'re always interested in hearing from passionate gymnastics professionals. Reach out and tell us about yourself.',
                image: '',
                items: [{ ctaText: 'Contact Us', ctaLink: '/contact' }],
                order: 3,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Careers | ProActive Sports', metaDescription: 'Career opportunities at ProActive Sports.', keywords: ['careers', 'jobs'] },
        isActive: true,
    },
    {
        slug: 'team',
        name: 'Team',
        hero: {
            title: 'Meet Our Team',
            subtitle: 'Certified, experienced coaches who care about every child\'s progress. Get to know the people behind ProActive Sports.',
            backgroundImage: '/images/team/team-hero.jpg',
            fallbackGradient: 'from-indigo-600 to-purple-700',
            ctaText: 'Book a Trial',
            ctaLink: '/book-trial',
            height: 'large',
        },
        sections: [
            {
                key: 'team-intro',
                title: 'Our Coaching Family',
                subtitle: 'OUR TEAM',
                body: 'Our coaches blend competitive backgrounds with a genuine love of teaching. Edit individual coaches in CMS → Team.',
                image: '',
                items: [
                    { value: '15+', label: 'Expert Coaches', sub: 'Certified professionals' },
                    { value: '100+', label: 'Years Combined', sub: 'Total experience' },
                    { value: '500+', label: 'Students Trained', sub: 'Across all programs' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'cta',
                title: 'Want to train with our team?',
                subtitle: '',
                body: 'Book a free trial and meet your child\'s future coach.',
                image: '',
                items: [{ ctaText: 'Book Free Trial', ctaLink: '/book-trial' }],
                order: 2,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Our Team | ProActive Sports', metaDescription: 'Meet our certified gymnastics coaches.', keywords: ['team', 'coaches'] },
        isActive: true,
    },
    {
        slug: 'blog',
        name: 'Blog',
        hero: {
            title: 'ProActive Blog',
            subtitle: 'Tips, stories, and insights on gymnastics training, child development, and family fitness from our expert coaches.',
            backgroundImage: '/images/blog/blog-hero.jpg',
            fallbackGradient: 'from-cyan-600 to-blue-700',
            ctaText: 'Read Latest',
            ctaLink: '#latest',
            height: 'large',
        },
        sections: [
            {
                key: 'categories',
                title: 'Browse by Category',
                subtitle: '',
                body: 'Find articles by topic.',
                image: '',
                items: [
                    { name: 'Health & Fitness', description: 'Tips on nutrition, conditioning, and healthy habits' },
                    { name: 'Tips & Advice', description: 'Practical guides for parents and gymnasts' },
                    { name: 'News & Events', description: 'Camp announcements and program updates' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'posts-intro',
                title: 'Latest Posts',
                subtitle: 'LATEST',
                body: 'Edit individual blog posts in CMS → Blog Posts.',
                image: '',
                items: [],
                order: 2,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Blog | ProActive Sports', metaDescription: 'Gymnastics tips and stories.', keywords: ['blog', 'gymnastics tips'] },
        isActive: true,
    },
    {
        slug: 'terms',
        name: 'Terms & Conditions',
        hero: {
            title: 'Terms & Conditions',
            subtitle: 'Please review the terms and conditions governing your use of ProActive Sports services.',
            backgroundImage: '/images/legal/terms-hero.jpg',
            fallbackGradient: 'from-gray-700 to-slate-900',
            ctaText: '',
            ctaLink: '',
            height: 'medium',
        },
        sections: [
            {
                key: 'introduction',
                title: 'Introduction',
                subtitle: '',
                body: 'These terms and conditions outline the rules and regulations for the use of ProActive Sports services. By enrolling in our programs you agree to comply with these terms.',
                image: '',
                items: [],
                order: 1,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Terms & Conditions | ProActive Sports', metaDescription: 'Terms and conditions.', keywords: ['terms', 'conditions'] },
        isActive: true,
    },
    {
        slug: 'contact',
        name: 'Contact Us',
        hero: {
            title: 'Get In Touch',
            subtitle: 'Have questions? Want to book a trial? Our team is ready to help — reach out anytime.',
            backgroundImage: '/images/contact/contact-hero.jpg',
            fallbackGradient: 'from-emerald-600 to-green-700',
            ctaText: 'Book a Trial',
            ctaLink: '/book-trial',
            height: 'medium',
        },
        sections: [
            {
                key: 'contact-channels',
                title: 'How to Reach Us',
                subtitle: '',
                body: 'Choose the channel that suits you best.',
                image: '',
                items: [
                    { iconKey: 'phone', label: 'Phone', text: '+852 1234 5678' },
                    { iconKey: 'mail', label: 'Email', text: 'info@proactivfitness.com' },
                    { iconKey: 'whatsapp', label: 'WhatsApp', text: 'Tap to chat' },
                    { iconKey: 'mapPin', label: 'Visit', text: 'Cyberport & Wan Chai locations' },
                ],
                order: 1,
                isActive: true,
            },
            {
                key: 'contact-form',
                title: 'Send Us a Message',
                subtitle: '',
                body: 'Fill out the form and we\'ll respond within 24 hours.',
                image: '',
                items: [
                    { fieldKey: 'name', fieldLabel: 'Name', fieldType: 'text', required: true },
                    { fieldKey: 'email', fieldLabel: 'Email', fieldType: 'email', required: true },
                    { fieldKey: 'phone', fieldLabel: 'Phone', fieldType: 'tel', required: true },
                    { fieldKey: 'subject', fieldLabel: 'Subject', fieldType: 'text', required: true },
                    { fieldKey: 'message', fieldLabel: 'Message', fieldType: 'textarea', required: true },
                ],
                order: 2,
                isActive: true,
            },
        ],
        seo: { metaTitle: 'Contact Us | ProActive Sports', metaDescription: 'Contact ProActive Sports.', keywords: ['contact'] },
        isActive: true,
    },
];

// =============================================
// TEAM MEMBERS
// =============================================
const teamMembersData = [
    {
        name: 'Sarah Chen',
        role: 'Head Coach',
        bio: 'Former national gymnast with 15+ years of competitive and coaching experience. Specializes in elite athlete development.',
        image: '/images/team/sarah-chen.jpg',
        fallbackGradient: 'from-pink-500 to-rose-500',
        specialization: 'Elite Competitive Gymnastics',
        experience: '15+ years',
        qualifications: ['Level 4 FIG Certified', 'BSc Sports Science', 'First Aid Certified'],
        socialLinks: [],
        location: 'Cyberport',
        order: 1,
        isActive: true,
    },
    {
        name: 'Marcus Wong',
        role: 'Senior Coach',
        bio: 'Passionate about teaching foundational gymnastics to young athletes. Builds confidence one cartwheel at a time.',
        image: '/images/team/marcus-wong.jpg',
        fallbackGradient: 'from-blue-500 to-cyan-500',
        specialization: 'Beginner & Intermediate Programs',
        experience: '10 years',
        qualifications: ['Level 3 Gymnastics Coach', 'Child Development Certificate'],
        socialLinks: [],
        location: 'Wan Chai',
        order: 2,
        isActive: true,
    },
    {
        name: 'Priya Sharma',
        role: 'Strength & Conditioning Coach',
        bio: 'Sports performance specialist focused on injury prevention and strength development for young gymnasts.',
        image: '/images/team/priya-sharma.jpg',
        fallbackGradient: 'from-amber-500 to-orange-500',
        specialization: 'Strength & Conditioning',
        experience: '8 years',
        qualifications: ['NSCA-CSCS', 'MSc Sports Science'],
        socialLinks: [],
        location: 'Cyberport',
        order: 3,
        isActive: true,
    },
    {
        name: 'James Liu',
        role: 'Junior Programs Coach',
        bio: 'Specialist in coaching pre-school and early-elementary children — making first steps in gymnastics fun and safe.',
        image: '/images/team/james-liu.jpg',
        fallbackGradient: 'from-emerald-500 to-teal-500',
        specialization: 'Toddler & Pre-School Gymnastics',
        experience: '6 years',
        qualifications: ['Level 2 Gymnastics Coach', 'Early Years Education Diploma'],
        socialLinks: [],
        location: 'Wan Chai',
        order: 4,
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

        // Nav Menu Items (header navigation)
        const navCount = await NavMenuItem.countDocuments({ isDeleted: { $ne: true } });
        if (navCount === 0) {
            await NavMenuItem.insertMany(navMenuItemsData);
            seeded.push('Nav Menu Items');
        } else {
            skipped.push('Nav Menu Items (already has data)');
        }

        // Page Contents (one per landing page slug — only seed missing slugs)
        const existingSlugs = (await PageContent.find({ isDeleted: { $ne: true } }, { slug: 1 }))
            .map(d => d.slug);
        const missingPages = pageContentsData.filter(p => !existingSlugs.includes(p.slug));
        if (missingPages.length > 0) {
            await PageContent.insertMany(missingPages);
            seeded.push(`Page Contents (${missingPages.map(p => p.slug).join(', ')})`);
        } else {
            skipped.push('Page Contents (already has data)');
        }

        // Team Members
        const teamCount = await TeamMember.countDocuments({ isDeleted: { $ne: true } });
        if (teamCount === 0) {
            await TeamMember.insertMany(teamMembersData);
            seeded.push('Team Members');
        } else {
            skipped.push('Team Members (already has data)');
        }

        return { seeded, skipped };
    }

    /**
     * Force-overwrite seed for PageContent + LocationDetail collections only.
     *
     * Use this when you want fresh seed data (with full sections + facilities + schedule)
     * applied without wiping the rest of the CMS (testimonials, blog posts, custom edits, etc.).
     *
     * Existing documents matched by slug are FULLY REPLACED with seed values; other slugs
     * remain untouched. Returns the slugs that were upserted in each collection.
     */
    static async upsertPagesAndLocations(): Promise<{ pageContents: string[]; locations: string[] }> {
        const pageContents: string[] = [];
        for (const page of pageContentsData) {
            const { slug } = page;
            await PageContent.findOneAndUpdate(
                { slug },
                { $set: page },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            pageContents.push(slug);
        }

        const locations: string[] = [];
        for (const loc of locationDetailsData) {
            const { slug } = loc;
            await LocationDetail.findOneAndUpdate(
                { slug },
                { $set: loc },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            locations.push(slug);
        }

        return { pageContents, locations };
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

        await NavMenuItem.deleteMany({});
        cleared.push('Nav Menu Items');

        await PageContent.deleteMany({});
        cleared.push('Page Contents');

        await TeamMember.deleteMany({});
        cleared.push('Team Members');

        return cleared;
    }
}
