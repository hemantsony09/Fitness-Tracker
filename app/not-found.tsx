export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-gray-400 mb-4">Page not found</p>
        <a href="/" className="text-white hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}

