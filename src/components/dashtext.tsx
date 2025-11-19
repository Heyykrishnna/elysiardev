"use client";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { motion } from "motion/react";
import { cn } from "@/lib/utils.ts";

export function ContainerTextFlipDemo() {
  const words = ["Dashboard", "Command Hub", "Control Center", "Core Panel"];
  return (
    <motion.h1
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      className={cn(
        "relative mb-6 max-w-5xl text-center flex justify-center items-center text-4xl leading-normal font-bold tracking-tight text-black md:text-7xl dark:text-black",
      )}
      layout
    >
      <div className="inline-block">
        <ContainerTextFlip words={words} />
        {/* <Blips /> */}
      </div>
    </motion.h1>
  );
}
