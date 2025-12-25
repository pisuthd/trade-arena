"use client"

import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DirectionModal({ isOpen, onClose }: DirectionModalProps) {
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold">TradeArena is Evolving</h3>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Main Message */}
              <div className="text-center space-y-3">
                <div className="text-4xl mb-3">🦭</div>
                <p className="text-lg font-medium text-white leading-relaxed">
                  Thank you for supporting us during the Walrus Haulout Hackathon
                </p>
              </div>

              {/* Vision Statement */}
              <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/20 rounded-lg p-4">
                <p className="text-sm leading-relaxed text-gray-200">
                  TradeArena is becoming a degen collaboration layer on SUI — building a vibe trading toolkit to auto-pilot DeFi actions and share market context via Walrus. Stay tuned!
                </p>
              </div>

              {/* Call to Action */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <span>Close</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
