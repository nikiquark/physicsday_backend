import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedItemProps extends MotionProps {
  children: ReactNode;
  index?: number;
  baseDelay?: number;
}

export const SequentialFadeIn = ({
  children,
  index = 0,
  baseDelay = 0.1,
  ...motionProps
}: AnimatedItemProps) => {
  const defaultAnimation = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: index * baseDelay },
  };

  const mergedProps = { ...defaultAnimation, ...motionProps };

  return <motion.div {...mergedProps}>{children}</motion.div>;
};