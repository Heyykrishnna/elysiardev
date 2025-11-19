"use client"

import { useState } from "react"
import {
  Activity,
  Clock,
  DollarSign,
  Download,
  Globe,
  HelpCircle,
  Lock,
  MessageCircle,
  Scale,
  Settings,
  ShoppingBag,
  Undo2,
  Users,
  WalletCards,
  Zap,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

interface FaqsGridProps {
  title?: string
  description?: string
  categories?: Array<{
    name: string
    id: string
    faqs: Array<{
      question: string
      answer: string
      icon: string
    }>
  }>
}

const iconMap = {
  Clock: Clock,
  WalletCards: WalletCards,
  ShoppingBag: ShoppingBag,
  Globe: Globe,
  Scale: Scale,
  Activity: Activity,
  DollarSign: DollarSign,
  Lock: Lock,
  Undo2: Undo2,
  Download: Download,
  Settings: Settings,
  HelpCircle: HelpCircle,
  MessageCircle: MessageCircle,
  Users: Users,
  Zap: Zap,
}

export function FaqsGrid({
  title = "FAQs",
  description = "Discover quick and comprehensive answers to common questions about our platform, services, and features.",
  categories = [
    {
      name: "General",
      id: "general",
      faqs: [
        {
          question: "What is this platform about?",
          answer:
            "Our platform helps educators and students with smart attendance, tests, AI, self-improvement and many more tools to make learning more efficient and engaging.",
          icon: "Download",
        },
        {
          question: "Who can use this platform?",
          answer:
            "It’s designed for schools, colleges, coaching institutes, and students who want a smart way to manage learning and growth.",
          icon: "Settings",
        },
        {
          question: "Do I need technical skills to use it?",
          answer:
            "No, the platform is user-friendly and requires no special technical knowledge — just basic computer or mobile usage.",
          icon: "Zap",
        },
      ],
    },
    {
      name: "Attendance FAQs",
      id: "components",
      faqs: [
        {
          question: "How does Smart Attendance work?",
          answer:
            "It uses a 3-step authentication (GPS, QR scan, and facial recognition) to ensure accurate and secure attendance also proxy free attendance",
          icon: "HelpCircle",
        },
        {
          question: "Can students mark proxy attendance?",
          answer:
            "No, the multi-layer verification system makes proxy attendance impossible. ( We have just brought down the proxy chances from 30% to 0.1%)",
          icon: "Settings",
        },
        {
          question: "Can I download attendance reports?",
          answer:
            "Yes, teachers/admins can download detailed attendance reports for daily, weekly, or monthly tracking with more advanced technology and proper alignment",
          icon: "Users",
        },
      ],
    },
    {
      name: "Support",
      id: "support",
      faqs: [
        {
          question: "How do I get help if I face an issue?",
          answer:
            "You can reach out to our support team via chat, email, or helpdesk, available 24/7 for quick resolutions.",
          icon: "MessageCircle",
        },
        {
          question: "Is training or onboarding provided?",
          answer:
            "Yes, we provide step-by-step onboarding guides, tutorials, and training sessions for teachers and administrators.",
          icon: "Users",
        },
        {
          question: "Can I report bugs or suggest features?",
          answer:
            "Absolutely! You can share feedback directly through the feedback option in the dashboard, and our team will review it.",
          icon: "Clock",
        },
      ],
    },
  ],
}: FaqsGridProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-lg">
          <h2 className="text-foreground text-4xl font-semibold">{title}</h2>
          <p className="text-muted-foreground mt-4 text-lg text-balance">
            {description}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-8 md:mt-12">
          <div className="border-border flex flex-wrap gap-2 border-b">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveTab(index)}
                className={`relative rounded-t-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === index
                    ? "text-brand bg-background"
                    : "text-muted-foreground hover:text-foreground hover:border-border/50 border-transparent"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category.name}
                {activeTab === index && (
                  <motion.div
                    className="bg-brand absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8 md:mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="space-y-6">
                <dl className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                  {categories[activeTab].faqs.map((faq, faqIndex) => {
                    const IconComponent =
                      iconMap[faq.icon as keyof typeof iconMap] || HelpCircle

                    return (
                      <motion.div
                        key={`${categories[activeTab].id}-${faqIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: faqIndex * 0.1,
                        }}
                        className="space-y-3"
                      >
                        <div className="bg-card flex size-8 items-center justify-center rounded-md border *:m-auto *:size-4">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <dt className="text-foreground font-semibold">
                          {faq.question}
                        </dt>
                        <dd className="text-muted-foreground">{faq.answer}</dd>
                      </motion.div>
                    )
                  })}
                </dl>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
