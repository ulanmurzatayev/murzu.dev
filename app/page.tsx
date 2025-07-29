import Image from "next/image";
import BackgroundPaths from "./components/BackgroundPaths";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <BackgroundPaths />
      <main className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="flex justify-center mb-8">
            <Image
              src="/profile.jpg"
              alt="Ulan Murzatayev"
              width={180}
              height={180}
              className="rounded-full object-cover object-center"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight">
            Ulan Murzatayev
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-light">
            Senior Software Engineer • Engineering Leader
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-xl">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Experienced software engineer and technical leader with{" "}
              <strong>15+ years</strong> across startup and enterprise
              environments. Specializing in{" "}
              <strong>full-stack development</strong>,{" "}
              <strong>distributed systems</strong>, and{" "}
              <strong>AI-powered solutions</strong>.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center space-x-6 pt-2">
            <a
              href="/ulan-murzatayev-resume-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium"
            >
              Resume
            </a>
            <a
              href="https://github.com/ulanmurzatayev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/murzatayev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:murzatayev&#64;gmail&#46;com"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
