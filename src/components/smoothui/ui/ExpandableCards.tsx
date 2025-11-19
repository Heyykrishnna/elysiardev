import { useEffect, useRef, useState } from "react"
import { Play } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

export interface Card {
  id: number
  title: string
  image: string
  content: string
  cardLink?: string
  author?: {
    name: string
    role: string
    image: string
  }
}

const defaultCards: Card[] = [
  {
    id: 1,
    title: "Namaste India",
    image:
      "https://pbs.twimg.com/media/GEatkFzXkAAM9CO?format=jpg&name=medium",
    content:
      "Embark on a mesmerizing journey through India's timeless tapestry of culture, traditions, and spiritual heritage. Discover the stories that have shaped a civilization spanning millennia.",
    cardLink: "https://understandingindia.vercel.app/",
  },
  {
    id: 2,
    title: "Neurovia AI",
    image:
      "https://i.pinimg.com/736x/46/5f/15/465f15e5733753e0ec03f3d646bff010.jpg",
    content:
      "Experience the future of study and mental health support like never before. Neurovia combines advanced neural intelligence with cutting-edge technology to provide personalized assistance, helping you stay focused, manage stress, and reach your full potential.",
    cardLink: "https://neurovia-ai.vercel.app/",
  },
  {
    id: 3,
    title: "Curriculo",
    image:
      "https://i.pinimg.com/736x/90/0b/bb/900bbb650062c1e9d51560ae775e6ca8.jpg",
    content:
      "Explore comprehensive curriculum guides, detailed chapter breakdowns, and well-structured learning paths designed to support your academic journey. Access resources that simplify complex topics, help you stay organized, and boost your understanding to achieve excellence in your studies.",
    cardLink: "https://curriculoquizoasis.vercel.app/",
  },
  {
    id: 4,
    title: "Feedback Form",
    image:
      "https://i.pinimg.com/736x/41/51/8e/41518ecea567e1622bcba1969832194f.jpg",
    content:
      "Help us improve by sharing your honest feedback about your experience. Your input is valuable and helps us enhance our products and services to better meet your needs. Please take a moment to tell us what you liked and what we can do better!",
    cardLink: "https://forms.gle/2RKCzkY6U1gfzefb9",
  },
]

const smoothEasing = [0.4, 0.0, 0.2, 1] as const

export interface ExpandableCardsProps {
  cards?: Card[]
  selectedCard?: number | null
  onSelect?: (id: number | null) => void
  className?: string
  cardClassName?: string
}

export default function ExpandableCards({
  cards = defaultCards,
  selectedCard: controlledSelected,
  onSelect,
  className = "",
  cardClassName = "",
}: ExpandableCardsProps) {
  const [internalSelected, setInternalSelected] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selectedCard =
    controlledSelected !== undefined ? controlledSelected : internalSelected

  useEffect(() => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth
      const clientWidth = scrollRef.current.clientWidth
      scrollRef.current.scrollLeft = (scrollWidth - clientWidth) / 2
    }
  }, [])

  const handleCardClick = (id: number) => {
    if (selectedCard === id) {
      if (onSelect) onSelect(null)
      else setInternalSelected(null)
    } else {
      if (onSelect) onSelect(id)
      else setInternalSelected(id)
      // Center the clicked card in view
      const cardElement = document.querySelector(`[data-card-id="${id}"]`)
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }

  return (
    <div
      className={`flex w-full flex-col gap-4 overflow-scroll p-4 ${className}`}
    >
      <div
        ref={scrollRef}
        className="scrollbar-hide mx-auto flex overflow-x-auto pt-4 pb-8"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: "20%",
        }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout
            data-card-id={card.id}
            className={`bg-background relative mr-4 h-[300px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border shadow-lg ${cardClassName}`}
            style={{
              scrollSnapAlign: "start",
            }}
            animate={{
              width: selectedCard === card.id ? "500px" : "200px",
            }}
            transition={{
              duration: 0.5,
              ease: smoothEasing,
            }}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="relative h-full w-[200px]">
              <img
                src={card.image || "/placeholder.svg"}
                alt={card.title}
                width={200}
                height={300}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                <h2 className="text-2xl font-bold">{card.title}</h2>
                <div className="flex items-center gap-2">
                  <a
                    href={card.cardLink || `#card-${card.id}`}
                    aria-label="Play video"
                    className="bg-background/30 flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-transform hover:scale-110"
                  >
                    <Play className="h-6 w-6 text-white" />
                  </a>
                  <span className="text-sm font-medium">Explore</span>
                </div>
              </div>
            </div>
            <AnimatePresence mode="popLayout">
              {selectedCard === card.id && (
                <motion.div
                  initial={{ width: 0, opacity: 0, filter: "blur(5px)" }}
                  animate={{ width: "300px", opacity: 1, filter: "blur(0px)" }}
                  exit={{ width: 0, opacity: 0, filter: "blur(5px)" }}
                  transition={{
                    duration: 0.5,
                    ease: smoothEasing,
                    opacity: { duration: 0.3, delay: 0.2 },
                  }}
                  className="bg-background absolute top-0 right-0 h-full"
                >
                  <motion.div
                    className="flex h-full flex-col justify-center items-center p-8 text-center"
                    initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <p className="text-black text-sm leading-relaxed">
                      {card.content}
                    </p>
                    {card.author && (
                      <a 
                        href={`#author-${card.id}`}
                        className="mt-4 flex items-center justify-center gap-3 hover:bg-muted/20 p-2 rounded-lg transition-colors"
                      >
                        <div className="bg-primary h-12 w-12 overflow-hidden rounded-full border">
                          <img
                            src={card.author.image}
                            alt={card.author.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            {card.author.name}
                          </p>
                          <p className="text-black text-xs">
                            {card.author.role}
                          </p>
                        </div>
                      </a>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
