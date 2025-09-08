import { isDev } from "@/lib/helpers";
import { Variants } from "framer-motion";

export const plans = [
    {
        id: "basic",
        name: "Basic",
        price: 9,
        description: "Perfect for occasional use",
        items: [
            "5 PDF summaries per month",
            "Standard processing speed",
            "Email support",

        ],
        paymentLink:
            isDev
                ? "https://buy.stripe.com/test_fZu9AM4q28H24yp6VxaVa00"
                : "",
        priceId:
            isDev
                ? "price_1S4otk2F8k2IcSji1AMMNLYl"
                : "",
    },
    {
        id: "pro",
        name: "Pro",
        price: 19,
        description: "For professionals and teams",
        items: [
            "Unlimited PDF summaries",
            "Priority processing",
            "24/7 priority support",
        ],
        paymentLink:
            isDev
                ? "https://buy.stripe.com/test_00w9AM6yag9uaWNgw7aVa01"
                : "",
        priceId:
            isDev
                ? "price_1S4otk2F8k2IcSjiqCnxeVuG"
                : "",
    },
];

export const DEMO_SUMMARY = `# 🚀 Umar Abdullah — Full Stack Web Developer

. 🚀 Transforming ideas into scalable web apps with Python, MERN, and robust backend systems.
. ✨ 2+ years of web development experience, 15+ freelance projects, and a passion for clean architecture.

## Document Details
. 📄 Type: Resume
. 👥 For: Hiring managers and tech teams seeking a versatile Full Stack Web Developer

## Summary
. 🧠 Summary: Software Engineer with a deep passion and expertise in Web Development, spanning Freelance work and hands-on industry experience.
. 🔧 Skills: Python, MERN, and SQL databases; hands-on experience building custom websites.
. 🗂️ Track Record: 15+ projects on Fiverr and 2+ years of web development experience.

## Education
. 🎓 National University of Science and Technology (NUST), Islamabad — Bachelor’s degree in Software Engineering (Nov 2021 – Apr 2025)

## Experience
. 💼 Freelance Python Developer – Fiverr (Jun 2023 - Present)
. 🎯 Delivered tailored web dev solutions for clients in various domains.
. ⭐ Renowned clients: Valvoline Inc. and RapidStart

. 🧭 Final Year Project – Data Orator (May 2024 - May 2025)
. 💬 Web-based SQL chatbot designed to simplify data retrieval from relational databases

. 🧰 BackEnd Developer Intern – BeyondSolutions (June 2024 - Sep 2024)
. 🧩 Collaborated with a team to develop and maintain backend services using the MEAN stack, following clean architecture principles and performance optimization best practices.
. 🔐 Built secure RESTful APIs and integrated external services including social media platforms using OAuth 2.0 and JWT.
. 🔗 Integrated third-party APIs and built custom endpoints for seamless frontend-backend communication.

. 🚀 Backend Developer – RapidStart (Live Website) (July 2024 - April 2025)
. 🧪 Built a FastAPI-based SDK for seamless social media automation and analytics.
. 🔌 Integrated multiple APIs with robust auth, caching, and error handling.

. 🧭 Full Stack Developer – YourEduConnect (Live Website) (Dec 2022 - Feb 2023)
. 🧭 Rebuilt course browsing and dashboards with optimized DB schemas and seamless Flask–React integration.

## Tools and Technologies
. 🧰 Python, C/C++, Java, JavaScript, Git
. 🛠️ FastAPI, Flask, React.js, MongoDB, MySQL, Express.js, Node

## Key Highlights
. 📌 15+ Fiverr projects completed; 2+ years of hands-on web development.
. ⭐ Proficient in Python, MERN, and SQL with real-world project experience.
. 💡 Strong backend focus with API design, security, and performance optimization.

## Why It Matters
. 🧠 Real-world impact: Demonstrates the ability to deliver end-to-end web solutions—turning ideas into scalable, secure, and maintainable apps that accelerate product development and drive measurable business outcomes.

## Main Points
. 🎯 Main insight: Versatile full-stack expertise across Python, MERN, and SQL with proven freelancing success.
. 🔑 Key strength: End-to-end delivery, strong problem-solving, and adaptability to client needs.
. 🔥 Important outcome: 15+ completed projects and live deployments with 2+ years of experience.

## Pro Tips
. 💡 First practical recommendation: Build a standout portfolio with 2-3 flagship projects (data-driven app, authentication flow, React frontend).
. 💎 Second valuable insight: Quantify impact in project descriptions (load time, user metrics, business outcomes).
. ✨ Third actionable advice: Highlight freelance successes on Fiverr and live-site contributions to showcase reliability.

## Key Terms to Know
. 📚 First key term: Full-stack — The ability to work on both frontend and backend, bridging UI with server logic.
. 📖 Second key term: RESTful API — Stateless, standardized interfaces for interoperable services.

## Bottom Line
. 🏆 The most important takeaway: A versatile, results-driven full-stack developer with freelance success and hands-on MEAN/MERN/SQL experience, ready to contribute to ambitious teams`;


export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

export const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 10,
            stiffness: 100,
        },
    },
};

