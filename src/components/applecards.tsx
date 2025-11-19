import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 font-sans">
        Features Showcase
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent1 = () => {
  const sections = [
    {
      title: "Authenticity through a powerful 3-step verification process",
      description: "GPS tracking to confirm the right location, QR code scanning to validate identity, and facial recognition for foolproof accuracy. This multi-layer system eliminates proxy attendance and strengthens trust.",
      image: "https://i.ibb.co/zWcZn996/b5bc8c2209b9133edb19bd5c1fdac07f-removebg-preview.png",
      alt: "Tracking Brain"
    },
    {
      title: "No more wasting precious time — with Smart Attendance",
      description: "The average time to mark attendance drops from 1.2 minutes to just 7 seconds. This efficiency saves hours collectively for teams, classrooms, or organizations, making it the fastest way to record presence.",
      image: "https://i.ibb.co/bMRR02S9/image.png",
      alt: "Precious time"
    },
    {
      title: "Managing attendance data has never been easier",
      description: "All records are securely stored, easy to access, and simple to analyze. Whether you need real-time tracking, monthly reports, or historical insights, Smart Attendance keeps everything organized at your fingertips.",
      image: "https://i.ibb.co/0pnTh3PM/image.png",
      alt: "Database"
    }
  ];

  return (
    <>
      {sections.map((section, index) => {
        return (
          <div
            key={"section-" + index}
            className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4"
          >
            <h3 className="text-neutral-700 text-lg md:text-2xl font-bold mb-4 text-center">
              {section.title}
            </h3>
            <p className="text-neutral-600 text-base md:text-xl font-sans max-w-3xl mx-auto text-center">
              {section.description}
            </p>
            <img
              src={section.image}
              alt={section.alt}
              height="500"
              width="500"
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-6"
            />
          </div>
        );
      })}
    </>
  );
};

const DummyContent2 = () => {
    const sections = [
      {
        title: "Effortless Test Creation & Smart Management",
        description: "Educators can seamlessly design customized tests suited to their subject, difficulty level, and student needs. With built-in tools to schedule, manage, and organize assessments, teachers save valuable time while ensuring a structured and smooth testing process.",
        image: "https://i.ibb.co/6JJv4twm/image.png",
        alt: "Tracking Brain"
      },
      {
        title: "Empowering Students to Learn & Improve",
        description: "Students can attempt tests anytime, anywhere and instantly see how they perform. The system helps them self-analyze their strengths and weaknesses, making it easier to focus on areas that need improvement. This continuous cycle of testing and reflection builds confidence and consistency.",
        image: "https://i.ibb.co/JW0Sthny/image.png",
        alt: "Precious time"
      },
      {
        title: "Live Results, Actionable Insights & Leaderboards",
        description: "Results are generated instantly, giving students clear insights into where they excel and where to put in more effort. Teachers get access to detailed analytics and performance breakdowns, along with a leaderboard to encourage healthy competition and track top performers at a glance.",
        image: "https://i.ibb.co/ZpRgthCr/image.png",
        alt: "Database"
      }
    ];
  
    return (
      <>
        {sections.map((section, index) => {
          return (
            <div
              key={"section-" + index}
              className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4"
            >
              <h3 className="text-neutral-700 text-lg md:text-2xl font-bold mb-4 text-center">
                {section.title}
              </h3>
              <p className="text-neutral-600 text-base md:text-xl font-sans max-w-3xl mx-auto text-center">
                {section.description}
              </p>
              <img
                src={section.image}
                alt={section.alt}
                height="500"
                width="500"
                className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-6"
              />
            </div>
          );
        })}
      </>
    );
  };

const DummyContent3 = () => {
    const sections = [
      {
        title: "Easy Resource Upload & Instant Access",
        description: "Educators can add notes, e-books, videos, or any study material with just a few clicks. Once uploaded, the resources go live instantly, making them easily available for all students.",
        image: "https://i.ibb.co/xP4dSB8/image.png",
        alt: "Books Black"
      },
      {
        title: "Student Requests & Digital Library",
        description: "Students can request specific resources they need and explore a fully digital library with organized, searchable study materials — ensuring they always have the right content at the right time.",
        image: "https://i.ibb.co/rG8pxL7R/image.png",
        alt: "Digitalisation"
      },
    ];
  
    return (
      <>
        {sections.map((section, index) => {
          return (
            <div
              key={"section-" + index}
              className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4"
            >
              <h3 className="text-neutral-700 text-lg md:text-2xl font-bold mb-4 text-center">
                {section.title}
              </h3>
              <p className="text-neutral-600 text-base md:text-xl font-sans max-w-3xl mx-auto text-center">
                {section.description}
              </p>
              <img
                src={section.image}
                alt={section.alt}
                height="500"
                width="500"
                className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-6"
              />
            </div>
          );
        })}
      </>
    );
  };

  const DummyContent4 = () => {
    const sections = [
      {
        title: "Comprehensive Calendar for Every Activity",
        description: "Our platform offers a centralized calendar where students and educators can track classes, events, assignments, exams, holidays, and even free time, ensuring complete visibility and organized scheduling at a glance.",
        image: "https://i.ibb.co/TMjKKt24/image.png",
        alt: "Books Black"
      },
      {
        title: "Fully Customizable & Personalized",
        description: "Students can edit, add, or remove entries, set reminders, and color-code events to match their personal preferences. This makes planning intuitive, organized, and tailored to individual needs.",
        image: "https://i.ibb.co/NdFPpcB5/image.png",
        alt: "Digitalisation"
      },
      {
        title: "Instant Notifications with Seamless Integration",
        description: "With just one click, teachers can notify all students at once. Notifications are directly synced with emails and in-app alerts, making communication faster, reliable, and effortless.",
        image: "https://i.ibb.co/Zt8m0kM/image.png",
        alt: "Digitalisation"
      },
      {
        title: "Smart Reminders & Alerts",
        description: "Never miss a deadline! Students receive automated reminders for upcoming classes, tests, or events, helping them manage time efficiently and stay ahead in their schedule.",
        image: "https://i.ibb.co/bMRR02S9/image.png",
        alt: "Digitalisation"
      },
    ];
  
    return (
      <>
        {sections.map((section, index) => {
          return (
            <div
              key={"section-" + index}
              className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4"
            >
              <h3 className="text-neutral-700 text-lg md:text-2xl font-bold mb-4 text-center">
                {section.title}
              </h3>
              <p className="text-neutral-600 text-base md:text-xl font-sans max-w-3xl mx-auto text-center">
                {section.description}
              </p>
              <img
                src={section.image}
                alt={section.alt}
                height="500"
                width="500"
                className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-6"
              />
            </div>
          );
        })}
      </>
    );
  };

  const DummyContent5 = () => {
    const sections = [
      {
        title: "Speak Up Anytime, Anywhere",
        description: "Students can raise complaints instantly with just a click, whether it’s harassment, bullying, faculty issues, or any other concern. Our platform makes reporting simple, fast, and accessible for everyone.",
        image: "https://i.ibb.co/DPPwNxV2/image.png",
        alt: "Books Black"
      },
      {
        title: "Complete Anonymity for Your Safety",
        description: "The platform allows anonymous complaints, so students can share issues without fear of exposure. Privacy is guaranteed, empowering students to speak up confidently.",
        image: "https://i.ibb.co/9kfrss8F/image.png",
        alt: "Digitalisation"
      },
      {
        title: "24/7 Support at Your Fingertips",
        description: "Whether via email, phone, or our round-the-clock AI chatbot, every concern gets timely assistance. Students always have a reliable support system available, anytime they need it.",
        image: "https://i.ibb.co/Kj6CK6KR/image.png",
        alt: "Digitalisation"
      },
      {
        title: "Track & Follow-Up Complaints",
        description: "Students can track the status of their complaints in real-time, ensuring transparency and reassurance that their voices are heard and acted upon.",
        image: "https://i.ibb.co/0pnTh3PM/image.png",
        alt: "Digitalisation"
      },
    ];
  
    return (
      <>
        {sections.map((section, index) => {
          return (
            <div
              key={"section-" + index}
              className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4"
            >
              <h3 className="text-neutral-700 text-lg md:text-2xl font-bold mb-4 text-center">
                {section.title}
              </h3>
              <p className="text-neutral-600 text-base md:text-xl font-sans max-w-3xl mx-auto text-center">
                {section.description}
              </p>
              <img
                src={section.image}
                alt={section.alt}
                height="500"
                width="500"
                className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-6"
              />
            </div>
          );
        })}
      </>
    );
  };

  const DummyContent6 = () => {
    const sections = [
      {
        title: "Namaste India – Explore & Learn About Our Nation",
        description: "Get complete insights about India with Namaste India. From history and culture to geography and current affairs, students can enhance their knowledge about our beloved country in a fun and interactive way.",
      },
      {
        title: "Neurovia AI – Your Personal Doubt Solver & Wellbeing Companion",
        description: "Neurovia AI is not just a smart doubt-solving assistant for any academic question, but also helps support mental health, providing guidance and assistance beyond studies to ensure overall student wellbeing.",
      },
      {
        title: "Curriculo – Personalized Smart Curriculum",
        description: "Curriculo offers a smart curriculum management system with a personalized learning roadmap, tracking progress and delivering a structured curriculum tailored to each student’s needs — like no other platform out there.",
      },
    ];
  
    return (
      <>
        {sections.map((section, index) => {
          return (
            <div
              key={"section-" + index}
              className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4"
            >
              <h3 className="text-neutral-700 text-lg md:text-2xl font-bold mb-4 text-center">
                {section.title}
              </h3>
              <p className="text-neutral-600 text-base md:text-xl font-sans max-w-3xl mx-auto text-center">
                {section.description}
              </p>
            </div>
          );
        })}
      </>
    );
  };

const data = [
  {
    category: "Smart Attendance",
    title: "Track every presence with no hassle.",
    src: "https://i.pinimg.com/736x/45/99/08/45990873d376822aa62fd6fe2f701de6.jpg",
    content: <DummyContent1 />,
  },
  {
    category: "Productivity",
    title: "Learn anytime, anywhere.",
    src: "https://i.pinimg.com/736x/47/ee/f6/47eef66487101e566f3158398d9ce426.jpg",
    content: <DummyContent3 />,
  },
  {
    category: "Self Analysis",
    title: "Measure, learn, become your best self.",
    src: "https://i.pinimg.com/736x/4e/c4/e2/4ec4e2eb1c8af1e08409eaa115cd38f4.jpg",
    content: <DummyContent2 />,
  },
  {
    category: "Management",
    title: "Stay on track with calendars & notifications.",
    src: "https://i.pinimg.com/736x/15/00/da/1500da2658827d948ff98e6abd9567c5.jpg",
    content: <DummyContent4 />,
  },
  {
    category: "Complain and Support",
    title: "Help is just a click away.",
    src: "https://i.pinimg.com/736x/d3/bd/26/d3bd2676563fd92326f74c868b2ac26d.jpg",
    content: <DummyContent5 />,
  },
  {
    category: "Our Network",
    title: "learning made seamless and connected",
    src: "https://i.pinimg.com/736x/66/41/11/6641111f89b160cd80a8b4d39db1212f.jpg",
    content: <DummyContent6 />,
  },
];