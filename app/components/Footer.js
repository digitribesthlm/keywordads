export default function Footer() {
  return (
    <footer className="bg-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:mt-0 w-full">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Keyword Management. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 