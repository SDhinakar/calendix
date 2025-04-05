'use client';
import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [showLine, setShowLine] = useState(false);

  useEffect(() => {
    setShowLine(true);
  }, []);

  return (
    <section className="relative text-center mt-24 px-4 py-24 overflow-hidden bg-gradient-to-r from-indigo-100 via-white to-pink-100 rounded-lg shadow-md">
      {/* Optional decorative radial blur background */}
      <div className="absolute inset-0 -z-10 bg-gradient-radial from-blue-300/20 via-purple-100/10 to-transparent blur-3xl opacity-40" />

      <div className="relative z-10">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Scheduling{' '}
          <span className={"text-blue-600 cool-underline " + (showLine ? 'show-underline' : '')}>
            made simple
          </span>
          <br />
          for people like you
        </h1>

        <p className="text-gray-600 max-w-xl mx-auto">
          Most scheduling apps are simple but ours is even more simple.<br />
          On top of this, it&apos;s open source and you can see the code.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/api/auth"
            className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            Start Scheduling Now
          </Link>

          <Link
            href="https://github.com/SDhinakar/calendix"
            target="_blank"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors text-sm"
          >
            <Star size={16} />
            Star us on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}
