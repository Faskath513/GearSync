import React from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Please try again later.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-12 text-center">
      <p className="text-xl font-semibold text-gray-900">{title}</p>
      <p className="text-gray-600 mt-2">{message}</p>
      {actionLabel ? (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};

export default ErrorState;

