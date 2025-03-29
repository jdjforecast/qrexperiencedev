import Image from "next/image"

export function MainTitle() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 md:py-12">
      <div className="relative w-[280px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[100px] sm:h-[150px] md:h-[180px] lg:h-[200px] transform hover:scale-105 transition-transform duration-300">
        <Image
          src="/digitalsummitnobackground.svg"
          alt="Digital Pharma Summit Logo"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
      </div>
    </div>
  )
}

