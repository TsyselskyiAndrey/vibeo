import type { MotionProps, Variants } from "framer-motion";

type Side = "left" | "right";

const STAGGER = 1 / 9;
const ENTER_OFFSET = 1;

const largeVariants = (side: Side): Variants => ({
  shown: { [side]: "0%", filter: "blur(0px)" },
  hidden: { [side]: "-100%", filter: "blur(10px)" },
});

const LARGE = { left: largeVariants("left"), right: largeVariants("right") };

const SMALL: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function formAnim(side: Side, isLarge: boolean, hidden: boolean) {
  return (index: number): MotionProps => {
    if (isLarge) {
      return {
        style: { position: "relative" },
        variants: LARGE[side],
        animate: hidden ? "hidden" : "shown",
        initial: false,
        transition: {
          delay: index * STAGGER + (hidden ? 0 : ENTER_OFFSET),
          duration: 1.1,
          ease: "easeInOut",
        },
      };
    }
    return {
      variants: SMALL,
      initial: "hidden",
      animate: "shown",
      transition: { delay: index * 0.06, duration: 0.45, ease: "easeOut" },
    };
  };
}
