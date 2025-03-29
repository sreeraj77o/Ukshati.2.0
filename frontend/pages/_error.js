export default function ErrorPage({ statusCode }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-red-600">Oops! Something went wrong.</h1>
        <p className="text-lg text-gray-600 mt-4">
          {statusCode
            ? `An error occurred on the server (${statusCode})`
            : "An error occurred on the client."}
        </p>
        <a href="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">Go Home</a>
      </div>
    );
  }
  
  ErrorPage.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
  };
  