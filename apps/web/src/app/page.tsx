export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Organa</h1>
      <p className="text-lg text-gray-600">One platform for all your businesses</p>
      <a href="/login" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Se connecter
      </a>
    </main>
  );
}
