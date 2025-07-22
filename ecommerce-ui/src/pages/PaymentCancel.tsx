import { Link } from "react-router-dom";

export const PaymentCancel = () => {
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-left">Payment Cancelled</h1>
      <div className="flex flex-col items-center justify-center flex-grow">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-semibold mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Your payment was cancelled. No charges have been made. You can try again or continue shopping.
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