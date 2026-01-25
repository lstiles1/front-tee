import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';

import state from '../store';
import { CustomButton } from '../components';
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../config/motion';

const Home = () => {
  const snap = useSnapshot(state);

  return (
    <AnimatePresence>
      {snap.intro && (
        <motion.section className="home" {...slideAnimation('left')}>
          <motion.header {...slideAnimation("down")} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Teenie Geenie</span>
            </div>
          </motion.header>

          <motion.div className="home-content" {...headContainerAnimation}>
            <motion.div {...headTextAnimation}>
              <h1 className="head-text">
                DESIGN <br className="xl:block hidden" /> IT ALL.
              </h1>
            </motion.div>
            <motion.div
              {...headContentAnimation}
              className="flex flex-col gap-6"
            >
              <p className="max-w-md font-normal text-gray-900 text-lg leading-relaxed">
                Design your perfect shirt from scratch. Choose your colors, upload your own designs, or let AI create something entirely new. Your style, your rules.
              </p>

              <div className="flex flex-col gap-3">
                <CustomButton
                  type="filled"
                  title="Start Customizing"
                  handleClick={() => state.intro = false}
                  customStyles="w-fit px-6 py-3 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export default Home