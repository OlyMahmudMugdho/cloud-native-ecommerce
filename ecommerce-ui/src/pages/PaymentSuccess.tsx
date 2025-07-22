import { Link } from "react-router-dom";

export const PaymentSuccess = () => {
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-left">Payment Successful</h1>
      <div className="flex flex-col items-center justify-center flex-grow">
        <svg
          className="w-16 h-16 text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-semibold mb-2">Thank You for Your Purchase!</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Your payment was successfully processed.
        </p>
        <Link
          to="/"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );
};