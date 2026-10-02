import { messages } from './messages';

export function App() {
  const copy = messages.en;

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-16">
      <header className="mb-14 flex items-baseline gap-3">
        <span className="text-lg font-semibold tracking-tight">
          {copy.brand}
        </span>
        <span lang="bn-BD" className="text-lg text-teal-800 dark:text-teal-300">
          {copy.name}
        </span>
      </header>
      <p className="mb-4 text-sm font-medium text-teal-800 dark:text-teal-300">
        {copy.eyebrow}
      </p>
      <h1 className="max-w-xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
        {copy.title}
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600 dark:text-stone-300">
        {copy.description}
      </p>
      <section
        aria-labelledby="development-status"
        className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900"
      >
        <h2 id="development-status" className="font-semibold">
          {copy.status}
        </h2>
        <p className="mt-2 leading-relaxed text-stone-600 dark:text-stone-300">
          {copy.detail}
        </p>
      </section>
    </main>
  );
}
