"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Crown, Music, Globe, Heart, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VipPopupProps {
  isOpen?: boolean
  onClose: () => void
  onSubscribe: () => void
  isVIP?: boolean
  subscriptionDate?: string
}

export function VipPopup({ isOpen = true, onClose, onSubscribe, isVIP = false, subscriptionDate }: VipPopupProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly")

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-b from-gray-900 to-black border border-yellow-500/20 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-black hover:text-gray-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-black" />
                <h2 className="text-2xl font-bold text-black">ChatChill VIP</h2>
              </div>
              <p className="mt-2 text-black/80">Unlock premium features and enhance your experience</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {isVIP ? (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center bg-yellow-500/20 rounded-full px-4 py-2 mb-4">
                    <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-yellow-500 font-medium">VIP Active</span>
                  </div>
                  <p className="text-gray-300">
                    You're a VIP member since {formatDate(subscriptionDate)}. Enjoy all premium features!
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-white mb-4">VIP Benefits</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5 mr-3">
                        <Heart className="h-3.5 w-3.5 text-yellow-500" />
                      </div>
                      <div>
                        <span className="text-white font-medium">Unlimited Super Likes</span>
                        <p className="text-sm text-gray-400">
                          Stand out and get more matches with unlimited super likes
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5 mr-3">
                        <Music className="h-3.5 w-3.5 text-yellow-500" />
                      </div>
                      <div>
                        <span className="text-white font-medium">Unlimited Music Sharing</span>
                        <p className="text-sm text-gray-400">Share your favorite songs without limits</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5 mr-3">
                        <Globe className="h-3.5 w-3.5 text-yellow-500" />
                      </div>
                      <div>
                        <span className="text-white font-medium">Country Selection</span>
                        <p className="text-sm text-gray-400">Choose which countries you want to connect with</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5 mr-3">
                        <Zap className="h-3.5 w-3.5 text-yellow-500" />
                      </div>
                      <div>
                        <span className="text-white font-medium">Priority Matching</span>
                        <p className="text-sm text-gray-400">Get matched faster with other users</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5 mr-3">
                        <Shield className="h-3.5 w-3.5 text-yellow-500" />
                      </div>
                      <div>
                        <span className="text-white font-medium">Ad-Free Experience</span>
                        <p className="text-sm text-gray-400">Enjoy ChatChill without any advertisements</p>
                      </div>
                    </li>
                  </ul>

                  {/* Subscription Plans */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setSelectedPlan("monthly")}
                      className={`p-4 rounded-lg border ${
                        selectedPlan === "monthly"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-gray-700 bg-gray-800/50"
                      } text-center transition-colors`}
                    >
                      <div className="font-medium text-white">Monthly</div>
                      <div className="text-xl font-bold text-white mt-1">$9.99</div>
                      <div className="text-xs text-gray-400 mt-1">per month</div>
                    </button>
                    <button
                      onClick={() => setSelectedPlan("yearly")}
                      className={`p-4 rounded-lg border ${
                        selectedPlan === "yearly"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-gray-700 bg-gray-800/50"
                      } text-center transition-colors relative overflow-hidden`}
                    >
                      {selectedPlan === "yearly" && (
                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-medium px-2 py-0.5 rounded-bl-md">
                          SAVE 40%
                        </div>
                      )}
                      <div className="font-medium text-white">Yearly</div>
                      <div className="text-xl font-bold text-white mt-1">$59.99</div>
                      <div className="text-xs text-gray-400 mt-1">per year</div>
                    </button>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {!isVIP && (
                  <Button
                    onClick={onSubscribe}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium py-6"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    {selectedPlan === "monthly" ? "Subscribe Monthly" : "Subscribe Yearly"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  {isVIP ? "Close" : "Maybe Later"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
