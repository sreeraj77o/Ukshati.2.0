export default function Custom404() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-5xl font-bold text-red-500">404</h1>
        <p className="text-lg text-gray-600 mt-4">
          Page Not Found. <a href="/" className="text-blue-500 underline">Go Home</a>
        </p>
      </div>
    );
  }
  