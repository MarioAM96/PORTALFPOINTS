"use client";

import { motion } from "motion/react";
import DocsPage from "./docs/page";
import { Logo } from "@/components/icons";

export default function Home() {
  return (
    <div className="relative mx-auto my-2 flex max-w-7xl flex-col items-center justify-center">
      <Navbar />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-[#FE280A] to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-[#FE280A] to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-[#FE280A] to-transparent" />
      </div>
      <div className="px-4 md:px-8 lg:px-16 py-4 md:py-8">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-[#FE280A] md:text-4xl lg:text-5xl dark:text-[#FE280A]">
          {"Portal Fibrapoints".split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-2 text-center text-sm font-normal text-[#FE280A]"
        >
          En FibraPoints, cada conexión cuenta. Transforma tu fidelidad con
          nosotros en increíbles beneficios. En el momento que eliges FibraMax
          se convierte en puntos que puedes canjear por grandes recompensas.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-4"
        >
          <DocsPage></DocsPage>
        </motion.div>
      </div>
    </div>
  );
}

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
      {" "}
      <div className="flex items-center gap-2">
        <Logo />
        <h1 className="text-base font-bold md:text-2xl">FM</h1>
      </div>
    </nav>
  );
};
