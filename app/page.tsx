"use client";

import { motion } from "framer-motion";
import FibraPointsPage from "./docs/page";

export default function Home() {
  return (
    <div className="relative mx-auto my-2 flex w-full max-w-7xl flex-col items-center justify-center px-2 sm:px-4">
      <Navbar />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80 hidden md:block">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-[#FF0000] to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80 hidden md:block">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-[#FF0000] to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80 hidden md:block">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-[#FF0000] to-transparent" />
      </div>
      <div className="px-2 py-4 sm:px-4 md:px-8 md:py-8 lg:px-16 w-full overflow-hidden">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-lg font-bold sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl">
          <motion.span
            initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.1,
              ease: "easeInOut",
            }}
            className="mr-1 inline-block text-black dark:text-white italic sm:mr-2"
          >
            Fibra
          </motion.span>
          <motion.span
            initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.2,
              ease: "easeInOut",
            }}
            className="mr-1 inline-block text-[#FF0000] italic sm:mr-2"
          >
            Points
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-2 text-center text-xs font-normal text-[#FF0000] sm:text-sm md:text-base break-words"
        >
          En FibraMax, cada conexión cuenta. ¡Haz que tu conexión trabaje para
          ti! y transforma tu fidelidad con nosotros convirtiéndola en puntos
          que puedes canjear por increíbles recompensas.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full"
        >
          <FibraPointsPage />
        </motion.div>
      </div>
    </div>
  );
}

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-2 py-2 dark:border-neutral-800 sm:px-3 md:px-4">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* <Logo /> */}
        <div className="bg-black px-1 py-1 rounded sm:px-2">
          <h1 className="text-xs font-bold sm:text-sm md:text-base lg:text-2xl italic">
            <span style={{ color: "white" }}>Fibra</span>
            <span style={{ color: "#FF0000" }}>max</span>
          </h1>
        </div>
      </div>
    </nav>
  );
};
