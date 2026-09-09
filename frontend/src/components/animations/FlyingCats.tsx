import { motion } from "framer-motion";

export const FlyingCats = () => {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Cat 1 - Left side, top */}
      <motion.div
        className="absolute w-42 h-42"
        initial={{ x: -200, y: 0 }}
        animate={{ x: 50 }}
        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
        style={{ left: 0, top: '15%', transform: 'translateY(-50%)' }}
      >
        <motion.img
          src="/cat1.png"
          alt="Cat 1"
          className="w-full h-full object-contain"
          animate={{ 
            y: [0, -10, 0],
            rotate: [-5, 5, -5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {/* Cat 2 - Right side, bottom */}
      <motion.div
        className="absolute w-34 h-34"
        initial={{ x: 200, y: 0 }}
        animate={{ x: -50 }}
        transition={{ duration: 2, delay: 2, ease: "easeOut" }}
        style={{ right: '3%', top: '75%', transform: 'translateY(-50%)' }}
      >
        <motion.img
          src="/cat2.png"
          alt="Cat 2"
          className="w-full h-full object-contain"
          animate={{ 
            y: [0, -15, 0],
            rotate: [5, -5, 5]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Cat 3 - Bottom left corner */}
      <motion.div
        className="absolute w-38 h-38"
        initial={{ y: 200, x: -150 }}
        animate={{ y: -30, x: 30 }}
        transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
        style={{ left: '3%', bottom: 0 }}
      >
        <motion.img
          src="/cat3.png"
          alt="Cat 3"
          className="w-full h-full object-contain"
          animate={{ 
            x: [-5, 5, -5],
            rotate: [-3, 3, -3]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Cat 4 - Left side, middle */}
      <motion.div
        className="absolute w-36 h-36"
        initial={{ x: -150, y: 0 }}
        animate={{ x: 20 }}
        transition={{ duration: 2.2, delay: 2.5, ease: "easeOut" }}
        style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }}
      >
        <motion.img
          src="/cat4.png"
          alt="Cat 4"
          className="w-full h-full object-contain"
          animate={{ 
            y: [0, -8, 0],
            rotate: [3, -3, 3]
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Cat 5 - Right side, top */}
      <motion.div
        className="absolute w-38 h-38"
        initial={{ x: 180, y: 0 }}
        animate={{ x: -30 }}
        transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
        style={{ right: '5%', top: '25%', transform: 'translateY(-50%)' }}
      >
        <motion.img
          src="/cat5.png"
          alt="Cat 5"
          className="w-full h-full object-contain"
          animate={{ 
            y: [0, -12, 0],
            rotate: [-4, 4, -4]
          }}
          transition={{
            duration: 2.7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Cat 6 - Right center */}
      <motion.div
        className="absolute w-36 h-36"
        initial={{ x: 200, y: 0 }}
        animate={{ x: -40 }}
        transition={{ duration: 2.1, delay: 3, ease: "easeOut" }}
        style={{ right: 0, top: '55%', transform: 'translateY(-50%)' }}
      >
        <motion.img
          src="/cat6.png"
          alt="Cat 6"
          className="w-full h-full object-contain"
          animate={{ 
            x: [-8, 8, -8],
            rotate: [4, -4, 4]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
};