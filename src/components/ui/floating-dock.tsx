// import { cn } from "@/lib/utils";
// import { Menu } from "lucide-react";
// import {
//   AnimatePresence,
//   MotionValue,
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
// } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// import { useRef, useState } from "react";

// export const FloatingDock = ({
//   items,
//   desktopClassName,
//   mobileClassName,
// }: {
//   items: { title: string; icon: React.ReactNode; link: string }[];
//   desktopClassName?: string;
//   mobileClassName?: string;
// }) => {
//   return (
//     <>
//       <FloatingDockDesktop items={items} className={desktopClassName} />
//       <FloatingDockMobile items={items} className={mobileClassName} />
//     </>
//   );
// };

// const FloatingDockMobile = ({
//   items,
//   className,
// }: {
//   items: { title: string; icon: React.ReactNode; link: string }[];
//   className?: string;
// }) => {
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();

//   const handleItemClick = (link: string) => {
//     navigate(link);
//     setOpen(false); // Close dock after navigation
//   };
//   return (
//     <div className={cn("relative block md:hidden", className)}>
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             layoutId="nav"
//             className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
//           >
//             {items.map((item, idx) => (
//               <motion.div
//                 key={item.title}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   y: 10,
//                   transition: {
//                     delay: idx * 0.02,
//                   },
//                 }}
//                 transition={{ 
//                   delay: (items.length - 1 - idx) * 0.03,
//                   type: "spring",
//                   stiffness: 200,
//                   damping: 20
//                 }}
//               >
//                 <button
//                   onClick={() => handleItemClick(item.link)}
//                   className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20 backdrop-blur-md border border-border/30 shadow-lg hover:shadow-glow hover:scale-110 transition-all duration-200 cursor-pointer"
//                   title={item.title}
//                 >
//                   <div className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors duration-200">{item.icon}</div>
//                 </button>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20 backdrop-blur-md border border-border/30 shadow-lg hover:shadow-glow transition-all duration-300"
//       >
//         <Menu className="h-5 w-5 text-muted-foreground" />
//       </button>
//     </div>
//   );
// };

// const FloatingDockDesktop = ({
//   items,
//   className,
// }: {
//   items: { title: string; icon: React.ReactNode; link: string }[];
//   className?: string;
// }) => {
//   let mouseX = useMotionValue(Infinity);
//   const navigate = useNavigate();
//   return (
//     <motion.div
//       onMouseMove={(e) => mouseX.set(e.pageX)}
//       onMouseLeave={() => mouseX.set(Infinity)}
//       className={cn(
//         "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-background/20 backdrop-blur-2xl px-4 pb-3 md:flex border border-border/30 shadow-2xl shadow-primary/10",
//         className,
//       )}
//     >
//       {items.map((item) => (
//         <IconContainer mouseX={mouseX} key={item.title} {...item} navigate={navigate} />
//       ))}
//     </motion.div>
//   );
// };

// function IconContainer({
//   mouseX,
//   title,
//   icon,
//   link,
//   navigate,
// }: {
//   mouseX: MotionValue;
//   title: string;
//   icon: React.ReactNode;
//   link: string;
//   navigate: (path: string) => void;
// }) {
//   let ref = useRef<HTMLDivElement>(null);

//   let distance = useTransform(mouseX, (val) => {
//     let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

//     return val - bounds.x - bounds.width / 2;
//   });

//   let widthTransform = useTransform(distance, [-120, 0, 120], [44, 80, 44]);
//   let heightTransform = useTransform(distance, [-120, 0, 120], [44, 80, 44]);

//   let widthTransformIcon = useTransform(distance, [-120, 0, 120], [22, 40, 22]);
//   let heightTransformIcon = useTransform(
//     distance,
//     [-120, 0, 120],
//     [22, 40, 22],
//   );

//   let width = useSpring(widthTransform, {
//     mass: 0.05,
//     stiffness: 300,
//     damping: 25,
//     restDelta: 0.01
//   });
//   let height = useSpring(heightTransform, {
//     mass: 0.05,
//     stiffness: 300,
//     damping: 25,
//     restDelta: 0.01
//   });

//   let widthIcon = useSpring(widthTransformIcon, {
//     mass: 0.05,
//     stiffness: 300,
//     damping: 25,
//     restDelta: 0.01
//   });
//   let heightIcon = useSpring(heightTransformIcon, {
//     mass: 0.05,
//     stiffness: 300,
//     damping: 25,
//     restDelta: 0.01
//   });

//   const [hovered, setHovered] = useState(false);

//   return (
//     <motion.div
//       ref={ref}
//       onClick={() => navigate(link)}
//       style={{ width, height }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       className="relative flex aspect-square items-center justify-center rounded-full bg-muted/20 backdrop-blur-md border border-border/30 hover:border-primary/20 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
//       whileHover={{ scale: 1.1 }}
//       whileTap={{ scale: 0.95 }}
//       transition={{ type: "spring", stiffness: 400, damping: 25 }}
//     >
//       <AnimatePresence>
//         {hovered && (
//           <motion.div
//             initial={{ opacity: 0, y: 10, x: "-50%" }}
//             animate={{ opacity: 1, y: 0, x: "-50%" }}
//             exit={{ opacity: 0, y: 2, x: "-50%" }}
//             transition={{ type: "spring", stiffness: 500, damping: 30 }}
//             className="absolute -top-10 left-1/2 w-fit rounded-md border border-border/30 bg-background/90 backdrop-blur-md px-3 py-1 text-xs whitespace-pre text-black shadow-xl"
//           >
//             {title}
//           </motion.div>
//         )}
//       </AnimatePresence>
//       <motion.div
//         style={{ width: widthIcon, height: heightIcon }}
//         className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200"
//       >
//         {icon}
//       </motion.div>
//     </motion.div>
//   );
// }

/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50/80 backdrop-blur-md bg-neutral-900/80 border border-gray-200/50 border-neutral-700/50 shadow-md"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50/80 backdrop-blur-md bg-neutral-800/80 border border-gray-200/50 border-neutral-700/50 shadow-md"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50/80 backdrop-blur-md px-4 pb-3 md:flex bg-neutral-900/80 border border-gray-200/50 border-neutral-700/50 shadow-lg",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200/80 backdrop-blur-md bg-neutral-800/80 border border-gray-200/50 border-neutral-700/50 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200/50 bg-gray-100/90 backdrop-blur-md px-2 py-0.5 text-xs whitespace-pre text-neutral-700 border-neutral-700/50 bg-neutral-800/90 text-white shadow-lg"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
