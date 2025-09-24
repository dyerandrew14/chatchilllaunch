export function StoreBadges() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
      <a href="#" className="w-full sm:w-auto">
        <img src="/images/app-store-badge.png" alt="Download on the App Store" className="h-10 w-auto" />
      </a>
      <a href="#" className="w-full sm:w-auto">
        <img src="/images/google-play-badge.png" alt="Get it on Google Play" className="h-10 w-auto" />
      </a>
    </div>
  )
}
