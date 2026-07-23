export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Organa</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
